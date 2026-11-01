package com.taskflow.taskflow_backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.data.jpa.domain.Specification;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.taskflow.taskflow_backend.dto.request.TaskCompletionRequest;
import com.taskflow.taskflow_backend.dto.request.TaskRequest;

import com.taskflow.taskflow_backend.dto.response.TaskResponse;
import com.taskflow.taskflow_backend.dto.response.DashboardStatsResponse;
import com.taskflow.taskflow_backend.dto.response.TaskPageResponse;

import com.taskflow.taskflow_backend.entity.Task;
import com.taskflow.taskflow_backend.enums.TaskPriority;

import com.taskflow.taskflow_backend.exception.ResourceNotFoundException;

import com.taskflow.taskflow_backend.repository.TaskRepository;
import com.taskflow.taskflow_backend.repository.TaskReminderLogRepository;
import com.taskflow.taskflow_backend.repository.UserRepository;

import com.taskflow.taskflow_backend.security.TaskflowUserDetails;

import com.taskflow.taskflow_backend.specification.TaskSpecification;

import jakarta.persistence.criteria.Expression;

import java.time.ZoneId;

import com.taskflow.taskflow_backend.dto.response.DashboardResponse;
import com.taskflow.taskflow_backend.dto.response.DashboardTaskResponse;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskReminderLogRepository reminderLogRepository;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "title",
            "priority",
            "completed",
            "dueDate",
            "createdAt",
            "updatedAt"
    );

    public TaskServiceImpl(
            TaskRepository taskRepository,
            UserRepository userRepository,
            TaskReminderLogRepository reminderLogRepository
    ) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.reminderLogRepository = reminderLogRepository;
    }

    // ==========================================
    // GET AUTHENTICATED USER ID
    // ==========================================

    private Long getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal()
                instanceof TaskflowUserDetails userDetails)) {

            throw new IllegalStateException(
                    "No authenticated user found."
            );
        }

        return userDetails.getUser().getId();
    }

    // ==========================================
    // CREATE TASK
    // ==========================================

    @Override
    public TaskResponse createTask(TaskRequest request) {

        Long userId = getCurrentUserId();

        Task task = new Task();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        // Automatically assign the authenticated owner.
        // Never accept user_id from the frontend.
        task.setUser(userRepository.getReferenceById(userId));

        Task savedTask = taskRepository.save(task);

        return mapToResponse(savedTask);
    }

    // ==========================================
    // GET ALL TASKS
    // SEARCH, FILTER, SORT AND PAGINATION
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public TaskPageResponse getAllTasks(
            String search,
            String priority,
            Boolean completed,
            String sortBy,
            String direction,
            int page,
            int size
    ) {

        Long userId = getCurrentUserId();

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
                        priority.trim().toUpperCase(Locale.ROOT)
                );

            } catch (IllegalArgumentException exception) {

                throw new IllegalArgumentException(
                        "Invalid priority. Allowed values: HIGH, MEDIUM, LOW."
                );
            }
        }

        // Validate sorting field
        String sortField =
                (sortBy == null || sortBy.isBlank())
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

        // Build search and filter specification.
        // The user ID condition is always included.
        Specification<Task> specification =
                TaskSpecification.filterTasks(
                        search,
                        taskPriority,
                        completed,
                        userId
                );

        Pageable pageable;

        // Custom priority sorting
        if ("priority".equals(sortField)) {

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

                                // Secondary sorting for stable pagination
                                criteriaBuilder.desc(root.get("createdAt")),
                                criteriaBuilder.asc(root.get("id"))
                        );

                        return criteriaBuilder.conjunction();
                    }
            );

        } else {

            Sort sort = Sort.by(sortDirection, sortField);

            pageable = PageRequest.of(page, size, sort);
        }

        // Retrieve only this user's tasks
        Page<Task> taskPage = taskRepository.findAll(
                specification,
                pageable
        );

        List<TaskResponse> taskResponses =
                taskPage.getContent()
                        .stream()
                        .map(this::mapToResponse)
                        .toList();

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

    // ==========================================
    // GET TASK BY ID
    // ==========================================

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {

        Long userId = getCurrentUserId();

        Task task = findTaskById(id, userId);

        return mapToResponse(task);
    }

    // ==========================================
    // UPDATE TASK
    // ==========================================

    @Override
    public TaskResponse updateTask(
            Long id,
            TaskRequest request
    ) {

        Long userId = getCurrentUserId();

        Task existingTask = findTaskById(id, userId);

        existingTask.setTitle(request.getTitle());
        existingTask.setDescription(request.getDescription());
        existingTask.setPriority(request.getPriority());
        existingTask.setDueDate(request.getDueDate());

        Task updatedTask = taskRepository.save(existingTask);

        return mapToResponse(updatedTask);
    }

    // ==========================================
    // UPDATE TASK COMPLETION
    // ==========================================

    @Override
    public TaskResponse updateTaskCompletion(
            Long id,
            TaskCompletionRequest request
    ) {

        Long userId = getCurrentUserId();

        Task existingTask = findTaskById(id, userId);

        existingTask.setCompleted(request.getCompleted());

        Task updatedTask = taskRepository.save(existingTask);

        return mapToResponse(updatedTask);
    }

    // ==========================================
    // DELETE TASK
    // ==========================================

    @Override
    public void deleteTask(Long id) {

        Long userId = getCurrentUserId();

        Task existingTask = findTaskById(id, userId);

        // Reminder logs reference the task and must be removed first.
        // This service method is transactional, so both operations commit together.
        reminderLogRepository.deleteAllByTaskId(existingTask.getId());
        taskRepository.delete(existingTask);
    }

    // ==========================================
    // FIND TASK BELONGING TO CURRENT USER
    // ==========================================

    private Task findTaskById(Long id, Long userId) {

        return taskRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Task not found with ID: " + id
                        )
                );
    }

    // ==========================================
    // MAP ENTITY TO RESPONSE DTO
    // ==========================================

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


    // ==========================================
    // DASHBOARD STATISTICS
    // ==========================================

    private static final ZoneId APP_ZONE =
            ZoneId.of("Asia/Kolkata");

    private DashboardStatsResponse buildDashboardStats(Long userId) {

        long totalTasks =
                taskRepository.countByUser_Id(userId);

        long completedTasks =
                taskRepository.countByUser_IdAndCompletedTrue(userId);

        long pendingTasks =
                taskRepository.countByUser_IdAndCompletedFalse(userId);

        LocalDate today = LocalDate.now(APP_ZONE);

        long overdueTasks =
                taskRepository
                        .countByUser_IdAndCompletedFalseAndDueDateBefore(
                                userId,
                                today
                        );

        long highPriorityTasks =
                taskRepository.countByUser_IdAndPriority(
                        userId,
                        TaskPriority.HIGH
                );

        long mediumPriorityTasks =
                taskRepository.countByUser_IdAndPriority(
                        userId,
                        TaskPriority.MEDIUM
                );

        long lowPriorityTasks =
                taskRepository.countByUser_IdAndPriority(
                        userId,
                        TaskPriority.LOW
                );

        double completionPercentage = totalTasks == 0
                ? 0.0
                : Math.round(
                        (completedTasks * 10000.0) / totalTasks
                ) / 100.0;

        return new DashboardStatsResponse(
                totalTasks,
                completedTasks,
                pendingTasks,
                overdueTasks,
                completionPercentage,
                highPriorityTasks,
                mediumPriorityTasks,
                lowPriorityTasks
        );
    }


    // Existing statistics endpoint

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {

        Long userId = getCurrentUserId();

        return buildDashboardStats(userId);
    }


    // Complete dashboard endpoint

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {

        Long userId = getCurrentUserId();

        LocalDate today = LocalDate.now(APP_ZONE);
        LocalDate nextSevenDays = today.plusDays(7);

        DashboardStatsResponse stats =
                buildDashboardStats(userId);

        List<DashboardTaskResponse> upcomingTasks =
                taskRepository
                        .findTop5ByUser_IdAndCompletedFalseAndDueDateBetweenOrderByDueDateAscCreatedAtDescIdAsc(
                                userId,
                                today,
                                nextSevenDays
                        )
                        .stream()
                        .map(this::mapToDashboardTask)
                        .toList();

        List<DashboardTaskResponse> recentTasks =
                taskRepository
                        .findTop5ByUser_IdOrderByCreatedAtDescIdDesc(
                                userId
                        )
                        .stream()
                        .map(this::mapToDashboardTask)
                        .toList();

        return new DashboardResponse(
                stats,
                upcomingTasks,
                recentTasks
        );
    }


    // Convert Task entity into compact dashboard response

    private DashboardTaskResponse mapToDashboardTask(Task task) {

        return new DashboardTaskResponse(
                task.getId(),
                task.getTitle(),
                task.getPriority(),
                task.isCompleted(),
                task.getDueDate(),
                task.getCreatedAt()
        );
    }

}