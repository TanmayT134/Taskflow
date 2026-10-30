
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
    <span
      className={`priority priority-${(
        value || "medium"
      ).toLowerCase()}`}
    >
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
}) {
  if (!tasks.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <ListTodo size={25} />
        </div>

        <h3>No tasks found</h3>

        <p>
          There are no tasks matching your current selection.
          Try changing your filters or create a new task.
        </p>

        {onCreate && (
          <button
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
          className={`task-row ${
            task.completed ? "task-done" : ""
          }`}
          key={task.id}
        >
          <button
            className={`check-button ${
              task.completed ? "checked" : ""
            }`}
            onClick={() => onToggle(task)}
            aria-label={
              task.completed
                ? "Mark pending"
                : "Mark completed"
            }
            disabled={busyId === task.id}
          >
            {task.completed && <Check size={14} />}
          </button>

          <div className="task-main">
            <div className="task-title-line">
              <h3>{task.title}</h3>
              <Priority value={task.priority} />
            </div>

            <p>
              {task.description || "No description added."}
            </p>

            <div
              className={`task-date ${
                isOverdue(task) ? "overdue" : ""
              }`}
            >
              <CalendarDays size={14} />

              {isOverdue(task)
                ? "Overdue · "
                : "Due · "}

              {formatDate(task.dueDate)}
            </div>
          </div>

          <div className="task-actions">
            <button
              className="icon-button"
              onClick={() => onEdit(task)}
              title="Edit task"
              disabled={busyId === task.id}
            >
              <Pencil size={16} />
            </button>

            <button
              className="icon-button danger-hover"
              onClick={() => onDelete(task)}
              title="Delete task"
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
