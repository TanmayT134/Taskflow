import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { CheckCheck, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getApiError } from "../services/api";

export default function AuthPage({ mode = "login" }) {
  const isRegister = mode === "register";
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isRegister) {
        const result = await register({ fullName: fullName.trim(), email: email.trim(), password });
        setSuccess(result?.message || "Account created successfully. Please sign in.");
        navigate("/login", { replace: true, state: { registered: true, email: email.trim() } });
      } else {
        await login({ email: email.trim(), password });
        const destination = location.state?.from?.pathname || "/";
        navigate(destination, { replace: true });
      }
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card" aria-labelledby="auth-title">
        <Link to="/login" className="auth-brand" aria-label="Taskflow home">
          <span className="auth-brand-mark"><CheckCheck size={22} /></span>
          <span>Taskflow</span>
        </Link>
        <div className="auth-heading">
          <span className="auth-eyebrow">YOUR PERSONAL WORKSPACE</span>
          <h1 id="auth-title">{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p>{isRegister ? "A clearer way to plan, focus, and make progress." : "Sign in to pick up where you left off."}</p>
        </div>

        {location.state?.registered && !isRegister && (
          <div className="auth-success" role="status">Account created. You can sign in now.</div>
        )}
        {success && <div className="auth-success" role="status">{success}</div>}
        {error && <div className="auth-error" role="alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <label className="auth-field">
              <span>Full name</span>
              <span className="auth-input-wrap"><UserRound size={17} /><input autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" required maxLength={100} /></span>
            </label>
          )}
          <label className="auth-field">
            <span>Email address</span>
            <span className="auth-input-wrap"><Mail size={17} /><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></span>
          </label>
          <label className="auth-field">
            <span>Password</span>
            <span className="auth-input-wrap"><LockKeyhole size={17} /><input type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isRegister ? "Create a password" : "Enter your password"} required minLength={isRegister ? 8 : 1} /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
          </label>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? (isRegister ? "Creating account…" : "Signing in…") : (isRegister ? "Create account" : "Sign in")}
          </button>
        </form>
        <p className="auth-switch">{isRegister ? "Already have an account?" : "New to Taskflow?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
        <p className="auth-footnote">Your tasks stay private to your account.</p>
      </section>
    </main>
  );
}
