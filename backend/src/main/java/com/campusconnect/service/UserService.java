package com.campusconnect.service;

import com.campusconnect.dto.request.UpdateProfileRequest;
import com.campusconnect.model.Event;
import com.campusconnect.model.EventRegistration;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.repository.EventRegistrationRepository;
import com.campusconnect.model.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EventRegistrationRepository registrationRepository;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }

    @Transactional
    public User updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));

        user.setFullName(request.fullName());

        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            if (request.currentPassword() == null || request.currentPassword().isBlank()) {
                throw new IllegalArgumentException("Current password is required to change password.");
            }

            if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
                throw new IllegalArgumentException("Incorrect current password.");
            }

            user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        }

        return userRepository.saveAndFlush(user);
    }

    @Transactional
    public void deleteUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));

        List<EventRegistration> registrations = registrationRepository.findByUserWithEventAndOrganizer(user);
        for (EventRegistration reg : registrations) {
            Event event = reg.getEvent();
            event.setRegisteredCount(Math.max(0, event.getRegisteredCount() - 1));
        }

        registrationRepository.deleteByUser(user);
        userRepository.delete(user);
        userRepository.flush();
    }
}
