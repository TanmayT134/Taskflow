package com.taskflow.taskflow_backend.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.taskflow.taskflow_backend.entity.Task;
import com.taskflow.taskflow_backend.enums.TaskPriority;

import jakarta.persistence.criteria.Predicate;

public class TaskSpecification {

    private TaskSpecification() {
    }

    public static Specification<Task> filterTasks(
            String search,
            TaskPriority priority,
            Boolean completed,
            Long userId
    ) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Mandatory ownership condition
            predicates.add(
                    criteriaBuilder.equal(
                            root.get("user").get("id"),
                            userId
                    )
            );

            // Search by title or description
            if (search != null && !search.isBlank()) {

                String keyword =
                        "%" + search.trim().toLowerCase() + "%";

                Predicate titleMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("title")),
                        keyword
                );

                Predicate descriptionMatch = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")),
                        keyword
                );

                predicates.add(
                        criteriaBuilder.or(
                                titleMatch,
                                descriptionMatch
                        )
                );
            }

            // Filter by priority
            if (priority != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("priority"),
                                priority
                        )
                );
            }

            // Filter by completion status
            if (completed != null) {

                predicates.add(
                        criteriaBuilder.equal(
                                root.get("completed"),
                                completed
                        )
                );
            }

            return criteriaBuilder.and(
                    predicates.toArray(new Predicate[0])
            );
        };
    }
}