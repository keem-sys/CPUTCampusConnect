package com.campusconnect.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record AttendeeResponse(
        UUID userId,
        String fullName,
        String email,
        LocalDateTime registeredAt
) {}