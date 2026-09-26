package com.campusconnect.dto.response;

import com.campusconnect.model.EventCategory;
import java.time.LocalDate;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String title,
        String description,
        EventCategory category,
        LocalDate eventDate,
        String eventTime,
        String venue,
        Integer capacity,
        String organizerName,
        String organizerEmail
) {}