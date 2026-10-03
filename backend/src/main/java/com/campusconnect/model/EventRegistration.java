package com.campusconnect.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_registrations",
        uniqueConstraints = @UniqueConstraint(name = "uk_event_registration_user_event",
                columnNames = {"event_id", "user_id"}),
        indexes = {
                @Index(name = "idx_event_registration_event", columnList = "event_id"),
                @Index(name = "idx_event_registration_user", columnList = "user_id")
        })
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime registeredAt = LocalDateTime.now();
}
