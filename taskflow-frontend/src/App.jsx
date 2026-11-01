import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import TasksPage from "./pages/TasksPage";
import CalendarPage from "./pages/CalendarPage";
import SettingsPage from "./pages/SettingsPage";
import Placeholder from "./pages/Placeholder";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/pending" element={<TasksPage mode="pending" />} />
          <Route path="/completed" element={<TasksPage mode="completed" />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Placeholder title="Page not found" />} />
        </Route>
      </Route>
    </Routes>
  );
}
