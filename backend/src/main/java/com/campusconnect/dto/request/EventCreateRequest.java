package com.campusconnect.dto.request;

import com.campusconnect.model.EventCategory;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record EventCreateRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title cannot exceed 150 characters")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        @NotNull(message = "Category is required")
        EventCategory category,

        @NotNull(message = "Event date is required")
        @FutureOrPresent(message = "Event date must be today or in the future")
        LocalDate eventDate,

        @NotBlank(message = "Event time is required")
        String eventTime,

        @NotBlank(message = "Venue is required")
        String venue,

        @NotNull(message = "Capacity is required")
        @Min(value = 1, message = "Capacity must be at least 1 person")
        Integer capacity
) {}