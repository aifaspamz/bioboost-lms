import { useContext, useEffect, useMemo, useState } from "react";
import Navigation from "../components/Navigation";
import { AuthContext } from "../contexts/AuthContext";
import { ProgressContext } from "../contexts/ProgressContext";
import { supabase } from "../supabaseClient";

const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 5 * 60; // 5 minutes

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function Quizzes() {
  const { user, role } = useContext(AuthContext);
  const { updateProgress } = useContext(ProgressContext);

  // Quiz list state
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Quiz taking state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Attempt tracking (student)
  const [attempts, setAttempts] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Teacher: create quiz
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuizData, setNewQuizData] = useState({
    title: "",
    description: "",
    passing_score: 7,
  });

  // Teacher: edit quiz
  const [showEditQuizForm, setShowEditQuizForm] = useState(false);
  const [editQuizData, setEditQuizData] = useState({
    id: null,
    title: "",
    description: "",
    passing_score: 7,
  });

  // Teacher: add question
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "mcq",
    options: ["", "", "", ""],
    answer: "",
    explanation: "",
  });

  // Teacher: edit question
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editQuestion, setEditQuestion] = useState({
    question: "",
    type: "mcq",
    options: ["", "", "", ""],
    answer: "",
    explanation: "",
  });

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  // Load quizzes
  useEffect(() => {
    if (!user?.id) return;
    loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, role]);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      if (role === "teacher") {
        const { data, error } = await supabase
          .from("quizzes")
          .select("*")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setQuizzes(data || []);
      } else {
        const { data, error } = await supabase
          .from("quizzes")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setQuizzes(data || []);
      }
    } catch (error) {
      console.error("Error loading quizzes:", error);
    }
    setLoading(false);
  };

  // Student: compute attempts + cooldown from DB
  const fetchAttemptsAndCooldown = async (quizId) => {
    if (role !== "student") return { attemptCount: 0, remaining: 0 };

    const { data: responses, error } = await supabase
      .from("quiz_responses")
      .select("submitted_at")
      .eq("quiz_id", quizId)
      .eq("student_id", user.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error loading attempts:", error);
      return { attemptCount: 0, remaining: 0 };
    }

    const attemptCount = responses?.length || 0;

    let remaining = 0;
    if (attemptCount >= MAX_ATTEMPTS && responses && responses.length > 0) {
      const lastTime = new Date(responses[0].submitted_at).getTime();
      const now = Date.now();
      const diffSeconds = Math.floor((now - lastTime) / 1000);
      remaining = COOLDOWN_SECONDS - diffSeconds;
      if (remaining < 0) remaining = 0;
    }

    setAttempts(attemptCount);
    setCooldownTime(remaining);

    return { attemptCount, remaining };
  };

  const loadQuizWithQuestions = async (quizId) => {
    try {
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (quizError) throw quizError;

      const { data: questions, error: qError } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizId)
        .order("order", { ascending: true });

      if (qError) throw qError;

      // Student: enforce attempts/cooldown BEFORE starting
      if (role === "student") {
        const { attemptCount, remaining } = await fetchAttemptsAndCooldown(quizId);
        if (attemptCount >= MAX_ATTEMPTS && remaining > 0) {
          alert(
            `You already used ${MAX_ATTEMPTS} attempts.\nPlease wait ${Math.floor(
              remaining / 60
            )}:${String(remaining % 60).padStart(2, "0")} before trying again.`
          );
          return;
        }
      }

      // Randomize questions on load (student)
      const shuffled = shuffleArray(questions || []);

      setSelectedQuiz({ ...quiz, questions: shuffled || [] });
      setAnswers({});
      setSubmitted(false);
      setCurrentQuestionIndex(0);
      setScore(0);

      // Teacher edit data preload
      if (role === "teacher") {
        setEditQuizData({
          id: quiz.id,
          title: quiz.title || "",
          description: quiz.description || "",
          passing_score: quiz.passing_score ?? 7,
        });
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
    }
  };

  // ---------- TEACHER CRUD (QUIZ) ----------
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("quizzes").insert([
        {
          teacher_id: user.id,
          title: newQuizData.title,
          description: newQuizData.description,
          passing_score: newQuizData.passing_score,
          is_published: false,
        },
      ]);

      if (error) throw error;

      setNewQuizData({ title: "", description: "", passing_score: 7 });
      setShowCreateForm(false);
      loadQuizzes();
    } catch (error) {
      alert("Error creating quiz: " + error.message);
    }
  };

  const openEditQuiz = () => {
    if (!selectedQuiz) return;
    setEditQuizData({
      id: selectedQuiz.id,
      title: selectedQuiz.title || "",
      description: selectedQuiz.description || "",
      passing_score: selectedQuiz.passing_score ?? 7,
    });
    setShowEditQuizForm(true);
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({
          title: editQuizData.title,
          description: editQuizData.description,
          passing_score: Number(editQuizData.passing_score) || 1,
        })
        .eq("id", editQuizData.id);

      if (error) throw error;

      // Refresh selected quiz and list
      await loadQuizWithQuestions(editQuizData.id);
      await loadQuizzes();
      setShowEditQuizForm(false);
    } catch (error) {
      alert("Error updating quiz: " + error.message);
    }
  };

  const handlePublishQuiz = async (quizId, isPublished) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .update({ is_published: !isPublished })
        .eq("id", quizId);

      if (error) throw error;
      loadQuizzes();

      if (selectedQuiz?.id === quizId) {
        setSelectedQuiz((prev) => ({ ...prev, is_published: !isPublished }));
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Delete this quiz? This will remove its questions too.")) return;
    try {
      await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
      const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
      if (error) throw error;

      setSelectedQuiz(null);
      loadQuizzes();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // ---------- TEACHER CRUD (QUESTIONS) ----------
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        quiz_id: selectedQuiz.id,
        question: newQuestion.question,
        type: newQuestion.type,
        options: newQuestion.type === "mcq" ? newQuestion.options : null,
        answer: newQuestion.answer,
        explanation: newQuestion.explanation,
        order: (selectedQuiz.questions?.length || 0) + 1,
      };

      const { error } = await supabase.from("quiz_questions").insert([payload]);
      if (error) throw error;

      await loadQuizWithQuestions(selectedQuiz.id);

      setNewQuestion({
        question: "",
        type: "mcq",
        options: ["", "", "", ""],
        answer: "",
        explanation: "",
      });
      setShowAddQuestion(false);
    } catch (error) {
      alert("Error adding question: " + error.message);
    }
  };

  const startEditQuestion = (q) => {
    setEditingQuestionId(q.id);
    setEditQuestion({
      question: q.question || "",
      type: q.type || "mcq",
      options: Array.isArray(q.options) && q.options.length ? q.options : ["", "", "", ""],
      answer: q.answer || "",
      explanation: q.explanation || "",
    });
  };

  const cancelEditQuestion = () => {
    setEditingQuestionId(null);
    setEditQuestion({
      question: "",
      type: "mcq",
      options: ["", "", "", ""],
      answer: "",
      explanation: "",
    });
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      const updates = {
        question: editQuestion.question,
        type: editQuestion.type,
        options: editQuestion.type === "mcq" ? editQuestion.options : null,
        answer: editQuestion.answer,
        explanation: editQuestion.explanation,
      };

      const { error } = await supabase
        .from("quiz_questions")
        .update(updates)
        .eq("id", editingQuestionId);

      if (error) throw error;

      await loadQuizWithQuestions(selectedQuiz.id);
      cancelEditQuestion();
    } catch (error) {
      alert("Error updating question: " + error.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);
      if (error) throw error;

      await loadQuizWithQuestions(selectedQuiz.id);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // ---------- STUDENT FLOW ----------
  const handleAnswerChange = (answer) => {
    const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  // ✅ FIXED NAME (this matches your JSX calls)
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    const { attemptCount, remaining } = await fetchAttemptsAndCooldown(selectedQuiz.id);
    if (attemptCount >= MAX_ATTEMPTS && remaining > 0) {
      alert(
        `You already used ${MAX_ATTEMPTS} attempts.\nPlease wait ${Math.floor(
          remaining / 60
        )}:${String(remaining % 60).padStart(2, "0")} before submitting again.`
      );
      return;
    }

    let correct = 0;
    selectedQuiz.questions.forEach((q) => {
      if (answers[q.id] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    const passed = correct >= selectedQuiz.passing_score;
    if (passed) updateProgress("quizzes", 1);

    try {
      const { error } = await supabase.from("quiz_responses").insert([
        {
          quiz_id: selectedQuiz.id,
          student_id: user.id,
          answers,
          score: correct,
          passed,
        },
      ]);
      if (error) throw error;

      await fetchAttemptsAndCooldown(selectedQuiz.id);
    } catch (error) {
      console.error("Error saving response:", error);
    }
  };

  const handleRetakeQuiz = async () => {
    const { attemptCount, remaining } = await fetchAttemptsAndCooldown(selectedQuiz.id);

    if (attemptCount >= MAX_ATTEMPTS && remaining > 0) {
      alert(`You must wait ${remaining} seconds before retaking this quiz.`);
      return;
    }

    setAnswers({});
    setSubmitted(false);
    setCurrentQuestionIndex(0);
    setScore(0);

    const reshuffled = shuffleArray(selectedQuiz.questions || []);
    setSelectedQuiz({ ...selectedQuiz, questions: reshuffled });
  };

  const cooldownLabel = useMemo(() => {
    const mm = Math.floor(cooldownTime / 60);
    const ss = String(cooldownTime % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [cooldownTime]);

  // -------------------------
  // LOADING
  // -------------------------
  if (loading) {
    return (
      <div className="container">
        <Navigation />
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // =========================
  // TEACHER VIEW
  // =========================
  if (role === "teacher") {
    // =========================
    // TEACHER: SELECTED QUIZ
    // =========================
    if (selectedQuiz) {
      const qCount = selectedQuiz.questions?.length || 0;
    
      return (
        <div className="container">
          <Navigation />
    
          {/* QUIZ INFO */}
          <div className="card">
            <button onClick={() => setSelectedQuiz(null)} className="btn">
              ← Back
            </button>
    
            <h1>{selectedQuiz.title}</h1>
            <p>{selectedQuiz.description}</p>
            <p className="small">
              Status: {selectedQuiz.is_published ? "📌 Published" : "🔒 Draft"} • Questions: {qCount} •
              Passing Score: {selectedQuiz.passing_score}
            </p>
          </div>
    
          {/* ACTION BUTTONS */}
          <div className="card" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => handlePublishQuiz(selectedQuiz.id, selectedQuiz.is_published)}
              className="btn"
            >
              {selectedQuiz.is_published ? "Unpublish" : "Publish"}
            </button>
    
            <button onClick={openEditQuiz} className="btn" style={{ background: "#0ea5e9" }}>
              Edit Quiz Info
            </button>
    
            <button
              onClick={() => handleDeleteQuiz(selectedQuiz.id)}
              className="btn"
              style={{ background: "#dc3545" }}
            >
              Delete Quiz
            </button>
          </div>
    
          {/* ✅ EDIT QUIZ INFO FORM */}
          {showEditQuizForm && (
            <div className="card">
              <h2>Edit Quiz</h2>
    
              <form onSubmit={handleUpdateQuiz}>
                <div style={{ marginBottom: "1rem" }}>
                  <label>Title</label>
                  <input
                    type="text"
                    value={editQuizData.title}
                    onChange={(e) => setEditQuizData({ ...editQuizData, title: e.target.value })}
                    required
                  />
                </div>
    
                <div style={{ marginBottom: "1rem" }}>
                  <label>Description</label>
                  <textarea
                    value={editQuizData.description}
                    onChange={(e) =>
                      setEditQuizData({ ...editQuizData, description: e.target.value })
                    }
                  />
                </div>
    
                <div style={{ marginBottom: "1rem" }}>
                  <label>Passing Score</label>
                  <input
                    type="number"
                    min="1"
                    value={editQuizData.passing_score}
                    onChange={(e) =>
                      setEditQuizData({
                        ...editQuizData,
                        passing_score: parseInt(e.target.value || "1", 10),
                      })
                    }
                  />
                </div>
    
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button type="submit" className="btn">
                    Save Changes
                  </button>
    
                  <button
                    type="button"
                    onClick={() => setShowEditQuizForm(false)}
                    className="btn"
                    style={{ background: "#6c757d" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
    
          {/* =========================
              ✅ QUESTIONS (ADD / EDIT / DELETE)
             ========================= */}
          <h2 style={{ marginTop: "1rem" }}>Questions ({qCount})</h2>
    
          {/* ADD QUESTION */}
          {showAddQuestion ? (
            <div className="card">
              <h2>Add Question</h2>
    
              <form onSubmit={handleAddQuestion}>
                <div style={{ marginBottom: "1rem" }}>
                  <label>Question</label>
                  <input
                    type="text"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    required
                  />
                </div>
    
                <div style={{ marginBottom: "1rem" }}>
                  <label>Type</label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        type: e.target.value,
                        answer: "",
                        options: ["", "", "", ""],
                      })
                    }
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="tf">True/False</option>
                  </select>
                </div>
    
                {newQuestion.type === "mcq" ? (
                  <>
                    <div style={{ marginBottom: "1rem" }}>
                      <label>Options</label>
                      {newQuestion.options.map((opt, idx) => (
                        <input
                          key={idx}
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const opts = [...newQuestion.options];
                            opts[idx] = e.target.value;
                            setNewQuestion({ ...newQuestion, options: opts });
                          }}
                          style={{ marginBottom: "0.5rem" }}
                          required
                        />
                      ))}
                    </div>
    
                    <div style={{ marginBottom: "1rem" }}>
                      <label>Correct Answer</label>
                      <select
                        value={newQuestion.answer}
                        onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                        required
                      >
                        <option value="">Select</option>
                        {newQuestion.options
                          .filter((o) => o.trim().length > 0)
                          .map((opt, idx) => (
                            <option key={idx} value={opt}>
                              {opt}
                            </option>
                          ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div style={{ marginBottom: "1rem" }}>
                    <label>Answer</label>
                    <select
                      value={newQuestion.answer}
                      onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                      required
                    >
                      <option value="">Select</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  </div>
                )}
    
                <div style={{ marginBottom: "1rem" }}>
                  <label>Explanation (optional)</label>
                  <textarea
                    value={newQuestion.explanation}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, explanation: e.target.value })
                    }
                  />
                </div>
    
                <button type="submit" className="btn">
                  Add Question
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddQuestion(false)}
                  className="btn"
                  style={{ background: "#6c757d" }}
                >
                  Cancel
                </button>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setShowAddQuestion(true)}
              className="btn"
              style={{ background: "#28a745" }}
            >
              + Add Question
            </button>
          )}
    
          {/* QUESTIONS LIST */}
          {qCount === 0 ? (
            <div className="card">
              <p>No questions yet.</p>
            </div>
          ) : (
            selectedQuiz.questions.map((q, idx) => {
              const isEditing = editingQuestionId === q.id;
    
              return (
                <div key={q.id} className="card" style={{ borderLeft: "4px solid #0ea5e9" }}>
                  <h4>
                    Q{idx + 1}. {q.question}
                  </h4>
                  <p className="small">Type: {String(q.type || "").toUpperCase()}</p>
    
                  {!isEditing ? (
                    <>
                      {Array.isArray(q.options) && q.options.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          {q.options.map((opt, optIdx) => (
                            <p key={optIdx} className="small">
                              {opt} {opt === q.answer ? "✓" : ""}
                            </p>
                          ))}
                        </div>
                      )}
    
                      {q.type === "tf" && (
                        <p className="small">
                          Answer: {q.answer === "true" ? "True" : "False"}
                        </p>
                      )}
    
                      {q.explanation && <p className="small">Explanation: {q.explanation}</p>}
    
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                          marginTop: "0.75rem",
                        }}
                      >
                        <button
                          onClick={() => startEditQuestion(q)}
                          className="btn"
                          style={{ background: "#0ea5e9" }}
                        >
                          Edit Question
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="btn"
                          style={{ background: "#dc3545" }}
                        >
                          Delete Question
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleUpdateQuestion} style={{ marginTop: "0.75rem" }}>
                      <div style={{ marginBottom: "0.75rem" }}>
                        <label>Question</label>
                        <input
                          type="text"
                          value={editQuestion.question}
                          onChange={(e) =>
                            setEditQuestion({ ...editQuestion, question: e.target.value })
                          }
                          required
                        />
                      </div>
    
                      <div style={{ marginBottom: "0.75rem" }}>
                        <label>Type</label>
                        <select
                          value={editQuestion.type}
                          onChange={(e) =>
                            setEditQuestion({
                              ...editQuestion,
                              type: e.target.value,
                              answer: "",
                              options: ["", "", "", ""],
                            })
                          }
                        >
                          <option value="mcq">Multiple Choice</option>
                          <option value="tf">True/False</option>
                        </select>
                      </div>
    
                      {editQuestion.type === "mcq" ? (
                        <>
                          <div style={{ marginBottom: "0.75rem" }}>
                            <label>Options</label>
                            {editQuestion.options.map((opt, optIdx) => (
                              <input
                                key={optIdx}
                                type="text"
                                value={opt}
                                placeholder={`Option ${optIdx + 1}`}
                                onChange={(e) => {
                                  const opts = [...editQuestion.options];
                                  opts[optIdx] = e.target.value;
                                  setEditQuestion({ ...editQuestion, options: opts });
                                }}
                                style={{ marginBottom: "0.5rem" }}
                                required
                              />
                            ))}
                          </div>
    
                          <div style={{ marginBottom: "0.75rem" }}>
                            <label>Correct Answer</label>
                            <select
                              value={editQuestion.answer}
                              onChange={(e) =>
                                setEditQuestion({ ...editQuestion, answer: e.target.value })
                              }
                              required
                            >
                              <option value="">Select</option>
                              {editQuestion.options
                                .filter((o) => o.trim().length > 0)
                                .map((opt, i) => (
                                  <option key={i} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </>
                      ) : (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <label>Answer</label>
                          <select
                            value={editQuestion.answer}
                            onChange={(e) =>
                              setEditQuestion({ ...editQuestion, answer: e.target.value })
                            }
                            required
                          >
                            <option value="">Select</option>
                            <option value="true">True</option>
                            <option value="false">False</option>
                          </select>
                        </div>
                      )}
    
                      <div style={{ marginBottom: "0.75rem" }}>
                        <label>Explanation (optional)</label>
                        <textarea
                          value={editQuestion.explanation}
                          onChange={(e) =>
                            setEditQuestion({ ...editQuestion, explanation: e.target.value })
                          }
                        />
                      </div>
    
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button type="submit" className="btn">
                          Save Question
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditQuestion}
                          className="btn"
                          style={{ background: "#6c757d" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })
          )}
        </div>
      );
    }
    
  
    // =========================
    // TEACHER: QUIZ LIST
    // =========================
    return (
      <div className="container">
        <Navigation />
  
        <div className="card">
          <h1>Manage Quizzes</h1>
  
          <p className="small" style={{ marginTop: 6 }}>
            🧑‍🏫 Teacher Mode: You can create and manage content here.
          </p>
  
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn">
            {showCreateForm ? "Cancel" : "+ Create Quiz"}
          </button>
        </div>
  
        {showCreateForm && (
          <div className="card">
            <h2>Create New Quiz</h2>
  
            <form onSubmit={handleCreateQuiz}>
              <div style={{ marginBottom: "1rem" }}>
                <label>Title</label>
                <input
                  type="text"
                  value={newQuizData.title}
                  onChange={(e) =>
                    setNewQuizData({ ...newQuizData, title: e.target.value })
                  }
                  required
                />
              </div>
  
              <div style={{ marginBottom: "1rem" }}>
                <label>Description</label>
                <textarea
                  value={newQuizData.description}
                  onChange={(e) =>
                    setNewQuizData({
                      ...newQuizData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
  
              <div style={{ marginBottom: "1rem" }}>
                <label>Passing Score</label>
                <input
                  type="number"
                  min="1"
                  value={newQuizData.passing_score}
                  onChange={(e) =>
                    setNewQuizData({
                      ...newQuizData,
                      passing_score: parseInt(e.target.value || "1", 10),
                    })
                  }
                />
              </div>
  
              <button type="submit" className="btn">
                Create
              </button>
            </form>
          </div>
        )}
  
        <h2>Your Quizzes</h2>
  
        {quizzes.length === 0 ? (
          <div className="card">
            <p>No quizzes yet.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.id} className="card">
              <h3>{quiz.title}</h3>
              <p className="small">{quiz.description}</p>
              <p className="small">
                {quiz.is_published ? "📌 Published" : "🔒 Draft"} • Passing:{" "}
                {quiz.passing_score}
              </p>
  
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button onClick={() => loadQuizWithQuestions(quiz.id)} className="btn">
                  Open
                </button>
  
                <button
                  onClick={() => handlePublishQuiz(quiz.id, quiz.is_published)}
                  className="btn"
                >
                  {quiz.is_published ? "Unpublish" : "Publish"}
                </button>
  
                <button
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  className="btn"
                  style={{ background: "#dc3545" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }
  
  // =========================
  // STUDENT VIEW - RESULTS (POP-UP)
  // =========================
  if (selectedQuiz && submitted) {
    return (
      <div className="container">
        <Navigation />

        <div className="modal-overlay" onClick={() => {}}>
          <div className="quiz-popup" onClick={(e) => e.stopPropagation()}>
            <div className="quiz-popup__header">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <h1 style={{ margin: 0 }}>Quiz Complete!</h1>
                  <p className="small" style={{ margin: "6px 0 0", opacity: 0.9 }}>
                    {selectedQuiz.title}
                  </p>
                </div>

                <button
                  className="btn"
                  onClick={() => {
                    setSelectedQuiz(null);
                    loadQuizzes();
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div className="small">
                  <b>
                    Score: {score} / {selectedQuiz.questions.length}
                  </b>
                </div>
                <div className="small">
                  <b>{score >= selectedQuiz.passing_score ? "✅ PASSED!" : "❌ FAILED"}</b>
                </div>
                <div className="small">
                  Attempts: <b>{attempts} / {MAX_ATTEMPTS}</b>
                </div>
              </div>
            </div>

            <div className="quiz-popup__content">
              {selectedQuiz.questions.map((q, idx) => {
                const userAns = answers[q.id] ?? null;
                const correct = q.answer;
                const isCorrect = userAns && userAns === correct;

                return (
                  <div key={q.id} style={{ marginBottom: 14 }}>
                    <div className="small" style={{ opacity: 0.9 }}>
                      Q{idx + 1}
                    </div>
                    <div style={{ fontWeight: 700 }}>{q.question}</div>
                    <div className="small">
                      <b>Your answer:</b> {userAns ?? "Not answered"} {userAns ? (isCorrect ? "✅" : "❌") : ""}
                    </div>
                    <div className="small">
                      <b>Correct:</b> {correct}
                    </div>
                    {q.explanation && (
                      <div className="small" style={{ marginTop: 6, opacity: 0.9 }}>
                        <b>Explanation:</b> {q.explanation}
                      </div>
                    )}
                    <hr style={{ opacity: 0.2, marginTop: 10 }} />
                  </div>
                );
              })}
            </div>

            <div className="quiz-popup__footer">
              <div style={{ display: "grid", gap: 10 }}>
                {attempts < MAX_ATTEMPTS ? (
                  <button onClick={handleRetakeQuiz} className="btn">
                    Retake Quiz
                  </button>
                ) : cooldownTime > 0 ? (
                  <button disabled className="btn" style={{ opacity: 0.6, cursor: "not-allowed" }}>
                    ⏳ Cooldown: {cooldownLabel}
                  </button>
                ) : (
                  <button onClick={handleRetakeQuiz} className="btn">
                    Retake Quiz (Cooldown Finished)
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedQuiz(null);
                    loadQuizzes();
                  }}
                  className="btn"
                  style={{ opacity: 0.9 }}
                >
                  Back to Quizzes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // STUDENT VIEW - TAKING QUIZ (POP-UP)
  // =========================
  if (selectedQuiz && !submitted) {
    const q = selectedQuiz.questions?.[currentQuestionIndex];

    const options = Array.isArray(q?.options)
      ? q.options
      : typeof q?.options === "string"
      ? (q.options.includes("|") ? q.options.split("|") : q.options.split(","))
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    return (
      <div className="container">
        <Navigation />

        <div className="modal-overlay" onClick={() => {}}>
          <div className="quiz-popup" onClick={(e) => e.stopPropagation()}>
            <div className="quiz-popup__header">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <h1 style={{ margin: 0 }}>{selectedQuiz.title}</h1>
                  <p className="small" style={{ margin: "6px 0 0", opacity: 0.9 }}>
                    Question {currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                  </p>
                </div>

                

                <button
                  className="btn"
                  onClick={() => {
                    setSelectedQuiz(null);
                    loadQuizzes();
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="quiz-popup__content">
  <h2 style={{ marginTop: 0 }}>{q?.question}</h2>

  <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
    {(q?.type === "tf" ? ["true", "false"] : options).map((opt, idx) => {
      const checked = answers?.[q?.id] === opt;

      return (
        <label key={idx} className={`quiz-option ${checked ? "is-selected" : ""}`}>
          <input
            type="radio"
            name={`q_${q?.id}`}
            checked={checked}
            onChange={() => handleAnswerChange(opt)}
          />
          <span style={{ fontWeight: 600 }}>
            {q?.type === "tf" ? (opt === "true" ? "True" : "False") : opt}
          </span>
        </label>
      );
    })}
  </div>
</div>


            <div className="quiz-popup__footer">
              <div className="quiz-actions">
                <button
                  className="btn"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  style={{ minWidth: 150, opacity: currentQuestionIndex === 0 ? 0.55 : 1 }}
                >
                  ← Previous
                </button>

                {currentQuestionIndex < selectedQuiz.questions.length - 1 ? (
                  <button
                    className="btn"
                    onClick={handleNextQuestion}
                    disabled={!answers?.[q?.id]}
                    style={{ minWidth: 150, opacity: !answers?.[q?.id] ? 0.55 : 1 }}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    className="btn"
                    onClick={handleSubmitQuiz}
                    disabled={!answers?.[q?.id]}
                    style={{ minWidth: 180, opacity: !answers?.[q?.id] ? 0.55 : 1 }}
                  >
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // STUDENT VIEW - QUIZ LIST
  // =========================
  return (
    <div className="container">
      <Navigation />

      <div className="card">
        <h1>Quizzes</h1>
      </div>

      {quizzes.length === 0 ? (
        <div className="card">
          <p>No quizzes available.</p>
        </div>
      ) : (
        quizzes.map((quiz) => (
          <div key={quiz.id} className="card">
            <h3>{quiz.title}</h3>
            <p className="small">{quiz.description}</p>
            <p className="small">Passing Score: {quiz.passing_score}</p>

            <button onClick={() => loadQuizWithQuestions(quiz.id)} className="btn">
              Take Quiz
            </button>
          </div>
        ))
      )}
    </div>
  );
}
