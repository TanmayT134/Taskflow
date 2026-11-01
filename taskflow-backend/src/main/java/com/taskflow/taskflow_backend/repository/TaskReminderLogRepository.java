package com.taskflow.taskflow_backend.repository;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.taskflow.taskflow_backend.entity.TaskReminderLog;

@Repository
public interface TaskReminderLogRepository
        extends JpaRepository<TaskReminderLog, Long> {

    /**
     * Removes reminder history before its owning task is deleted.
     * Called inside the task deletion transaction.
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM TaskReminderLog reminderLog WHERE reminderLog.task.id = :taskId")
    int deleteAllByTaskId(@Param("taskId") Long taskId);

    /*
     * Atomically creates a reminder claim.
     * Returns 1 when a new claim is created and 0 if it already exists.
     */
    @Modifying
    @Transactional
    @Query(value = """
        INSERT IGNORE INTO task_reminder_logs
        (
            task_id,
            reminder_type,
            reminder_date,
            status,
            attempt_count,
            claimed_at,
            created_at
        )
        VALUES
        (
            :taskId,
            :reminderType,
            :reminderDate,
            'PROCESSING',
            1,
            NOW(),
            NOW()
        )
        """, nativeQuery = true)
    int insertClaimIfAbsent(
        @Param("taskId") Long taskId,
        @Param("reminderType") String reminderType,
        @Param("reminderDate") LocalDate reminderDate
    );

    /*
     * Allows a failed or abandoned claim to be retried.
     * The 15-minute lease prevents two scheduler instances
     * from processing the same reminder simultaneously.
     */
    @Modifying
    @Transactional
    @Query(value = """
        UPDATE task_reminder_logs
        SET
            status = 'PROCESSING',
            attempt_count = attempt_count + 1,
            claimed_at = NOW(),
            last_error = NULL
        WHERE task_id = :taskId
          AND reminder_type = :reminderType
          AND reminder_date = :reminderDate
          AND
          (
              status = 'FAILED'
              OR
              (
                  status = 'PROCESSING'
                  AND claimed_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
              )
          )
        """, nativeQuery = true)
    int reclaimIfAvailable(
        @Param("taskId") Long taskId,
        @Param("reminderType") String reminderType,
        @Param("reminderDate") LocalDate reminderDate
    );

    @Modifying
    @Transactional
    @Query(value = """
        UPDATE task_reminder_logs
        SET
            status = 'SENT',
            sent_at = NOW(),
            last_error = NULL
        WHERE task_id = :taskId
          AND reminder_type = :reminderType
          AND reminder_date = :reminderDate
          AND status = 'PROCESSING'
        """, nativeQuery = true)
    int markAsSent(
        @Param("taskId") Long taskId,
        @Param("reminderType") String reminderType,
        @Param("reminderDate") LocalDate reminderDate
    );

    @Modifying
    @Transactional
    @Query(value = """
        UPDATE task_reminder_logs
        SET
            status = 'FAILED',
            last_error = :error
        WHERE task_id = :taskId
          AND reminder_type = :reminderType
          AND reminder_date = :reminderDate
          AND status = 'PROCESSING'
        """, nativeQuery = true)
    int markAsFailed(
        @Param("taskId") Long taskId,
        @Param("reminderType") String reminderType,
        @Param("reminderDate") LocalDate reminderDate,
        @Param("error") String error
    );
}