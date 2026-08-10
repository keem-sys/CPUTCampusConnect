package com.campusconnect.service;

import com.campusconnect.exception.UserAlreadyExistsException;
import com.campusconnect.model.Role;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.dto.request.LoginRequest;
import com.campusconnect.dto.request.RegistrationRequest;
import com.campusconnect.model.User;
import com.campusconnect.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
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
        String lowerCaseEmail = registrationRequest.email().toLowerCase();
        if (userRepository.existsByEmail(lowerCaseEmail)) {
            throw new UserAlreadyExistsException("User with email: " + registrationRequest.email() + " already exists");
        }

        Role requestedRole = registrationRequest.role();
        if (requestedRole != null && requestedRole == Role.ADMIN) {
            throw new IllegalArgumentException("You cannot register as an Admin!");
        } else if (requestedRole == null) {
            requestedRole = Role.STUDENT;
        }

        User user = User.builder()
                .fullName(registrationRequest.fullName())
                .email(lowerCaseEmail)
                .passwordHash(passwordEncoder.encode(registrationRequest.password()))
                .role(requestedRole)
                .build();

        userRepository.save(user);
        return jwtUtils.generateToken(user);
    }

    public String login(LoginRequest loginRequest) {
        String lowerCaseEmail = loginRequest.email().toLowerCase();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(lowerCaseEmail, loginRequest.password())
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(lowerCaseEmail).orElseThrow(() ->
                new UsernameNotFoundException("User not found"));

        return jwtUtils.generateToken(user);
    }
}
