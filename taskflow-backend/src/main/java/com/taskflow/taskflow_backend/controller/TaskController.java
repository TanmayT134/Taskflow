package com.taskflow.taskflow_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.taskflow.taskflow_backend.dto.request.TaskCompletionRequest;
import com.taskflow.taskflow_backend.dto.request.TaskRequest;
import com.taskflow.taskflow_backend.dto.response.DashboardStatsResponse;
import com.taskflow.taskflow_backend.dto.response.TaskPageResponse;
import com.taskflow.taskflow_backend.dto.response.TaskResponse;
import com.taskflow.taskflow_backend.service.TaskService;
import com.taskflow.taskflow_backend.dto.response.DashboardResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // Create a new task
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody TaskRequest request) {

        TaskResponse createdTask = taskService.createTask(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    // Get all tasks with search, filtering, sorting and pagination
    @GetMapping
    public ResponseEntity<TaskPageResponse> getAllTasks(

            @RequestParam(required = false) String search,

            @RequestParam(required = false) String priority,

            @RequestParam(required = false) Boolean completed,

            @RequestParam(defaultValue = "createdAt") String sortBy,

            @RequestParam(defaultValue = "ASC") String direction,

            @RequestParam(defaultValue = "0") int page,

            @RequestParam(defaultValue = "10") int size) {

        TaskPageResponse tasks = taskService.getAllTasks(
                search,
                priority,
                completed,
                sortBy,
                direction,
                page,
                size
        );

        return ResponseEntity.ok(tasks);
    }

    // Get task by ID
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable Long id) {

        TaskResponse task = taskService.getTaskById(id);

        return ResponseEntity.ok(task);
    }

    // Update task details
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {

        TaskResponse updatedTask = taskService.updateTask(id, request);

        return ResponseEntity.ok(updatedTask);
    }

    // Update task completion status
    @PatchMapping("/{id}/completion")
    public ResponseEntity<TaskResponse> updateTaskCompletion(
            @PathVariable Long id,
            @Valid @RequestBody TaskCompletionRequest request) {

        TaskResponse updatedTask =
                taskService.updateTaskCompletion(id, request);

        return ResponseEntity.ok(updatedTask);
    }

    // Delete task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id) {

        taskService.deleteTask(id);

        return ResponseEntity.noContent().build();
    }

    // Get dashboard statistics
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {

        DashboardStatsResponse stats = taskService.getDashboardStats();

        return ResponseEntity.ok(stats);
    }
    

    // Get complete dashboard data

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {

        DashboardResponse dashboard = taskService.getDashboard();

        return ResponseEntity.ok(dashboard);
    }

}