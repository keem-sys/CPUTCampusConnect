package com.campusconnect.dto.response;

import com.campusconnect.model.Role;
import java.util.UUID;

public record UserProfileResponse(
        UUID userId,
        String fullName,
        String email,
        Role role
) {}