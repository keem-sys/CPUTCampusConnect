package com.campusconnect.controller;

import com.campusconnect.dto.response.AdminStatsResponse;
import com.campusconnect.dto.response.EventResponse;
import com.campusconnect.dto.response.UserProfileResponse;
import com.campusconnect.model.Role;
import com.campusconnect.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getPlatformStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }


    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UserProfileResponse> updateUserRole(
            @PathVariable UUID userId,
            @RequestParam Role role,
            Authentication authentication
    ) {
        return ResponseEntity.ok(adminService.updateUserRole(userId, role, authentication.getName()));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable UUID userId,
            Authentication authentication
    ) {
        adminService.deleteUser(userId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(adminService.getAllEventsForAdmin());
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> forceDeleteEvent(@PathVariable UUID eventId) {
        adminService.forceDeleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }
}