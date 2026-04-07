package com.paf.googleauth.incident.model;

import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

public class TicketComment {

    @Field("id")
    private String id;

    @Field("author_email")
    private String authorEmail;

    @Field("author_name")
    private String authorName;

    @Field("author_role")
    private CommentRole authorRole;

    @Field("text")
    private String text;

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

    public String getAuthorEmail() {
        return authorEmail;
    }

    public void setAuthorEmail(String authorEmail) {
        this.authorEmail = authorEmail;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public CommentRole getAuthorRole() {
        return authorRole;
    }

    public void setAuthorRole(CommentRole authorRole) {
        this.authorRole = authorRole;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
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
