package com.taskflow.taskflow_backend.dto.request;

import jakarta.validation.constraints.NotNull;

public class TaskCompletionRequest {

    @NotNull(message = "Completion status is required")
    private Boolean completed;

    public TaskCompletionRequest() {
    }

    public TaskCompletionRequest(Boolean completed) {
        this.completed = completed;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
}