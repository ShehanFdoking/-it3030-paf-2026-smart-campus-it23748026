package com.paf.googleauth.catalog.dto;

public record AvailabilityWindowResponse(
        String dayScope,
        String openTime,
        String closeTime) {
}
