package com.campusconnect.repository;

import com.campusconnect.model.Role;
import com.campusconnect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(Role role);
    List<User> findTop5ByOrderByCreatedAtDesc();
}
