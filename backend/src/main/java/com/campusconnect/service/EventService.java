package com.campusconnect.service;

import com.campusconnect.dto.request.EventCreateRequest;
import com.campusconnect.dto.response.EventResponse;
import com.campusconnect.model.Event;
import com.campusconnect.model.User;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Transactional
    public EventResponse createEvent(EventCreateRequest request, String organizerEmail) {
        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new EntityNotFoundException("Organizer not found"));

        Event event = Event.builder()
                .title(request.title())
                .description(request.description())
                .category(request.category())
                .eventDate(request.eventDate())
                .eventTime(request.eventTime())
                .venue(request.venue())
                .capacity(request.capacity())
                .organizer(organizer)
                .build();

        Event savedEvent = eventRepository.saveAndFlush(event);
        return mapToResponse(savedEvent);
    }

    public List<EventResponse> getAllUpcomingEvents() {
        return eventRepository.findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate.now())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<EventResponse> getEventsByOrganizer(String organizerEmail) {
        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return eventRepository.findByOrganizer(organizer)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public EventResponse getEventById(UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with ID: " + id));
        return mapToResponse(event);
    }

    // Helper mapper
    private EventResponse mapToResponse(Event event) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getCategory(),
                event.getEventDate(),
                event.getEventTime(),
                event.getVenue(),
                event.getCapacity(),
                event.getOrganizer().getFullName(),
                event.getOrganizer().getEmail()
        );
    }
}