
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "taskflow.preferences.v1";

const DEFAULTS = {
  theme: "light",
  accent: "blue",
  defaultPriority: "MEDIUM",
  sortBy: "createdAt",
  sortDirection: "DESC",
};

function readPreferences() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    return { ...DEFAULTS, ...saved };
  } catch {
    return DEFAULTS;
  }
}

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(readPreferences);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(preferences)
    );

    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.accent = preferences.accent;

    const accents = {
      blue: "#5368e8",
      violet: "#805ad5",
      teal: "#159b91",
      rose: "#df6687",
    };

    document.documentElement.style.setProperty(
      "--taskflow-accent",
      accents[preferences.accent] || accents.blue
    );
  }, [preferences]);

  const value = useMemo(
    () => ({
      preferences,
      setPreferences,
    }),
    [preferences]
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error(
      "usePreferences must be used inside PreferencesProvider"
    );
  }

  return context;
}
