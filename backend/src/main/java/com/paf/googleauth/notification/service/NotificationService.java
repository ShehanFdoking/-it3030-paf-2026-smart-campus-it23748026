package com.paf.googleauth.notification.service;

import com.paf.googleauth.notification.dto.CreateNotificationRequest;
import com.paf.googleauth.notification.dto.NotificationResponse;
import com.paf.googleauth.notification.model.Notification;
import com.paf.googleauth.notification.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public NotificationResponse create(CreateNotificationRequest request) {
        Notification notification = new Notification();
        notification.setId(UUID.randomUUID().toString());
        notification.setRecipientEmail(request.recipientEmail().trim());
        notification.setTitle(request.title().trim());
        notification.setMessage(request.message().trim());
        notification.setType(request.type().trim());
        notification.setRelatedEntityType(trim(request.relatedEntityType()));
        notification.setRelatedEntityId(trim(request.relatedEntityId()));
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());
        notification.setUpdatedAt(Instant.now());
        return toResponse(notificationRepository.save(notification));
    }

    public List<NotificationResponse> listForRecipient(String recipientEmail) {
        return notificationRepository.findAllByRecipientEmailOrderByCreatedAtDesc(recipientEmail.trim()).stream()
                .map(this::toResponse)
                .toList();
    }

    public long unreadCount(String recipientEmail) {
        return notificationRepository.countByRecipientEmailAndReadFalse(recipientEmail.trim());
    }

    public NotificationResponse markRead(String id, boolean read) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        notification.setRead(read);
        notification.setUpdatedAt(Instant.now());
        return toResponse(notificationRepository.save(notification));
    }

    public void markAllRead(String recipientEmail) {
        List<Notification> notifications = notificationRepository.findAllByRecipientEmailOrderByCreatedAtDesc(recipientEmail.trim());
        notifications.forEach(item -> {
            item.setRead(true);
            item.setUpdatedAt(Instant.now());
        });
        notificationRepository.saveAll(notifications);
    }

    public NotificationResponse notifyBookingStatus(String recipientEmail, String status, String bookingId, String resourceName) {
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();
        String title = switch (normalizedStatus) {
            case "APPROVED" -> "Booking approved";
            case "REJECTED" -> "Booking rejected";
            default -> "Booking updated";
        };
        String message = switch (normalizedStatus) {
            case "APPROVED" -> "Your booking for " + resourceName + " was approved.";
            case "REJECTED" -> "Your booking for " + resourceName + " was rejected.";
            default -> "Your booking for " + resourceName + " was updated.";
        };
        return create(new CreateNotificationRequest(recipientEmail, title, message, "BOOKING", "booking", bookingId));
    }

    public NotificationResponse notifyTicketStatus(String recipientEmail, String status, String ticketId, String resourceName) {
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();
        String title = switch (normalizedStatus) {
            case "IN_PROGRESS" -> "Ticket in progress";
            case "RESOLVED" -> "Ticket resolved";
            case "CLOSED" -> "Ticket closed";
            case "REJECTED" -> "Ticket rejected";
            default -> "Ticket updated";
        };
        String message = "Your ticket for " + resourceName + " is now " + normalizedStatus + ".";
        return create(new CreateNotificationRequest(recipientEmail, title, message, "TICKET", "ticket", ticketId));
    }

    public NotificationResponse notifyTicketComment(String recipientEmail, String ticketId, String resourceName) {
        return create(new CreateNotificationRequest(recipientEmail, "New comment on your ticket",
                "A new comment was added to your ticket for " + resourceName + ".", "COMMENT", "ticket", ticketId));
    }

    public NotificationResponse notifyTicketCreated(String recipientEmail, String ticketId, String resourceName) {
        return create(new CreateNotificationRequest(recipientEmail, "Incident ticket submitted",
                "Your incident ticket for " + resourceName + " has been received and is now OPEN.", "TICKET", "ticket", ticketId));
    }

    public NotificationResponse notifyResourceStatusChange(String recipientEmail, String resourceId,
            String resourceName, String newStatus) {
        String normalizedStatus = newStatus == null ? "" : newStatus.trim().toUpperCase();
        String title = "OUT_OF_SERVICE".equals(normalizedStatus)
                ? "Resource unavailable: " + resourceName
                : "Resource available: " + resourceName;
        String message = "OUT_OF_SERVICE".equals(normalizedStatus)
                ? resourceName + " is now out of service. Your upcoming bookings may be affected."
                : resourceName + " is now active and available for booking.";
        return create(new CreateNotificationRequest(recipientEmail, title, message, "RESOURCE", "resource", resourceId));
    }

    public NotificationResponse notifyResourceDeleted(String recipientEmail, String resourceId, String resourceName) {
        return create(new CreateNotificationRequest(recipientEmail, "Resource removed: " + resourceName,
                resourceName + " has been removed from the catalog. Your upcoming bookings may be affected.",
                "RESOURCE", "resource", resourceId));
    }

    public NotificationResponse notifyResourceCreated(String adminEmail, String resourceId, String resourceName, String category) {
        return create(new CreateNotificationRequest(adminEmail, "Resource created: " + resourceName,
                "New " + category + " resource \"" + resourceName + "\" has been added to the catalog.",
                "RESOURCE", "resource", resourceId));
    }

    public NotificationResponse notifyResourceUpdated(String adminEmail, String resourceId, String resourceName) {
        return create(new CreateNotificationRequest(adminEmail, "Resource updated: " + resourceName,
                "Resource \"" + resourceName + "\" has been updated in the catalog.",
                "RESOURCE", "resource", resourceId));
    }

    public NotificationResponse notifyResourceDeletedAdmin(String adminEmail, String resourceId, String resourceName) {
        return create(new CreateNotificationRequest(adminEmail, "Resource deleted: " + resourceName,
                "Resource \"" + resourceName + "\" has been permanently removed from the catalog.",
                "RESOURCE", "resource", resourceId));
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getRecipientEmail(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType(),
                notification.getRelatedEntityType(),
                notification.getRelatedEntityId(),
                notification.isRead(),
                notification.getCreatedAt(),
                notification.getUpdatedAt());
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
