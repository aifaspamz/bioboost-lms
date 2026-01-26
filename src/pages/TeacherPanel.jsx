import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

export default function TeacherPanel() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <Navigation />
      <div className="card">
        <h1>Teacher Panel</h1>
        <p className="small">
          Manage lessons and create quizzes for your students.
        </p>
      </div>

      <div className="card teacher-menu">
        <button onClick={() => navigate("/create-lesson")} className="btn btn-large">
          📚 Create Lesson
        </button>
        <button onClick={() => navigate("/quiz-management")} className="btn btn-large">
          ❓ Manage Quizzes
        </button>
      </div>
    </div>
  );
}
