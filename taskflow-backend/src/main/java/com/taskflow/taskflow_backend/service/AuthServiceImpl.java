package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.request.LoginRequest;
import com.taskflow.taskflow_backend.dto.request.RegisterRequest;
import com.taskflow.taskflow_backend.dto.response.LoginResponse;
import com.taskflow.taskflow_backend.dto.response.RegisterResponse;

import com.taskflow.taskflow_backend.entity.User;
import com.taskflow.taskflow_backend.exception.EmailAlreadyExistsException;
import com.taskflow.taskflow_backend.repository.UserRepository;
import com.taskflow.taskflow_backend.security.JwtService;
import com.taskflow.taskflow_backend.security.TaskflowUserDetails;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;

import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public RegisterResponse register(RegisterRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        String fullName = request.fullName().trim();

        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalArgumentException(
                    "Password cannot exceed 72 UTF-8 bytes"
            );
        }

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException(
                    "An account with this email already exists"
            );
        }

        User user = new User();

        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(request.password())
        );

        User savedUser = userRepository.save(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getCreatedAt(),
                "Registration successful"
        );
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        String email = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                email,
                                request.password()
                        )
                );

        TaskflowUserDetails userDetails =
                (TaskflowUserDetails) authentication.getPrincipal();

        User user = userDetails.getUser();

        String token = jwtService.generateToken(userDetails);

        return new LoginResponse(
                token,
                "Bearer",
                jwtService.getExpirationMs(),
                new LoginResponse.UserInfo(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail()
                )
        );
    }
}