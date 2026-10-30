import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1", headers: { "Content-Type": "application/json" }, timeout: 15000 });
export function getApiError(error) { return error?.response?.data?.message || error?.response?.data?.error || error?.message || "Something went wrong. Please try again."; }
export default api;
