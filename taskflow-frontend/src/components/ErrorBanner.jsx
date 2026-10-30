import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";

export default function ErrorBanner({ message, onRetry, retrying = false, compact = false }) {
  if (!message) return null;
  const offline = /connect|network|connection/i.test(message);

  return (
    <div className={`taskflow-error-banner${compact ? " taskflow-error-banner-compact" : ""}`} role="alert">
      <span className="taskflow-error-icon" aria-hidden="true">
        {offline ? <WifiOff size={18} /> : <AlertCircle size={18} />}
      </span>
      <div className="taskflow-error-copy">
        <strong>{offline ? "Connection problem" : "Something went wrong"}</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button type="button" className="taskflow-error-retry" onClick={onRetry} disabled={retrying}>
          <RefreshCw size={15} className={retrying ? "taskflow-retry-spinning" : ""} />
          {retrying ? "Retrying…" : "Try again"}
        </button>
      )}
    </div>
  );
}
