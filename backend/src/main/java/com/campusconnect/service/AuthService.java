package com.campusconnect.service;

import com.campusconnect.exception.UserAlreadyExistsException;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.dto.request.LoginRequest;
import com.campusconnect.dto.request.RegistrationRequest;
import com.campusconnect.model.User;
import com.campusconnect.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    public String register(RegistrationRequest registrationRequest) {
        if (userRepository.existsByEmail(registrationRequest.email())) {
            throw new UserAlreadyExistsException("User with email: " + registrationRequest.email() + " already exists");
        }

        User user = User.builder()
                .fullName(registrationRequest.fullName())
                .email(registrationRequest.email())
                .passwordHash(passwordEncoder.encode(registrationRequest.password()))
                .role(registrationRequest.role())
                .build();

        userRepository.save(user);
        return "User registered successfully";
    }

    public String login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );

        User user = userRepository.findByEmail(loginRequest.email()).orElseThrow(() ->
                new RuntimeException("User not found!"));

        return jwtUtils.generateToken(user);
    }
}
