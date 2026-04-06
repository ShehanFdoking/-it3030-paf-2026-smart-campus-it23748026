package com.paf.googleauth.booking.dto;

import java.util.List;

public record BookingRequestResult(
        boolean success,
        String message,
        BookingResponse booking,
        List<BookingSuggestionResponse> suggestions) {
}
