import { useContext, useState } from "react";
import Navigation from "../components/Navigation";
import { gameQuestions } from "../utils/mockData";
import { ProgressContext } from "../contexts/ProgressContext";

export default function Game() {
  const { updateProgress } = useContext(ProgressContext);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const handleAnswer = (selected) => {
    if (selected === gameQuestions[currentQuestion].answer) {
      setScore((s) => s + 1);
    }
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < gameQuestions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      setShowAnswer(false);
    } else {
      setGameOver(true);
      updateProgress("games", 1); 
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowAnswer(false);
    setGameOver(false);
  };

  if (gameOver) {
    return (
      <div className="container">
        <Navigation />
        <h1>Game Over!</h1>
        <p>Score: {score}/{gameQuestions.length}</p>
        <button onClick={resetGame} className="btn">Play Again</button>
      </div>
    );
  }

  const q = gameQuestions[currentQuestion];

  return (
    <div className="container">
      <Navigation />
      <h1>Name That Thing</h1>
      <p className="small">Question {currentQuestion + 1}/{gameQuestions.length}</p>

      <div className="card">
        <p><b>{q.question}</b></p>

        <div className="stack">
          {q.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className="btn"
              disabled={showAnswer}
            >
              {option}
            </button>
          ))}
        </div>

        {showAnswer && <p className="small">Correct Answer: <b>{q.answer}</b></p>}
      </div>

      {showAnswer && <button onClick={nextQuestion} className="btn">Next</button>}
    </div>
  );
}
