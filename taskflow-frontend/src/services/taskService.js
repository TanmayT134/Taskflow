import api from "./api";
export const taskService = {
 getTasks: params => api.get("/tasks", { params }).then(r => r.data),
 getStats: () => api.get("/tasks/stats").then(r => r.data),
 createTask: payload => api.post("/tasks", payload).then(r => r.data),
 updateTask: (id, payload) => api.put(`/tasks/${id}`, payload).then(r => r.data),
 setCompleted: (id, completed) => api.patch(`/tasks/${id}/completion`, { completed }).then(r => r.data),
 deleteTask: id => api.delete(`/tasks/${id}`)
};
