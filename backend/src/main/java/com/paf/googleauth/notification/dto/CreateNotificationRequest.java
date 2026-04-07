package com.paf.googleauth.notification.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateNotificationRequest(
        @NotBlank String recipientEmail,
        @NotBlank String title,
        @NotBlank String message,
        @NotBlank String type,
        String relatedEntityType,
        String relatedEntityId) {
}
