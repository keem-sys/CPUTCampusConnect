package com.campusconnect.controller;

import com.campusconnect.dto.request.UpdateProfileRequest;
import com.campusconnect.dto.response.UserProfileResponse;
import com.campusconnect.model.User;
import com.campusconnect.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(Authentication authentication) {
        String email = authentication.getName();
        UserProfileResponse response = userService.getCurrentUserProfile(email);

        return ResponseEntity.ok(response);
    }
}
