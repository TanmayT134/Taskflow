package com.taskflow.taskflow_backend.service;

import java.util.List;
import java.util.Set;
import java.time.LocalDate;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskflow.taskflow_backend.dto.request.TaskCompletionRequest;
import com.taskflow.taskflow_backend.dto.request.TaskRequest;
import com.taskflow.taskflow_backend.dto.response.TaskResponse;
import com.taskflow.taskflow_backend.entity.Task;
import com.taskflow.taskflow_backend.enums.TaskPriority;
import com.taskflow.taskflow_backend.exception.ResourceNotFoundException;
import com.taskflow.taskflow_backend.repository.TaskRepository;
import com.taskflow.taskflow_backend.specification.TaskSpecification;

import jakarta.persistence.criteria.Expression;

import com.taskflow.taskflow_backend.dto.response.DashboardStatsResponse;
import com.taskflow.taskflow_backend.dto.response.TaskPageResponse;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "title",
            "priority",
            "completed",
            "dueDate",
            "createdAt",
            "updatedAt"
    );

    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // Create a new task
    @Override
    public TaskResponse createTask(TaskRequest request) {

        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        Task savedTask = taskRepository.save(task);

        return mapToResponse(savedTask);
    }


@Override
@Transactional(readOnly = true)
public TaskPageResponse getAllTasks(
        String search,
        String priority,
        Boolean completed,
        String sortBy,
        String direction,
        int page,
        int size) {

    // Validate pagination parameters
    if (page < 0) {
        throw new IllegalArgumentException(
                "Page number cannot be negative."
        );
    }

    if (size < 1 || size > 100) {
        throw new IllegalArgumentException(
                "Page size must be between 1 and 100."
        );
    }

    // Convert priority string into enum
    TaskPriority taskPriority = null;

    if (priority != null && !priority.isBlank()) {
        try {
            taskPriority = TaskPriority.valueOf(
                    priority.trim().toUpperCase()
            );
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid priority. Allowed values: HIGH, MEDIUM, LOW."
            );
        }
    }

    // Validate sorting field
    String sortField = (sortBy == null || sortBy.isBlank())
            ? "createdAt"
            : sortBy.trim();

    if (!ALLOWED_SORT_FIELDS.contains(sortField)) {
        throw new IllegalArgumentException(
                "Invalid sort field. Allowed values: "
                        + ALLOWED_SORT_FIELDS
        );
    }

    // Validate sorting direction
    Sort.Direction sortDirection;

    if (direction == null || direction.isBlank()) {
        sortDirection = Sort.Direction.ASC;
    } else {
        try {
            sortDirection = Sort.Direction.fromString(
                    direction.trim()
            );
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException(
                    "Invalid sort direction. Use ASC or DESC."
            );
        }
    }

    // Build dynamic search and filtering specification
    Specification<Task> specification =
            TaskSpecification.filterTasks(
                    search,
                    taskPriority,
                    completed
            );

    Pageable pageable;

    // Custom priority sorting
    if ("priority".equals(sortField)) {

        // Database-level priority ranking:
        // HIGH = 1, MEDIUM = 2, LOW = 3

        pageable = PageRequest.of(page, size);

        specification = specification.and(
                (root, query, criteriaBuilder) -> {

                    Expression<Integer> priorityRank =
                            criteriaBuilder
                                    .<TaskPriority, Integer>selectCase(
                                            root.get("priority")
                                    )
                                    .when(TaskPriority.HIGH, 1)
                                    .when(TaskPriority.MEDIUM, 2)
                                    .when(TaskPriority.LOW, 3)
                                    .otherwise(4);

                    query.orderBy(
                            sortDirection.isAscending()
                                    ? criteriaBuilder.asc(priorityRank)
                                    : criteriaBuilder.desc(priorityRank),

                            // Secondary sorting for consistent pagination
                            criteriaBuilder.desc(root.get("createdAt")),
                            criteriaBuilder.asc(root.get("id"))
                    );

                    return criteriaBuilder.conjunction();
                }
        );

    } else {

        // Normal sorting for other supported fields
        Sort sort = Sort.by(sortDirection, sortField);

        pageable = PageRequest.of(page, size, sort);
    }

    // Retrieve paginated tasks from database
    Page<Task> taskPage = taskRepository.findAll(
            specification,
            pageable
    );

    // Convert Task entities into TaskResponse DTOs
    List<TaskResponse> taskResponses = taskPage.getContent()
            .stream()
            .map(this::mapToResponse)
            .toList();

    // Return paginated response
    return new TaskPageResponse(
            taskResponses,
            taskPage.getNumber(),
            taskPage.getSize(),
            taskPage.getTotalElements(),
            taskPage.getTotalPages(),
            taskPage.isFirst(),
            taskPage.isLast(),
            taskPage.isEmpty()
    );
}

    // Retrieve task by ID
    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {

        Task task = findTaskById(id);

        return mapToResponse(task);
    }

    // Update task details
    @Override
    public TaskResponse updateTask(Long id, TaskRequest request) {

        Task existingTask = findTaskById(id);

        existingTask.setTitle(request.getTitle());
        existingTask.setDescription(request.getDescription());
        existingTask.setPriority(request.getPriority());
        existingTask.setDueDate(request.getDueDate());

        Task updatedTask = taskRepository.save(existingTask);

        return mapToResponse(updatedTask);
    }

    // Update task completion status
    @Override
    public TaskResponse updateTaskCompletion(
            Long id,
            TaskCompletionRequest request) {

        Task existingTask = findTaskById(id);

        existingTask.setCompleted(request.getCompleted());

        Task updatedTask = taskRepository.save(existingTask);

        return mapToResponse(updatedTask);
    }

    // Delete task
    @Override
    public void deleteTask(Long id) {

        Task existingTask = findTaskById(id);

        taskRepository.delete(existingTask);
    }

    // Find task or throw exception
    private Task findTaskById(Long id) {

        return taskRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Task not found with ID: " + id
                        )
                );
    }

    // Convert Task entity into TaskResponse DTO
    private TaskResponse mapToResponse(Task task) {

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.isCompleted(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
    
 // Get dashboard statistics
    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {

        long totalTasks = taskRepository.count();

        long completedTasks = taskRepository.countByCompletedTrue();

        long pendingTasks = taskRepository.countByCompletedFalse();

        long overdueTasks = taskRepository
                .countByCompletedFalseAndDueDateBefore(LocalDate.now());

        double completionPercentage = totalTasks == 0
                ? 0.0
                : Math.round((completedTasks * 10000.0) / totalTasks) / 100.0;

        return new DashboardStatsResponse(
                totalTasks,
                completedTasks,
                pendingTasks,
                overdueTasks,
                completionPercentage
        );
    }
}