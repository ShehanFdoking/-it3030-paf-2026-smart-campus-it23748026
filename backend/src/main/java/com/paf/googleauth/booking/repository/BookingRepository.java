package com.paf.googleauth.booking.repository;

import com.paf.googleauth.booking.model.BookingRecord;
import com.paf.googleauth.booking.model.BookingStatus;
import com.paf.googleauth.catalog.model.ResourceCategory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends MongoRepository<BookingRecord, String> {

    List<BookingRecord> findAllByRequesterEmailOrderByCreatedAtDesc(String requesterEmail);

    Optional<BookingRecord> findByIdAndRequesterEmail(String id, String requesterEmail);

    List<BookingRecord> findAllByOrderByCreatedAtDesc();

    List<BookingRecord> findAllByResourceCategoryOrderByCreatedAtDesc(ResourceCategory category);

    List<BookingRecord> findAllByResourceIdAndBookingDateAndStatus(String resourceId, String bookingDate, BookingStatus status);

    List<BookingRecord> findAllByParentBookingId(String parentBookingId);
}
