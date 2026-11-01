package com.taskflow.taskflow_backend.entity;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reminder_preferences")
@Getter
@Setter
@NoArgsConstructor
public class ReminderPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "day_before_enabled", nullable = false)
    private boolean dayBeforeEnabled = true;

    @Column(name = "due_today_enabled", nullable = false)
    private boolean dueTodayEnabled = true;

    @Column(name = "overdue_enabled", nullable = false)
    private boolean overdueEnabled = true;

    @Column(name = "reminder_time", nullable = false)
    private LocalTime reminderTime = LocalTime.of(9, 0);

    @Column(name = "time_zone", nullable = false, length = 60)
    private String timeZone = "Asia/Kolkata";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        applyDefaults();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        applyDefaults();
    }

    private void applyDefaults() {
        if (reminderTime == null) reminderTime = LocalTime.of(9, 0);
        if (timeZone == null || timeZone.isBlank()) timeZone = "Asia/Kolkata";
    }

    public void validateTimeZone() {
        ZoneId.of(timeZone);
    }
}
