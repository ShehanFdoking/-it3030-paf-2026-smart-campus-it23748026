package com.paf.googleauth.incident.dto;

import com.paf.googleauth.incident.model.TicketPriority;
import com.paf.googleauth.incident.model.TicketStatus;

import java.time.Instant;
import java.util.List;

public record IncidentTicketResponse(
        String id,
        String bookingId,
        String resourceId,
        String resourceName,
        String resourceLocation,
        String resourceSublocation,
        String reporterEmail,
        String reporterName,
        String category,
        String description,
        TicketPriority priority,
        String preferredContact,
        List<String> attachments,
        TicketStatus status,
        String assignedStaffEmail,
        String assignedStaffName,
        String resolutionNotes,
        String rejectionReason,
        List<IncidentCommentResponse> comments,
        Instant createdAt,
        Instant updatedAt) {
}
