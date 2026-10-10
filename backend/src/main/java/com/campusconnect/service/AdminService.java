package com.campusconnect.service;

import com.campusconnect.dto.response.AdminStatsResponse;
import com.campusconnect.dto.response.EventResponse;
import com.campusconnect.dto.response.UserProfileResponse;
import com.campusconnect.model.*;
import com.campusconnect.repository.EventRegistrationRepository;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;

    public AdminStatsResponse getPlatformStats() {
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalOrganizers = userRepository.countByRole(Role.ORGANIZER);
        long totalEvents = eventRepository.count();
        long totalRsvps = registrationRepository.count();

        // Campus breakdown map
        Map<String, Long> campusDistribution = new HashMap<>();
        for (Campus campus : Campus.values()) {
            campusDistribution.put(campus.name(), 0L);
        }

        List<Object[]> groupResults = eventRepository.countEventsByCampusGroup();
        for (Object[] row : groupResults) {
            if (row[0] != null && row[1] != null) {
                Campus campus = (Campus) row[0];
                Long count = (Long) row[1];
                campusDistribution.put(campus.name(), count);
            }
        }

        // Recent 5 events
        List<EventResponse> recentEvents = eventRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToEventResponse)
                .toList();

        // Recent 5 registered users
        List<UserProfileResponse> recentUsers = userRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(user -> new UserProfileResponse(
                        user.getUserId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .toList();

        return new AdminStatsResponse(
                totalStudents,
                totalOrganizers,
                totalEvents,
                totalRsvps,
                campusDistribution,
                recentEvents,
                recentUsers
        );
    }

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> new UserProfileResponse(
                        user.getUserId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getRole()
                ))
                .toList();
    }

    @Transactional
    public UserProfileResponse updateUserRole(UUID userId, Role newRole, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new EntityNotFoundException("Admin not found"));

        // Security Guard: Prevent admin from demoting themselves!
        if (admin.getUserId().equals(userId) && newRole != Role.ADMIN) {
            throw new IllegalArgumentException("You cannot demote your own administrator account.");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        targetUser.setRole(newRole);
        User updatedUser = userRepository.saveAndFlush(targetUser);

        return new UserProfileResponse(
                updatedUser.getUserId(),
                updatedUser.getFullName(),
                updatedUser.getEmail(),
                updatedUser.getRole()
        );
    }

    @Transactional
    public void deleteUser(UUID userId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new EntityNotFoundException("Admin not found"));

        if (admin.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You cannot delete your own administrator account.");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        registrationRepository.deleteByUser(targetUser);

        List<Event> organizedEvents = eventRepository.findByOrganizer(targetUser);
        for (Event event : organizedEvents) {
            List<EventRegistration> eventRegs = registrationRepository.findByEventIdWithUser(event.getId());
            registrationRepository.deleteAll(eventRegs);
            eventRepository.delete(event);
        }

        userRepository.delete(targetUser);
        userRepository.flush();
    }


    public List<EventResponse> getAllEventsForAdmin() {
        return eventRepository.findAll()
                .stream()
                .map(this::mapToEventResponse)
                .toList();
    }

    @Transactional
    public void forceDeleteEvent(UUID eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException("Event not found with ID: " + eventId));

        List<EventRegistration> registrations = registrationRepository.findByEventIdWithUser(eventId);
        registrationRepository.deleteAll(registrations);

        eventRepository.delete(event);
        eventRepository.flush();
    }


    private EventResponse mapToEventResponse(Event event) {
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
                false,
                event.getOrganizer().getFullName(),
                event.getOrganizer().getEmail()
        );
    }
}