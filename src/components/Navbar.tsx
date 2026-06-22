import React, { useState } from 'react';
import { Atom, Trophy, BookOpen, Volume2, VolumeX, LogIn, User, Gamepad2, HelpCircle } from 'lucide-react';
import { audio } from '../utils/audio';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  xp: number;
  unlockedLevels: number;
  user: { name: string; email: string } | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onHelpClick: () => void;
}

const LogoutIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    className="logout-svg-custom"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="logoutGradCustom" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff4b5c" />
        <stop offset="100%" stopColor="#ff0055" />
      </linearGradient>
      <linearGradient id="logoutArrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#ff9fa6" />
      </linearGradient>
      <filter id="logoutGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Outer telemetry / orbit circle */}
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="url(#logoutGradCustom)" 
      strokeWidth="1.2" 
      strokeDasharray="4 3" 
      className="logout-portal-ring" 
      opacity="0.45"
    />
    
    {/* Exit portal arc */}
    <path 
      d="M12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C15.1 3 17.82 4.57 19.5 7" 
      stroke="url(#logoutGradCustom)" 
      strokeWidth="2.2" 
      strokeLinecap="round" 
      className="logout-door-arc"
      filter="url(#logoutGlow)"
    />
    
    {/* Particle exit dot */}
    <circle cx="19.5" cy="7" r="1.5" fill="#ff4b5c" />
    
    {/* The active exit arrow */}
    <g className="logout-arrow-group">
      <path 
        d="M11 12H21" 
        stroke="url(#logoutArrowGrad)" 
        strokeWidth="2.2" 
        strokeLinecap="round"
      />
      <path 
        d="M18 9L21 12L18 15" 
        stroke="url(#logoutArrowGrad)" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  xp,
  unlockedLevels,
  user,
  onLoginClick,
  onLogoutClick,
  onHelpClick,
}) => {
  const [muted, setMuted] = useState(audio.getMuted());

  const handleTabClick = (tabId: string) => {
    audio.playClick();
    setActiveTab(tabId);
  };

  const handleMuteToggle = () => {
    const isMutedNow = audio.toggleMute();
    setMuted(isMutedNow);
    if (!isMutedNow) {
      audio.playClick();
    }
  };

  const handleHelpClick = () => {
    audio.playClick();
    onHelpClick();
  };

  return (
    <nav className="navbar-container glass-panel">
      <div className="nav-brand" onClick={() => handleTabClick('sandbox')}>
        <div className="brand-logo">
          <Atom className="logo-icon animate-spin-slow" />
        </div>
        <div className="brand-text">
          <span className="title-geo">ქიმიური ლაბორატორია</span>
          <span className="title-eng">The Bonding Sandbox</span>
        </div>
      </div>

      <div className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'sandbox' ? 'active' : ''}`}
          onClick={() => handleTabClick('sandbox')}
        >
          <Gamepad2 size={16} />
          <span>ლაბორატორია</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'puzzles' ? 'active' : ''}`}
          onClick={() => handleTabClick('puzzles')}
        >
          <Trophy size={16} />
          <span>ამოცანები</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => handleTabClick('leaderboard')}
        >
          <Trophy className="gold-trophy" size={16} />
          <span>რეიტინგი</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'sources' ? 'active' : ''}`}
          onClick={() => handleTabClick('sources')}
        >
          <BookOpen size={16} />
          <span>წყაროები</span>
        </button>
      </div>

      <div className="nav-status">
        <div className="stat-badge-unified">
          <div className="badge-part xp-part">
            <Trophy size={14} className="gold-text animate-pulse-glow" />
            <span>{xp} XP</span>
          </div>
          <div className="badge-divider"></div>
          <div className="badge-part level-part">
            <span className="badge-dot"></span>
            <span>დონე: {unlockedLevels}/5</span>
          </div>
        </div>

        <button className="sound-toggle btn-secondary" onClick={handleMuteToggle} title="ხმის ჩართვა/გამორთვა">
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button className="sound-toggle btn-secondary" onClick={handleHelpClick} title="გზამკვლევი (ტუტორიალი)">
          <HelpCircle size={16} />
        </button>

        <div className="auth-section">
          {user ? (
            <div className="user-profile">
              <div className="user-avatar" title={user.email}>
                <User size={14} />
                <span className="username">{user.name}</span>
              </div>
              <button className="auth-btn btn-danger-icon" onClick={onLogoutClick} title="გამოსვლა">
                <LogoutIcon />
              </button>
            </div>

          ) : (
            <button className="auth-btn btn-primary" onClick={onLoginClick}>
              <LogIn size={16} />
              <span>შესვლა</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
