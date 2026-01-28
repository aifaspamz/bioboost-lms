import { useContext, useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { ProgressContext } from "../contexts/ProgressContext";
import "../styles/interactive-krebs.css";

const KREBS_DATA = [
  { id: "acetyl", name: "Acetyl-CoA", description: "The Krebs cycle begins when acetyl-CoA enters the cycle carrying a two-carbon unit that will be processed to release energy." },
  { id: "citrate", name: "Citrate", description: "Acetyl-CoA combines with oxaloacetate to form citrate, a six-carbon molecule, marking the first step of carbon rearrangement in the cycle." },
  { id: "isocitrate", name: "Isocitrate", description: "Citrate is converted into isocitrate through molecular rearrangement, preparing the compound for oxidation and energy release." },
  { id: "ketoglutarate", name: "α-Ketoglutarate", description: "Isocitrate undergoes oxidation, releasing one carbon as carbon dioxide and forming a five-carbon molecule while producing NADH." },
  { id: "succinyl", name: "Succinyl-CoA", description: "α-Ketoglutarate is further oxidized, releasing another carbon dioxide and capturing energy in the form of ATP (or GTP)." },
  { id: "succinate", name: "Succinate", description: "Succinyl-CoA is converted into succinate, a four-carbon molecule, as ATP is directly generated in this step." },
  { id: "fumarate", name: "Fumarate", description: "Succinate is oxidized to fumarate, forming a double bond and producing FADH₂ for later ATP production." },
  { id: "malate", name: "Malate", description: "Fumarate undergoes hydration as water is added, converting it into malate." },
  { id: "oxaloacetate", name: "Oxaloacetate", description: "Malate is oxidized to regenerate oxaloacetate, completing the cycle and allowing it to begin again with a new acetyl-CoA molecule." },
];

export default function InteractiveKrebs() {
  const { updateProgress } = useContext(ProgressContext);
  
  const [shuffledSteps, setShuffledSteps] = useState([]);
  const [sequence, setSequence] = useState([]); 
  const [feedback, setFeedback] = useState({ message: "Can you find the starting molecule?", type: "hint" });
  const [draggedItem, setDraggedItem] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const randomized = [...KREBS_DATA].sort(() => Math.random() - 0.5);
    setShuffledSteps(randomized);
    setSequence([]);
    setFeedback({ message: "Find Step 1: How does the cycle begin?", type: "hint" });
  };

  const handleGuess = (item) => {
    const nextStepIndex = sequence.length;
    const correctStep = KREBS_DATA[nextStepIndex];

    if (item.id === correctStep.id) {
      const newSequence = [...sequence, item];
      setSequence(newSequence);
      setShuffledSteps(shuffledSteps.filter(s => s.id !== item.id));
      
      if (newSequence.length === KREBS_DATA.length) {
        setFeedback({ message: "🎉 Perfect! You've mastered the Krebs Cycle!", type: "success" });
        updateProgress("games", 1);
      } else {
        setFeedback({ message: `Correct! ${item.description}`, type: "success" });
      }
    } else {
      setFeedback({ message: `Not quite. "${item.name}" isn't the next step. Try again!`, type: "error" });
    }
  };

  const onDragStart = (item) => setDraggedItem(item);
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const onDragLeave = () => setIsDragOver(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (draggedItem) handleGuess(draggedItem);
    setDraggedItem(null);
  };

  return (
    <div className="container">
      <Navigation />
      <div className="interactive-krebs">
        <h1>Interactive Krebs Cycle</h1>
        <p className="subtitle">Guess the correct order. Drag molecules to the cycle or click them.</p>

        <div className="progress-section">
          <div className="progress-info">
            <span>Progress: {sequence.length}/{KREBS_DATA.length} Steps</span>
            <span className="score-display">
              {Math.round((sequence.length / KREBS_DATA.length) * 100)}% Complete
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(sequence.length / KREBS_DATA.length) * 100}%` }}
            />
          </div>
        </div>

        <div className={`feedback-box ${feedback.type}`}>
          {feedback.message}
        </div>

        <div className="krebs-game-container">
          <div className="steps-panel">
            <h3>Available Molecules</h3>
            <div className="available-steps">
              {shuffledSteps.map((item) => (
                <div
                  key={item.id}
                  className="step-item"
                  draggable
                  onDragStart={() => onDragStart(item)}
                  onClick={() => handleGuess(item)}
                >
                  <div className="step-name">{item.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div 
            className={`drop-zone ${isDragOver ? "drag-over" : ""}`} 
            onDragOver={onDragOver} 
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <h3>Krebs Cycle Sequence</h3>
            <div className="sequence">
              {sequence.length === 0 ? (
                <p className="drop-hint">Drag the first step here...</p>
              ) : (
                sequence.map((item, index) => (
                  <div key={item.id} className="sequence-item">
                    <div className="sequence-number">{index + 1}</div>
                    <div className="sequence-content">
                      <div className="sequence-name">{item.name}</div>
                      <div className="sequence-description">{item.description}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="game-actions">
          <button className="btn btn-secondary" onClick={initGame}>
            Reset & Randomize
          </button>
        </div>
      </div>
    </div>
  );
}