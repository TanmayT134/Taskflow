package com.taskflow.taskflow_backend.service;

import com.taskflow.taskflow_backend.dto.request.TaskCompletionRequest;
import com.taskflow.taskflow_backend.dto.request.TaskRequest;
import com.taskflow.taskflow_backend.dto.response.TaskResponse;
import com.taskflow.taskflow_backend.dto.response.DashboardStatsResponse;
import com.taskflow.taskflow_backend.dto.response.TaskPageResponse;
import com.taskflow.taskflow_backend.dto.response.DashboardResponse;

public interface TaskService {

    TaskResponse createTask(TaskRequest request);

    TaskPageResponse getAllTasks(
            String search,
            String priority,
            Boolean completed,
            String sortBy,
            String direction,
            int page,
            int size
    );

    TaskResponse getTaskById(Long id);

    TaskResponse updateTask(Long id, TaskRequest request);

    TaskResponse updateTaskCompletion(
            Long id,
            TaskCompletionRequest request
    );

    void deleteTask(Long id);

    DashboardStatsResponse getDashboardStats();
    
    DashboardResponse getDashboard();
}