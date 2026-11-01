import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ListTodo, Clock3, CircleCheck, CalendarDays,
  Settings, CheckCheck, X, MoreHorizontal, ChevronRight
} from "lucide-react";

const groups = [
  { title: "WORKSPACE", items: [["Dashboard", "/", LayoutDashboard], ["All tasks", "/tasks", ListTodo], ["Pending", "/pending", Clock3], ["Completed", "/completed", CircleCheck]] },
  { title: "PERSONAL", items: [["Calendar", "/calendar", CalendarDays], ["Settings", "/settings", Settings]] }
];

export default function Sidebar({ open, onClose }) {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const workspaceRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    function onPointerDown(event) {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) {
        setWorkspaceMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function goTo(path) {
    navigate(path);
    setWorkspaceMenuOpen(false);
    onClose?.();
  }

  return (
    <>
      {open && <button type="button" className="mobile-scrim" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`} aria-label="Main sidebar">
        <div className="brand">
          <div className="brand-mark"><CheckCheck size={21} /></div>
          <div><strong>Taskflow</strong><span>PERSONAL WORKSPACE</span></div>
          <button type="button" className="icon-button sidebar-x" onClick={onClose} aria-label="Close menu"><X size={19} /></button>
        </div>

        <div className="workspace-menu-anchor" ref={workspaceRef}>
          <button
            type="button"
            className="workspace-switch"
            onClick={() => setWorkspaceMenuOpen((value) => !value)}
            aria-expanded={workspaceMenuOpen}
            aria-haspopup="menu"
          >
            <span className="workspace-avatar">{(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}</span>
            <span className="workspace-copy"><b>{user?.fullName || "My Workspace"}</b><small>Personal workspace</small></span>
            <MoreHorizontal className="workspace-dots-icon" size={18} />
          </button>
          {workspaceMenuOpen && (
            <div className="workspace-popover" role="menu">
              <div className="workspace-popover-heading">
                <span className="workspace-avatar">{(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}</span>
                <span><strong>{user?.fullName || "My Workspace"}</strong><small>{user?.email || "Personal workspace"}</small></span>
              </div>
              <button type="button" role="menuitem" onClick={() => goTo("/")}>
                <LayoutDashboard size={15} /> Workspace overview <ChevronRight size={14} />
              </button>
              <button type="button" role="menuitem" onClick={() => goTo("/settings")}>
                <Settings size={15} /> Workspace settings <ChevronRight size={14} />
              </button>
              <p>You're using the personal workspace.</p>
            </div>
          )}
        </div>

        <nav className="side-nav" aria-label="Main navigation">
          {groups.map((group) => (
            <section className="nav-group" key={group.title}>
              <p className="nav-heading">{group.title}</p>
              {group.items.map(([label, to, Icon]) => (
                <NavLink
                  end={to === "/"}
                  to={to}
                  key={to}
                  onClick={onClose}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} /><span>{label}</span>
                </NavLink>
              ))}
            </section>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <div className="note-spark">✦</div>
            <b>Make today count.</b>
            <p>Focus on progress, not perfection.</p>
          </div>
          <div className="sidebar-version">TASKFLOW <span>V 1.0.0</span></div>
        </div>
      </aside>
    </>
  );
}
