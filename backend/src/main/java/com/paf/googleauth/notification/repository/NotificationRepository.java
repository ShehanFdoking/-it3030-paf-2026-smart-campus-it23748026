package com.paf.googleauth.notification.repository;

import com.paf.googleauth.notification.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findAllByRecipientEmailOrderByCreatedAtDesc(String recipientEmail);

    long countByRecipientEmailAndReadFalse(String recipientEmail);
}
