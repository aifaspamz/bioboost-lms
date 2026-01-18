import Navigation from "../components/Navigation";

export default function TeacherPanel() {
  return (
    <div className="container">
      <Navigation />
      <div className="card">
        <h1>Teacher Panel</h1>
        <p className="small">
          Here teachers can add lessons and create quizzes (UI first, backend later).
        </p>
      </div>
    </div>
  );
}
