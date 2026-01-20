import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Login() {
  const { register, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("student");

  const goAfterLogin = (role) => {
    // if (role === "teacher") navigate("/teacher");
    navigate("/dashboard");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    const res = await login({ email: email.trim(), password });
    if (!res.ok) {
      setError(res.message || "Login failed.");
      return;
    }

    const user = res.data?.user;
    const role = user?.user_metadata?.role || "student";
    goAfterLogin(role);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError("Please fill out username, email, and password.");
      return;
    }

    const res = await register({
      username: regUsername.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: regRole,
    });

    if (!res.ok) {
      setError(res.message || "Registration failed.");
      return;
    }

    // Supabase may require email confirmation depending on your settings.
    setInfo(
      "Account created! If email confirmations are ON in Supabase, please check your email. Otherwise, you can log in now."
    );

    // Move to login mode + prefill
    setMode("login");
    setEmail(regEmail.trim());
    setPassword(regPassword);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {/* Logo */}
        <div className="logo-header">
          {/* put logo.png inside /public */}
          <img src="/logo.png" alt="BioBoost Logo" className="bioboost-logo" />
        </div>

        <h1 style={{ marginTop: 6 }}>
          {mode === "login" ? "Welcome Back" : "Be One of Us!"}
        </h1>

        <p className="small" style={{ marginTop: 6 }}>
          {mode === "login"
            ? "Log in to continue learning the Krebs Cycle through lessons, quizzes, and games."
            : "Create your BioBoost account (Student or Teacher) to access the platform."}
        </p>

        {error ? <div className="error" style={{ marginTop: 12 }}>{error}</div> : null}
        {info ? <div className="success" style={{ marginTop: 12 }}>{info}</div> : null}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="stack" style={{ marginTop: 14 }}>
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <button className="btn" type="submit">
              Login
            </button>

            <div className="auth-footer">
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setInfo("");
                }}
              >
                Don’t have an account? Create one
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="stack" style={{ marginTop: 14 }}>
            <input
              placeholder="Username"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              autoComplete="username"
            />

            <input
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              autoComplete="email"
            />

            <input
              placeholder="Password"
              type="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              autoComplete="new-password"
            />

            <select value={regRole} onChange={(e) => setRegRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>

            <button className="btn" type="submit">
              Create Account
            </button>

            <div className="auth-footer">
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setInfo("");
                }}
              >
                Already have an account? Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
