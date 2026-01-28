import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { ProgressProvider } from "./contexts/ProgressContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LearningHub from "./pages/LearningHub";
import LearningHubDetails from "./pages/LearningHubDetails";
import InteractiveKrebs from "./pages/InteractiveKrebs";
import Quizzes from "./pages/Quizzes.jsx";
import Progress from "./pages/Progress";
import LessonEditor from "./pages/teachers/LessonEditor.jsx";
import "./styles/quiz-modal.css";


function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/learning"
              element={
                <ProtectedRoute>
                  <LearningHub />
                </ProtectedRoute>
              }
            />

            <Route
              path="/learning/:id"
              element={
                <ProtectedRoute>
                  <LearningHubDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/new-lesson"
              element={
                <ProtectedRoute>
                  <LessonEditor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/edit-lesson/:id"
              element={
                <ProtectedRoute>
                  <LessonEditor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/interactive-krebs"
              element={
                <ProtectedRoute>
                  <InteractiveKrebs />
                </ProtectedRoute>
              }
            />

            <Route
              path="/quizzes"
              element={
                <ProtectedRoute>
                  <Quizzes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ProgressProvider>
    </AuthProvider>
  );
}
