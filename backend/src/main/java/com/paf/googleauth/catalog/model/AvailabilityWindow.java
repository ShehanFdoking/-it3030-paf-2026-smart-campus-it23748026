package com.paf.googleauth.catalog.model;

import org.springframework.data.mongodb.core.mapping.Field;

public class AvailabilityWindow {

    @Field("day_scope")
    private String dayScope;

    @Field("open_time")
    private String openTime;

    @Field("close_time")
    private String closeTime;

    public AvailabilityWindow() {
    }

    public AvailabilityWindow(String dayScope, String openTime, String closeTime) {
        this.dayScope = dayScope;
        this.openTime = openTime;
        this.closeTime = closeTime;
    }

    public String getDayScope() {
        return dayScope;
    }

    public void setDayScope(String dayScope) {
        this.dayScope = dayScope;
    }

    public String getOpenTime() {
        return openTime;
    }

    public void setOpenTime(String openTime) {
        this.openTime = openTime;
    }

    public String getCloseTime() {
        return closeTime;
    }

    public void setCloseTime(String closeTime) {
        this.closeTime = closeTime;
    }
}
