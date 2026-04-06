package com.paf.googleauth.booking.dto;

import com.paf.googleauth.booking.model.BookingStatus;
import com.paf.googleauth.catalog.model.ResourceCategory;

import java.time.Instant;

public record BookingResponse(
        String id,
        String resourceId,
        ResourceCategory resourceCategory,
        String resourceName,
        String resourceLocation,
        String resourceSublocation,
        String bookingDate,
        String startTime,
        String endTime,
        String purpose,
        Integer expectedAttendees,
        String requesterEmail,
        String requesterName,
        BookingStatus status,
        String approvalCode,
        String adminNote,
        Instant createdAt,
        Instant updatedAt,
        boolean systemGenerated,
        String parentBookingId) {
}
