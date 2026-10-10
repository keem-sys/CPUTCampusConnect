package com.campusconnect.config;

import com.campusconnect.model.Event;
import com.campusconnect.model.EventCategory;
import com.campusconnect.model.Role;
import com.campusconnect.model.User;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String @NonNull ... args) {
        // Only seed if the database has no users
        if (userRepository.count() == 0) {
            seedUsersAndEvents();
        }
    }

    private void seedUsersAndEvents() {
        // Pre-configured Admin
        User admin = User.builder()
                .fullName("System Administrator")
                .email("admin@cput.ac.za")
                .passwordHash(passwordEncoder.encode("AdminPass123!"))
                .role(Role.ADMIN)
                .build();

        // Seed an Event Organizer
        User organizer = User.builder()
                .fullName("Faculty of Informatics & Design")
                .email("fid.events@cput.ac.za")
                .passwordHash(passwordEncoder.encode("Organizer123!"))
                .role(Role.ORGANIZER)
                .build();

        // Seed a Student for testing
        User student = User.builder()
                .fullName("John Doe")
                .email("john.student@mycput.ac.za")
                .passwordHash(passwordEncoder.encode("Student123!"))
                .role(Role.STUDENT)
                .build();

        userRepository.saveAll(List.of(admin, organizer, student));

        // Seed Upcoming CPUT Events linked to the Organizer
        Event event1 = Event.builder()
                .title("CPUT Annual Tech & Innovation Expo")
                .description("Showcase of final-year ICT student projects, robotics demonstrations, and tech networking.")
                .category(EventCategory.CAREER)
                .eventDate(LocalDate.now().plusDays(5))
                .eventTime("10:00 - 15:00")
                .venue("Cape Town Campus - Multi-Purpose Hall")
                .capacity(250)
                .registeredCount(0)
                .organizer(organizer)
                .build();

        Event event2 = Event.builder()
                .title("Hackathon: Build with Cloud & AI")
                .description("A 24-hour sprint developing open-source solutions for campus sustainability and transit.")
                .category(EventCategory.ACADEMIC)
                .eventDate(LocalDate.now().plusDays(12))
                .eventTime("09:00 - 21:00")
                .venue("Engineering Building, Lab 3.12")
                .capacity(60)
                .registeredCount(0)
                .organizer(organizer)
                .build();

        Event event3 = Event.builder()
                .title("Inter-Campus Basketball Derby")
                .description("Bellville vs Cape Town Campus championship match. Free refreshments for student attendees!")
                .category(EventCategory.SPORTS)
                .eventDate(LocalDate.now().plusDays(18))
                .eventTime("16:30 - 19:00")
                .venue("Bellville Indoor Sports Centre")
                .capacity(300)
                .registeredCount(0)
                .organizer(organizer)
                .build();

        Event event4 = Event.builder()
                .title("CV & Interview Readiness Workshop")
                .description("Practical session hosted by industry recruiters on polishing tech resumes and acing tech interviews.")
                .category(EventCategory.WORKSHOP)
                .eventDate(LocalDate.now().plusDays(25))
                .eventTime("13:00 - 14:30")
                .venue("Online via Microsoft Teams")
                .capacity(100)
                .registeredCount(0)
                .organizer(organizer)
                .build();

        eventRepository.saveAll(List.of(event1, event2, event3, event4));
    }
}
