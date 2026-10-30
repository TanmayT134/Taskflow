import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [toasts, setToasts] = useState([]);
  const resolverRef = useRef(null);
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  const toastIdRef = useRef(0);

  const confirm = useCallback((options = {}) => {
    // Resolve any pending dialog as cancelled before opening another one.
    resolverRef.current?.(false);
    returnFocusRef.current = document.activeElement;
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({
        title: options.title || "Are you sure?",
        message: options.message || "Please confirm that you want to continue.",
        confirmLabel: options.confirmLabel || "Confirm",
        cancelLabel: options.cancelLabel || "Cancel",
        tone: options.tone || "default",
      });
    });
  }, []);

  const closeDialog = useCallback((accepted) => {
    setDialog(null);
    const resolve = resolverRef.current;
    resolverRef.current = null;
    resolve?.(accepted);
    window.requestAnimationFrame(() => returnFocusRef.current?.focus?.());
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, type = "success") => {
    const id = ++toastIdRef.current;
    setToasts((current) => [...current, { id, message, type }].slice(-4));
    return id;
  }, []);

  useEffect(() => {
    if (!dialog) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDialog(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialog, closeDialog]);

  useEffect(() => {
    if (!toasts.length) return undefined;
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 3800)
    );
    return () => timers.forEach(window.clearTimeout);
  }, [toasts, dismissToast]);

  useEffect(() => () => resolverRef.current?.(false), []);

  return (
    <FeedbackContext.Provider value={{ confirm, notify }}>
      {children}
      {dialog && (
        <div
          className="feedback-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDialog(false);
          }}
        >
          <section
            ref={dialogRef}
            className={`feedback-dialog feedback-dialog-${dialog.tone}`}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="feedback-dialog-title"
            aria-describedby="feedback-dialog-message"
          >
            <div className="feedback-dialog-icon" aria-hidden="true">
              {dialog.tone === "danger" ? <AlertTriangle size={21} /> : <Info size={21} />}
            </div>
            <h2 id="feedback-dialog-title">{dialog.title}</h2>
            <p id="feedback-dialog-message">{dialog.message}</p>
            <div className="feedback-dialog-actions">
              <button className="btn btn-quiet" onClick={() => closeDialog(false)}>
                {dialog.cancelLabel}
              </button>
              <button
                className={`btn ${dialog.tone === "danger" ? "feedback-danger-button" : "btn-primary"}`}
                onClick={() => closeDialog(true)}
                autoFocus
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      )}
      <div className="feedback-toast-stack" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div className={`feedback-toast feedback-toast-${toast.type}`} role="status" key={toast.id}>
            <span className="feedback-toast-icon" aria-hidden="true">
              {toast.type === "success" ? <CheckCircle2 size={18} /> : <Info size={18} />}
            </span>
            <span>{toast.message}</span>
            <button onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used inside FeedbackProvider.");
  }
  return context;
}
