package com.paf.googleauth.incident.dto;

import jakarta.validation.constraints.NotBlank;

public record TicketCommentUpdateRequest(@NotBlank String text) {
}
