package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.request.LoginRequest;
import com.taskflow.taskflow_backend.dto.request.RegisterRequest;
import com.taskflow.taskflow_backend.dto.response.LoginResponse;
import com.taskflow.taskflow_backend.dto.response.RegisterResponse;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
}