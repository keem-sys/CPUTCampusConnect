package com.campusconnect.backend.service;

import com.campusconnect.dto.request.LoginRequest;
import com.campusconnect.dto.request.RegistrationRequest;
import com.campusconnect.exception.UserAlreadyExistsException;
import com.campusconnect.model.Role;
import com.campusconnect.model.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.security.JwtUtils;
import com.campusconnect.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private RegistrationRequest studentRequest;
    private RegistrationRequest adminRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        studentRequest = new RegistrationRequest("John Doe", "john@test.com", "password123", Role.STUDENT);
        adminRequest = new RegistrationRequest("Admin User", "admin@test.com", "password123", Role.ADMIN);
        loginRequest = new LoginRequest("john@test.com", "password123");
    }

    @Test
    void register_Success() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(jwtUtils.generateToken(any(User.class))).thenReturn("mockJwtToken");

        // Act
        String result = authService.register(studentRequest);

        // Assert
        assertEquals("mockJwtToken", result);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_ThrowsException_WhenUserAlreadyExists() {
        // Arrange: Mock the database to say "this email already exists"
        when(userRepository.existsByEmail("john@test.com")).thenReturn(true);

        // Act & Assert: Verify that the custom exception is thrown
        assertThrows(UserAlreadyExistsException.class, () -> authService.register(studentRequest));

        // Verify that the database save method was NEVER called
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_ThrowsException_WhenRoleIsAdmin() {
        // Act & Assert: Attempting to register an ADMIN must throw IllegalArgumentException
        assertThrows(IllegalArgumentException.class, () -> authService.register(adminRequest));

        // Verify that save was never called
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_Success() {
        // Arrange
        Authentication mockAuth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);

        User mockUser = User.builder()
                .email("john@test.com")
                .role(Role.STUDENT)
                .build();

        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(mockUser));
        when(jwtUtils.generateToken(mockUser)).thenReturn("mockJwtToken");

        // Act
        String token = authService.login(loginRequest);

        assertNotNull(token);
        assertEquals("mockJwtToken", token);
    }
}