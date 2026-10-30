
import { useEffect, useState } from "react";
import {
    CheckCheck,
    ListTodo,
    Clock3,
    AlertCircle,
    ArrowUpRight,
    Plus,
    Sparkles,
    BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

import { taskService } from "../services/taskService";
import { getApiError } from "../services/api";
import { greeting } from "../utils/format";

import StatCard from "../components/StatCard";
import TaskTable from "../components/TaskTable";
import TaskModal from "../components/TaskModal";

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const [saving, setSaving] = useState(false);
    const [busyId, setBusyId] = useState(null);

    // Load dashboard information from backend
    async function loadDashboard() {
        setLoading(true);
        setError("");

        try {
            const [statsData, recentData, allTasksData] =
                await Promise.all([
                    taskService.getStats(),

                    taskService.getTasks({
                        page: 0,
                        size: 5,
                        sortBy: "createdAt",
                        direction: "DESC",
                    }),

                    taskService.getTasks({
                        page: 0,
                        size: 100,
                        sortBy: "createdAt",
                        direction: "DESC",
                    }),
                ]);

            setStats(statsData);
            setTasks(recentData.content || []);
            setAllTasks(allTasksData.content || []);
        } catch (err) {
            setError(getApiError(err));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
    }, []);

    // Open modal for creating a task
    function handleCreateTask() {
        setEditingTask(null);
        setModalOpen(true);
    }

    // Open modal for editing a task
    function handleEditTask(task) {
        setEditingTask(task);
        setModalOpen(true);
    }

    // Create or update task
    async function handleSaveTask(payload) {
        setSaving(true);
        setError("");

        try {
            if (editingTask) {
                await taskService.updateTask(editingTask.id, payload);
            } else {
                await taskService.createTask(payload);
            }

            setModalOpen(false);
            setEditingTask(null);

            await loadDashboard();
        } catch (err) {
            setError(getApiError(err));
        } finally {
            setSaving(false);
        }
    }

    // Mark task completed or pending
    async function handleToggleTask(task) {
        setBusyId(task.id);
        setError("");

        try {
            await taskService.setCompleted(
                task.id,
                !task.completed
            );

            await loadDashboard();
        } catch (err) {
            setError(getApiError(err));
        } finally {
            setBusyId(null);
        }
    }

    // Delete task
    async function handleDeleteTask(task) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${task.title}"?`
        );

        if (!confirmed) return;

        setBusyId(task.id);
        setError("");

        try {
            await taskService.deleteTask(task.id);

            await loadDashboard();
        } catch (err) {
            setError(getApiError(err));
        } finally {
            setBusyId(null);
        }
    }

    // Calculate priority distribution from backend task data
    const priorityCounts = {
        HIGH: allTasks.filter(
            (task) => task.priority === "HIGH"
        ).length,

        MEDIUM: allTasks.filter(
            (task) => task.priority === "MEDIUM"
        ).length,

        LOW: allTasks.filter(
            (task) => task.priority === "LOW"
        ).length,
    };

    const totalPriorityTasks =
        priorityCounts.HIGH +
        priorityCounts.MEDIUM +
        priorityCounts.LOW;

    const priorityItems = [
        {
            label: "High priority",
            key: "HIGH",
            color: "#e47777",
        },
        {
            label: "Medium priority",
            key: "MEDIUM",
            color: "#e5ad5d",
        },
        {
            label: "Low priority",
            key: "LOW",
            color: "#48b58b",
        },
    ];

    return (
        <div className="dashboard-page">

            {/* Welcome section */}
            <div className="welcome-row">
                <div>
                    <div className="eyebrow">
                        <Sparkles size={13} />
                        YOUR PRODUCTIVITY, AT A GLANCE
                    </div>

                    <h2>{greeting()}, let’s make it count.</h2>

                    <p>
                        A little progress each day adds up to remarkable results.
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleCreateTask}
                >
                    <Plus size={17} />
                    New task
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="alert-error">
                    <AlertCircle size={17} />
                    <span>{error}</span>

                    <button onClick={loadDashboard}>
                        Retry
                    </button>
                </div>
            )}

            {/* Statistics */}
            <div className="section-title">
                <div>
                    <h2>Your overview</h2>
                    <p>Here’s your current task progress.</p>
                </div>

                <span className="live-label">
                    <i />
                    LIVE DATA
                </span>
            </div>

            <div className="stats-grid">
                <StatCard
                    label="Total tasks"
                    value={loading ? "…" : stats?.totalTasks}
                    detail="Across your workspace"
                    icon={ListTodo}
                    tone="blue"
                />

                <StatCard
                    label="Completed"
                    value={loading ? "…" : stats?.completedTasks}
                    detail="Tasks you’ve finished"
                    icon={CheckCheck}
                    tone="green"
                />

                <StatCard
                    label="In progress"
                    value={loading ? "…" : stats?.pendingTasks}
                    detail="Still waiting for you"
                    icon={Clock3}
                    tone="violet"
                />

                <StatCard
                    label="Overdue"
                    value={loading ? "…" : stats?.overdueTasks}
                    detail="Past their due date"
                    icon={AlertCircle}
                    tone="orange"
                />
            </div>

            {/* Dashboard insights */}
            <div className="dashboard-lower">

                {/* Completion progress */}
                <section className="panel progress-panel">
                    <div className="panel-heading">
                        <div>
                            <h3>Completion rate</h3>
                            <p>Your overall progress so far</p>
                        </div>

                        <span className="progress-badge">
                            WORKSPACE
                        </span>
                    </div>

                    <div className="progress-number">
                        {loading
                            ? "—"
                            : `${Number(
                                stats?.completionPercentage || 0
                            ).toFixed(1)}%`}
                    </div>

                    <div className="progress-track">
                        <div
                            style={{
                                width: `${Math.min(
                                    100,
                                    Math.max(
                                        0,
                                        Number(stats?.completionPercentage || 0)
                                    )
                                )}%`,
                            }}
                        />
                    </div>

                    <div className="progress-foot">
                        <span>
                            {stats?.completedTasks ?? 0} completed
                        </span>

                        <span>
                            {stats?.pendingTasks ?? 0} remaining
                        </span>
                    </div>
                </section>

                {/* Focus reminder */}
                <section className="focus-card">
                    <div className="focus-orb">✦</div>

                    <span className="eyebrow">
                        A SMALL REMINDER
                    </span>

                    <h3>Clarity creates momentum.</h3>

                    <p>
                        Choose one meaningful task, give it your
                        attention, and take the next step.
                    </p>

                    <Link to="/pending">
                        View pending tasks
                        <ArrowUpRight size={15} />
                    </Link>
                </section>
            </div>

            {/* Priority distribution */}
            <section className="panel priority-panel">
                <div className="panel-heading">
                    <div>
                        <h3>Task priority distribution</h3>
                        <p>
                            Understand how your tasks are distributed
                            by priority.
                        </p>
                    </div>

                    <div className="priority-chart-icon">
                        <BarChart3 size={19} />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-line">
                        Loading priority data…
                    </div>
                ) : totalPriorityTasks === 0 ? (
                    <div className="priority-empty">
                        No task priority data available yet.
                    </div>
                ) : (
                    <div className="priority-chart">
                        {priorityItems.map((item) => {
                            const count = priorityCounts[item.key];

                            const percentage =
                                (count / totalPriorityTasks) * 100;

                            return (
                                <div
                                    className="priority-chart-row"
                                    key={item.key}
                                >
                                    <div className="priority-chart-label">
                                        <span>
                                            <i
                                                style={{ backgroundColor: item.color }}
                                            />
                                            {item.label}
                                        </span>

                                        <strong>{count}</strong>
                                    </div>

                                    <div className="priority-chart-track">
                                        <div
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: item.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        <div className="priority-chart-footer">
                            Based on {totalPriorityTasks} loaded tasks
                        </div>
                    </div>
                )}
            </section>

            {/* Recent tasks */}
            <section className="panel recent-panel">
                <div className="panel-heading">
                    <div>
                        <h3>Recently created</h3>
                        <p>Your latest tasks, ready when you are.</p>
                    </div>

                    <Link to="/tasks" className="text-link">
                        View all tasks
                        <ArrowUpRight size={15} />
                    </Link>
                </div>

                {loading ? (
                    <div className="loading-line">
                        Loading your tasks…
                    </div>
                ) : (
                    <TaskTable
                        tasks={tasks}
                        onToggle={handleToggleTask}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        busyId={busyId}
                    />
                )}
            </section>

            {/* Create / Edit task modal */}
            <TaskModal
                open={modalOpen}
                task={editingTask}
                onClose={() => {
                    setModalOpen(false);
                    setEditingTask(null);
                }}
                onSave={handleSaveTask}
                saving={saving}
            />

        </div>
    );
}
