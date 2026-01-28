import { useContext } from "react";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import { AuthContext } from "../contexts/AuthContext";

export default function Dashboard() {
  const { loading, username, role, teacher_verified } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container">
      <Navigation />

      <div className="card">
        <h1>Welcome to Bioboost, {username || "Student"}!</h1>

        <p className="small">
          Role: <b>{role || "student"}</b>
        </p>

        <p className="small">
          Learn the Krebs Cycle through lectures, quizzes, and an interactive krebs feature.
        </p>

        <div className="grid">
          <Link className="btn" to="/learning">Learning Hub</Link>
          <Link className="btn" to="/interactive-krebs">Interactive Krebs</Link>
          <Link className="btn" to="/quizzes">Quizzes</Link>
          <Link className="btn" to="/progress">Progress</Link>
          {role === "teacher" && teacher_verified && (
            <Link className="btn" to="/new-lesson">Create Lesson</Link>
          )}
        </div>
      </div>
    </div>
  );
}
