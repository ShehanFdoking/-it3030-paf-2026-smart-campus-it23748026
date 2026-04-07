package com.paf.googleauth.notification.controller;

import com.paf.googleauth.notification.dto.CreateNotificationRequest;
import com.paf.googleauth.notification.dto.MarkReadRequest;
import com.paf.googleauth.notification.dto.NotificationResponse;
import com.paf.googleauth.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponse> list(@RequestParam String email) {
        return notificationService.listForRecipient(email);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@RequestParam String email) {
        return Map.of("count", notificationService.unreadCount(email));
    }

    @PostMapping
    public NotificationResponse create(@Valid @RequestBody CreateNotificationRequest request) {
        return notificationService.create(request);
    }

    @PatchMapping("/{id}/read")
    public NotificationResponse markRead(@PathVariable String id, @Valid @RequestBody MarkReadRequest request) {
        return notificationService.markRead(id, request.read());
    }

    @PatchMapping("/read-all")
    public Map<String, String> readAll(@RequestParam String email) {
        notificationService.markAllRead(email);
        return Map.of("message", "Notifications marked as read");
    }
}
