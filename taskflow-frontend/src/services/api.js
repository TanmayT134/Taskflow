import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});


// Attach the current session token to every protected API request.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("taskflow.accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// A rejected protected request invalidates the local session.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthRequest = url.includes("/auth/login") || url.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthRequest) {
      sessionStorage.removeItem("taskflow.accessToken");
      sessionStorage.removeItem("taskflow.user");
      window.dispatchEvent(new Event("taskflow:unauthorized"));
    }
    return Promise.reject(error);
  }
);

function cleanMessage(value) {
  if (typeof value !== "string") return "";
  const message = value.trim();
  // Avoid showing implementation details or empty backend messages to users.
  if (!message || message.length > 500) return "";
  return message;
}

function validationMessage(data) {
  if (!data || typeof data !== "object") return "";
  const errors = data.validationErrors || data.errors || data.fieldErrors;
  if (Array.isArray(errors)) {
    const messages = errors
      .map((item) => cleanMessage(item?.defaultMessage || item?.message || item?.error))
      .filter(Boolean);
    if (messages.length) return messages.join(" ");
  }
  if (errors && typeof errors === "object") {
    const messages = Object.entries(errors)
      .map(([field, message]) => {
        const detail = cleanMessage(typeof message === "string" ? message : message?.message);
        return detail ? `${field}: ${detail}` : "";
      })
      .filter(Boolean);
    if (messages.length) return messages.join(" ");
  }
  return "";
}

export function getApiError(error) {
  if (axios.isCancel(error) || error?.code === "ERR_CANCELED") {
    return "This request was cancelled. Please try again.";
  }

  if (!error?.response) {
    if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
      return "The server is taking too long to respond. Check your connection and try again.";
    }
    if (error?.request || error?.code === "ERR_NETWORK") {
      return "Unable to connect to Taskflow. Check that the backend is running and your device is connected to the network.";
    }
    return cleanMessage(error?.message) || "Something went wrong. Please try again.";
  }

  const { status, data } = error.response;
  const validation = validationMessage(data);
  const backendMessage = cleanMessage(data?.message) || cleanMessage(data?.detail);

  if (status === 400 || status === 422) {
    return validation || backendMessage || "Some information is invalid. Review the fields and try again.";
  }
  if (status === 401) return "Your session is not authorized. Please sign in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return backendMessage || "The requested task or resource could not be found. Refresh and try again.";
  if (status === 409) return backendMessage || "This change conflicts with the latest data. Refresh and try again.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status >= 500) return "Taskflow's server encountered a problem. Your data has not been confirmed as saved; please try again shortly.";

  return backendMessage || "The request could not be completed. Please try again.";
}

export function getFieldErrors(error) {
  const data = error?.response?.data;
  const errors = data?.validationErrors || data?.errors || data?.fieldErrors;
  if (!errors) return {};
  if (Array.isArray(errors)) {
    return errors.reduce((result, item) => {
      const field = item?.field || item?.propertyPath;
      const message = cleanMessage(item?.defaultMessage || item?.message);
      if (field && message) result[field] = message;
      return result;
    }, {});
  }
  if (typeof errors === "object") {
    return Object.entries(errors).reduce((result, [field, value]) => {
      const message = cleanMessage(typeof value === "string" ? value : value?.message);
      if (message) result[field] = message;
      return result;
    }, {});
  }
  return {};
}

export default api;
