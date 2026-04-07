package com.paf.googleauth.incident.dto;

import com.paf.googleauth.incident.model.TicketStatus;

public record UpdateIncidentTicketRequest(
        TicketStatus status,
        String assignedStaffEmail,
        String assignedStaffName,
        String resolutionNotes,
        String rejectionReason) {
}
