import { useContext } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { AuthContext } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, role } = useContext(AuthContext);

  return (
    <div className="container">
      <Navigation />

      <div className="card">
        <h1>Welcome to Bioboost, {user?.username || "Student"}!</h1>
        <p className="small">
          Role: <b>{role}</b>
        </p>
        <p className="small">Learn the Krebs Cycle through lectures, quizzes, and a mini game.</p>

        <div className="grid">
          <Link className="btn" to="/learning">Learning Hub</Link>
          <Link className="btn" to="/game">Game</Link>
          <Link className="btn" to="/quizzes">Quizzes</Link>
          <Link className="btn" to="/progress">Progress</Link>

          {role === "teacher" && <Link className="btn" to="/teacher">Teacher Panel</Link>}
        </div>
      </div>
    </div>
  );
}
