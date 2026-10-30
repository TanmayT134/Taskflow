export function formatDate(value) { if (!value) return "No due date"; const d = new Date(`${value}T00:00:00`); return Number.isNaN(d.getTime()) ? value : new Intl.DateTimeFormat("en", {day:"numeric",month:"short",year:"numeric"}).format(d); }
export function isOverdue(task) { if (!task?.dueDate || task.completed) return false; const today = new Date(); today.setHours(0,0,0,0); return new Date(`${task.dueDate}T00:00:00`) < today; }
export function greeting() { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; }
