import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

export default function Navigation() {
  const { user, role, username, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const close = () => setOpen(false);

  const onLogout = async () => {
    close();
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <div
          className="brand"
          onClick={() => navigate("/dashboard")}
          role="button"
          tabIndex={0}
        >
          BioBoost
        </div>

        <button
          className="hamburger"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="nav-menu">
          <Link to="/dashboard" onClick={close}>
            Home Dashboard
          </Link>
          <Link to="/learning" onClick={close}>
            Learning Hub
          </Link>
          <Link to="/interactive-krebs" onClick={close}>
            Interactive Krebs
          </Link>
          <Link to="/quizzes" onClick={close}>
            Quizzes
          </Link>
          <Link to="/progress" onClick={close}>
            Progress
          </Link>

          <div className="nav-meta">
            <div className="small" style={{ marginTop: 8 }}>
              Logged in as <b>{username || user?.email || "Unknown"}</b> (
              <b>{role || "no-role"}</b>)
            </div>

            <button className="btn" onClick={onLogout} style={{ marginTop: 10 }}>
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
