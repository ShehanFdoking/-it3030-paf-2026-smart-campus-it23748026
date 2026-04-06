package com.paf.googleauth.booking.dto;

import com.paf.googleauth.booking.model.BookingStatus;
import jakarta.validation.constraints.NotNull;

public record BookingStatusUpdateRequest(
        @NotNull BookingStatus status,
        String adminNote) {
}
