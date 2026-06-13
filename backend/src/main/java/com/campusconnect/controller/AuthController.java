package com.campusconnect.controller;

import com.campusconnect.dto.request.LoginRequest;
import com.campusconnect.dto.request.RegistrationRequest;
import com.campusconnect.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    public record AuthResponse(String token, String message) {}

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegistrationRequest request) {
        String token = authService.register(request);
        return ResponseEntity.ok(new AuthResponse(token, "Registration Successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(new AuthResponse(token, "Login successful"));
    }
}