package com.taskflow.taskflow_backend.scheduler;

import java.time.ZonedDateTime;
import java.time.ZoneId;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.taskflow.taskflow_backend.entity.ReminderPreferences;
import com.taskflow.taskflow_backend.repository.ReminderPreferencesRepository;
import com.taskflow.taskflow_backend.service.TaskReminderProcessingService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class TaskReminderScheduler {

    private final ReminderPreferencesRepository preferencesRepository;
    private final TaskReminderProcessingService processingService;

    /*
     * Check each minute so each account can use its own time zone and
     * reminder time. The reminder log's unique key makes repeated checks
     * idempotent for each task/type/date.
     */
    @Scheduled(cron = "0 * * * * *")
    public void processDueReminderSchedules() {
        for (ReminderPreferences preferences : preferencesRepository.findAllByEnabledTrue()) {
            try {
                ZoneId zone = ZoneId.of(preferences.getTimeZone());
                ZonedDateTime now = ZonedDateTime.now(zone);

                if (now.toLocalTime().getHour() == preferences.getReminderTime().getHour()
                        && now.toLocalTime().getMinute() == preferences.getReminderTime().getMinute()) {
                    processingService.processRemindersForUser(now.toLocalDate(), preferences);
                }
            } catch (Exception exception) {
                log.error("Unable to process reminder schedule for preference ID {}",
                        preferences.getId(), exception);
            }
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void catchUpAfterStartup() {
        for (ReminderPreferences preferences : preferencesRepository.findAllByEnabledTrue()) {
            try {
                ZoneId zone = ZoneId.of(preferences.getTimeZone());
                ZonedDateTime now = ZonedDateTime.now(zone);
                if (!now.toLocalTime().isBefore(preferences.getReminderTime())) {
                    processingService.processRemindersForUser(now.toLocalDate(), preferences);
                }
            } catch (Exception exception) {
                log.error("Reminder startup catch-up failed for preference ID {}",
                        preferences.getId(), exception);
            }
        }
    }
}
