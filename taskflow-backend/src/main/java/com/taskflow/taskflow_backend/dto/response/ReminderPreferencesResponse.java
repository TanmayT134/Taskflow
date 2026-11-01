package com.taskflow.taskflow_backend.dto.response;

import java.time.LocalTime;

public record ReminderPreferencesResponse(
        boolean enabled,
        boolean dayBeforeEnabled,
        boolean dueTodayEnabled,
        boolean overdueEnabled,
        LocalTime reminderTime,
        String timeZone
) {}
