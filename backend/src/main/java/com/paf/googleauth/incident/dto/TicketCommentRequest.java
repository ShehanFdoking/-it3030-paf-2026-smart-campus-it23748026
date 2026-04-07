package com.paf.googleauth.incident.dto;

import com.paf.googleauth.incident.model.CommentRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TicketCommentRequest(
        @NotBlank String authorEmail,
        @NotBlank String authorName,
        @NotNull CommentRole authorRole,
        @NotBlank String text) {
}
