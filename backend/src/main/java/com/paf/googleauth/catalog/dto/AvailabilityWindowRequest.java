package com.paf.googleauth.catalog.dto;

import jakarta.validation.constraints.NotBlank;

public record AvailabilityWindowRequest(
        @NotBlank String dayScope,
        @NotBlank String openTime,
        @NotBlank String closeTime
) {
}
