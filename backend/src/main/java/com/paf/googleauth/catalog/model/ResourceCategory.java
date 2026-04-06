package com.paf.googleauth.catalog.model;

public enum ResourceCategory {
    LECTURE_HALL("Lecture Hall"),
    MEETING_ROOM("Meeting Room"),
    EQUIPMENT("Equipment");

    private final String displayName;

    ResourceCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
