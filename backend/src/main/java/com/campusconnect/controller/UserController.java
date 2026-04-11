package com.campusconnect.controller;

import com.campusconnect.dto.response.UserProfileResponse;
import com.campusconnect.model.User;
import com.campusconnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);

        UserProfileResponse userProfileResponse = new UserProfileResponse(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
        return ResponseEntity.ok(userProfileResponse);
    }
}
