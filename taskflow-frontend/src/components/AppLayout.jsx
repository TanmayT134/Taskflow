import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import RouteErrorBoundary from "./RouteErrorBoundary";
import { PreferencesProvider } from "../context/PreferencesContext";
import { FeedbackProvider } from "../context/FeedbackContext";

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <PreferencesProvider>
      <FeedbackProvider>
        <div className="app-shell">
          <Sidebar open={open} onClose={() => setOpen(false)} />
          <div className="main-area">
            <a className="skip-to-content" href="#main-content">Skip to main content</a>
            <Header onMenu={() => setOpen(true)} />
            <main className="page-content" id="main-content" tabIndex="-1">
              <RouteErrorBoundary>
                <Outlet />
              </RouteErrorBoundary>
            </main>
            <footer className="app-footer">
              <span>© {new Date().getFullYear()} Taskflow</span>
              <span>Designed for focus. Built for progress.</span>
            </footer>
          </div>
        </div>
      </FeedbackProvider>
    </PreferencesProvider>
  );
}
