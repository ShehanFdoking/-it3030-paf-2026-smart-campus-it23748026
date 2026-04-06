package com.paf.googleauth.catalog.dto;

import com.paf.googleauth.catalog.model.ResourceCategory;
import com.paf.googleauth.catalog.model.ResourceStatus;

import java.util.List;

public record ResourceCatalogResponse(
                String id,
                ResourceCategory category,
                String categoryLabel,
                String name,
                Integer capacity,
                String location,
                String sublocation,
                ResourceStatus status,
                String relatedResourceName,
                String equipmentType,
                List<AvailabilityWindowResponse> availabilityWindows) {
}
