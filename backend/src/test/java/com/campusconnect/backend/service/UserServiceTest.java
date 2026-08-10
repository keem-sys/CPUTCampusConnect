package com.campusconnect.backend.service;

import com.campusconnect.dto.response.UserProfileResponse;
import com.campusconnect.model.Role;
import com.campusconnect.model.User;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;
    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser =  User.builder()
                .userId(java.util.UUID.randomUUID())
                .fullName("Jane Doe")
                .email("jane@student.cput.ac.za")
                .role(Role.STUDENT)
                .build();
    }

    @Test
    void getUserByEmail_UserExists(){
        when(userRepository.findByEmail("jane@student.cput.ac.za")).thenReturn(Optional.of(mockUser));

        User result = userService.getUserByEmail("jane@student.cput.ac.za");

        assertNotNull(result);
        assertEquals("jane@student.cput.ac.za", result.getEmail());
    }

    @Test
    void getUserByEmail_UserDoesNotExist(){
        when(userRepository.findByEmail("notfound@student.cput.ac.za")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            userService.getUserByEmail("notfound@student.cput.ac.za");
        });
    }

    @Test
    void getCurrentUserProfile(){
        when(userRepository.findByEmail("jane@student.cput.ac.za")).thenReturn(Optional.of(mockUser));

        UserProfileResponse response = userService.getCurrentUserProfile("jane@student.cput.ac.za");

        assertNotNull(response);
        assertEquals(1L, response.userId());
        assertEquals("Jane Doe", response.fullName());
        assertEquals("jane@student.cput.ac.za", response.email());
        assertEquals(Role.STUDENT, response.role());
    }
}
