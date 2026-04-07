package com.paf.googleauth.notification.dto;

import java.time.Instant;

public record NotificationResponse(
        String id,
        String recipientEmail,
        String title,
        String message,
        String type,
        String relatedEntityType,
        String relatedEntityId,
        boolean read,
        Instant createdAt,
        Instant updatedAt) {
}
