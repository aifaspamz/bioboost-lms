import { useContext, useState } from "react";
import Navigation from "../components/Navigation";
import { ProgressContext } from "../contexts/ProgressContext";
import "../styles/interactive-krebs.css";

export default function InteractiveKrebs() {
  const { updateProgress } = useContext(ProgressContext);

  const krebsSteps = [
    { id: "acetyl", name: "Acetyl-CoA", description: "Enter the cycle" },
    { id: "citrate", name: "Citrate", description: "6-carbon molecule" },
    { id: "isocitrate", name: "Isocitrate", description: "Rearrangement" },
    { id: "ketoglutarate", name: "α-Ketoglutarate", description: "5-carbon molecule" },
    { id: "succinyl", name: "Succinyl-CoA", description: "Energy released" },
    { id: "succinate", name: "Succinate", description: "4-carbon molecule" },
    { id: "fumarate", name: "Fumarate", description: "Double bond added" },
    { id: "malate", name: "Malate", description: "Hydration" },
    { id: "oxaloacetate", name: "Oxaloacetate", description: "Regenerated" },
  ];

  const [sequence, setSequence] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const handleDragStart = (item) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItem && !sequence.find(item => item.id === draggedItem.id)) {
      setSequence([...sequence, draggedItem]);
    }
    setDraggedItem(null);
  };

  const handleItemClick = (item) => {
    if (sequence.find(seq => seq.id === item.id)) {
      return;
    }
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  const handleAddToSequence = () => {
    if (selectedItem && !sequence.find(item => item.id === selectedItem.id)) {
      setSequence([...sequence, selectedItem]);
      setSelectedItem(null);
    }
  };

  const handleRemoveFromSequence = (id) => {
    setSequence(sequence.filter(item => item.id !== id));
  };

  const checkAnswer = () => {
    const correctSequence = krebsSteps.map(s => s.id);
    const userSequence = sequence.map(s => s.id);
    
    if (JSON.stringify(correctSequence) === JSON.stringify(userSequence)) {
      setCompleted(true);
      setScore(100);
      updateProgress("games", 1);
    } else {
      setScore(Math.round((sequence.length / krebsSteps.length) * 100));
    }
  };

  const resetGame = () => {
    setSequence([]);
    setCompleted(false);
    setScore(0);
  };

  const availableItems = krebsSteps.filter(
    step => !sequence.find(item => item.id === step.id)
  );

  return (
    <div className="container">
      <Navigation />
      
      <div className="interactive-krebs">
        <h1>Interactive Krebs Cycle</h1>
        <p className="subtitle">Drag and drop the steps in the correct order</p>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-info">
            <span>Progress: {sequence.length}/{krebsSteps.length} steps</span>
            <span className="score-display">{score > 0 ? `Score: ${score}%` : ''}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(sequence.length / krebsSteps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="krebs-game-container">
          {/* Available Steps */}
          <div className="steps-panel">
            <h3>Available Steps</h3>
            <div className="available-steps">
          {availableItems.map((item) => (
            <div
              key={item.id}
              className={`step-item draggable ${selectedItem?.id === item.id ? 'selected' : ''}`}
              draggable
              onDragStart={() => handleDragStart(item)}
              onClick={() => handleItemClick(item)}
            >
              <div className="step-name">{item.name}</div>
              <div className="step-description">{item.description}</div>
            </div>
          ))}
            </div>
            {selectedItem && (
              <button className="btn btn-add-mobile" onClick={handleAddToSequence}>
                Add "{selectedItem.name}"
              </button>
            )}
          </div>

          {/* Drop Zone */}
          <div className="drop-zone" onDragOver={handleDragOver} onDrop={handleDrop}>
            <h3>Krebs Cycle Sequence</h3>
            {sequence.length === 0 ? (
              <p className="drop-hint">Drag steps here to build the cycle</p>
            ) : (
              <div className="sequence">
                {sequence.map((item, index) => (
                  <div key={item.id} className="sequence-item">
                    <div className="sequence-number">{index + 1}</div>
                    <div className="sequence-content">
                      <div className="sequence-name">{item.name}</div>
                      <div className="sequence-description">{item.description}</div>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveFromSequence(item.id)}
                      title="Remove from sequence"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {completed && (
          <div className="completion-message success">
            🎉 Perfect! You completed the Krebs cycle correctly!
          </div>
        )}
        {score > 0 && score < 100 && (
          <div className="completion-message partial">
            Score: {score}% - Try again to get all steps in the correct order!
          </div>
        )}

        {/* Buttons */}
        <div className="game-actions">
          <button className="btn btn-primary" onClick={checkAnswer} disabled={sequence.length === 0}>
            Check Answer
          </button>
          <button className="btn btn-secondary" onClick={resetGame}>
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
}
