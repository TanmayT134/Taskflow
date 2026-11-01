package com.taskflow.taskflow_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import com.taskflow.taskflow_backend.entity.ReminderPreferences;

public interface ReminderPreferencesRepository
        extends JpaRepository<ReminderPreferences, Long> {

    Optional<ReminderPreferences> findByUser_Id(Long userId);

    @EntityGraph(attributePaths = "user")
    List<ReminderPreferences> findAllByEnabledTrue();
}
