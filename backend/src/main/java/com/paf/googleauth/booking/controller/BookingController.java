package com.paf.googleauth.booking.controller;

import com.paf.googleauth.booking.dto.BookingRequest;
import com.paf.googleauth.booking.dto.BookingRequestResult;
import com.paf.googleauth.booking.dto.BookingResponse;
import com.paf.googleauth.booking.dto.BookingStatusUpdateRequest;
import com.paf.googleauth.booking.dto.BookingUpdateRequest;
import com.paf.googleauth.booking.model.BookingStatus;
import com.paf.googleauth.booking.service.BookingService;
import com.paf.googleauth.catalog.model.ResourceCategory;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/bookings/request")
    public BookingRequestResult requestBooking(@Valid @RequestBody BookingRequest request) {
        return bookingService.requestBooking(request);
    }

    @GetMapping("/bookings/my")
    public List<BookingResponse> myBookings(@RequestParam String email) {
        return bookingService.listMyBookings(email);
    }

    @PutMapping("/bookings/{id}")
    public BookingRequestResult updateMyBooking(
            @PathVariable String id,
            @RequestParam String email,
            @Valid @RequestBody BookingUpdateRequest request) {
        return bookingService.updateMyBooking(id, email, request);
    }

    @DeleteMapping("/bookings/{id}")
    public Map<String, String> deleteMyBooking(@PathVariable String id, @RequestParam String email) {
        bookingService.deleteMyBooking(id, email);
        return Map.of("message", "Booking deleted successfully");
    }

    @GetMapping("/admin/bookings")
    public List<BookingResponse> adminBookings(
            @RequestParam(required = false) ResourceCategory category,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) String search) {
        return bookingService.listAdminBookings(category, status, search);
    }

    @PatchMapping("/admin/bookings/{id}/status")
    public BookingResponse updateStatus(@PathVariable String id,
            @Valid @RequestBody BookingStatusUpdateRequest request) {
        return bookingService.updateBookingStatus(id, request);
    }
}
