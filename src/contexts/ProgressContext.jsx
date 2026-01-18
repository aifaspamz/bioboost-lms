import { createContext, useState, useEffect } from "react";

export const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  
  const [progress, setProgress] = useState({
    quizzes: 0, 
    games: 0,   
  });

  
  useEffect(() => {
    const stored = localStorage.getItem("progress");
    if (stored) {
      setProgress(JSON.parse(stored));
    }
  }, []);

  
  const updateProgress = (type, value) => {
    const newProgress = { ...progress, [type]: value };
    setProgress(newProgress);
    localStorage.setItem("progress", JSON.stringify(newProgress));
  };

  
  const getTotalProgress = () => {
    const quizzesPercent = Math.min(progress.quizzes, 1) * 60; 
    const gamesPercent = Math.min(progress.games, 1) * 40;    
    return Math.min(quizzesPercent + gamesPercent, 100);
  };

  
  const getLevel = () => {
    const total = getTotalProgress();
    if (total < 40) return "Beginner";
    if (total < 80) return "Intermediate";
    return "Master";
  };

  return (
    <ProgressContext.Provider
      value={{
        progress,
        updateProgress,
        getTotalProgress,
        getLevel,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};
