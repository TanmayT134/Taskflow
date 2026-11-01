package com.taskflow.taskflow_backend.dto.request;

import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReminderPreferencesRequest(
        @NotNull Boolean enabled,
        @NotNull Boolean dayBeforeEnabled,
        @NotNull Boolean dueTodayEnabled,
        @NotNull Boolean overdueEnabled,
        @NotNull LocalTime reminderTime,
        @NotBlank @Size(max = 60) String timeZone
) {}
