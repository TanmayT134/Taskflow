import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Menu, Bell, ChevronDown, Search, X, Settings, LayoutDashboard,
  ListTodo, CheckCheck, AlertCircle, CalendarClock, Command, LoaderCircle
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { taskService } from "../services/taskService";
import { fetchAllTaskPages } from "../utils/fetchAllTaskPages";
import { getApiError } from "../services/api";
import { useAuth } from "../context/AuthContext";

const titles = {
  "/": ["Overview", "Here’s what’s happening with your tasks."],
  "/tasks": ["All tasks", "Keep every commitment in one place."],
  "/pending": ["Pending tasks", "A clear view of what’s still on your plate."],
  "/completed": ["Completed tasks", "Look back at everything you’ve accomplished."],
  "/calendar": ["Calendar", "Your schedule at a glance."],
  "/settings": ["Settings", "Your workspace preferences."]
};

function localDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDueDate(value) {
  if (!value) return "No due date";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: "short", day: "numeric"
  });
}

export default function Header({ onMenu }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [title, subtitle] = titles[pathname] || ["Taskflow", "Your personal workspace."];

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef(null);
  const searchTimerRef = useRef(null);
  const searchRequestRef = useRef(0);

  const [activeMenu, setActiveMenu] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const menuRef = useRef(null);

  const closeMenus = useCallback(() => {
    setActiveMenu(null);
    setSearchOpen(false);
  }, []);

  const runSearch = useCallback((query) => {
    window.clearTimeout(searchTimerRef.current);
    const trimmed = query.trim();
    const requestId = ++searchRequestRef.current;
    if (!trimmed) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError("");
      return;
    }
    searchTimerRef.current = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");
      try {
        const result = await taskService.getTasks({
          page: 0, size: 7, search: trimmed, sortBy: "createdAt", direction: "DESC"
        });
        if (requestId === searchRequestRef.current) {
          setSearchResults(result.content || []);
          setActiveIndex(0);
        }
      } catch (error) {
        if (requestId === searchRequestRef.current) {
          setSearchResults([]);
          setSearchError(getApiError(error));
        }
      } finally {
        if (requestId === searchRequestRef.current) setSearchLoading(false);
      }
    }, 220);
  }, []);

  useEffect(() => {
    runSearch(search);
    return () => {
      window.clearTimeout(searchTimerRef.current);
      searchRequestRef.current += 1;
    };
  }, [search, runSearch]);

  const openSearch = useCallback(() => {
    setActiveMenu(null);
    setSearchOpen(true);
    window.requestAnimationFrame(() => searchRef.current?.focus());
  }, []);

  useEffect(() => {
    function onKeyDown(event) {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isShortcut) {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "Escape") {
        closeMenus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openSearch, closeMenus]);

  useEffect(() => {
    function onPointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
        setSearchOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const navigateToSearch = useCallback((query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/tasks?search=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
    setSearch("");
    setSearchResults([]);
  }, [navigate]);

  const chooseSearchResult = useCallback((task) => {
    navigateToSearch(task.title || search);
  }, [navigateToSearch, search]);

  function handleSearchKeyDown(event) {
    if (event.key === "ArrowDown" && searchResults.length) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % searchResults.length);
    } else if (event.key === "ArrowUp" && searchResults.length) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + searchResults.length) % searchResults.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (searchResults[activeIndex]) chooseSearchResult(searchResults[activeIndex]);
      else navigateToSearch(search);
    }
  }

  const loadNotifications = useCallback(async () => {
    setNotificationLoading(true);
    setNotificationError("");
    try {
      const firstPage = await taskService.getTasks({
        page: 0, size: 100, completed: false, sortBy: "dueDate", direction: "ASC"
      });
      const allPending = await fetchAllTaskPages(
        firstPage,
        { size: 100, completed: false, sortBy: "dueDate", direction: "ASC" },
        taskService.getTasks,
        4
      );
      const today = localDateKey();
      const items = allPending
        .filter((task) => task.dueDate)
        .map((task) => ({
          ...task,
          kind: task.dueDate < today ? "overdue" : task.dueDate === today ? "today" : null
        }))
        .filter((task) => task.kind)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      setNotifications(items);
      setNotificationsLoaded(true);
    } catch (error) {
      setNotificationError(getApiError(error));
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  function toggleMenu(name) {
    setSearchOpen(false);
    setActiveMenu((current) => current === name ? null : name);
    if (name === "notifications" && !notificationsLoaded) loadNotifications();
  }

  const overdueCount = useMemo(
    () => notifications.filter((item) => item.kind === "overdue").length,
    [notifications]
  );

  function openTaskList(task) {
    navigate(`/pending?search=${encodeURIComponent(task.title || "")}`);
    setActiveMenu(null);
  }

  return (
    <header className="topbar">
      <button type="button" className="icon-button menu-button" onClick={onMenu} aria-label="Open navigation">
        <Menu size={21} />
      </button>

      <div className="page-heading">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="topbar-actions" ref={menuRef}>
        <div className={`topbar-search-wrap ${searchOpen ? "is-open" : ""}`}>
          <button
            type="button"
            className="topbar-search-trigger"
            onClick={() => searchOpen ? setSearchOpen(false) : openSearch()}
            aria-label="Search tasks"
            aria-expanded={searchOpen}
          >
            <Search size={14} />
            <span>Search tasks</span>
            <kbd><Command size={10} /> K</kbd>
          </button>

          {searchOpen && (
            <div className="header-popover search-popover">
              <div className="header-search-input-wrap">
                <Search size={17} />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search tasks by title or description..."
                  aria-label="Search tasks by title or description"
                />
                {searchLoading ? <LoaderCircle className="header-spin" size={16} /> : (
                  <button type="button" className="header-clear-button" onClick={() => setSearch("")} aria-label="Clear search">
                    <X size={15} />
                  </button>
                )}
              </div>
              <div className="header-popover-caption">
                {search.trim() ? "MATCHING TASKS" : "QUICK TIP"}
              </div>
              {!search.trim() ? (
                <div className="header-popover-empty">Type a task name or description to search your workspace.</div>
              ) : searchError ? (
                <div className="header-popover-error">{searchError}</div>
              ) : searchLoading ? (
                <div className="header-popover-empty">Searching your tasks…</div>
              ) : searchResults.length ? (
                <div className="header-search-results" role="listbox" aria-label="Matching tasks">
                  {searchResults.map((task, index) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      className={`header-search-result ${index === activeIndex ? "active" : ""}`}
                      key={task.id}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => chooseSearchResult(task)}
                    >
                      <span className={`header-result-status ${task.completed ? "complete" : ""}`}>
                        {task.completed ? <CheckCheck size={14} /> : <ListTodo size={14} />}
                      </span>
                      <span className="header-result-copy">
                        <strong>{task.title}</strong>
                        <small>{task.description || "No description"}</small>
                      </span>
                      <span className={`header-result-priority ${String(task.priority || "").toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </button>
                  ))}
                  <button type="button" className="header-search-all" onClick={() => navigateToSearch(search)}>
                    View all matching tasks
                  </button>
                </div>
              ) : (
                <div className="header-popover-empty">No tasks found for “{search}”.</div>
              )}
              <div className="header-popover-foot">Use ↑ ↓ to navigate · Enter to open · Esc to close</div>
            </div>
          )}
        </div>

        <div className="header-menu-anchor">
          <button
            type="button"
            className="icon-button notification-button"
            onClick={() => toggleMenu("notifications")}
            aria-label="Open task notifications"
            aria-expanded={activeMenu === "notifications"}
          >
            <Bell size={19} />
            {notifications.some((item) => item.kind === "overdue" || item.kind === "today") && <i />}
          </button>
          {activeMenu === "notifications" && (
            <div className="header-popover notification-popover">
              <div className="header-popover-heading">
                <div><strong>Task reminders</strong><small>Based on your pending tasks</small></div>
                <button type="button" className="header-clear-button" onClick={loadNotifications} disabled={notificationLoading} aria-label="Refresh reminders">
                  <LoaderCircle size={15} className={notificationLoading ? "header-spin" : ""} />
                </button>
              </div>
              {notificationError ? <div className="header-popover-error">{notificationError}</div>
                : notificationLoading ? <div className="header-popover-empty">Checking your task reminders…</div>
                : notifications.length === 0 ? <div className="header-popover-empty">You're all clear. No overdue tasks or tasks due today.</div>
                : (
                  <>
                    <div className="notification-summary">
                      <span><AlertCircle size={14} /> {overdueCount} overdue</span>
                      <span><CalendarClock size={14} /> {notifications.length - overdueCount} due today</span>
                    </div>
                    <div className="notification-items">
                      {notifications.slice(0, 8).map((task) => (
                        <button type="button" className="notification-item" key={task.id} onClick={() => openTaskList(task)}>
                          <span className={`notification-item-icon ${task.kind}`}>
                            {task.kind === "overdue" ? <AlertCircle size={15} /> : <CalendarClock size={15} />}
                          </span>
                          <span><strong>{task.title}</strong><small>{task.kind === "overdue" ? "Overdue" : "Due today"} · {formatDueDate(task.dueDate)}</small></span>
                        </button>
                      ))}
                    </div>
                    {notifications.length > 8 && <div className="header-popover-foot">{notifications.length - 8} more reminders</div>}
                  </>
                )}
              <button type="button" className="header-popover-action" onClick={() => { navigate("/pending"); setActiveMenu(null); }}>
                View pending tasks
              </button>
            </div>
          )}
        </div>

        <div className="header-menu-anchor profile-anchor">
          <button
            type="button"
            className="profile profile-trigger"
            onClick={() => toggleMenu("profile")}
            aria-expanded={activeMenu === "profile"}
            aria-label="Open profile menu"
          >
            <span className="profile-avatar">{(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}</span>
            <span className="profile-copy"><b>{user?.fullName || "My profile"}</b><small>{user?.email || "Signed in"}</small></span>
            <ChevronDown size={15} />
          </button>
          {activeMenu === "profile" && (
            <div className="header-popover compact-popover profile-popover">
              <div className="profile-menu-summary">
                <span className="profile-avatar large">{(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}</span>
                <span><strong>{user?.fullName || "Taskflow user"}</strong><small>{user?.email || "Signed in"}</small></span>
              </div>
              <button type="button" className="header-menu-item" onClick={() => { navigate("/settings"); setActiveMenu(null); }}>
                <Settings size={16} /> Settings and preferences
              </button>
              <button type="button" className="header-menu-item" onClick={() => { navigate("/"); setActiveMenu(null); }}>
                <LayoutDashboard size={16} /> Workspace overview
              </button>
              <button type="button" className="header-menu-item auth-logout-item" onClick={() => { logout(); navigate("/login", { replace: true }); setActiveMenu(null); }}>
                <X size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
