package com.taskflow.taskflow_backend.dto.response;

public record LoginResponse(

        String accessToken,

        String tokenType,

        long expiresIn,

        UserInfo user

) {

    public record UserInfo(
            Long id,
            String fullName,
            String email
    ) {
    }
}