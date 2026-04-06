package com.paf.googleauth.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record BookingUpdateRequest(
        @NotBlank String bookingDate,
        @NotBlank String startTime,
        @NotBlank String endTime,
        @NotBlank String purpose,
        @Positive Integer expectedAttendees,
        String linkedRoomApprovalCode) {
}
