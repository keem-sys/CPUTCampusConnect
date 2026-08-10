package com.campusconnect.service;

import com.campusconnect.dto.request.UpdateProfileRequest;
import com.campusconnect.dto.response.UserProfileResponse;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.model.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }

    public UserProfileResponse getCurrentUserProfile(String email){
        User user = getUserByEmail(email);

        return new UserProfileResponse(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}
