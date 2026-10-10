package com.campusconnect.service;

import com.campusconnect.dto.request.EventCreateRequest;
import com.campusconnect.dto.response.AttendeeResponse;
import com.campusconnect.dto.response.EventResponse;
import com.campusconnect.model.Event;
import com.campusconnect.model.EventRegistration;
import com.campusconnect.model.User;
import com.campusconnect.model.Role;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.EventRegistrationRepository;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.exception.EventCapacityExceededException;
import com.campusconnect.exception.RsvpNotAllowedException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventRegistrationRepository registrationRepository;

    @Transactional
    public EventResponse createEvent(EventCreateRequest request, String organizerEmail) {
        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new EntityNotFoundException("Organizer not found"));

        Event event = Event.builder()
                .title(request.title())
                .description(request.description())
                .category(request.category())
                .campus(request.campus())
                .imageUrl(request.imageUrl())
                .eventDate(request.eventDate())
                .eventTime(request.eventTime())
                .venue(request.venue())
                .capacity(request.capacity())
                .organizer(organizer)
                .build();

        Event savedEvent = eventRepository.saveAndFlush(event);
        return mapToResponse(savedEvent, false);
    }

    public List<EventResponse> getAllUpcomingEvents(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        List<Event> events = eventRepository.findUpcomingEventsWithOrganizer(LocalDate.now());
        Set<UUID> registeredEventIds = registeredEventIds(user, events);
        return events
                .stream()
                .map(event -> mapToResponse(event, registeredEventIds.contains(event.getId())))
                .toList();
    }

    public List<EventResponse> getEventsByOrganizer(String organizerEmail) {
        User organizer = userRepository.findByEmail(organizerEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        List<Event> events = eventRepository.findByOrganizer(organizer);
        Set<UUID> registeredEventIds = registeredEventIds(organizer, events);
        return events
                .stream()
                .map(event -> mapToResponse(event, registeredEventIds.contains(event.getId())))
                .toList();
    }

    public EventResponse getEventById(UUID id, String userEmail) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with ID: " + id));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return mapToResponse(event, registrationRepository.existsByEventIdAndUser(id, user));
    }

    public List<EventResponse> getMyRsvps(String userEmail) {
        User user = findUser(userEmail);
        return registrationRepository.findByUserWithEventAndOrganizer(user)
                .stream()
                .map(registration -> mapToResponse(registration.getEvent(), true))
                .toList();
    }

    @Transactional
    public EventResponse register(UUID eventId, String userEmail) {
        User user = findUser(userEmail);
        if (user.getRole() != Role.STUDENT) {
            throw new RsvpNotAllowedException();
        }
        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with ID: " + eventId));

        if (!registrationRepository.existsByEventIdAndUser(eventId, user)) {
            int registeredCount = event.getRegisteredCount() == null ? 0 : event.getRegisteredCount();
            if (registeredCount >= event.getCapacity()) {
                throw new EventCapacityExceededException("This event is fully booked.");
            }
            registrationRepository.save(EventRegistration.builder().event(event).user(user).build());
            event.setRegisteredCount(registeredCount + 1);
        }
        return mapToResponse(event, true);
    }

    @Transactional
    public EventResponse cancelRegistration(UUID eventId, String userEmail) {
        User user = findUser(userEmail);
        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with ID: " + eventId));

        if (registrationRepository.existsByEventIdAndUser(eventId, user)) {
            registrationRepository.deleteByEventIdAndUser(eventId, user);
            event.setRegisteredCount(Math.max(0, (event.getRegisteredCount() == null ? 0 : event.getRegisteredCount()) - 1));
        }
        return mapToResponse(event, false);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    private Set<UUID> registeredEventIds(User user, List<Event> events) {
        if (events.isEmpty()) {
            return Set.of();
        }
        return registrationRepository.findEventIdsByUserAndEventIdIn(
                user, events.stream().map(Event::getId).toList());
    }

    public List<AttendeeResponse> getEventAttendees(UUID eventId, String organizerEmail) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        User requester = findUser(organizerEmail);

        // Security check: You can only view the roster for events YOU organized (unless you are Admin)
        if (!event.getOrganizer().getUserId().equals(requester.getUserId()) && requester.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You can only view attendees for your own events.");
        }

        return registrationRepository.findByEventIdWithUser(eventId)
                .stream()
                .map(reg -> new AttendeeResponse(
                        reg.getUser().getUserId(),
                        reg.getUser().getFullName(),
                        reg.getUser().getEmail(),
                        reg.getRegisteredAt()
                ))
                .toList();
    }

    @Transactional
    public void removeAttendee(UUID eventId, UUID userId, String organizerEmail) {
        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found"));
        User requester = findUser(organizerEmail);

        if (!event.getOrganizer().getUserId().equals(requester.getUserId()) && requester.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("You can only manage attendees for your own events.");
        }

        User student = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));

        if (registrationRepository.existsByEventIdAndUser(eventId, student)) {
            registrationRepository.deleteByEventIdAndUser(eventId, student);
            event.setRegisteredCount(Math.max(0, (event.getRegisteredCount() == null ? 0 : event.getRegisteredCount()) - 1));
        }
    }

    private EventResponse mapToResponse(Event event, boolean registered) {
        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getCategory(),
                event.getCampus(),
                event.getImageUrl(),
                event.getEventDate(),
                event.getEventTime(),
                event.getVenue(),
                event.getCapacity(),
                event.getRegisteredCount() == null ? 0 : event.getRegisteredCount(),
                registered,
                event.getOrganizer().getFullName(),
                event.getOrganizer().getEmail()
        );
    }
}