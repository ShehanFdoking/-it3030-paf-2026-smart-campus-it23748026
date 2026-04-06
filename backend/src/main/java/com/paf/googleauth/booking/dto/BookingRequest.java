package com.paf.googleauth.booking.dto;

import com.paf.googleauth.catalog.model.ResourceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record BookingRequest(
        @NotBlank String resourceId,
        @NotNull ResourceCategory resourceCategory,
        @NotBlank String bookingDate,
        @NotBlank String startTime,
        @NotBlank String endTime,
        @NotBlank String purpose,
        @Positive Integer expectedAttendees,
        @NotBlank String requesterEmail,
        @NotBlank String requesterName,
        String linkedRoomApprovalCode) {
}
