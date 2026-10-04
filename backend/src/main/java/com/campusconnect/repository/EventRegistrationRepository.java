package com.campusconnect.repository;

import com.campusconnect.model.EventRegistration;
import com.campusconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;
import java.util.Collection;
import java.util.Set;
import java.util.List;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, UUID> {
    boolean existsByEventIdAndUser(UUID eventId, User user);
    void deleteByEventIdAndUser(UUID eventId, User user);
    void deleteByUser(User user);

    @Query("select r.event.id from EventRegistration r where r.user = :user and r.event.id in :eventIds")
    Set<UUID> findEventIdsByUserAndEventIdIn(@Param("user") User user, @Param("eventIds") Collection<UUID> eventIds);

    @Query("""
            select r
            from EventRegistration r
            join fetch r.event e
            join fetch e.organizer
            where r.user = :user
            order by e.eventDate asc
            """)
    List<EventRegistration> findByUserWithEventAndOrganizer(@Param("user") User user);
}
