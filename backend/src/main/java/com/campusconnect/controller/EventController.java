package com.campusconnect.controller;

import com.campusconnect.dto.request.EventCreateRequest;
import com.campusconnect.dto.response.AttendeeResponse;
import com.campusconnect.dto.response.EventResponse;
import com.campusconnect.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllUpcomingEvents(Authentication authentication) {
        return ResponseEntity.ok(eventService.getAllUpcomingEvents(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(eventService.getEventById(id, authentication.getName()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<EventResponse> createEvent(
            @RequestBody @Valid EventCreateRequest request,
            Authentication authentication
    ) {
        String organizerEmail = authentication.getName();
        EventResponse createdEvent = eventService.createEvent(request, organizerEmail);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @GetMapping("/my-events")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<EventResponse>> getMyEvents(Authentication authentication) {
        String organizerEmail = authentication.getName();
        return ResponseEntity.ok(eventService.getEventsByOrganizer(organizerEmail));
    }

    @GetMapping("/my-rsvps")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<EventResponse>> getMyRsvps(Authentication authentication) {
        return ResponseEntity.ok(eventService.getMyRsvps(authentication.getName()));
    }

    @PostMapping("/{id}/rsvp")
    public ResponseEntity<EventResponse> register(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(eventService.register(id, authentication.getName()));
    }

    @DeleteMapping("/{id}/rsvp")
    public ResponseEntity<EventResponse> cancelRegistration(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(eventService.cancelRegistration(id, authentication.getName()));
    }

    @GetMapping("/{id}/attendees")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<List<AttendeeResponse>> getEventAttendees(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(eventService.getEventAttendees(id, authentication.getName()));
    }

    @DeleteMapping("/{id}/attendees/{userId}")
    @PreAuthorize("hasAnyRole('ORGANIZER', 'ADMIN')")
    public ResponseEntity<Void> removeAttendee(
            @PathVariable UUID id,
            @PathVariable UUID userId,
            Authentication authentication
    ) {
        eventService.removeAttendee(id, userId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}