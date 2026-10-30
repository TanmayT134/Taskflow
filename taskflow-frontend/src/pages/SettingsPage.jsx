import { useEffect, useState } from "react";
import {
  Palette, SlidersHorizontal, Download, Database, Check, Sun, Moon,
  ListTodo, CheckCheck, Clock3, AlertCircle, RotateCcw,
} from "lucide-react";
import { usePreferences } from "../context/PreferencesContext";
import { taskService } from "../services/taskService";
import { getApiError } from "../services/api";

const ACCENTS = [
  { id: "blue", label: "Ocean blue", color: "#5368e8" },
  { id: "violet", label: "Royal violet", color: "#805ad5" },
  { id: "teal", label: "Fresh teal", color: "#159b91" },
  { id: "rose", label: "Soft rose", color: "#df6687" },
];

function downloadCsv(tasks) {
  const columns = ["id", "title", "description", "priority", "completed", "dueDate", "createdAt", "updatedAt"];
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = [columns.join(","), ...tasks.map((task) => columns.map((key) => escape(task[key])).join(","))];
  const blob = new Blob(["\uFEFF", rows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `taskflow-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  const { preferences, setPreferences } = usePreferences();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    taskService.getStats()
      .then((result) => { if (active) setStats(result); })
      .catch((err) => { if (active) setError(getApiError(err)); })
      .finally(() => { if (active) setLoadingStats(false); });
    return () => { active = false; };
  }, []);

  function update(key, value) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setNotice("Your preferences have been saved on this device.");
    setError("");
  }

  function resetPreferences() {
    setPreferences({ theme: "light", accent: "blue", defaultPriority: "MEDIUM", sortBy: "createdAt", sortDirection: "DESC" });
    setNotice("Preferences restored to their defaults.");
    setError("");
  }

  async function exportTasks() {
    setExporting(true);
    setError("");
    setNotice("");
    try {
      const first = await taskService.getTasks({ page: 0, size: 100, sortBy: "createdAt", direction: "DESC" });
      const tasks = [...(first.content || [])];
      for (let page = 1; page < (first.totalPages || 0); page += 1) {
        const result = await taskService.getTasks({ page, size: 100, sortBy: "createdAt", direction: "DESC" });
        tasks.push(...(result.content || []));
      }
      downloadCsv(tasks);
      setNotice(`Exported ${tasks.length} task${tasks.length === 1 ? "" : "s"} to CSV.`);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-intro">
        <div><span className="eyebrow">MAKE TASKFLOW YOURS</span><h2>Settings</h2><p>Personalize your workspace and manage your task data.</p></div>
        <button className="btn btn-quiet settings-reset" onClick={resetPreferences}><RotateCcw size={15} /> Reset preferences</button>
      </div>

      {notice && <div className="settings-notice" role="status"><Check size={16} />{notice}</div>}
      {error && <div className="alert-error" role="alert"><AlertCircle size={17} /><span>{error}</span></div>}

      <section className="panel settings-section">
        <div className="settings-section-heading"><div className="settings-section-icon"><Palette size={19}/></div><div><h3>Appearance</h3><p>Choose how Taskflow looks on this device.</p></div></div>
        <div className="settings-field"><div><strong>Color theme</strong><small>Switch between light and dark workspace.</small></div><div className="settings-choice-row">
          <button className={`settings-choice ${preferences.theme === "light" ? "selected" : ""}`} onClick={() => update("theme", "light")}><Sun size={17}/> Light {preferences.theme === "light" && <Check size={14}/>}</button>
          <button className={`settings-choice ${preferences.theme === "dark" ? "selected" : ""}`} onClick={() => update("theme", "dark")}><Moon size={17}/> Dark {preferences.theme === "dark" && <Check size={14}/>}</button>
        </div></div>
        <div className="settings-field"><div><strong>Accent color</strong><small>Choose the highlight color used across the interface.</small></div><div className="accent-options">
          {ACCENTS.map((accent) => <button key={accent.id} className={`accent-option ${preferences.accent === accent.id ? "selected" : ""}`} onClick={() => update("accent", accent.id)} aria-label={accent.label} title={accent.label} style={{ "--swatch": accent.color }}>{preferences.accent === accent.id && <Check size={16}/>}</button>)}
        </div></div>
      </section>

      <section className="panel settings-section">
        <div className="settings-section-heading"><div className="settings-section-icon"><SlidersHorizontal size={19}/></div><div><h3>Task preferences</h3><p>Set sensible defaults for your everyday workflow.</p></div></div>
        <div className="settings-field"><div><strong>Default task priority</strong><small>Preselected when you create a new task.</small></div><select className="settings-select" value={preferences.defaultPriority} onChange={(e) => update("defaultPriority", e.target.value)}><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></div>
        <div className="settings-field"><div><strong>Default task sorting</strong><small>Applied when you open All, Pending, or Completed tasks.</small></div><select className="settings-select" value={`${preferences.sortBy}:${preferences.sortDirection}`} onChange={(e) => { const [sortBy, sortDirection] = e.target.value.split(":"); setPreferences((current) => ({ ...current, sortBy, sortDirection })); setNotice("Your preferences have been saved on this device."); }}><option value="createdAt:DESC">Newest first</option><option value="createdAt:ASC">Oldest first</option><option value="dueDate:ASC">Due date</option><option value="priority:ASC">Priority: High first</option><option value="title:ASC">Title A–Z</option></select></div>
      </section>

      <section className="panel settings-section">
        <div className="settings-section-heading"><div className="settings-section-icon"><Database size={19}/></div><div><h3>Data management</h3><p>Keep a portable copy of your task information.</p></div></div>
        <div className="settings-export-row"><div><strong>Export tasks</strong><small>Download all your tasks as a CSV file, including descriptions, priorities, status, and dates.</small></div><button className="btn btn-primary" onClick={exportTasks} disabled={exporting}><Download size={16}/>{exporting ? "Preparing export…" : "Export CSV"}</button></div>
      </section>

      <section className="panel settings-section">
        <div className="settings-section-heading"><div className="settings-section-icon"><ListTodo size={19}/></div><div><h3>Workspace overview</h3><p>A quick snapshot of your current task data.</p></div></div>
        <div className="settings-stats-grid">
          <div className="settings-stat"><ListTodo size={17}/><span>Total tasks</span><strong>{loadingStats ? "—" : stats?.totalTasks ?? 0}</strong></div>
          <div className="settings-stat"><CheckCheck size={17}/><span>Completed</span><strong>{loadingStats ? "—" : stats?.completedTasks ?? 0}</strong></div>
          <div className="settings-stat"><Clock3 size={17}/><span>Pending</span><strong>{loadingStats ? "—" : stats?.pendingTasks ?? 0}</strong></div>
          <div className="settings-stat"><AlertCircle size={17}/><span>Overdue</span><strong>{loadingStats ? "—" : stats?.overdueTasks ?? 0}</strong></div>
        </div>
        <div className="settings-app-info"><span>Application</span><strong>Taskflow <i>v1.0.0</i></strong><span>Preferences storage</span><strong>Saved locally in this browser</strong></div>
      </section>
    </div>
  );
}
