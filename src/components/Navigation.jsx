import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Navigation() {
  const { user, role, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ IMPORTANT: Don't show nav when logged out (fixes your blue menu screen on /login)
  if (!user) return null;

  const close = () => setOpen(false);

  const onLogout = () => {
    close();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="brand" onClick={() => navigate("/dashboard")} role="button" tabIndex={0}>
          Bioboost
        </div>

        <button className="hamburger" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          ☰
        </button>
      </div>

      {open && (
        <div className="nav-menu">
          <Link to="/dashboard" onClick={close}>Home Dashboard</Link>
          <Link to="/learning" onClick={close}>Learning Hub</Link>
          <Link to="/interactive-krebs" onClick={close}>Interactive Krebs</Link>
          <Link to="/quizzes" onClick={close}>Quizzes</Link>
          <Link to="/progress" onClick={close}>Progress</Link>

          {role === "teacher" && (
            <Link to="/teacher" onClick={close}>Teacher Panel</Link>
          )}

          <div className="nav-meta">
            <div className="small">
              Logged in as <b>{user.username}</b> ({role})
            </div>
            <button className="btn" onClick={onLogout}>Logout</button>
          </div>
        </div>
      )}
    </header>
  );
}
