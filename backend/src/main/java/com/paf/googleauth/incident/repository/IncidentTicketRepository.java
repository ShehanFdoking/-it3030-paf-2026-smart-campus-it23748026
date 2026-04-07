package com.paf.googleauth.incident.repository;

import com.paf.googleauth.incident.model.IncidentTicket;
import com.paf.googleauth.incident.model.TicketStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {

    List<IncidentTicket> findAllByReporterEmailOrderByCreatedAtDesc(String reporterEmail);

    List<IncidentTicket> findAllByOrderByCreatedAtDesc();

    List<IncidentTicket> findAllByStatusOrderByCreatedAtDesc(TicketStatus status);

    List<IncidentTicket> findAllByBookingId(String bookingId);
}
