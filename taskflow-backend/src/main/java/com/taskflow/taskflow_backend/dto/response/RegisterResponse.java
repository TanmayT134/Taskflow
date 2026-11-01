package com.taskflow.taskflow_backend.dto.response;

import java.time.LocalDateTime;

public record RegisterResponse(
        Long id,
        String fullName,
        String email,
        LocalDateTime createdAt,
        String message
) {
}