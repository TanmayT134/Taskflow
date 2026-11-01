package com.taskflow.taskflow_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.taskflow.taskflow_backend.dto.request.ReminderPreferencesRequest;
import com.taskflow.taskflow_backend.dto.response.ReminderPreferencesResponse;
import com.taskflow.taskflow_backend.service.ReminderPreferencesService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/reminders")
@RequiredArgsConstructor
public class ReminderPreferencesController {

    private final ReminderPreferencesService preferencesService;

    @GetMapping("/preferences")
    public ResponseEntity<ReminderPreferencesResponse> getPreferences() {
        return ResponseEntity.ok(preferencesService.getPreferences());
    }

    @PutMapping("/preferences")
    public ResponseEntity<ReminderPreferencesResponse> updatePreferences(
            @Valid @RequestBody ReminderPreferencesRequest request) {
        return ResponseEntity.ok(preferencesService.updatePreferences(request));
    }
}
