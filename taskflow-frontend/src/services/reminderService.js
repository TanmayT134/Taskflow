import api from "./api";

export const reminderService = {
  getPreferences: () => api.get("/reminders/preferences").then((response) => response.data),
  updatePreferences: (preferences) =>
    api.put("/reminders/preferences", preferences).then((response) => response.data),
};
