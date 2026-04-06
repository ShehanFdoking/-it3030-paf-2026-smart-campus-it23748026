package com.paf.googleauth.catalog.dto;

import com.paf.googleauth.catalog.model.ResourceCategory;
import com.paf.googleauth.catalog.model.ResourceStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.ArrayList;
import java.util.List;

public record ResourceCatalogRequest(
        @NotNull ResourceCategory category,
        @NotBlank String name,
        @NotNull @Positive Integer capacity,
        @NotBlank String location,
        @NotBlank String sublocation,
        @NotNull ResourceStatus status,
        String relatedResourceName,
        @Valid List<AvailabilityWindowRequest> availabilityWindows) {
    public ResourceCatalogRequest {
        availabilityWindows = availabilityWindows == null ? new ArrayList<>() : List.copyOf(availabilityWindows);
    }
}
