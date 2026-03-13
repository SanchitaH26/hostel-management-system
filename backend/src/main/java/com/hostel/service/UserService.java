package com.hostel.service;

import com.hostel.dto.AuthDTO;
import com.hostel.model.User;
import com.hostel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roomNumber(request.getRoomNumber())
                .role(request.getRole() != null && request.getRole().equals("ADMIN")
                        ? User.Role.ADMIN : User.Role.STUDENT)
                .build();

        User saved = userRepository.save(user);

        return new AuthDTO.AuthResponse(
                saved.getId(), saved.getName(), saved.getEmail(),
                saved.getRole().name(), saved.getRoomNumber(),
                "Registration successful"
        );
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return new AuthDTO.AuthResponse(
                user.getId(), user.getName(), user.getEmail(),
                user.getRole().name(), user.getRoomNumber(),
                "Login successful"
        );
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
