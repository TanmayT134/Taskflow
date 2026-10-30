import {
  Check,
  Trash2,
  CalendarDays,
  Pencil,
  Plus,
  ListTodo,
} from "lucide-react";

import { formatDate, isOverdue } from "../utils/format";

function Priority({ value }) {
  return (
    <span className={`priority priority-${(value || "medium").toLowerCase()}`}>
      <i />
      {value || "MEDIUM"}
    </span>
  );
}

export default function TaskTable({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onCreate,
  busyId,
  emptyTitle = "No tasks found",
  emptyDescription = "There are no tasks matching your current selection.",
  showEmptyCreate = Boolean(onCreate),
}) {
  if (!tasks.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <ListTodo size={25} />
        </div>
        <h3>{emptyTitle}</h3>
        <p>{emptyDescription}</p>

        {showEmptyCreate && onCreate && (
          <button
            type="button"
            className="btn btn-primary empty-create-btn"
            onClick={onCreate}
          >
            <Plus size={16} />
            Create task
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article
          className={`task-row ${task.completed ? "task-done" : ""}`}
          key={task.id}
        >
          <button
            className={`check-button ${task.completed ? "checked" : ""}`}
            onClick={() => onToggle(task)}
            aria-label={task.completed ? "Move task back to pending" : "Mark task completed"}
            title={task.completed ? "Move back to pending" : "Mark as completed"}
            disabled={busyId === task.id}
          >
            {task.completed && <Check size={14} />}
          </button>

          <div className="task-main">
            <div className="task-title-line">
              <h3>{task.title}</h3>
              <Priority value={task.priority} />
            </div>

            <p>{task.description || "No description added."}</p>

            <div className={`task-date ${isOverdue(task) ? "overdue" : ""}`}>
              <CalendarDays size={14} />
              {isOverdue(task) ? "Overdue · " : "Due · "}
              {formatDate(task.dueDate)}
            </div>
          </div>

          <div className="task-actions">
            <button
              type="button"
              className="icon-button"
              onClick={() => onEdit(task)}
              title="Edit task"
              aria-label={`Edit ${task.title}`}
              disabled={busyId === task.id}
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              className="icon-button danger-hover"
              onClick={() => onDelete(task)}
              title="Delete task"
              aria-label={`Delete ${task.title}`}
              disabled={busyId === task.id}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
