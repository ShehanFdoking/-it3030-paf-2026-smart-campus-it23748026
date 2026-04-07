package com.paf.googleauth.incident.dto;

import com.paf.googleauth.incident.model.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record UpdateMyIncidentTicketRequest(
        @NotBlank String category,
        @NotBlank String description,
        @NotNull TicketPriority priority,
        @NotBlank String preferredContact,
        List<String> attachments) {
}
