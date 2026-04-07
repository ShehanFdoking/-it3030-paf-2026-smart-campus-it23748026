package com.paf.googleauth.incident.controller;

import com.paf.googleauth.incident.dto.CreateIncidentTicketRequest;
import com.paf.googleauth.incident.dto.IncidentTicketResponse;
import com.paf.googleauth.incident.dto.TicketCommentRequest;
import com.paf.googleauth.incident.dto.TicketCommentUpdateRequest;
import com.paf.googleauth.incident.dto.UpdateIncidentTicketRequest;
import com.paf.googleauth.incident.model.TicketStatus;
import com.paf.googleauth.incident.service.IncidentTicketService;
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

@RestController
@RequestMapping("/api")
public class IncidentTicketController {

    private final IncidentTicketService incidentTicketService;

    public IncidentTicketController(IncidentTicketService incidentTicketService) {
        this.incidentTicketService = incidentTicketService;
    }

    @PostMapping("/incidents")
    public IncidentTicketResponse create(@Valid @RequestBody CreateIncidentTicketRequest request) {
        return incidentTicketService.createTicket(request);
    }

    @GetMapping("/incidents/my")
    public List<IncidentTicketResponse> listMy(@RequestParam String email) {
        return incidentTicketService.listMyTickets(email);
    }

    @GetMapping("/admin/incidents")
    public List<IncidentTicketResponse> listAdmin(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) String search) {
        return incidentTicketService.listAdminTickets(status, search);
    }

    @GetMapping("/bookings/{bookingId}/incidents")
    public List<IncidentTicketResponse> listByBooking(@PathVariable String bookingId) {
        return incidentTicketService.listByBookingId(bookingId);
    }

    @PatchMapping("/admin/incidents/{id}")
    public IncidentTicketResponse update(@PathVariable String id, @RequestBody UpdateIncidentTicketRequest request) {
        return incidentTicketService.updateTicket(id, request);
    }

    @PostMapping("/incidents/{id}/comments")
    public IncidentTicketResponse addComment(@PathVariable String id, @Valid @RequestBody TicketCommentRequest request) {
        return incidentTicketService.addComment(id, request);
    }

    @PutMapping("/incidents/{id}/comments/{commentId}")
    public IncidentTicketResponse updateComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestParam String actorEmail,
            @Valid @RequestBody TicketCommentUpdateRequest request) {
        return incidentTicketService.updateComment(id, commentId, actorEmail, request);
    }

    @DeleteMapping("/incidents/{id}/comments/{commentId}")
    public IncidentTicketResponse deleteComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @RequestParam String actorEmail) {
        return incidentTicketService.deleteComment(id, commentId, actorEmail);
    }
}
