package com.campusconnect.backend.controller;

import com.campusconnect.config.JwtAuthFilter;
import com.campusconnect.controller.AuthController;
import com.campusconnect.dto.request.LoginRequest;
import com.campusconnect.dto.request.RegistrationRequest;
import com.campusconnect.model.Role;
import com.campusconnect.service.AuthService;
import com.campusconnect.service.CustomUserDetailsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtAuthFilter jwtAuthFilter;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @Test
    void register_Success() throws Exception {
        RegistrationRequest request = new RegistrationRequest("John Doe", "john@test.com", "password123", Role.STUDENT);
        when(authService.register(any(RegistrationRequest.class))).thenReturn("mockJwtToken");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mockJwtToken"))
                .andExpect(jsonPath("$.message").value("Registration Successful"));
    }

    @Test
    void register_BadRequest_WhenEmailIsInvalid() throws Exception {
        RegistrationRequest request = new RegistrationRequest("John Doe", "invalid-email-format", "password123", Role.STUDENT);

        // Act & Assert: Should fail with 400 Bad Request because of `@Email` on your DTO record
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_Success() throws Exception {
        // Arrange
        LoginRequest request = new LoginRequest("john@test.com", "password123");
        when(authService.login(any(LoginRequest.class))).thenReturn("mockJwtToken");

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mockJwtToken"))
                .andExpect(jsonPath("$.message").value("Login successful"));
    }

    @Test
    void login_BadRequest_WhenPasswordTooShort() throws Exception {
        LoginRequest request = new LoginRequest("john@test.com", "short");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}