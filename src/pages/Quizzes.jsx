import { useContext, useState } from "react";
import Navigation from "../components/Navigation";
import { quizQuestions } from "../utils/mockData";
import { ProgressContext } from "../contexts/ProgressContext";

export default function Quizzes() {
  const { updateProgress } = useContext(ProgressContext);

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const PASSING_SCORE = 7;

  const handleChange = (id, answer) => {
    setAnswers((prev) => ({ ...prev, [id]: answer }));
  };

  const handleSubmit = () => {
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    if (correct >= PASSING_SCORE) updateProgress("quizzes", 1);
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  if (submitted) {
    return (
      <div className="container">
        <Navigation />
        <div className="card">
          <h1>Quiz Results</h1>
          <p>
            Score: <b>{score}</b> / {quizQuestions.length}
          </p>
          <p>{score >= PASSING_SCORE ? "✅ Passed!" : "❌ Try again."}</p>
        </div>

        {quizQuestions.map((q) => (
          <div key={q.id} className="card">
            <p>
              <b>{q.question}</b>
            </p>
            <p>Your answer: {answers[q.id] || "None"}</p>
            <p>Correct: {q.answer}</p>
            {q.explanation ? (
              <p className="small">Explanation: {q.explanation}</p>
            ) : null}
          </div>
        ))}

        <button onClick={resetQuiz} className="btn">
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <Navigation />

      <div className="card">
        <h1>Krebs Cycle Quiz</h1>
        <p className="small">
          Passing score: {PASSING_SCORE}/{quizQuestions.length}
        </p>
      </div>

      {quizQuestions.map((q) => (
        <div key={q.id} className="card">
          <p>
            <b>{q.question}</b>
          </p>

          {q.type === "mcq" ? (
            <div className="stack">
              {q.options.map((option) => {
                const selected = answers[q.id] === option;

                return (
                  <label key={option} className={`option-row ${selected ? "selected" : ""}`}>
                    <input
                      className="option-radio"
                      type="radio"
                      name={`q-${q.id}`}
                      value={option}
                      checked={selected}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    />
                    <span className="option-label">{option}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <select
              value={answers[q.id] || ""}
              onChange={(e) => handleChange(q.id, e.target.value)}
            >
              <option value="">Select</option>
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          )}
        </div>
      ))}

      <button onClick={handleSubmit} className="btn">
        Submit
      </button>
    </div>
  );
}
