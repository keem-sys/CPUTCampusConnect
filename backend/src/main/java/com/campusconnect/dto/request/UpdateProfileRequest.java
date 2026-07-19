package com.campusconnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        String currentPassword,

        @Size(min = 8, message = "New password must be at least 8 characters")
        String newPassword
) {}