package com.taskflow.taskflow_backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.taskflow.taskflow_backend.enums.ReminderStatus;
import com.taskflow.taskflow_backend.enums.ReminderType;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "task_reminder_logs",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_task_reminder_date_type",
            columnNames = {
                "task_id",
                "reminder_type",
                "reminder_date"
            }
        )
    },
    indexes = {
        @Index(name = "idx_reminder_status", columnList = "status"),
        @Index(name = "idx_reminder_claimed_at", columnList = "claimed_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class TaskReminderLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Enumerated(EnumType.STRING)
    @Column(name = "reminder_type", nullable = false, length = 20)
    private ReminderType reminderType;

    @Column(name = "reminder_date", nullable = false)
    private LocalDate reminderDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReminderStatus status;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount;

    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "last_error", length = 1000)
    private String lastError;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}