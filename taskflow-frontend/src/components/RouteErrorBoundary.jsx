import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Keep diagnostic details in the browser console without exposing them to users.
    console.error("Taskflow page rendering error:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="route-error-state" role="alert">
          <span className="route-error-icon"><AlertTriangle size={22} /></span>
          <p className="eyebrow">PAGE ERROR</p>
          <h2>This page couldn't be displayed</h2>
          <p>Your account and saved tasks are unaffected. Try rendering the page again.</p>
          <button type="button" className="btn btn-primary" onClick={this.handleRetry}>
            <RefreshCw size={15} /> Try again
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
