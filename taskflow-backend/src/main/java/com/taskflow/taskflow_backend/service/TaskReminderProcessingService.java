package com.taskflow.taskflow_backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.taskflow.taskflow_backend.entity.ReminderPreferences;
import com.taskflow.taskflow_backend.entity.Task;
import com.taskflow.taskflow_backend.enums.ReminderType;
import com.taskflow.taskflow_backend.repository.TaskReminderLogRepository;
import com.taskflow.taskflow_backend.repository.TaskRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskReminderProcessingService {

    private final TaskRepository taskRepository;
    private final TaskReminderLogRepository reminderLogRepository;
    private final TaskReminderEmailService emailService;

    public void processRemindersForUser(LocalDate today, ReminderPreferences preferences) {
        if (!preferences.isEnabled()) return;

        Long userId = preferences.getUser().getId();
        log.info("Processing reminders for user {} on {}", userId, today);

        if (preferences.isDayBeforeEnabled()) {
            processTasks(
                    taskRepository.findByUser_IdAndCompletedFalseAndDueDate(userId, today.plusDays(1)),
                    ReminderType.DAY_BEFORE, today, userId
            );
        }

        if (preferences.isDueTodayEnabled()) {
            processTasks(
                    taskRepository.findByUser_IdAndCompletedFalseAndDueDate(userId, today),
                    ReminderType.DUE_TODAY, today, userId
            );
        }

        if (preferences.isOverdueEnabled()) {
            processTasks(
                    taskRepository.findByUser_IdAndCompletedFalseAndDueDateBefore(userId, today),
                    ReminderType.OVERDUE, today, userId
            );
        }
    }

    private void processTasks(List<Task> tasks, ReminderType type, LocalDate reminderDate, Long userId) {
        for (Task candidate : tasks) {
            try {
                processSingleReminder(candidate.getId(), candidate.getDueDate(), type, reminderDate, userId);
            } catch (Exception exception) {
                log.error("Unexpected error processing reminder for task ID {}", candidate.getId(), exception);
            }
        }
    }

    private void processSingleReminder(
            Long taskId, LocalDate dueDate, ReminderType type, LocalDate reminderDate, Long userId) {

        Task task = taskRepository
                .findByIdAndUser_IdAndCompletedFalseAndDueDate(taskId, userId, dueDate)
                .orElse(null);
        if (task == null) return;

        int claimed = reminderLogRepository.insertClaimIfAbsent(taskId, type.name(), reminderDate);
        if (claimed == 0) {
            claimed = reminderLogRepository.reclaimIfAvailable(taskId, type.name(), reminderDate);
        }
        if (claimed == 0) return;

        try {
            emailService.sendReminder(task, type);
            reminderLogRepository.markAsSent(taskId, type.name(), reminderDate);
            log.info("Reminder sent successfully. Task ID: {}, Type: {}, User ID: {}", taskId, type, userId);
        } catch (Exception exception) {
            String error = exception.getMessage();
            if (error == null || error.isBlank()) error = exception.getClass().getSimpleName();
            if (error.length() > 1000) error = error.substring(0, 1000);
            reminderLogRepository.markAsFailed(taskId, type.name(), reminderDate, error);
            log.error("Failed to send reminder. Task ID: {}, Type: {}", taskId, type, exception);
        }
    }
}
