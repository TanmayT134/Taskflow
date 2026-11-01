package com.taskflow.taskflow_backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.taskflow.taskflow_backend.entity.Task;
import com.taskflow.taskflow_backend.enums.TaskPriority;

import org.springframework.data.jpa.repository.EntityGraph;

public interface TaskRepository extends JpaRepository<Task, Long>,
        JpaSpecificationExecutor<Task> {

    Optional<Task> findByIdAndUser_Id(Long id, Long userId);

    long countByUser_Id(Long userId);

    long countByUser_IdAndCompletedTrue(Long userId);

    long countByUser_IdAndCompletedFalse(Long userId);

    long countByUser_IdAndCompletedFalseAndDueDateBefore(
            Long userId,
            LocalDate date
    );
    

    // Priority distribution for the authenticated user

    long countByUser_IdAndPriority(
            Long userId,
            TaskPriority priority
    );


    // Upcoming incomplete tasks due today through the next 7 days

    List<Task> findTop5ByUser_IdAndCompletedFalseAndDueDateBetweenOrderByDueDateAscCreatedAtDescIdAsc(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    );


    // Five most recently created tasks belonging to the user

    List<Task> findTop5ByUser_IdOrderByCreatedAtDescIdDesc(
            Long userId
    );
    
 // Find pending tasks belonging to a specific user and due on a date
    @EntityGraph(attributePaths = "user")
    List<Task> findByUser_IdAndCompletedFalseAndDueDate(
            Long userId,
            LocalDate dueDate
    );

    // Find overdue pending tasks belonging to a specific user
    @EntityGraph(attributePaths = "user")
    List<Task> findByUser_IdAndCompletedFalseAndDueDateBefore(
            Long userId,
            LocalDate dueDate
    );

    // Recheck that the task belongs to the user,
    // is still pending, and its due date has not changed
    @EntityGraph(attributePaths = "user")
    Optional<Task> findByIdAndUser_IdAndCompletedFalseAndDueDate(
            Long id,
            Long userId,
            LocalDate dueDate
    );

}