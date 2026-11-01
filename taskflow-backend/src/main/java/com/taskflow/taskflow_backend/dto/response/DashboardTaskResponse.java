
package com.taskflow.taskflow_backend.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.taskflow.taskflow_backend.enums.TaskPriority;

public record DashboardTaskResponse(
        Long id,
        String title,
        TaskPriority priority,
        boolean completed,
        LocalDate dueDate,
        LocalDateTime createdAt
) {
}
