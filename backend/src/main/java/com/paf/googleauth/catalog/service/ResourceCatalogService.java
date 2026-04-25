package com.paf.googleauth.catalog.service;

import com.paf.googleauth.booking.repository.BookingRepository;
import com.paf.googleauth.catalog.dto.AvailabilityWindowRequest;
import com.paf.googleauth.catalog.dto.AvailabilityWindowResponse;
import com.paf.googleauth.catalog.dto.ResourceCatalogRequest;
import com.paf.googleauth.catalog.dto.ResourceCatalogResponse;
import com.paf.googleauth.catalog.model.AvailabilityWindow;
import com.paf.googleauth.catalog.model.ResourceCatalogItem;
import com.paf.googleauth.catalog.model.ResourceCategory;
import com.paf.googleauth.catalog.model.ResourceStatus;
import com.paf.googleauth.catalog.repository.ResourceCatalogRepository;
import com.paf.googleauth.notification.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ResourceCatalogService {

    private final ResourceCatalogRepository repository;
    private final NotificationService notificationService;
    private final BookingRepository bookingRepository;

    public ResourceCatalogService(ResourceCatalogRepository repository,
            NotificationService notificationService,
            BookingRepository bookingRepository) {
        this.repository = repository;
        this.notificationService = notificationService;
        this.bookingRepository = bookingRepository;
    }

    public List<ResourceCatalogResponse> list(ResourceCategory category, String sortBy) {
        List<ResourceCatalogItem> items = category == null
                ? repository.findAll()
                : repository.findAllByCategoryOrderByNameAsc(category);

        if ("location".equalsIgnoreCase(sortBy)) {
            Comparator<ResourceCatalogItem> byLocationThenSublocationThenName = Comparator
                    .comparing((ResourceCatalogItem item) -> normalizeSortValue(item.getLocation()))
                    .thenComparing(item -> normalizeSortValue(item.getSublocation()))
                    .thenComparing(item -> normalizeSortValue(item.getName()));
            items = items.stream().sorted(byLocationThenSublocationThenName).toList();
        }

        return items.stream().map(this::toResponse).toList();
    }

    private String normalizeSortValue(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }

    public ResourceCatalogResponse getById(String id) {
        return toResponse(findRequired(id));
    }

    public ResourceCatalogResponse create(ResourceCatalogRequest request, String adminEmail) {
        validateDuplicateName(request.name(), null);
        ResourceCatalogItem item = new ResourceCatalogItem();
        applyRequest(item, request);
        ResourceCatalogItem saved = repository.save(item);

        if (adminEmail != null && !adminEmail.isBlank()) {
            notificationService.notifyResourceCreated(
                    adminEmail.trim(),
                    saved.getId(),
                    saved.getName(),
                    saved.getCategory() == null ? "resource" : saved.getCategory().getDisplayName());
        }

        return toResponse(saved);
    }

    public ResourceCatalogResponse update(String id, ResourceCatalogRequest request, String adminEmail) {
        ResourceCatalogItem item = findRequired(id);
        ResourceStatus previousStatus = item.getStatus();
        validateDuplicateName(request.name(), id);
        applyRequest(item, request);
        ResourceCatalogItem saved = repository.save(item);

        // Notify admin confirmation
        if (adminEmail != null && !adminEmail.isBlank()) {
            notificationService.notifyResourceUpdated(adminEmail.trim(), saved.getId(), saved.getName());
        }

        // Notify users with bookings if resource status changed
        ResourceStatus newStatus = saved.getStatus();
        if (previousStatus != newStatus) {
            notifyAffectedBookingUsers(saved.getId(), saved.getName(), newStatus.name());
        }

        return toResponse(saved);
    }

    public void delete(String id, String adminEmail) {
        ResourceCatalogItem item = findRequired(id);
        // Notify users with bookings before deleting
        notifyAffectedBookingUsers(item.getId(), item.getName(), "DELETED");
        // Notify admin confirmation
        if (adminEmail != null && !adminEmail.isBlank()) {
            notificationService.notifyResourceDeletedAdmin(adminEmail.trim(), item.getId(), item.getName());
        }
        repository.delete(item);
    }

    private void notifyAffectedBookingUsers(String resourceId, String resourceName, String eventType) {
        List<String> affectedEmails = bookingRepository.findAllByResourceId(resourceId).stream()
                .map(booking -> booking.getRequesterEmail())
                .filter(email -> email != null && !email.isBlank())
                .collect(Collectors.toSet())
                .stream().toList();

        for (String email : affectedEmails) {
            if ("DELETED".equals(eventType)) {
                notificationService.notifyResourceDeleted(email, resourceId, resourceName);
            } else {
                notificationService.notifyResourceStatusChange(email, resourceId, resourceName, eventType);
            }
        }
    }

    private ResourceCatalogItem findRequired(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    private void validateDuplicateName(String name, String currentId) {
        boolean exists = currentId == null
                ? repository.existsByNameIgnoreCase(name)
                : repository.existsByNameIgnoreCaseAndIdNot(name, currentId);

        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A resource with this name already exists");
        }
    }

    private void applyRequest(ResourceCatalogItem item, ResourceCatalogRequest request) {
        validateRelatedResourceName(request);
        validateEquipmentType(request);
        validateLabType(request);
        item.setCategory(request.category());
        item.setName(request.name().trim());
        item.setCapacity(request.capacity());
        item.setLocation(request.location());
        item.setSublocation(request.sublocation());
        item.setStatus(request.status() == null ? ResourceStatus.ACTIVE : request.status());
        item.setRelatedResourceName(normalizeRelatedResourceName(request));
        item.setEquipmentType(normalizeEquipmentType(request));
        item.setAvailabilityWindows(toWindows(request.availabilityWindows()));
    }

    private void validateLabType(ResourceCatalogRequest request) {
        if (request.category() != ResourceCategory.LAB) {
            return;
        }
        String labType = normalizeEquipmentType(request);
        if (labType == null || labType.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Lab type is required for lab resources");
        }
    }

    private void validateEquipmentType(ResourceCatalogRequest request) {
        String equipmentType = normalizeEquipmentType(request);
        if (request.category() != ResourceCategory.EQUIPMENT) {
            return;
        }

        if (equipmentType == null || equipmentType.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Equipment type is required for equipment resources");
        }
    }

    private void validateRelatedResourceName(ResourceCatalogRequest request) {
        String relatedResourceName = normalizeRelatedResourceName(request);
        if (request.category() != ResourceCategory.EQUIPMENT) {
            return;
        }

        if (relatedResourceName == null || relatedResourceName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Equipment must reference an existing lecture hall or meeting room name");
        }

        boolean exists = repository.existsByNameIgnoreCaseAndCategoryIn(
                relatedResourceName,
                List.of(ResourceCategory.LECTURE_HALL, ResourceCategory.MEETING_ROOM));

        if (!exists) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Referenced lecture hall or meeting room does not exist");
        }

        boolean matchesLocation = repository.existsByNameIgnoreCaseAndCategoryInAndLocationAndSublocation(
                relatedResourceName,
                List.of(ResourceCategory.LECTURE_HALL, ResourceCategory.MEETING_ROOM),
                request.location(),
                request.sublocation());

        if (!matchesLocation) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Referenced lecture hall or meeting room must match the selected location and sublocation");
        }
    }

    private String normalizeRelatedResourceName(ResourceCatalogRequest request) {
        return request.relatedResourceName() == null ? null : request.relatedResourceName().trim();
    }

    private String normalizeEquipmentType(ResourceCatalogRequest request) {
        return request.equipmentType() == null ? null : request.equipmentType().trim();
    }

    private List<AvailabilityWindow> toWindows(List<AvailabilityWindowRequest> availabilityWindows) {
        List<AvailabilityWindow> windows = new ArrayList<>();
        if (availabilityWindows == null) {
            return windows;
        }

        for (AvailabilityWindowRequest window : availabilityWindows) {
            windows.add(new AvailabilityWindow(window.dayScope(), window.openTime(), window.closeTime()));
        }
        return windows;
    }

    private ResourceCatalogResponse toResponse(ResourceCatalogItem item) {
        List<AvailabilityWindowResponse> windows = item.getAvailabilityWindows() == null
                ? List.of()
                : item.getAvailabilityWindows().stream()
                        .map(window -> new AvailabilityWindowResponse(
                                window.getDayScope(),
                                window.getOpenTime(),
                                window.getCloseTime()))
                        .toList();

        return new ResourceCatalogResponse(
                item.getId(),
                item.getCategory(),
                item.getCategory() == null ? null : item.getCategory().getDisplayName(),
                item.getName(),
                item.getCapacity(),
                item.getLocation(),
                item.getSublocation(),
                item.getStatus(),
                item.getRelatedResourceName(),
                item.getEquipmentType(),
                windows);
    }
}
