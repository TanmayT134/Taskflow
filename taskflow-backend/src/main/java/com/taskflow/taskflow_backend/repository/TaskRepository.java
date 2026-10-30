package com.taskflow.taskflow_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.time.LocalDate;

import com.taskflow.taskflow_backend.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Long>,
        JpaSpecificationExecutor<Task> {

    List<Task> findAllByOrderByCreatedAtAsc();
    
    long countByCompletedTrue();

    long countByCompletedFalse();

    long countByCompletedFalseAndDueDateBefore(LocalDate date);
}