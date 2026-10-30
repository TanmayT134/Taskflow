import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  RefreshCw,
  Check,
  Clock3,
  CircleAlert,
} from "lucide-react";
import { taskService } from "../services/taskService";
import { getApiError } from "../services/api";
import TaskModal from "../components/TaskModal";
import { formatDate, isOverdue } from "../utils/format";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  if (!value) return null;
  // Treat YYYY-MM-DD as a local calendar date rather than UTC.
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function buildCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export default function CalendarPage() {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(dateKey(today));
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch every page so calendar dates are not silently incomplete
      // when a workspace contains more than the first page of tasks.
      const firstPage = await taskService.getTasks({
        page: 0,
        size: 100,
        sortBy: "dueDate",
        direction: "ASC",
      });

      let allTasks = [...(firstPage.content || [])];
      const totalPages = Number(firstPage.totalPages || 0);

      for (let page = 1; page < totalPages; page += 1) {
        const result = await taskService.getTasks({
          page,
          size: 100,
          sortBy: "dueDate",
          direction: "ASC",
        });
        allTasks = allTasks.concat(result.content || []);
      }

      setTasks(allTasks);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth.getFullYear(), visibleMonth.getMonth()),
    [visibleMonth]
  );

  const tasksByDate = useMemo(() => {
    const grouped = {};
    tasks.forEach((task) => {
      const key = task.dueDate ? String(task.dueDate).slice(0, 10) : "";
      if (!key) return;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(task);
    });
    return grouped;
  }, [tasks]);

  const selectedTasks = tasksByDate[selectedDate] || [];
  const selectedDateObject = parseDate(selectedDate);
  const pendingCount = selectedTasks.filter((task) => !task.completed).length;
  const completedCount = selectedTasks.filter((task) => task.completed).length;

  function changeMonth(offset) {
    setVisibleMonth((current) => new Date(
      current.getFullYear(),
      current.getMonth() + offset,
      1
    ));
  }

  function goToToday() {
    const now = new Date();
    setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(dateKey(now));
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditing(task);
    setModalOpen(true);
  }

  async function saveTask(payload) {
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await taskService.updateTask(editing.id, payload);
      } else {
        await taskService.createTask(payload);
      }
      setModalOpen(false);
      setEditing(null);
      await loadTasks();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    const nextCompleted = !task.completed;
    const action = nextCompleted ? "complete" : "move back to pending";
    if (!window.confirm(`Are you sure you want to ${action} "${task.title}"?`)) {
      return;
    }

    setBusyId(task.id);
    setError("");
    try {
      await taskService.setCompleted(task.id, nextCompleted);
      await loadTasks();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

    setBusyId(task.id);
    setError("");
    try {
      await taskService.deleteTask(task.id);
      await loadTasks();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="calendar-page">
      <div className="calendar-intro">
        <div>
          <span className="eyebrow"><CalendarDays size={13} /> PLAN YOUR MONTH</span>
          <h2>Task calendar</h2>
          <p>See what's coming up and keep your deadlines in view.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={17} />
          Add task
        </button>
      </div>

      {error && (
        <div className="alert-error" role="alert">
          <CircleAlert size={17} />
          <span>{error}</span>
          <button onClick={loadTasks}>Retry</button>
        </div>
      )}

      <section className="calendar-panel panel">
        <div className="calendar-toolbar">
          <div className="calendar-month-heading">
            <h3>{MONTHS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</h3>
            <span>{tasks.length} scheduled {tasks.length === 1 ? "task" : "tasks"}</span>
          </div>
          <div className="calendar-nav">
            <button className="btn btn-quiet calendar-today" onClick={goToToday}>Today</button>
            <button className="icon-button" onClick={() => changeMonth(-1)} aria-label="Previous month">
              <ChevronLeft size={19} />
            </button>
            <button className="icon-button" onClick={() => changeMonth(1)} aria-label="Next month">
              <ChevronRight size={19} />
            </button>
            <button className="icon-button" onClick={loadTasks} aria-label="Refresh calendar" title="Refresh calendar" disabled={loading}>
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {WEEKDAYS.map((day) => (
            <div className="calendar-weekday" key={day}>{day}</div>
          ))}

          {calendarDays.map((date) => {
            const key = dateKey(date);
            const dayTasks = tasksByDate[key] || [];
            const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
            const isToday = sameDay(date, today);
            const isSelected = key === selectedDate;
            const pending = dayTasks.filter((task) => !task.completed).length;
            const completed = dayTasks.length - pending;
            const overdue = dayTasks.some((task) => isOverdue(task));

            return (
              <button
                type="button"
                key={key}
                className={[
                  "calendar-day",
                  !isCurrentMonth ? "outside-month" : "",
                  isToday ? "is-today" : "",
                  isSelected ? "is-selected" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => setSelectedDate(key)}
                aria-pressed={isSelected}
                aria-label={`${key}, ${dayTasks.length} tasks`}
              >
                <span className="calendar-day-number">{date.getDate()}</span>
                {dayTasks.length > 0 && (
                  <span className="calendar-day-meta">
                    {pending > 0 && <i className="calendar-dot pending-dot" />}
                    {completed > 0 && <i className="calendar-dot completed-dot" />}
                    {overdue && <i className="calendar-dot overdue-dot" />}
                    <small>{dayTasks.length} {dayTasks.length === 1 ? "task" : "tasks"}</small>
                  </span>
                )}
                {dayTasks.length > 0 && (
                  <span className="calendar-day-preview">
                    {dayTasks.slice(0, 2).map((task) => (
                      <span
                        key={task.id}
                        className={`calendar-task-chip ${task.completed ? "is-completed" : isOverdue(task) ? "is-overdue" : "is-pending"}`}
                        title={task.title}
                      >
                        {task.title}
                      </span>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="calendar-more">+{dayTasks.length - 2} more</span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span><i className="calendar-dot pending-dot" /> Pending</span>
          <span><i className="calendar-dot completed-dot" /> Completed</span>
          <span><i className="calendar-dot overdue-dot" /> Overdue</span>
        </div>
      </section>

      <section className="panel calendar-agenda">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">DAILY AGENDA</span>
            <h3>
              {selectedDateObject
                ? selectedDateObject.toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Selected date"}
            </h3>
            <p>
              {selectedTasks.length} tasks · {pendingCount} pending · {completedCount} completed
            </p>
          </div>
          <button className="btn btn-quiet" onClick={openCreate}>
            <Plus size={15} /> Add for this day
          </button>
        </div>

        {loading ? (
          <div className="loading-line">Loading your scheduled tasks...</div>
        ) : selectedTasks.length === 0 ? (
          <div className="calendar-agenda-empty">
            <div className="empty-icon"><CalendarDays size={23} /></div>
            <h3>No tasks scheduled</h3>
            <p>There are no tasks due on this date. Add a task and set its due date to see it here.</p>
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} /> Create task
            </button>
          </div>
        ) : (
          <div className="calendar-agenda-list">
            {selectedTasks.map((task) => (
              <article className={`calendar-agenda-item ${task.completed ? "is-completed" : ""}`} key={task.id}>
                <button
                  className={`check-button ${task.completed ? "checked" : ""}`}
                  onClick={() => toggleTask(task)}
                  disabled={busyId === task.id}
                  aria-label={task.completed ? "Move task back to pending" : "Mark task completed"}
                >
                  {task.completed && <Check size={14} />}
                </button>
                <button className="calendar-agenda-task" onClick={() => openEdit(task)}>
                  <strong>{task.title}</strong>
                  <span>{task.description || "No description added."}</span>
                  <small><Clock3 size={13} /> Due {formatDate(task.dueDate)}</small>
                </button>
                <span className={`priority priority-${(task.priority || "medium").toLowerCase()}`}>
                  <i /> {task.priority || "MEDIUM"}
                </span>
                <button
                  className="icon-button danger-hover"
                  onClick={() => deleteTask(task)}
                  disabled={busyId === task.id}
                  aria-label={`Delete ${task.title}`}
                  title="Delete task"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <TaskModal
        open={modalOpen}
        task={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={saveTask}
        saving={saving}
      />
    </div>
  );
}
