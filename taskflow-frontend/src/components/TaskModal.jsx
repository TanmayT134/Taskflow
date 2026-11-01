import { useEffect, useRef, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { usePreferences } from "../context/PreferencesContext";

const blank = {
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
};

export default function TaskModal({
  open,
  onClose,
  onSave,
  task,
  saving,
  initialDueDate = "",
}) {
  const { preferences } = usePreferences();
  const [form, setForm] = useState(blank);
  const [validationError, setValidationError] = useState("");
  const titleRef = useRef(null);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement;
    setValidationError("");
    setForm(
      task
        ? {
            title: task.title || "",
            description: task.description || "",
            priority: task.priority || "MEDIUM",
            dueDate: task.dueDate || "",
          }
        : {
            ...blank,
            priority: preferences.defaultPriority,
            dueDate: initialDueDate || "",
          }
    );

    const focusFrame = window.requestAnimationFrame(() => titleRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(focusFrame);
      previousFocusRef.current?.focus?.();
    };
  }, [task, open, preferences.defaultPriority, initialDueDate]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !saving) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = modalRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, saving, onClose]);

  if (!open) return null;

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "title") setValidationError("");
  }

  async function submit(event) {
    event.preventDefault();
    if (saving || submittingRef.current) return;

    const title = form.title.trim();
    if (!title) {
      setValidationError("Please enter a task title.");
      titleRef.current?.focus();
      return;
    }

    if (title.length > 150) {
      setValidationError("Task title must be 150 characters or fewer.");
      titleRef.current?.focus();
      return;
    }

    setValidationError("");
    submittingRef.current = true;
    try {
      await onSave({
        ...form,
        title,
        description: form.description.trim(),
        dueDate: form.dueDate || null,
      });
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <section
        className="task-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        aria-describedby="task-modal-description"
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">TASK DETAILS</span>
            <h2 id="task-modal-title">{task ? "Edit task" : "Create a task"}</h2>
            <p id="task-modal-description">Give your next step a clear direction.</p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close task dialog"
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} noValidate>
          <label htmlFor="task-title">
            Task title <span aria-hidden="true">*</span>
            <input
              ref={titleRef}
              id="task-title"
              name="title"
              value={form.title}
              onChange={change}
              maxLength={150}
              required
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? "task-title-error" : undefined}
              placeholder="e.g. Finish project proposal"
              disabled={saving}
            />
            {validationError && (
              <small className="task-field-error" id="task-title-error" role="alert">
                {validationError}
              </small>
            )}
          </label>

          <label htmlFor="task-description">
            Description <small>OPTIONAL</small>
            <textarea
              id="task-description"
              name="description"
              value={form.description}
              onChange={change}
              maxLength={1000}
              rows={4}
              placeholder="Add a few details..."
              disabled={saving}
            />
            <small className="task-field-hint">{form.description.length}/1000 characters</small>
          </label>

          <div className="form-row">
            <label htmlFor="task-priority">
              Priority
              <select
                id="task-priority"
                name="priority"
                value={form.priority}
                onChange={change}
                disabled={saving}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </label>

            <label htmlFor="task-due-date">
              Due date <small>OPTIONAL</small>
              <div className="date-input">
                <CalendarDays size={16} aria-hidden="true" />
                <input
                  id="task-due-date"
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={change}
                  disabled={saving}
                />
              </div>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-quiet" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : task ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
