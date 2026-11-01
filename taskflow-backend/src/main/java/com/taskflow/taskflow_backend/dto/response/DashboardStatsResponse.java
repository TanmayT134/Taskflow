
package com.taskflow.taskflow_backend.dto.response;

public class DashboardStatsResponse {

    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long overdueTasks;

    private double completionPercentage;

    private long highPriorityTasks;
    private long mediumPriorityTasks;
    private long lowPriorityTasks;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(
            long totalTasks,
            long completedTasks,
            long pendingTasks,
            long overdueTasks,
            double completionPercentage,
            long highPriorityTasks,
            long mediumPriorityTasks,
            long lowPriorityTasks
    ) {
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.pendingTasks = pendingTasks;
        this.overdueTasks = overdueTasks;
        this.completionPercentage = completionPercentage;
        this.highPriorityTasks = highPriorityTasks;
        this.mediumPriorityTasks = mediumPriorityTasks;
        this.lowPriorityTasks = lowPriorityTasks;
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

    public long getHighPriorityTasks() {
        return highPriorityTasks;
    }

    public void setHighPriorityTasks(long highPriorityTasks) {
        this.highPriorityTasks = highPriorityTasks;
    }

    public long getMediumPriorityTasks() {
        return mediumPriorityTasks;
    }

    public void setMediumPriorityTasks(long mediumPriorityTasks) {
        this.mediumPriorityTasks = mediumPriorityTasks;
    }

    public long getLowPriorityTasks() {
        return lowPriorityTasks;
    }

    public void setLowPriorityTasks(long lowPriorityTasks) {
        this.lowPriorityTasks = lowPriorityTasks;
    }
}
