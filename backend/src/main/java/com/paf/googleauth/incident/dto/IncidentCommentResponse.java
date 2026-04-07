package com.paf.googleauth.incident.dto;

import com.paf.googleauth.incident.model.CommentRole;

import java.time.Instant;

public record IncidentCommentResponse(
        String id,
        String authorEmail,
        String authorName,
        CommentRole authorRole,
        String text,
        Instant createdAt,
        Instant updatedAt) {
}
