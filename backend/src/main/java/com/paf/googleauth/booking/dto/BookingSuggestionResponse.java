package com.paf.googleauth.booking.dto;

import com.paf.googleauth.catalog.model.ResourceCategory;

public record BookingSuggestionResponse(
        String resourceId,
        ResourceCategory resourceCategory,
        String resourceName,
        String location,
        String sublocation,
        Integer capacity) {
}
