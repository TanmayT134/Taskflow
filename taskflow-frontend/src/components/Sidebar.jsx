import { useEffect, useRef, useState } from "react";
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
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
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
            <span className="workspace-avatar">T</span>
            <span className="workspace-copy"><b>My Workspace</b><small>Personal plan</small></span>
            <MoreHorizontal className="workspace-dots-icon" size={18} />
          </button>
          {workspaceMenuOpen && (
            <div className="workspace-popover" role="menu">
              <div className="workspace-popover-heading">
                <span className="workspace-avatar">T</span>
                <span><strong>My Workspace</strong><small>Personal plan · 1 workspace</small></span>
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

        <nav className="side-nav">
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
