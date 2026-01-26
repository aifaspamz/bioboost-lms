import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import { AuthProvider, AuthContext } from "./contexts/AuthContext";
import { ProgressProvider } from "./contexts/ProgressContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LearningHub from "./pages/LearningHub";
import LearningHubDetails from "./pages/LearningHubDetails";
import InteractiveKrebs from "./pages/InteractiveKrebs";
import Quizzes from "./pages/Quizzes.jsx"; // ✅ explicit .jsx to avoid duplicate file issues
import Progress from "./pages/Progress";
import CreateLesson from "./pages/teachers/CreateLesson";
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
              path="/learning/:lessonId"
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
                  <CreateLesson />
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

            {/* ❌ Teacher Panel route removed intentionally */}

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ProgressProvider>
    </AuthProvider>
  );
}
