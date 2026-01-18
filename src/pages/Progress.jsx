import { useContext } from "react";
import Navigation from "../components/Navigation";
import { AuthContext } from "../contexts/AuthContext";
import { ProgressContext } from "../contexts/ProgressContext";

export default function Progress() {
  const { user, logout } = useContext(AuthContext);
  const { progress, getLevel } = useContext(ProgressContext);

  const overallLevel = getLevel();

  // Progress levels
  const tfLevel = progress.quizzes >= 1 ? "Master" : "Beginner";
  const gameLevel = progress.games >= 1 ? "Master" : "Beginner";

  const fillWidth = (level) => {
    if (level === "Beginner") return "0%";
    if (level === "Intermediate") return "50%";
    return "100%";
  };

  const LevelTrack = ({ level }) => (
    <div className="level-track">
      <div className="level-line">
        <div
          className="level-line-fill"
          style={{ width: fillWidth(level) }}
        />
      </div>

      <div className="level-item">
        <div className={`level-dot ${level === "Beginner" ? "active" : ""}`} />
        <div className={`level-label ${level === "Beginner" ? "active" : ""}`}>
          Beginner
        </div>
      </div>

      <div className="level-item">
        <div
          className={`level-dot ${
            level === "Intermediate" ? "active" : ""
          }`}
        />
        <div
          className={`level-label ${
            level === "Intermediate" ? "active" : ""
          }`}
        >
          Intermediate
        </div>
      </div>

      <div className="level-item">
        <div className={`level-dot ${level === "Master" ? "active" : ""}`} />
        <div className={`level-label ${level === "Master" ? "active" : ""}`}>
          Master
        </div>
      </div>
    </div>
  );

  return (
    <div className="container">
      <Navigation />

      
      <div className="logo-header">
        <img src="/logo.png" alt="Bioboost Logo" className="bioboost-logo" />
      </div>

    
      <div className="profile-card card">
        <div className="profile-header">
          <div>
           
            <div className="profile-username">
              {user?.username || "Username"}
            </div>
          </div>

          <div className="profile-total">
            <div className="pill">{overallLevel}</div>
          </div>
        </div>

        
        <div className="profile-section">
          <div className="profile-section-title">
            TRUE OR FALSE / QUIZZES
          </div>
          <LevelTrack level={tfLevel} />
          <div className="profile-hint">
            Status: {progress.quizzes >= 1 ? "Passed ✅" : "Not passed yet"}
          </div>
        </div>

        
        <div className="profile-section">
          <div className="profile-section-title">
            NAME THAT THING (GAME)
          </div>
          <LevelTrack level={gameLevel} />
          <div className="profile-hint">
            Status: {progress.games >= 1 ? "Completed ✅" : "Not completed"}
          </div>
        </div>

        <button className="btn logout-btn" onClick={logout}>
          Log Out
        </button>
      </div>
    </div>
  );
}
