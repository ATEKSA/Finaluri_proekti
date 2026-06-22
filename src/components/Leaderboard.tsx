import React from 'react';
import { useAuth } from '../context/AuthContext';
import { audio } from '../utils/audio';

/* Custom SVG Icons */
const CrownIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <path d="M2 20h20L19 8l-5 5-2-7-2 7-5-5-3 12Z" fill="url(#crownGrad)" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="12" cy="5" r="1" fill="#fbbf24" />
    <circle cx="5" cy="8" r="1" fill="#fbbf24" />
    <circle cx="19" cy="8" r="1" fill="#fbbf24" />
  </svg>
);

const MedalIcon = ({ rank }: { rank: number }) => {
  const colors: Record<number, { fill: string; stroke: string }> = {
    1: { fill: '#f59e0b', stroke: '#d97706' },
    2: { fill: '#94a3b8', stroke: '#64748b' },
    3: { fill: '#cd7f32', stroke: '#a0522d' },
  };
  const c = colors[rank] || { fill: '#6b7280', stroke: '#4b5563' };
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="14" r="7" fill={c.fill} stroke={c.stroke} strokeWidth="1.5" opacity="0.9" />
      <path d="M9 2L12 7L15 2" stroke={c.stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="12" y="17" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff">{rank}</text>
    </svg>
  );
};

// Simulated leaderboard data (mock classmates)
const MOCK_CLASSMATES = [
  { name: 'ანი კ.', xp: 420, levels: 5 },
  { name: 'გიორგი მ.', xp: 375, levels: 5 },
  { name: 'მარიამ ბ.', xp: 310, levels: 4 },
  { name: 'ლუკა თ.', xp: 275, levels: 4 },
  { name: 'ნინო ჯ.', xp: 225, levels: 3 },
  { name: 'დავით წ.', xp: 200, levels: 3 },
  { name: 'თამარ ხ.', xp: 150, levels: 2 },
  { name: 'სანდრო ბ.', xp: 120, levels: 2 },
  { name: 'ელენე გ.', xp: 75, levels: 1 },
  { name: 'ნიკა ა.', xp: 50, levels: 1 },
];

export const Leaderboard: React.FC = () => {
  const { user } = useAuth();

  // Merge current user into leaderboard
  const currentUserEntry = {
    name: user ? (user.uid === 'guest' ? 'შენ (სტუმარი)' : user.name) : 'შენ',
    xp: user ? user.xp : 0,
    levels: user ? user.unlockedLevels : 1,
    isCurrentUser: true,
  };

  const allEntries = [
    ...MOCK_CLASSMATES.map(e => ({ ...e, isCurrentUser: false })),
    currentUserEntry,
  ]
    .sort((a, b) => b.xp - a.xp)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return (
    <div className="leaderboard-container animate-fade-in">
      <header className="section-header">
        <h1>მოსწავლეთა რეიტინგი</h1>
        <p>შეეჯიბრე შენს კლასელებს და გახდი საუკეთესო ქიმიკოსი! გადაამეტე მათ XP ქულები.</p>
      </header>

      {/* Top 3 Podium */}
      <div className="leaderboard-podium">
        {allEntries.slice(0, 3).map((entry) => (
          <div
            key={entry.rank}
            className={`podium-card glass-panel ${entry.isCurrentUser ? 'is-you' : ''} rank-${entry.rank}`}
            onClick={() => audio.playClick()}
          >
            <MedalIcon rank={entry.rank} />
            <div className="podium-name">{entry.name}</div>
            <div className="podium-xp">{entry.xp} XP</div>
            <div className="podium-levels">დონე: {entry.levels}/5</div>
            {entry.rank === 1 && <CrownIcon />}
          </div>
        ))}
      </div>

      {/* Full Rankings Table */}
      <div className="leaderboard-table glass-panel">
        <div className="table-header-row">
          <span className="col-rank">#</span>
          <span className="col-name">მოსწავლე</span>
          <span className="col-xp">XP ქულები</span>
          <span className="col-levels">დონეები</span>
        </div>
        {allEntries.map((entry) => (
          <div
            key={entry.rank}
            className={`table-row ${entry.isCurrentUser ? 'is-you' : ''} ${entry.rank <= 3 ? 'top-three' : ''}`}
          >
            <span className="col-rank">
              {entry.rank <= 3 ? <MedalIcon rank={entry.rank} /> : entry.rank}
            </span>
            <span className="col-name">
              {entry.name}
              {entry.isCurrentUser && <span className="you-badge">შენ</span>}
            </span>
            <span className="col-xp">{entry.xp} XP</span>
            <span className="col-levels">{entry.levels}/5</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
