package com.paf.googleauth.incident.service;

import com.paf.googleauth.catalog.model.ResourceCatalogItem;
import com.paf.googleauth.catalog.repository.ResourceCatalogRepository;
import com.paf.googleauth.incident.dto.CreateIncidentTicketRequest;
import com.paf.googleauth.incident.dto.IncidentCommentResponse;
import com.paf.googleauth.incident.dto.IncidentTicketResponse;
import com.paf.googleauth.incident.dto.TicketCommentRequest;
import com.paf.googleauth.incident.dto.TicketCommentUpdateRequest;
import com.paf.googleauth.incident.dto.UpdateMyIncidentTicketRequest;
import com.paf.googleauth.incident.dto.UpdateIncidentTicketRequest;
import com.paf.googleauth.incident.model.CommentRole;
import com.paf.googleauth.incident.model.IncidentTicket;
import com.paf.googleauth.incident.model.TicketComment;
import com.paf.googleauth.incident.model.TicketStatus;
import com.paf.googleauth.incident.repository.IncidentTicketRepository;
import com.paf.googleauth.notification.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class IncidentTicketService {

    private final IncidentTicketRepository incidentTicketRepository;
    private final ResourceCatalogRepository resourceCatalogRepository;
    private final NotificationService notificationService;

    public IncidentTicketService(IncidentTicketRepository incidentTicketRepository,
            ResourceCatalogRepository resourceCatalogRepository,
            NotificationService notificationService) {
        this.incidentTicketRepository = incidentTicketRepository;
        this.resourceCatalogRepository = resourceCatalogRepository;
        this.notificationService = notificationService;
    }

    public IncidentTicketResponse createTicket(CreateIncidentTicketRequest request) {
        validateAttachments(request.attachments());

        ResourceCatalogItem resource = resourceCatalogRepository.findById(request.resourceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        IncidentTicket ticket = new IncidentTicket();
        ticket.setBookingId(trim(request.bookingId()));
        ticket.setResourceId(resource.getId());
        ticket.setResourceName(resource.getName());
        ticket.setResourceLocation(resource.getLocation());
        ticket.setResourceSublocation(resource.getSublocation());
        ticket.setReporterEmail(request.reporterEmail().trim());
        ticket.setReporterName(request.reporterName().trim());
        ticket.setCategory(request.category().trim());
        ticket.setDescription(request.description().trim());
        ticket.setPriority(request.priority());
        ticket.setPreferredContact(request.preferredContact().trim());
        ticket.setAttachments(request.attachments() == null ? List.of() : request.attachments());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());

        return toResponse(incidentTicketRepository.save(ticket));
    }

    public List<IncidentTicketResponse> listMyTickets(String email) {
        return incidentTicketRepository.findAllByReporterEmailOrderByCreatedAtDesc(email).stream()
                .map(this::toResponse)
                .toList();
    }

    public IncidentTicketResponse updateMyTicket(String ticketId, String reporterEmail,
            UpdateMyIncidentTicketRequest request) {
        IncidentTicket ticket = incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        if (!ticket.getReporterEmail().equalsIgnoreCase(trim(reporterEmail))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own tickets");
        }
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only OPEN tickets can be edited");
        }

        validateAttachments(request.attachments());

        ticket.setCategory(request.category().trim());
        ticket.setDescription(request.description().trim());
        ticket.setPriority(request.priority());
        ticket.setPreferredContact(request.preferredContact().trim());
        ticket.setAttachments(request.attachments() == null ? List.of() : request.attachments());
        ticket.setUpdatedAt(Instant.now());

        return toResponse(incidentTicketRepository.save(ticket));
    }

    public void deleteMyTicket(String ticketId, String reporterEmail) {
        IncidentTicket ticket = incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        if (!ticket.getReporterEmail().equalsIgnoreCase(trim(reporterEmail))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own tickets");
        }
        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only OPEN tickets can be deleted");
        }

        incidentTicketRepository.delete(ticket);
    }

    public List<IncidentTicketResponse> listAdminTickets(TicketStatus status, String search) {
        List<IncidentTicket> tickets = status == null
                ? incidentTicketRepository.findAllByOrderByCreatedAtDesc()
                : incidentTicketRepository.findAllByStatusOrderByCreatedAtDesc(status);

        return tickets.stream()
                .filter(ticket -> matchesSearch(ticket, search))
                .map(this::toResponse)
                .toList();
    }

    public List<IncidentTicketResponse> listByBookingId(String bookingId) {
        return incidentTicketRepository.findAllByBookingId(bookingId).stream()
                .map(this::toResponse)
                .toList();
    }

    public IncidentTicketResponse updateTicket(String ticketId, UpdateIncidentTicketRequest request) {
        IncidentTicket ticket = incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
        TicketStatus previousStatus = ticket.getStatus();

        boolean hasAssignedStaffUpdate = !isBlank(request.assignedStaffEmail())
                || !isBlank(request.assignedStaffName());

        if (!isBlank(request.assignedStaffEmail())) {
            ticket.setAssignedStaffEmail(request.assignedStaffEmail().trim());
        }
        if (!isBlank(request.assignedStaffName())) {
            ticket.setAssignedStaffName(request.assignedStaffName().trim());
        }

        // Auto move to IN_PROGRESS once technician assignment is provided.
        if (hasAssignedStaffUpdate && ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        if (request.resolutionNotes() != null) {
            ticket.setResolutionNotes(trim(request.resolutionNotes()));
        }

        // Auto move to RESOLVED once technician adds resolution notes.
        if (!isBlank(request.resolutionNotes()) && ticket.getStatus() == TicketStatus.IN_PROGRESS) {
            ticket.setStatus(TicketStatus.RESOLVED);
        }

        if (request.status() != null) {
            if (request.status() != TicketStatus.CLOSED && request.status() != TicketStatus.REJECTED) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Status changes are automatic. Only CLOSED or REJECTED can be set directly");
            }

            validateStatusTransition(ticket.getStatus(), request.status());
            if (request.status() == TicketStatus.REJECTED && isBlank(request.rejectionReason())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
            }
            ticket.setStatus(request.status());
        }

        if (request.rejectionReason() != null) {
            ticket.setRejectionReason(trim(request.rejectionReason()));
        }

        ticket.setUpdatedAt(Instant.now());
        IncidentTicketResponse response = toResponse(incidentTicketRepository.save(ticket));

        if (previousStatus != ticket.getStatus()) {
            notificationService.notifyTicketStatus(
                    ticket.getReporterEmail(),
                    ticket.getStatus().name(),
                    ticket.getId(),
                    ticket.getResourceName());
        }

        return response;
    }

    public IncidentTicketResponse addComment(String ticketId, TicketCommentRequest request) {
        IncidentTicket ticket = incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        if (request.authorRole() == CommentRole.USER
                && !ticket.getReporterEmail().equalsIgnoreCase(request.authorEmail().trim())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Users can only comment on their own tickets");
        }

        TicketComment comment = new TicketComment();
        comment.setId(UUID.randomUUID().toString());
        comment.setAuthorEmail(request.authorEmail().trim());
        comment.setAuthorName(request.authorName().trim());
        comment.setAuthorRole(request.authorRole());
        comment.setText(request.text().trim());
        comment.setCreatedAt(Instant.now());
        comment.setUpdatedAt(Instant.now());

        ticket.getComments().add(comment);
        ticket.setUpdatedAt(Instant.now());
        IncidentTicketResponse response = toResponse(incidentTicketRepository.save(ticket));

        if (request.authorRole() != CommentRole.USER) {
            notificationService.notifyTicketComment(
                    ticket.getReporterEmail(),
                    ticket.getId(),
                    ticket.getResourceName());
        }

        return response;
    }

    public IncidentTicketResponse updateComment(String ticketId, String commentId, String actorEmail,
            TicketCommentUpdateRequest request) {
        IncidentTicket ticket = incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        TicketComment comment = ticket.getComments().stream()
                .filter(item -> item.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!comment.getAuthorEmail().equalsIgnoreCase(actorEmail.trim())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own comments");
        }

        comment.setText(request.text().trim());
        comment.setUpdatedAt(Instant.now());
        ticket.setUpdatedAt(Instant.now());

        return toResponse(incidentTicketRepository.save(ticket));
    }

    public IncidentTicketResponse deleteComment(String ticketId, String commentId, String actorEmail) {
        IncidentTicket ticket = incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        TicketComment comment = ticket.getComments().stream()
                .filter(item -> item.getId().equals(commentId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!comment.getAuthorEmail().equalsIgnoreCase(actorEmail.trim())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own comments");
        }

        ticket.setComments(ticket.getComments().stream()
                .filter(item -> !item.getId().equals(commentId))
                .toList());
        ticket.setUpdatedAt(Instant.now());

        return toResponse(incidentTicketRepository.save(ticket));
    }

    private void validateAttachments(List<String> attachments) {
        if (attachments == null) {
            return;
        }
        if (attachments.size() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 3 attachments are allowed");
        }
        boolean hasInvalid = attachments.stream().anyMatch(item -> {
            String value = trim(item);
            return isBlank(value) || (!value.startsWith("data:image/") && !value.startsWith("http"));
        });
        if (hasInvalid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attachments must be valid image data");
        }
    }

    private boolean matchesSearch(IncidentTicket ticket, String search) {
        if (isBlank(search)) {
            return true;
        }
        String query = search.trim().toLowerCase(Locale.ROOT);
        String text = String.join(" ",
                safe(ticket.getResourceName()),
                safe(ticket.getResourceLocation()),
                safe(ticket.getResourceSublocation()),
                safe(ticket.getReporterName()),
                safe(ticket.getReporterEmail()),
                safe(ticket.getCategory()),
                safe(ticket.getDescription()),
                safe(ticket.getAssignedStaffName()),
                safe(ticket.getAssignedStaffEmail()),
                ticket.getStatus() == null ? "" : ticket.getStatus().name(),
                ticket.getPriority() == null ? "" : ticket.getPriority().name())
                .toLowerCase(Locale.ROOT);

        return text.contains(query);
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        if (current == next) {
            return;
        }
        if (next == TicketStatus.REJECTED) {
            return;
        }
        boolean valid = (current == TicketStatus.OPEN && next == TicketStatus.IN_PROGRESS)
                || (current == TicketStatus.IN_PROGRESS && next == TicketStatus.RESOLVED)
                || (current == TicketStatus.RESOLVED && next == TicketStatus.CLOSED);

        if (!valid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid status transition. Allowed flow: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED");
        }
    }

    private IncidentTicketResponse toResponse(IncidentTicket ticket) {
        return new IncidentTicketResponse(
                ticket.getId(),
                ticket.getBookingId(),
                ticket.getResourceId(),
                ticket.getResourceName(),
                ticket.getResourceLocation(),
                ticket.getResourceSublocation(),
                ticket.getReporterEmail(),
                ticket.getReporterName(),
                ticket.getCategory(),
                ticket.getDescription(),
                ticket.getPriority(),
                ticket.getPreferredContact(),
                ticket.getAttachments(),
                ticket.getStatus(),
                ticket.getAssignedStaffEmail(),
                ticket.getAssignedStaffName(),
                ticket.getResolutionNotes(),
                ticket.getRejectionReason(),
                ticket.getComments().stream().map(this::toCommentResponse).toList(),
                ticket.getCreatedAt(),
                ticket.getUpdatedAt());
    }

    private IncidentCommentResponse toCommentResponse(TicketComment comment) {
        return new IncidentCommentResponse(
                comment.getId(),
                comment.getAuthorEmail(),
                comment.getAuthorName(),
                comment.getAuthorRole(),
                comment.getText(),
                comment.getCreatedAt(),
                comment.getUpdatedAt());
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return trim(value) == null || trim(value).isBlank();
    }
}
