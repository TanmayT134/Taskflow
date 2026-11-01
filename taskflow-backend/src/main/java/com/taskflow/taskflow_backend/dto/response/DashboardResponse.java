
package com.taskflow.taskflow_backend.dto.response;

import java.util.List;

public record DashboardResponse(
        DashboardStatsResponse stats,
        List<DashboardTaskResponse> upcomingTasks,
        List<DashboardTaskResponse> recentTasks
) {
}
