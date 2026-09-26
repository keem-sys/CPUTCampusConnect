package com.campusconnect.repository;

import com.campusconnect.model.Event;
import com.campusconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    List<Event> findByOrganizer(User organizer);

    List<Event> findByEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate date);
}