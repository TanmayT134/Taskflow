package com.taskflow.taskflow_backend.dto.response;

public class DashboardStatsResponse {

    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long overdueTasks;
    private double completionPercentage;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(
            long totalTasks,
            long completedTasks,
            long pendingTasks,
            long overdueTasks,
            double completionPercentage) {

        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.pendingTasks = pendingTasks;
        this.overdueTasks = overdueTasks;
        this.completionPercentage = completionPercentage;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(long totalTasks) {
        this.totalTasks = totalTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(long completedTasks) {
        this.completedTasks = completedTasks;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public long getOverdueTasks() {
        return overdueTasks;
    }

    public void setOverdueTasks(long overdueTasks) {
        this.overdueTasks = overdueTasks;
    }

    public double getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(double completionPercentage) {
        this.completionPercentage = completionPercentage;
    }
}