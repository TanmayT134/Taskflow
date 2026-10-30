const statItems = ["Total tasks", "Completed", "In progress", "Overdue"];

export function StatCardsSkeleton() {
  return (
    <div className="stats-grid" aria-label="Loading dashboard statistics" role="status">
      {statItems.map((item) => (
        <div className="stat-card skeleton-stat-card" key={item}>
          <span className="skeleton-block skeleton-stat-icon" />
          <span className="skeleton-block skeleton-label" />
          <span className="skeleton-block skeleton-stat-value" />
          <span className="skeleton-block skeleton-detail" />
        </div>
      ))}
      <span className="sr-only">Loading dashboard statistics…</span>
    </div>
  );
}

export function TaskRowsSkeleton({ rows = 5 }) {
  return (
    <div className="task-list skeleton-task-list" role="status" aria-label="Loading tasks">
      {Array.from({ length: rows }, (_, index) => (
        <div className="task-row skeleton-task-row" key={index}>
          <span className="skeleton-block skeleton-check" />
          <div className="task-main">
            <div className="skeleton-task-title-line">
              <span className="skeleton-block skeleton-task-title" />
              <span className="skeleton-block skeleton-priority" />
            </div>
            <span className="skeleton-block skeleton-description" />
            <span className="skeleton-block skeleton-date" />
          </div>
          <div className="skeleton-task-actions">
            <span className="skeleton-block skeleton-action" />
            <span className="skeleton-block skeleton-action" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading task list…</span>
    </div>
  );
}

export function CalendarGridSkeleton() {
  return (
    <div className="calendar-grid calendar-grid-skeleton" role="status" aria-label="Loading calendar">
      {Array.from({ length: 7 }, (_, index) => (
        <div className="calendar-weekday" key={`heading-${index}`}>
          <span className="skeleton-block skeleton-weekday" />
        </div>
      ))}
      {Array.from({ length: 35 }, (_, index) => (
        <div className="calendar-day skeleton-calendar-day" key={index}>
          <span className="skeleton-block skeleton-day-number" />
          <span className="skeleton-block skeleton-day-line" />
          {index % 3 === 0 && <span className="skeleton-block skeleton-day-line short" />}
        </div>
      ))}
      <span className="sr-only">Loading calendar dates…</span>
    </div>
  );
}

export function AgendaSkeleton() {
  return <TaskRowsSkeleton rows={3} />;
}
