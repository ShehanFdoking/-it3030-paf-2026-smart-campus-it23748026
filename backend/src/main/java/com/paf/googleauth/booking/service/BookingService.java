package com.paf.googleauth.booking.service;

import com.paf.googleauth.booking.dto.BookingRequest;
import com.paf.googleauth.booking.dto.BookingRequestResult;
import com.paf.googleauth.booking.dto.BookingResponse;
import com.paf.googleauth.booking.dto.BookingStatusUpdateRequest;
import com.paf.googleauth.booking.dto.BookingSuggestionResponse;
import com.paf.googleauth.booking.dto.BookingUpdateRequest;
import com.paf.googleauth.booking.model.BookingRecord;
import com.paf.googleauth.booking.model.BookingStatus;
import com.paf.googleauth.booking.repository.BookingRepository;
import com.paf.googleauth.catalog.model.ResourceCatalogItem;
import com.paf.googleauth.catalog.model.ResourceCategory;
import com.paf.googleauth.catalog.model.ResourceStatus;
import com.paf.googleauth.catalog.repository.ResourceCatalogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceCatalogRepository resourceCatalogRepository;

    public BookingService(BookingRepository bookingRepository, ResourceCatalogRepository resourceCatalogRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceCatalogRepository = resourceCatalogRepository;
    }

    public BookingRequestResult requestBooking(BookingRequest request) {
        validateTimeRange(request.bookingDate(), request.startTime(), request.endTime());

        ResourceCatalogItem resource = getBookableResource(request.resourceId(), request.resourceCategory());
        validateExpectedAttendees(request.resourceCategory(), request.expectedAttendees(), resource.getCapacity());

        if (hasApprovedConflict(resource.getId(), request.bookingDate(), request.startTime(), request.endTime(),
                null)) {
            return conflictResult(resource, request.expectedAttendees(),
                    getUnavailableMessage(request.resourceCategory()));
        }

        ResourceCatalogItem linkedResource = null;
        if (request.resourceCategory() == ResourceCategory.EQUIPMENT) {
            linkedResource = resolveLinkedResource(resource);
            String proofCode = normalize(request.linkedRoomApprovalCode());
            boolean linkedRoomBooked = hasApprovedConflict(linkedResource.getId(), request.bookingDate(),
                    request.startTime(), request.endTime(), null);
            if (linkedRoomBooked && !hasMatchingApprovalCode(linkedResource.getId(), request.bookingDate(),
                    request.startTime(), request.endTime(), proofCode)) {
                return conflictResult(resource, request.expectedAttendees(),
                        "This equipment or linked room is already booked for the selected time.");
            }
        }

        BookingRecord booking = buildBookingRecord(resource, request);
        booking = bookingRepository.save(booking);

        if (linkedResource != null) {
            BookingRecord linkedBooking = buildLinkedRoomBooking(linkedResource, request, booking.getId());
            bookingRepository.save(linkedBooking);
        }

        return new BookingRequestResult(true, "Booking request submitted. Current status: Pending.",
                toResponse(booking), List.of());
    }

    public List<BookingResponse> listMyBookings(String requesterEmail) {
        return bookingRepository.findAllByRequesterEmailOrderByCreatedAtDesc(requesterEmail).stream()
                .map(this::toResponse)
                .toList();
    }

    public BookingRequestResult updateMyBooking(String id, String requesterEmail, BookingUpdateRequest request) {
        BookingRecord booking = bookingRepository.findByIdAndRequesterEmail(id, requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.isSystemGenerated()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Linked room bookings are managed automatically");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be edited");
        }

        validateTimeRange(request.bookingDate(), request.startTime(), request.endTime());
        ResourceCatalogItem resource = getBookableResource(booking.getResourceId(), booking.getResourceCategory());
        validateExpectedAttendees(booking.getResourceCategory(), request.expectedAttendees(), resource.getCapacity());

        if (hasApprovedConflict(booking.getResourceId(), request.bookingDate(), request.startTime(), request.endTime(),
                booking.getId())) {
            return conflictResult(resource, request.expectedAttendees(),
                    getUnavailableMessage(booking.getResourceCategory()));
        }

        if (booking.getResourceCategory() == ResourceCategory.EQUIPMENT) {
            ResourceCatalogItem linkedResource = resolveLinkedResource(resource);
            String proofCode = normalize(request.linkedRoomApprovalCode());
            boolean linkedRoomBooked = hasApprovedConflict(linkedResource.getId(), request.bookingDate(),
                    request.startTime(), request.endTime(), null);
            if (linkedRoomBooked && !hasMatchingApprovalCode(linkedResource.getId(), request.bookingDate(),
                    request.startTime(), request.endTime(), proofCode)) {
                return conflictResult(resource, request.expectedAttendees(),
                        "This equipment or linked room is already booked for the selected time.");
            }
        }

        booking.setBookingDate(request.bookingDate());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setPurpose(request.purpose().trim());
        booking.setExpectedAttendees(request.expectedAttendees());
        booking.setUpdatedAt(Instant.now());
        booking = bookingRepository.save(booking);

        syncLinkedBooking(booking);

        return new BookingRequestResult(true, "Booking updated successfully.", toResponse(booking), List.of());
    }

    public void deleteMyBooking(String id, String requesterEmail) {
        BookingRecord booking = bookingRepository.findByIdAndRequesterEmail(id, requesterEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.isSystemGenerated()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Linked room bookings are managed automatically");
        }

        bookingRepository.delete(booking);
        List<BookingRecord> linkedBookings = bookingRepository.findAllByParentBookingId(id);
        if (!linkedBookings.isEmpty()) {
            bookingRepository.deleteAll(linkedBookings);
        }
    }

    public List<BookingResponse> listAdminBookings(ResourceCategory category, BookingStatus status, String search) {
        List<BookingRecord> records = category == null
                ? bookingRepository.findAllByOrderByCreatedAtDesc()
                : bookingRepository.findAllByResourceCategoryOrderByCreatedAtDesc(category);

        return records.stream()
                .filter(record -> status == null || record.getStatus() == status)
                .filter(record -> matchesSearch(record, search))
                .map(this::toResponse)
                .toList();
    }

    public BookingResponse updateBookingStatus(String id, BookingStatusUpdateRequest request) {
        BookingRecord booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        List<BookingRecord> linkedBookings = bookingRepository.findAllByParentBookingId(booking.getId());

        if (request.status() == BookingStatus.APPROVED
                && hasApprovedConflict(booking.getResourceId(), booking.getBookingDate(), booking.getStartTime(),
                        booking.getEndTime(), booking.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Resource is already booked for this time range");
        }

        for (BookingRecord linked : linkedBookings) {
            if (request.status() == BookingStatus.APPROVED
                    && hasApprovedConflict(linked.getResourceId(), linked.getBookingDate(), linked.getStartTime(),
                            linked.getEndTime(), linked.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Linked room is already booked for this time range");
            }
        }

        applyStatus(booking, request.status(), request.adminNote());
        booking = bookingRepository.save(booking);

        for (BookingRecord linked : linkedBookings) {
            applyStatus(linked, request.status(), request.adminNote());
        }
        if (!linkedBookings.isEmpty()) {
            bookingRepository.saveAll(linkedBookings);
        }

        return toResponse(booking);
    }

    private void applyStatus(BookingRecord booking, BookingStatus status, String adminNote) {
        booking.setStatus(status);
        booking.setAdminNote(normalize(adminNote));
        booking.setUpdatedAt(Instant.now());
        if (status == BookingStatus.APPROVED) {
            booking.setApprovalCode(generateApprovalCode());
        } else {
            booking.setApprovalCode(null);
        }
    }

    private void syncLinkedBooking(BookingRecord booking) {
        List<BookingRecord> linkedBookings = bookingRepository.findAllByParentBookingId(booking.getId());
        if (linkedBookings.isEmpty()) {
            return;
        }
        for (BookingRecord linked : linkedBookings) {
            linked.setBookingDate(booking.getBookingDate());
            linked.setStartTime(booking.getStartTime());
            linked.setEndTime(booking.getEndTime());
            linked.setPurpose("Linked room booking for equipment: " + booking.getResourceName());
            linked.setExpectedAttendees(booking.getExpectedAttendees());
            linked.setRequesterEmail(booking.getRequesterEmail());
            linked.setRequesterName(booking.getRequesterName());
            linked.setUpdatedAt(Instant.now());
        }
        bookingRepository.saveAll(linkedBookings);
    }

    private boolean matchesSearch(BookingRecord record, String search) {
        String query = normalize(search);
        if (query == null || query.isBlank()) {
            return true;
        }

        String text = String.join(" ",
                safe(record.getResourceName()),
                safe(record.getRequesterEmail()),
                safe(record.getRequesterName()),
                safe(record.getResourceLocation()),
                safe(record.getResourceSublocation()),
                safe(record.getPurpose()),
                safe(record.getApprovalCode()),
                record.getStatus() == null ? "" : record.getStatus().name())
                .toLowerCase(Locale.ROOT);

        return text.contains(query.toLowerCase(Locale.ROOT));
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private BookingRecord buildBookingRecord(ResourceCatalogItem resource, BookingRequest request) {
        BookingRecord record = new BookingRecord();
        record.setResourceId(resource.getId());
        record.setResourceCategory(resource.getCategory());
        record.setResourceName(resource.getName());
        record.setResourceLocation(resource.getLocation());
        record.setResourceSublocation(resource.getSublocation());
        record.setBookingDate(request.bookingDate());
        record.setStartTime(request.startTime());
        record.setEndTime(request.endTime());
        record.setPurpose(request.purpose().trim());
        record.setExpectedAttendees(request.expectedAttendees());
        record.setRequesterEmail(request.requesterEmail().trim());
        record.setRequesterName(request.requesterName().trim());
        record.setStatus(BookingStatus.PENDING);
        record.setSystemGenerated(false);
        record.setCreatedAt(Instant.now());
        record.setUpdatedAt(Instant.now());
        return record;
    }

    private BookingRecord buildLinkedRoomBooking(ResourceCatalogItem linkedResource, BookingRequest request,
            String parentBookingId) {
        BookingRecord linked = new BookingRecord();
        linked.setResourceId(linkedResource.getId());
        linked.setResourceCategory(linkedResource.getCategory());
        linked.setResourceName(linkedResource.getName());
        linked.setResourceLocation(linkedResource.getLocation());
        linked.setResourceSublocation(linkedResource.getSublocation());
        linked.setBookingDate(request.bookingDate());
        linked.setStartTime(request.startTime());
        linked.setEndTime(request.endTime());
        linked.setPurpose("Linked room booking for equipment request");
        linked.setExpectedAttendees(request.expectedAttendees());
        linked.setRequesterEmail(request.requesterEmail().trim());
        linked.setRequesterName(request.requesterName().trim());
        linked.setStatus(BookingStatus.PENDING);
        linked.setParentBookingId(parentBookingId);
        linked.setSystemGenerated(true);
        linked.setCreatedAt(Instant.now());
        linked.setUpdatedAt(Instant.now());
        return linked;
    }

    private ResourceCatalogItem getBookableResource(String resourceId, ResourceCategory category) {
        ResourceCatalogItem resource = resourceCatalogRepository.findById(resourceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        if (resource.getCategory() != category) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resource category does not match");
        }

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only active resources can be booked");
        }

        return resource;
    }

    private ResourceCatalogItem resolveLinkedResource(ResourceCatalogItem equipment) {
        String linkedName = normalize(equipment.getRelatedResourceName());
        if (linkedName == null || linkedName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Equipment has no linked room configured");
        }

        ResourceCatalogItem linked = resourceCatalogRepository.findByNameIgnoreCase(linkedName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Linked room not found"));

        if (linked.getCategory() != ResourceCategory.LECTURE_HALL
                && linked.getCategory() != ResourceCategory.MEETING_ROOM) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Linked room must be a lecture hall or meeting room");
        }

        if (linked.getStatus() != ResourceStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Linked room must be active");
        }

        return linked;
    }

    private String getUnavailableMessage(ResourceCategory category) {
        if (category == ResourceCategory.LECTURE_HALL) {
            return "This lecture hall is already booked for the selected time.";
        }
        if (category == ResourceCategory.MEETING_ROOM) {
            return "This meeting room is already booked for the selected time.";
        }
        return "This equipment is already booked for the selected time.";
    }

    private void validateExpectedAttendees(ResourceCategory category, Integer expectedAttendees,
            Integer resourceCapacity) {
        if (category == ResourceCategory.LECTURE_HALL || category == ResourceCategory.MEETING_ROOM) {
            if (expectedAttendees == null || expectedAttendees < 1) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expected attendees is required");
            }
        }

        if (category == ResourceCategory.MEETING_ROOM && expectedAttendees != null && expectedAttendees <= 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Meeting room expected attendees should be more than 5");
        }

        if (category != ResourceCategory.EQUIPMENT
                && expectedAttendees != null
                && resourceCapacity != null
                && expectedAttendees > resourceCapacity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Expected attendees cannot exceed resource capacity");
        }
    }

    private void validateTimeRange(String date, String startTime, String endTime) {
        if (normalize(date) == null || normalize(startTime) == null || normalize(endTime) == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date and time range are required");
        }

        LocalDate bookingDate = parseDate(date);
        if (bookingDate.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Booking date cannot be in the past");
        }

        LocalTime start = parseTime(startTime);
        LocalTime end = parseTime(endTime);
        if (!start.isBefore(end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
        }
    }

    private boolean hasApprovedConflict(String resourceId, String date, String startTime, String endTime,
            String excludeBookingId) {
        List<BookingRecord> approved = bookingRepository.findAllByResourceIdAndBookingDateAndStatus(
                resourceId,
                date,
                BookingStatus.APPROVED);

        LocalTime requestedStart = parseTime(startTime);
        LocalTime requestedEnd = parseTime(endTime);

        for (BookingRecord existing : approved) {
            if (excludeBookingId != null && excludeBookingId.equals(existing.getId())) {
                continue;
            }
            LocalTime existingStart = parseTime(existing.getStartTime());
            LocalTime existingEnd = parseTime(existing.getEndTime());
            if (requestedStart.isBefore(existingEnd) && requestedEnd.isAfter(existingStart)) {
                return true;
            }
        }
        return false;
    }

    private boolean hasMatchingApprovalCode(String resourceId, String date, String startTime, String endTime,
            String approvalCode) {
        if (approvalCode == null || approvalCode.isBlank()) {
            return false;
        }

        List<BookingRecord> approved = bookingRepository.findAllByResourceIdAndBookingDateAndStatus(
                resourceId,
                date,
                BookingStatus.APPROVED);

        LocalTime requestedStart = parseTime(startTime);
        LocalTime requestedEnd = parseTime(endTime);

        return approved.stream().anyMatch(existing -> {
            LocalTime existingStart = parseTime(existing.getStartTime());
            LocalTime existingEnd = parseTime(existing.getEndTime());
            boolean overlaps = requestedStart.isBefore(existingEnd) && requestedEnd.isAfter(existingStart);
            return overlaps && approvalCode.equalsIgnoreCase(safe(existing.getApprovalCode()));
        });
    }

    private BookingRequestResult conflictResult(ResourceCatalogItem selectedResource, Integer expectedAttendees,
            String message) {
        List<BookingSuggestionResponse> suggestions = suggestAlternatives(selectedResource, expectedAttendees);
        return new BookingRequestResult(false, message, null, suggestions);
    }

    private List<BookingSuggestionResponse> suggestAlternatives(ResourceCatalogItem selectedResource,
            Integer expectedAttendees) {
        int requiredCapacity = expectedAttendees == null ? 1 : expectedAttendees;

        return resourceCatalogRepository.findAllByCategoryOrderByNameAsc(selectedResource.getCategory()).stream()
                .filter(item -> !item.getId().equals(selectedResource.getId()))
                .filter(item -> item.getStatus() == ResourceStatus.ACTIVE)
                .filter(item -> item.getCapacity() != null && item.getCapacity() >= requiredCapacity)
                .sorted(Comparator.comparingInt(item -> distanceScore(selectedResource, item)))
                .limit(5)
                .map(item -> new BookingSuggestionResponse(
                        item.getId(),
                        item.getCategory(),
                        item.getName(),
                        item.getLocation(),
                        item.getSublocation(),
                        item.getCapacity()))
                .toList();
    }

    private int distanceScore(ResourceCatalogItem selected, ResourceCatalogItem candidate) {
        if (safe(selected.getLocation()).equalsIgnoreCase(safe(candidate.getLocation()))
                && safe(selected.getSublocation()).equalsIgnoreCase(safe(candidate.getSublocation()))) {
            return 0;
        }
        if (safe(selected.getLocation()).equalsIgnoreCase(safe(candidate.getLocation()))) {
            return 1;
        }
        return 2;
    }

    private String generateApprovalCode() {
        return "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
    }

    private LocalTime parseTime(String value) {
        try {
            return LocalTime.parse(value);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid time format");
        }
    }

    private LocalDate parseDate(String value) {
        try {
            return LocalDate.parse(value);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date format");
        }
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    private BookingResponse toResponse(BookingRecord record) {
        return new BookingResponse(
                record.getId(),
                record.getResourceId(),
                record.getResourceCategory(),
                record.getResourceName(),
                record.getResourceLocation(),
                record.getResourceSublocation(),
                record.getBookingDate(),
                record.getStartTime(),
                record.getEndTime(),
                record.getPurpose(),
                record.getExpectedAttendees(),
                record.getRequesterEmail(),
                record.getRequesterName(),
                record.getStatus(),
                record.getApprovalCode(),
                record.getAdminNote(),
                record.getCreatedAt(),
                record.getUpdatedAt(),
                record.isSystemGenerated(),
                record.getParentBookingId());
    }
}
