package com.paf.googleauth.booking.model;

import com.paf.googleauth.catalog.model.ResourceCategory;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "resource_bookings")
public class BookingRecord {

    @Id
    private String id;

    @Field("resource_id")
    private String resourceId;

    @Field("resource_category")
    private ResourceCategory resourceCategory;

    @Field("resource_name")
    private String resourceName;

    @Field("resource_location")
    private String resourceLocation;

    @Field("resource_sublocation")
    private String resourceSublocation;

    @Field("booking_date")
    private String bookingDate;

    @Field("start_time")
    private String startTime;

    @Field("end_time")
    private String endTime;

    @Field("purpose")
    private String purpose;

    @Field("expected_attendees")
    private Integer expectedAttendees;

    @Field("requester_email")
    private String requesterEmail;

    @Field("requester_name")
    private String requesterName;

    @Field("status")
    private BookingStatus status;

    @Field("approval_code")
    private String approvalCode;

    @Field("admin_note")
    private String adminNote;

    @Field("parent_booking_id")
    private String parentBookingId;

    @Field("system_generated")
    private boolean systemGenerated;

    @Field("created_at")
    private Instant createdAt;

    @Field("updated_at")
    private Instant updatedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public ResourceCategory getResourceCategory() {
        return resourceCategory;
    }

    public void setResourceCategory(ResourceCategory resourceCategory) {
        this.resourceCategory = resourceCategory;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getResourceLocation() {
        return resourceLocation;
    }

    public void setResourceLocation(String resourceLocation) {
        this.resourceLocation = resourceLocation;
    }

    public String getResourceSublocation() {
        return resourceSublocation;
    }

    public void setResourceSublocation(String resourceSublocation) {
        this.resourceSublocation = resourceSublocation;
    }

    public String getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(String bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public Integer getExpectedAttendees() {
        return expectedAttendees;
    }

    public void setExpectedAttendees(Integer expectedAttendees) {
        this.expectedAttendees = expectedAttendees;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getApprovalCode() {
        return approvalCode;
    }

    public void setApprovalCode(String approvalCode) {
        this.approvalCode = approvalCode;
    }

    public String getAdminNote() {
        return adminNote;
    }

    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }

    public String getParentBookingId() {
        return parentBookingId;
    }

    public void setParentBookingId(String parentBookingId) {
        this.parentBookingId = parentBookingId;
    }

    public boolean isSystemGenerated() {
        return systemGenerated;
    }

    public void setSystemGenerated(boolean systemGenerated) {
        this.systemGenerated = systemGenerated;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
