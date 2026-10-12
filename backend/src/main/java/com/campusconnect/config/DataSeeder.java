package com.campusconnect.config;

import com.campusconnect.model.*;
import com.campusconnect.repository.EventRegistrationRepository;
import com.campusconnect.repository.EventRepository;
import com.campusconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String @NonNull ... args) {
        if (userRepository.count() == 0) {
            seedComprehensiveData();
        }
    }

    private void seedComprehensiveData() {
        System.out.println(">>> [DataSeeder] Initializing CPUT Campus Connect demonstration dataset...");

        // ==========================================
        // 1. SEED USERS ACROSS ROLES & PERSONAS
        // ==========================================

        // System Administrator (IT Overseer)
        User admin = User.builder()
                .fullName("CPUT Central Administration")
                .email("admin@cput.ac.za")
                .passwordHash(passwordEncoder.encode("AdminPass123!"))
                .role(Role.ADMIN)
                .build();

        // Organizer 1: Faculty of Informatics and Design (District Six)
        User fidOrganizer = User.builder()
                .fullName("Faculty of Informatics & Design")
                .email("fid.events@cput.ac.za")
                .passwordHash(passwordEncoder.encode("Organizer123!"))
                .role(Role.ORGANIZER)
                .build();

        User roboticsOrganizer = User.builder()
                .fullName("CPUT Robotics & Engineering Club")
                .email("robotics.club@cput.ac.za")
                .passwordHash(passwordEncoder.encode("Organizer123!"))
                .role(Role.ORGANIZER)
                .build();

        User demoStudent = User.builder()
                .fullName("John Makele")
                .email("john.student@mycput.ac.za")
                .passwordHash(passwordEncoder.encode("Student123!"))
                .role(Role.STUDENT)
                .build();

        User student2 = User.builder()
                .fullName("Sipho Ndlovu")
                .email("sipho.ndlovu@mycput.ac.za")
                .passwordHash(passwordEncoder.encode("Student123!"))
                .role(Role.STUDENT)
                .build();

        User student3 = User.builder()
                .fullName("Chloe Daniels")
                .email("chloe.daniels@mycput.ac.za")
                .passwordHash(passwordEncoder.encode("Student123!"))
                .role(Role.STUDENT)
                .build();

        User student4 = User.builder()
                .fullName("Ayanda Mthembu")
                .email("ayanda.m@mycput.ac.za")
                .passwordHash(passwordEncoder.encode("Student123!"))
                .role(Role.STUDENT)
                .build();

        userRepository.saveAll(List.of(admin, fidOrganizer, roboticsOrganizer, demoStudent, student2, student3, student4));

        // ==========================================
        // 2. SEED REALISTIC MULTI-CAMPUS EVENTS
        // ==========================================
        Event expoEvent = Event.builder()
                .title("Career Fair 2026")
                .description("Annual CPUT flagship Career Fair connecting students with graduate recruiters, internship opportunities, and top industry employers across the Western Cape. Dress code: Smart casual.")
                .category(EventCategory.CAREER)
                .campus(Campus.CAPE_TOWN)
                .imageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80")
                .eventDate(LocalDate.now().plusDays(2))
                .eventTime("09:30 - 15:30")
                .venue("District Six - Multi-Purpose Sports Hall")
                .capacity(150)
                .registeredCount(2)
                .organizer(fidOrganizer)
                .build();

        // Event 2: EDGE CASE -> FULLY BOOKED LAB (Bellville)
        Event labEvent = Event.builder()
                .title("Advanced AI & Machine Learning Lab Sprint")
                .description("Hands-on high-performance computing session on the Bellville GPU Cluster. Strict workstation cap: exactly 3 workstations available.")
                .category(EventCategory.ACADEMIC)
                .campus(Campus.BELLVILLE)
                .imageUrl("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1000&q=80")
                .eventDate(LocalDate.now().plusDays(9))
                .eventTime("09:00 - 16:00")
                .venue("Bellville Campus - Engineering Lab 3.12")
                .capacity(3)
                .registeredCount(3)
                .organizer(roboticsOrganizer)
                .build();

        // Event 3: Sports Derby (Bellville) - Zero RSVPs (Perfect for live demo RSVP click!)
        Event derbyEvent = Event.builder()
                .title("Inter-Campus Basketball Derby & Rally")
                .description("Bellville vs District Six campus championship showdown. Live DJ, faculty cheer squads, and complimentary refreshments for all student supporters!")
                .category(EventCategory.SPORTS)
                .campus(Campus.BELLVILLE)
                .imageUrl("https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1000&q=80")
                .eventDate(LocalDate.now().plusDays(14))
                .eventTime("16:30 - 20:00")
                .venue("Bellville Indoor Sports Centre")
                .capacity(300)
                .registeredCount(0)
                .organizer(fidOrganizer)
                .build();

        // Event 4: Media & Hospitality (Granger Bay)
        Event culinaryEvent = Event.builder()
                .title("Journalism & Culinary Arts Showcase")
                .description("Media photography exhibition paired with signature courses prepared by CPUT Granger Bay Hotel School apprentices. Special focus on digital storytelling.")
                .category(EventCategory.WORKSHOP)
                .campus(Campus.GRANGER_BAY)
                .imageUrl("https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80")
                .eventDate(LocalDate.now().plusDays(18))
                .eventTime("17:00 - 19:30")
                .venue("Granger Bay - Hotel School Restaurant, Waterfront")
                .capacity(45)
                .registeredCount(1)
                .organizer(fidOrganizer)
                .build();

        // Event 5: Education Workshop (Mowbray)
        Event educationEvent = Event.builder()
                .title("Future of Multigrade Education Seminar")
                .description("Research symposium hosted by the Mowbray Education faculty focusing on educational software tools for rural and distributed classrooms.")
                .category(EventCategory.ACADEMIC)
                .campus(Campus.MOWBRAY)
                .imageUrl("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80")
                .eventDate(LocalDate.now().plusDays(22))
                .eventTime("11:00 - 13:00")
                .venue("Mowbray Campus - Lecture Theatre 1")
                .capacity(60)
                .registeredCount(1)
                .organizer(fidOrganizer)
                .build();

        // Event 6: Virtual Event (Online)
        Event onlineEvent = Event.builder()
                .title("AWS & Azure Cloud Certification Bootcamp")
                .description("Virtual weekend preparation for students taking cloud architecture vouchers. Link shared to registered Microsoft Teams attendees.")
                .category(EventCategory.CAREER)
                .campus(Campus.ONLINE)
                .imageUrl("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80")
                .eventDate(LocalDate.now().plusDays(28))
                .eventTime("10:00 - 13:00")
                .venue("Online via Microsoft Teams")
                .capacity(200)
                .registeredCount(1)
                .organizer(roboticsOrganizer)
                .build();

        // Event 7: EDGE CASE -> POLICY-VIOLATING EVENT FOR ADMIN LIVE-DELETION DEMO
        Event spamEvent = Event.builder()
                .title("Unofficial D6 Rooftop Party & Rave")
                .description("Unsanctioned after-hours gathering on the engineering rooftop. BYOB. No security or faculty oversight.")
                .category(EventCategory.SOCIAL)
                .campus(Campus.CAPE_TOWN)
                .imageUrl("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80")
                .eventDate(LocalDate.now().plusDays(3))
                .eventTime("22:00 - 03:00")
                .venue("District Six - Rooftop Level 5")
                .capacity(100)
                .registeredCount(0)
                .organizer(roboticsOrganizer)
                .build();

        eventRepository.saveAll(List.of(expoEvent, labEvent, derbyEvent, culinaryEvent, educationEvent, onlineEvent, spamEvent));

        // ==========================================
        // 3. SEED AUTHENTIC EVENT REGISTRATIONS (RSVPs)
        // ==========================================

        EventRegistration r1 = EventRegistration.builder()
                .event(expoEvent).user(student2).registeredAt(LocalDateTime.now().minusDays(2)).build();
        EventRegistration r2 = EventRegistration.builder()
                .event(expoEvent).user(student3).registeredAt(LocalDateTime.now().minusDays(1)).build();

        EventRegistration r3 = EventRegistration.builder()
                .event(labEvent).user(demoStudent).registeredAt(LocalDateTime.now().minusDays(3)).build();
        EventRegistration r4 = EventRegistration.builder()
                .event(labEvent).user(student2).registeredAt(LocalDateTime.now().minusDays(2)).build();
        EventRegistration r5 = EventRegistration.builder()
                .event(labEvent).user(student3).registeredAt(LocalDateTime.now().minusDays(1)).build();

        EventRegistration r6 = EventRegistration.builder()
                .event(culinaryEvent).user(demoStudent).registeredAt(LocalDateTime.now().minusHours(8)).build();

        EventRegistration r7 = EventRegistration.builder()
                .event(educationEvent).user(student4).registeredAt(LocalDateTime.now().minusDays(1)).build();
        EventRegistration r8 = EventRegistration.builder()
                .event(onlineEvent).user(student4).registeredAt(LocalDateTime.now().minusHours(3)).build();

        registrationRepository.saveAll(List.of(r1, r2, r3, r4, r5, r6, r7, r8));

        System.out.println(">>> [DataSeeder] Seeded dataset aligned with login notification!");
    }
}