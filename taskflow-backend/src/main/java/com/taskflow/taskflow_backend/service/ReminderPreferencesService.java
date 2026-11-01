package com.taskflow.taskflow_backend.service;

import java.time.DateTimeException;
import java.time.LocalTime;
import java.time.ZoneId;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskflow.taskflow_backend.dto.request.ReminderPreferencesRequest;
import com.taskflow.taskflow_backend.dto.response.ReminderPreferencesResponse;
import com.taskflow.taskflow_backend.entity.ReminderPreferences;
import com.taskflow.taskflow_backend.entity.User;
import com.taskflow.taskflow_backend.repository.ReminderPreferencesRepository;
import com.taskflow.taskflow_backend.repository.UserRepository;
import com.taskflow.taskflow_backend.security.TaskflowUserDetails;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ReminderPreferencesService {

    private final ReminderPreferencesRepository preferencesRepository;
    private final UserRepository userRepository;

    public ReminderPreferencesResponse getPreferences() {
        Long userId = currentUserId();
        ReminderPreferences preferences = preferencesRepository.findByUser_Id(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
        return toResponse(preferences);
    }

    public ReminderPreferencesResponse updatePreferences(ReminderPreferencesRequest request) {
        Long userId = currentUserId();

        try {
            ZoneId.of(request.timeZone().trim());
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException("Invalid time zone. Use a valid IANA time zone, such as Asia/Kolkata.");
        }

        ReminderPreferences preferences = preferencesRepository.findByUser_Id(userId)
                .orElseGet(() -> createDefaultPreferences(userId));

        preferences.setEnabled(request.enabled());
        preferences.setDayBeforeEnabled(request.dayBeforeEnabled());
        preferences.setDueTodayEnabled(request.dueTodayEnabled());
        preferences.setOverdueEnabled(request.overdueEnabled());
        preferences.setReminderTime(request.reminderTime());
        preferences.setTimeZone(request.timeZone().trim());

        return toResponse(preferencesRepository.save(preferences));
    }

    private ReminderPreferences createDefaultPreferences(Long userId) {
        User user = userRepository.getReferenceById(userId);
        ReminderPreferences preferences = new ReminderPreferences();
        preferences.setUser(user);
        preferences.setEnabled(true);
        preferences.setDayBeforeEnabled(true);
        preferences.setDueTodayEnabled(true);
        preferences.setOverdueEnabled(true);
        preferences.setReminderTime(LocalTime.of(9, 0));
        preferences.setTimeZone("Asia/Kolkata");
        return preferencesRepository.save(preferences);
    }

    private Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof TaskflowUserDetails principal)) {
            throw new IllegalStateException("Authenticated user could not be identified.");
        }
        return principal.getUser().getId();
    }

    private ReminderPreferencesResponse toResponse(ReminderPreferences p) {
        return new ReminderPreferencesResponse(
                p.isEnabled(),
                p.isDayBeforeEnabled(),
                p.isDueTodayEnabled(),
                p.isOverdueEnabled(),
                p.getReminderTime(),
                p.getTimeZone()
        );
    }
}
