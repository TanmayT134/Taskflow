
import { useEffect, useRef, useState } from "react";
import {
    CheckCheck,
    AlertCircle,
    ListTodo,
    Clock3,
    ArrowUpRight,
    Plus,
    Sparkles,
    BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

import { taskService } from "../services/taskService";
import { getApiError } from "../services/api";
import { greeting } from "../utils/format";
import { fetchAllTaskPages } from "../utils/fetchAllTaskPages";

import StatCard from "../components/StatCard";
import TaskTable from "../components/TaskTable";
import TaskModal from "../components/TaskModal";
import { StatCardsSkeleton, TaskRowsSkeleton } from "../components/LoadingSkeletons";
import { useFeedback } from "../context/FeedbackContext";
import ErrorBanner from "../components/ErrorBanner";

export default function Dashboard() {
    const { confirm, notify } = useFeedback();
    const [stats, setStats] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]);

    const [loading, setLoading] = useState(true);
    const initialLoading = loading && stats === null;
    const [error, setError] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const [saving, setSaving] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const requestIdRef = useRef(0);
    const savingRef = useRef(false);
    const actionLocksRef = useRef(new Set());

    // Load dashboard information. Priority data is collected across every page,
    // not just the first 100 tasks, so the distribution remains accurate.
    async function loadDashboard() {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        setError("");

        try {
            const taskQuery = {
                size: 100,
                sortBy: "createdAt",
                direction: "DESC",
            };
            // The first task page also supplies the five recent tasks, avoiding
            // a second overlapping request for the same records.
            const [statsData, firstTaskPage] = await Promise.all([
                taskService.getStats(),
                taskService.getTasks({ ...taskQuery, page: 0 }),
            ]);

            const completeTaskList = await fetchAllTaskPages(
                firstTaskPage,
                taskQuery,
                taskService.getTasks,
                4
            );

            // Ignore older requests that finish after a newer refresh.
            if (requestId !== requestIdRef.current) return;
            setStats(statsData);
            setTasks((firstTaskPage.content || []).slice(0, 5));
            setAllTasks(completeTaskList);
        } catch (err) {
            if (requestId === requestIdRef.current) setError(getApiError(err));
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }

    useEffect(() => {
        loadDashboard();
        return () => { requestIdRef.current += 1; };
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
        if (savingRef.current) return;
        savingRef.current = true;
        setSaving(true);
        setError("");

        try {
            if (editingTask) {
                await taskService.updateTask(editingTask.id, payload);
                notify("Task updated successfully.");
            } else {
                await taskService.createTask(payload);
                notify("Task created successfully.");
            }

            setModalOpen(false);
            setEditingTask(null);

            await loadDashboard();
        } catch (err) {
            setError(getApiError(err));
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    }

    // Mark task completed or pending. A ref lock prevents rapid repeated clicks
    // before React has a chance to render the disabled state.
    async function handleToggleTask(task) {
        const lockKey = `task-${task.id}`;
        if (actionLocksRef.current.has(lockKey)) return;
        actionLocksRef.current.add(lockKey);

        try {
            const nextCompleted = !task.completed;
            const confirmed = await confirm({
                title: nextCompleted ? "Complete this task?" : "Restore this task?",
                message: nextCompleted
                    ? `Mark "${task.title}" as completed?`
                    : `Move "${task.title}" back to pending?`,
                confirmLabel: nextCompleted ? "Mark complete" : "Move to pending",
            });
            if (!confirmed) return;

            setBusyId(task.id);
            setError("");
            await taskService.setCompleted(task.id, nextCompleted);
            notify(nextCompleted ? "Task marked as completed." : "Task moved back to pending.");
            await loadDashboard();
        } catch (err) {
            setError(getApiError(err));
        } finally {
            actionLocksRef.current.delete(lockKey);
            setBusyId(null);
        }
    }

    // Delete task
    async function handleDeleteTask(task) {
        const lockKey = `task-${task.id}`;
        if (actionLocksRef.current.has(lockKey)) return;
        actionLocksRef.current.add(lockKey);

        try {
            const confirmed = await confirm({
                title: "Delete this task?",
                message: `"${task.title}" will be permanently deleted. This action cannot be undone.`,
                confirmLabel: "Delete task",
                tone: "danger",
            });
            if (!confirmed) return;

            setBusyId(task.id);
            setError("");
            await taskService.deleteTask(task.id);
            notify("Task deleted successfully.");
            await loadDashboard();
        } catch (err) {
            setError(getApiError(err));
        } finally {
            actionLocksRef.current.delete(lockKey);
            setBusyId(null);
        }
    }

    // Calculate priority distribution from backend task data
    // One pass over the collection is cheaper than three separate filters.
    const priorityCounts = allTasks.reduce(
        (counts, task) => {
            if (task.priority === "HIGH") counts.HIGH += 1;
            else if (task.priority === "MEDIUM") counts.MEDIUM += 1;
            else if (task.priority === "LOW") counts.LOW += 1;
            return counts;
        },
        { HIGH: 0, MEDIUM: 0, LOW: 0 }
    );

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
        <div className="dashboard-page" aria-busy={loading}>

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
            <ErrorBanner message={error} onRetry={loadDashboard} retrying={loading} />

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

            {initialLoading ? <StatCardsSkeleton /> : (
                <div className="stats-grid" aria-busy={loading}>
                    <StatCard label="Total tasks" value={stats?.totalTasks ?? 0} detail="Across your workspace" icon={ListTodo} tone="blue" />
                    <StatCard label="Completed" value={stats?.completedTasks ?? 0} detail="Tasks you’ve finished" icon={CheckCheck} tone="green" />
                    <StatCard label="In progress" value={stats?.pendingTasks ?? 0} detail="Still waiting for you" icon={Clock3} tone="violet" />
                    <StatCard label="Overdue" value={stats?.overdueTasks ?? 0} detail="Past their due date" icon={AlertCircle} tone="orange" />
                </div>
            )}

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

                    {initialLoading ? (
                        <div className="skeleton-progress-block" role="status" aria-label="Loading completion progress">
                            <span className="skeleton-block skeleton-progress-value" />
                            <span className="skeleton-block skeleton-progress-track" />
                        </div>
                    ) : (
                        <>
                            <div className="progress-number">{`${Number(stats?.completionPercentage || 0).toFixed(1)}%`}</div>
                            <div className="progress-track">
                                <div style={{ width: `${Math.min(100, Math.max(0, Number(stats?.completionPercentage || 0)))}%` }} />
                            </div>
                        </>
                    )}

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

                {initialLoading ? (
                    <div className="skeleton-chart" role="status" aria-label="Loading priority distribution">
                        <span className="skeleton-block skeleton-chart-line" />
                        <span className="skeleton-block skeleton-chart-line medium" />
                        <span className="skeleton-block skeleton-chart-line short" />
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
                            Based on {totalPriorityTasks} tasks
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

                {initialLoading ? (
                    <TaskRowsSkeleton rows={4} />
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
