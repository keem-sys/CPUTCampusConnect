package com.campusconnect.repository;

import com.campusconnect.model.Event;
import com.campusconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findByOrganizer(User organizer);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Event e where e.id = :id")
    java.util.Optional<Event> findByIdForUpdate(@Param("id") UUID id);

    @Query("""
            select e
            from Event e
            join fetch e.organizer
            where e.eventDate >= :date
            order by e.eventDate asc
            """)
    List<Event> findUpcomingEventsWithOrganizer(LocalDate date);
}