
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { taskService } from "../services/taskService";
import { getApiError } from "../services/api";

import TaskTable from "../components/TaskTable";
import TaskModal from "../components/TaskModal";

export default function TasksPage({ mode = "all" }) {
  const [data, setData] = useState({
    content: [],
    pageNumber: 0,
    totalPages: 0,
    totalElements: 0,
  });

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("all");

  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("DESC");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const title =
    mode === "pending"
      ? "Pending tasks"
      : mode === "completed"
      ? "Completed tasks"
      : "All tasks";

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        size: pageSize,
        sortBy,
        direction,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (priority) {
        params.priority = priority;
      }

      if (mode === "pending") {
        params.completed = false;
      } else if (mode === "completed") {
        params.completed = true;
      } else if (status === "active") {
        params.completed = false;
      } else if (status === "completed") {
        params.completed = true;
      }

      const result = await taskService.getTasks(params);
      setData(result);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pageSize,
    search,
    priority,
    status,
    sortBy,
    direction,
    mode,
  ]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  function resetPage() {
    setPage(0);
  }

  function openCreateModal() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEditModal(task) {
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
      await load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setBusyId(task.id);
    setError("");

    try {
      await taskService.setCompleted(task.id, !task.completed);
      await load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteTask(task) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    setBusyId(task.id);
    setError("");

    try {
      await taskService.deleteTask(task.id);

      if (data.content.length === 1 && page > 0) {
        setPage((current) => current - 1);
      } else {
        await load();
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setBusyId(null);
    }
  }

  const hasFilters =
    search.trim() !== "" ||
    priority !== "" ||
    (mode === "all" && status !== "all");

  function clearFilters() {
    setSearch("");
    setPriority("");
    setStatus("all");
    setPage(0);
  }

  return (
    <div className="tasks-page">

      {/* Toolbar */}
      <div className="tasks-toolbar">

        {/* Status tabs */}
        {mode === "all" && (
          <div className="status-tabs">
            {[
              { label: "All tasks", value: "all" },
              { label: "Active", value: "active" },
              { label: "Completed", value: "completed" },
            ].map((item) => (
              <button
                key={item.value}
                className={`status-tab ${
                  status === item.value ? "active" : ""
                }`}
                onClick={() => {
                  setStatus(item.value);
                  resetPage();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Search and filters */}
        <div className="list-toolbar">

          <div className="search-box">
            <Search size={17} />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Search by title or description..."
            />

            {search && (
              <button
                className="search-clear"
                onClick={() => {
                  setSearch("");
                  resetPage();
                }}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="toolbar-filters">

            <label className="filter-control">
              <SlidersHorizontal size={16} />

              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  resetPage();
                }}
              >
                <option value="">All priorities</option>
                <option value="HIGH">High priority</option>
                <option value="MEDIUM">Medium priority</option>
                <option value="LOW">Low priority</option>
              </select>
            </label>

            <select
              className="sort-select"
              value={`${sortBy}:${direction}`}
              onChange={(e) => {
                const [sort, dir] = e.target.value.split(":");

                setSortBy(sort);
                setDirection(dir);
                resetPage();
              }}
            >
              <option value="createdAt:DESC">Newest first</option>
              <option value="createdAt:ASC">Oldest first</option>
              <option value="dueDate:ASC">Due date</option>
              <option value="priority:ASC">Priority: High first</option>
              <option value="title:ASC">Title A–Z</option>
            </select>

            <button
              className="btn btn-primary"
              onClick={openCreateModal}
            >
              <Plus size={17} />
              Add task
            </button>
          </div>
        </div>

        {hasFilters && (
          <div className="active-filters">
            <span>Filters applied</span>

            <button onClick={clearFilters}>
              Clear all <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="alert-error">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button onClick={load}>Retry</button>
        </div>
      )}

      {/* Task list */}
      <section className="panel task-panel">

        <div className="panel-heading">
          <div>
            <h3>{title}</h3>

            <p>
              {loading
                ? "Loading tasks..."
                : `${data.totalElements || 0} tasks found`}
            </p>
          </div>

          <button
            className="icon-button"
            onClick={load}
            title="Refresh tasks"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        {loading ? (
          <div className="loading-line">
            Fetching tasks from your workspace...
          </div>
        ) : (
          <TaskTable
            tasks={data.content || []}
            onToggle={toggleTask}
            onEdit={openEditModal}
            onDelete={deleteTask}
            onCreate={openCreateModal}
            busyId={busyId}
          />
        )}

        {/* Pagination */}
        <div className="pagination pagination-enhanced">

          <div className="pagination-info">
            <span>
              Showing{" "}
              {data.totalElements === 0
                ? 0
                : page * pageSize + 1}
              –
              {Math.min(
                (page + 1) * pageSize,
                data.totalElements || 0
              )}{" "}
              of {data.totalElements || 0}
            </span>

            <label>
              Rows:
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </label>
          </div>

          <div className="pagination-controls">
            <button
              className="icon-button"
              disabled={page <= 0 || loading}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="pagination-current">
              {data.totalPages ? page + 1 : 0}
              <span> / {data.totalPages || 0}</span>
            </span>

            <button
              className="icon-button"
              disabled={
                page + 1 >= data.totalPages || loading
              }
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Create / Edit modal */}
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
