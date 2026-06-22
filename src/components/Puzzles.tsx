import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sandbox, PUZZLE_LEVELS } from './Sandbox';
import { Lock, Star, Play, CheckCircle } from 'lucide-react';
import { audio } from '../utils/audio';

export const Puzzles: React.FC = () => {
  const { user } = useAuth();
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);

  const currentUnlocked = user ? user.unlockedLevels : 1;

  const handleLevelSelect = (levelId: number) => {
    if (levelId > currentUnlocked) {
      audio.playError();
      return;
    }
    audio.playClick();
    setActiveLevelId(levelId);
  };

  const handleLevelComplete = (completedId: number, xpEarned: number) => {
    // We can show additional level complete states here if needed
    console.log(`Level ${completedId} completed, earned ${xpEarned} XP`);
  };

  const handleNextLevel = () => {
    audio.playClick();
    if (activeLevelId && activeLevelId < 5) {
      setActiveLevelId(activeLevelId + 1);
    } else {
      setActiveLevelId(null); // Go back to level selection if finished last level
    }
  };

  if (activeLevelId !== null) {
    return (
      <div className="puzzle-gameplay-container animate-fade-in">
        <Sandbox 
          puzzleMode={true} 
          levelId={activeLevelId} 
          onBackToPuzzles={() => setActiveLevelId(null)} 
          onLevelComplete={handleLevelComplete}
        />
        
        {/* Next level controller displayed optionally */}
        {activeLevelId < 5 && currentUnlocked > activeLevelId && (
          <div className="next-level-banner glass-panel animate-float" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', marginTop: '1.5rem', borderColor: 'var(--border-glow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <CheckCircle size={20} className="green-text" />
              <span>დონე დასრულებულია! გსურთ შემდეგ ეტაპზე გადასვლა?</span>
            </div>
            <button className="btn-primary" onClick={handleNextLevel}>
              შემდეგი დონე ➔
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="puzzles-selection-container animate-fade-in">
      <header className="section-header">
        <h1>საგანმანათლებლო ამოცანები</h1>
        <p>შეასრულე 5 საინტერესო ქიმიური მისია, დააკავშირე ატომები სწორად და მოიპოვე ვარსკვლავები და XP ქულები!</p>
      </header>

      <div className="puzzles-grid">
        {Object.values(PUZZLE_LEVELS).map((level) => {
          const isUnlocked = level.id <= currentUnlocked;
          const isCompleted = level.id < currentUnlocked;

          return (
            <div 
              key={level.id} 
              className={`puzzle-card glass-panel ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}`}
              onClick={() => handleLevelSelect(level.id)}
            >
              {/* Card Header with Level ID and status */}
              <div className="puzzle-card-header">
                <span className="level-number">ამოცანა {level.id}</span>
                <span className="xp-reward">+{level.xpReward} XP</span>
              </div>

              {/* Molecule Formula & Name */}
              <div className="puzzle-card-body">
                <div className="molecule-formula-display">
                  {level.formula}
                </div>
                <h3 className="molecule-name">{level.nameGeo}</h3>
                <p className="puzzle-desc">{level.description}</p>
              </div>

              {/* Card Footer with Stars and Unlocked indicators */}
              <div className="puzzle-card-footer">
                {isCompleted ? (
                  <div className="stars-container">
                    <Star size={16} fill="var(--color-amber)" stroke="var(--color-amber)" className="animate-pulse-glow" />
                    <Star size={16} fill="var(--color-amber)" stroke="var(--color-amber)" className="animate-pulse-glow" />
                    <Star size={16} fill="var(--color-amber)" stroke="var(--color-amber)" className="animate-pulse-glow" />
                  </div>
                ) : isUnlocked ? (
                  <div className="status-indicator current">
                    <Play size={14} />
                    <span>აქტიური</span>
                  </div>
                ) : (
                  <div className="status-indicator locked">
                    <Lock size={14} />
                    <span>ჩაკეტილი</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Puzzles;
