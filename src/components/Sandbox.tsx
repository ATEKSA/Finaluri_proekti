import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { audio } from '../utils/audio';
import { RotateCcw, ShieldCheck, Info, Award, ChevronLeft } from 'lucide-react';

/* ─── Atom Definitions ─────────────────────────────────────────────────────── */
interface AtomType {
  symbol: string;
  name: string;
  nameEng: string;
  valency: number;
  requiredBonds: number;
  color: string;
  glowColor: string;
  radius: number;
}

const ATOM_DEFS: Record<string, AtomType> = {
  H:  { symbol: 'H',  name: 'წყალბადი',   nameEng: 'Hydrogen',   valency: 1, requiredBonds: 1, color: '#60a5fa', glowColor: 'rgba(96,165,250,0.5)',   radius: 28 },
  O:  { symbol: 'O',  name: 'ჟანგბადი',   nameEng: 'Oxygen',     valency: 6, requiredBonds: 2, color: '#f87171', glowColor: 'rgba(248,113,113,0.5)',   radius: 36 },
  C:  { symbol: 'C',  name: 'ნახშირბადი', nameEng: 'Carbon',     valency: 4, requiredBonds: 4, color: '#94a3b8', glowColor: 'rgba(148,163,184,0.5)',   radius: 38 },
  Na: { symbol: 'Na', name: 'ნატრიუმი',   nameEng: 'Sodium',     valency: 1, requiredBonds: 1, color: '#c084fc', glowColor: 'rgba(192,132,252,0.5)',   radius: 42 },
  Cl: { symbol: 'Cl', name: 'ქლორი',      nameEng: 'Chlorine',   valency: 7, requiredBonds: 1, color: '#34d399', glowColor: 'rgba(52,211,153,0.5)',    radius: 38 },
};

/* ─── Puzzle Level Configs ─────────────────────────────────────────────────── */
export interface PuzzleLevelConfig {
  id: number;
  nameGeo: string;
  formula: string;
  description: string;
  tutorial: {
    bondType: 'covalent' | 'ionic';
    bondTypeName: string;
    steps: { icon: string; text: string }[];
    funFact: string;
  };
  atomsToSpawn: string[];
  xpReward: number;
}

export const PUZZLE_LEVELS: Record<number, PuzzleLevelConfig> = {
  1: {
    id: 1, nameGeo: 'წყალი', formula: 'H₂O',
    description: 'დააკავშირეთ 2 წყალბადის (H) და 1 ჟანგბადის (O) ატომი.',
    tutorial: {
      bondType: 'covalent', bondTypeName: 'კოვალენტური ბმა',
      steps: [
        { icon: '⚛️', text: 'O-ს სჭირდება 2 ბმა (6 ელ-ი აქვს, 8 უნდა)' },
        { icon: '🔗', text: 'გაიღე ბმა H-დან O-ზე (2-ჯერ)' },
        { icon: '✅', text: 'შეამოწმე — H·O·H = H₂O' },
      ],
      funFact: '💧 წყლის 1 წვეთში 1.7 სექსტილიონი H₂O მოლეკულაა!',
    },
    atomsToSpawn: ['H', 'H', 'O'], xpReward: 50,
  },
  2: {
    id: 2, nameGeo: 'სუფრის მარილი', formula: 'NaCl',
    description: 'ნატრიუმი გადასცემს ელექტრონს ქლორს — იონური ბმა.',
    tutorial: {
      bondType: 'ionic', bondTypeName: 'იონური ბმა',
      steps: [
        { icon: '🟣', text: 'Na-ს 1 ელექტრონი „სურს" გასცეს' },
        { icon: '🔗', text: 'გაიღე ბმა Na-დან Cl-ზე' },
        { icon: '✅', text: 'Na⁺ + Cl⁻ = NaCl (მარილი)' },
      ],
      funFact: '🧂 ადამიანს დღეში 5გ NaCl სჭირდება გადარჩენისთვის!',
    },
    atomsToSpawn: ['Na', 'Cl'], xpReward: 75,
  },
  3: {
    id: 3, nameGeo: 'ნახშირორჟანგი', formula: 'CO₂',
    description: 'C-ს აქვს 4 ბმა — O ორივეს ორ-ორი ბმა ესაჭიროება.',
    tutorial: {
      bondType: 'covalent', bondTypeName: 'ორმაგი ბმა',
      steps: [
        { icon: '⚫', text: 'C-ს სჭირდება 4 ბმა (2+2 = ორ O-ზე)' },
        { icon: '🔗', text: 'C→O₁: 2 ბმა, შემდეგ C→O₂: 2 ბმა' },
        { icon: '✅', text: 'O=C=O = CO₂ (ნახშირბადი)' },
      ],
      funFact: '🌱 მცენარეები CO₂-ს შთანთქავენ ფოტოსინთეზის დროს!',
    },
    atomsToSpawn: ['C', 'O', 'O'], xpReward: 100,
  },
  4: {
    id: 4, nameGeo: 'მეთანი', formula: 'CH₄',
    description: 'C-ს ცენტრი — 4 H ირგვლივ, სულ 4 ბმა.',
    tutorial: {
      bondType: 'covalent', bondTypeName: 'კოვალენტური ბმა',
      steps: [
        { icon: '⚫', text: 'C-ს სჭირდება 4 ბმა, თითოეულ H-ს — 1' },
        { icon: '🔗', text: 'C→H₁, C→H₂, C→H₃, C→H₄' },
        { icon: '✅', text: 'CH₄ — ბუნებრივი გაზი!' },
      ],
      funFact: '🔥 მეთანი სახლებს ათბობს და კვებავს ბუჩქს!',
    },
    atomsToSpawn: ['C', 'H', 'H', 'H', 'H'], xpReward: 120,
  },
  5: {
    id: 5, nameGeo: 'მარილმჟავა', formula: 'HCl',
    description: 'H და Cl — თითო-თითო ბმა, ძლიერი მჟავა.',
    tutorial: {
      bondType: 'covalent', bondTypeName: 'პოლარული ბმა',
      steps: [
        { icon: '🔵', text: 'H-ს 1 ელ-ი, Cl-ს 7 — ორივეს 1 ბმა სჭირდება' },
        { icon: '🔗', text: 'გაიღე ბმა H-დან Cl-ზე' },
        { icon: '✅', text: 'HCl — კუჭის წვენის შემადგენელი!' },
      ],
      funFact: '🫁 HCl-ი ჩვენი კუჭის წვენში ბაქტერიებს კლავს!',
    },
    atomsToSpawn: ['H', 'Cl'], xpReward: 150,
  },
};

/* ─── Spawn positions per molecule ────────────────────────────────────────── */
const PUZZLE_SPAWN_POSITIONS: Record<number, { x: number; y: number }[]> = {
  1: [{ x: 160, y: 230 }, { x: 160, y: 330 }, { x: 310, y: 280 }],          // H H O
  2: [{ x: 230, y: 280 }, { x: 420, y: 280 }],                               // Na Cl
  3: [{ x: 200, y: 280 }, { x: 340, y: 280 }, { x: 480, y: 280 }],          // C O O
  4: [{ x: 330, y: 280 }, { x: 200, y: 200 }, { x: 460, y: 200 }, { x: 200, y: 360 }, { x: 460, y: 360 }], // C H H H H
  5: [{ x: 230, y: 280 }, { x: 400, y: 280 }],                               // H Cl
};

/* ─── Types ────────────────────────────────────────────────────────────────── */
interface AtomInstance { id: string; symbol: string; x: number; y: number; }
interface BondInstance  { id: string; atomAId: string; electronAIdx: number; atomBId: string; electronBIdx: number; isNew?: boolean; }
interface SandboxProps {
  puzzleMode?: boolean;
  levelId?: number;
  onBackToPuzzles?: () => void;
  onLevelComplete?: (levelId: number, xpEarned: number) => void;
}

/* ─── Component ────────────────────────────────────────────────────────────── */
export const Sandbox: React.FC<SandboxProps> = ({
  puzzleMode = false,
  levelId = 1,
  onBackToPuzzles,
  onLevelComplete,
}) => {
  const { updateProgress } = useAuth();

  const [atoms,              setAtoms]              = useState<AtomInstance[]>([]);
  const [bonds,              setBonds]              = useState<BondInstance[]>([]);
  const [selectedAtom,       setSelectedAtom]       = useState<string | null>(null);
  const [hoveredAtom,        setHoveredAtom]        = useState<string | null>(null);
  const [draggingAtomId,     setDraggingAtomId]     = useState<string | null>(null);
  const [dragOffset,         setDragOffset]         = useState({ x: 0, y: 0 });
  const [activeBondStart,    setActiveBondStart]    = useState<{ atomId: string; electronIdx: number; x: number; y: number } | null>(null);
  const [mousePos,           setMousePos]           = useState({ x: 0, y: 0 });
  const [resetKey,           setResetKey]           = useState(0);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean; nameGeo: string; nameEng: string;
    formula: string; description: string; xpEarned: number;
  } | null>(null);

  const canvasRef = useRef<SVGSVGElement | null>(null);

  /* ─── Spawn atoms on level load ─── */
  useEffect(() => {
    if (puzzleMode && levelId) {
      const config = PUZZLE_LEVELS[levelId];
      if (!config) return;
      const positions = PUZZLE_SPAWN_POSITIONS[levelId] || [];
      const spawnedAtoms = config.atomsToSpawn.map((symbol, idx) => ({
        id: `${symbol}_puzzle_${idx}_${Math.random().toString(36).substr(2, 5)}`,
        symbol,
        x: positions[idx]?.x ?? 160 + idx * 120,
        y: positions[idx]?.y ?? 280,
      }));
      setAtoms(spawnedAtoms);
      setBonds([]);
      setVerificationResult(null);
      setSelectedAtom(null);
      setCelebrationVisible(false);
    } else {
      setAtoms([]);
      setBonds([]);
      setVerificationResult(null);
      setSelectedAtom(null);
      setCelebrationVisible(false);
    }
  }, [puzzleMode, levelId, resetKey]);

  /* ─── Helpers ─── */
  const getElectronCoords = useCallback((atom: AtomInstance, idx: number) => {
    const def = ATOM_DEFS[atom.symbol];
    const angle = (2 * Math.PI / def.valency) * idx - Math.PI / 2;
    return {
      x: atom.x + def.radius * Math.cos(angle),
      y: atom.y + def.radius * Math.sin(angle),
    };
  }, []);

  const getBondCountForAtom = (atomId: string) =>
    bonds.filter(b => b.atomAId === atomId || b.atomBId === atomId).length;

  const totalRequiredBonds = atoms.reduce((sum, a) => sum + ATOM_DEFS[a.symbol].requiredBonds, 0) / 2;
  const currentBonds = bonds.length;
  const progressPct = totalRequiredBonds > 0 ? Math.min((currentBonds / totalRequiredBonds) * 100, 100) : 0;

  /* Active tutorial step based on state */
  const tutorialStep = bonds.length === 0 ? 0 : bonds.length < totalRequiredBonds ? 1 : 2;

  /* ─── Spawn atom (free-play mode) ─── */
  const spawnAtom = (symbol: string) => {
    audio.playClick();
    const id = `${symbol}_${Math.random().toString(36).substr(2, 9)}`;
    const canvas = canvasRef.current;
    let x = 300, y = 200;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      x = rect.width / 2 + (Math.random() - 0.5) * 120;
      y = rect.height / 2 + (Math.random() - 0.5) * 80;
    }
    setAtoms(prev => [...prev, { id, symbol, x, y }]);
    setVerificationResult(null);
  };

  /* ─── Clear canvas ─── */
  const clearCanvas = () => {
    audio.playClick();
    if (puzzleMode) { setResetKey(k => k + 1); return; }
    setAtoms([]); setBonds([]); setVerificationResult(null); setSelectedAtom(null);
  };

  /* ─── Delete selected atom ─── */
  const deleteSelectedAtom = () => {
    if (!selectedAtom || puzzleMode) return;
    audio.playClick();
    setAtoms(prev => prev.filter(a => a.id !== selectedAtom));
    setBonds(prev => prev.filter(b => b.atomAId !== selectedAtom && b.atomBId !== selectedAtom));
    setSelectedAtom(null);
    setVerificationResult(null);
  };

  /* ─── Mouse handlers ─── */
  const handleMouseDownAtom = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedAtom(id);
    setDraggingAtomId(id);
    const atom = atoms.find(a => a.id === id);
    if (atom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({ x: e.clientX - rect.left - atom.x, y: e.clientY - rect.top - atom.y });
    }
  };

  const handleMouseDownElectron = (e: React.MouseEvent, atomId: string, electronIdx: number) => {
    e.stopPropagation();
    const atom = atoms.find(a => a.id === atomId);
    if (!atom) return;
    const isAlreadyBonded = bonds.some(b =>
      (b.atomAId === atomId && b.electronAIdx === electronIdx) ||
      (b.atomBId === atomId && b.electronBIdx === electronIdx)
    );
    if (isAlreadyBonded) { audio.playError(); return; }
    audio.playClick();
    const coords = getElectronCoords(atom, electronIdx);
    setActiveBondStart({ atomId, electronIdx, ...coords });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    if (draggingAtomId) {
      setAtoms(prev => prev.map(a =>
        a.id === draggingAtomId ? { ...a, x: x - dragOffset.x, y: y - dragOffset.y } : a
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggingAtomId(null);
    if (!activeBondStart) return;

    let target: { atomId: string; electronIdx: number } | null = null;
    let minDistance = 28;  // increased snap radius for easier bonding

    atoms.forEach(atom => {
      if (atom.id === activeBondStart.atomId) return;
      const def = ATOM_DEFS[atom.symbol];
      for (let i = 0; i < def.valency; i++) {
        const isBonded = bonds.some(b =>
          (b.atomAId === atom.id && b.electronAIdx === i) ||
          (b.atomBId === atom.id && b.electronBIdx === i)
        );
        if (isBonded) continue;
        const coords = getElectronCoords(atom, i);
        const dist = Math.hypot(mousePos.x - coords.x, mousePos.y - coords.y);
        if (dist < minDistance) { target = { atomId: atom.id, electronIdx: i }; minDistance = dist; }
      }
    });

    if (target) {
      audio.playZap();
      const t = target as { atomId: string; electronIdx: number };
      const newBond: BondInstance = {
        id: `bond_${Math.random().toString(36).substr(2, 9)}`,
        atomAId: activeBondStart.atomId,
        electronAIdx: activeBondStart.electronIdx,
        atomBId: t.atomId,
        electronBIdx: t.electronIdx,
        isNew: true,
      };
      setBonds(prev => [...prev, newBond]);
      setTimeout(() => {
        setBonds(prev => prev.map(b => b.id === newBond.id ? { ...b, isNew: false } : b));
      }, 600);
      setVerificationResult(null);
    } else {
      audio.playError();
    }
    setActiveBondStart(null);
  };

  /* ─── Verify molecule ─── */
  const verifyMolecule = () => {
    audio.playClick();
    if (atoms.length === 0) { audio.playError(); return; }

    const atomBondsCount: Record<string, number> = {};
    atoms.forEach(a => { atomBondsCount[a.id] = 0; });
    bonds.forEach(b => {
      if (atomBondsCount[b.atomAId] !== undefined) atomBondsCount[b.atomAId]++;
      if (atomBondsCount[b.atomBId] !== undefined) atomBondsCount[b.atomBId]++;
    });

    let allSatisfied = true;
    const unsatisfiedAtoms: string[] = [];
    atoms.forEach(atom => {
      const def = ATOM_DEFS[atom.symbol];
      if (atomBondsCount[atom.id] !== def.requiredBonds) {
        allSatisfied = false;
        unsatisfiedAtoms.push(atom.symbol);
      }
    });

    if (!allSatisfied) {
      audio.playError();
      setVerificationResult({
        isValid: false, nameGeo: 'არასტაბილური ბმები', nameEng: 'Unstable',
        formula: '',
        description: `${unsatisfiedAtoms.join(', ')} — ელექტრონები ჯერ კიდევ თავისუფალია. სცადეთ ყველა მწვანე ელექტრონი დააკავშიროთ!`,
        xpEarned: 0,
      });
      return;
    }

    const counts: Record<string, number> = {};
    atoms.forEach(a => { counts[a.symbol] = (counts[a.symbol] || 0) + 1; });
    const H = counts['H'] || 0, O = counts['O'] || 0, C = counts['C'] || 0;
    const Na = counts['Na'] || 0, Cl = counts['Cl'] || 0;
    const n = atoms.length;

    let nameGeo = '', nameEng = '', formula = '', description = '', xpAward = 50;
    if      (H===2&&O===1&&n===3)  { nameGeo='წყალი';          nameEng='Water';                formula='H₂O';  description='წყლის მოლეკულა — სიცოცხლის საფუძველი!'; }
    else if (Na===1&&Cl===1&&n===2) { nameGeo='სუფრის მარილი'; nameEng='Table Salt';           formula='NaCl'; description='ნატრიუმის იონი (+) და ქლორი (–) ქმნის ჩვენ ყოველდღიურ მარილს!'; }
    else if (C===1&&O===2&&n===3)   { nameGeo='ნახშირორჟანგი'; nameEng='Carbon Dioxide';       formula='CO₂';  description='ნახშირბადი ორ ჟანგბადს ორმაგი ბმებით უკავშირდება!'; }
    else if (C===1&&H===4&&n===5)   { nameGeo='მეთანი';         nameEng='Methane';              formula='CH₄';  description='უმარტივესი ნახშირწყალბადი — ბუნებრივი გაზი!'; }
    else if (H===1&&Cl===1&&n===2)  { nameGeo='მარილმჟავა';    nameEng='Hydrochloric Acid';    formula='HCl';  description='ძლიერი მჟავა — ჩვენს კუჭში ბაქტერიებს კლავს!'; }
    else if (H===2&&n===2)          { nameGeo='წყალბადის გაზი';nameEng='Hydrogen Gas';         formula='H₂';   description='ყველაზე მსუბუქი გაზი სამყაროში!'; }
    else if (O===2&&n===2)          { nameGeo='ჟანგბადი';       nameEng='Oxygen Gas';           formula='O₂';   description='ჩვენ ვსუნთქავთ O₂-ს — სიცოცხლისთვის აუცილებელი!'; }
    else {
      nameGeo='უცნობი ნაერთი'; nameEng='Unknown Compound';
      formula = Object.entries(counts).map(([s, c]) => `${s}${c > 1 ? c : ''}`).join('');
      description = 'სტაბილური მოლეკულა, მაგრამ ჩვენი სიაში არ არის. სცადეთ H₂O, NaCl, ან CO₂!';
      xpAward = 15;
    }

    if (puzzleMode) {
      const config = PUZZLE_LEVELS[levelId];
      if (config && formula === config.formula) {
        audio.playSuccess();
        xpAward = config.xpReward;
        updateProgress(xpAward, levelId + 1, `level_${levelId}_completed`);
        setVerificationResult({ isValid: true, nameGeo: config.nameGeo, nameEng: nameEng, formula: config.formula, description: `🎉 გამარჯვება! ${config.nameGeo} (${config.formula}) შეიქმნა!`, xpEarned: xpAward });
        setCelebrationVisible(true);
        onLevelComplete?.(levelId, xpAward);
      } else {
        audio.playError();
        setVerificationResult({
          isValid: false, nameGeo: 'არასწორი', nameEng: 'Wrong', formula: '',
          description: `ეს არ არის ${PUZZLE_LEVELS[levelId]?.formula}. გააგრძელეთ ცდა!`,
          xpEarned: 0,
        });
      }
      return;
    }

    audio.playSuccess();
    updateProgress(xpAward);
    setVerificationResult({ isValid: true, nameGeo, nameEng, formula, description, xpEarned: xpAward });
  };

  /* ─── Render helpers ─── */
  const selectedAtomDef = selectedAtom
    ? ATOM_DEFS[atoms.find(a => a.id === selectedAtom)?.symbol || '']
    : null;

  const level = puzzleMode ? PUZZLE_LEVELS[levelId] : null;

  const gradientDefs = Object.entries(ATOM_DEFS).map(([sym, def]) => (
    <radialGradient key={sym} id={`atomGrad_${sym}`} cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
      <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.9" />
      <stop offset="20%"  stopColor={def.color} stopOpacity="0.85" />
      <stop offset="70%"  stopColor={def.color} stopOpacity="0.4" />
      <stop offset="100%" stopColor="#010204" stopOpacity="0.95" />
    </radialGradient>
  ));

  /* ═══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="sandbox-layout animate-fade-in">
      <div className="sandbox-grid-container">

        {/* ── Left Sidebar ── */}
        <div className="sandbox-sidebar glass-panel glass-panel-upgrade">
          {puzzleMode && level ? (
            <div className="puzzle-mission-sidebar">
              {/* Back button */}
              {onBackToPuzzles && (
                <button className="btn-secondary w-full" onClick={onBackToPuzzles}
                  style={{ marginBottom: '0.75rem', height: '34px', fontSize: '0.78rem', gap: '0.4rem' }}>
                  <ChevronLeft size={14} /> ამოცანებზე დაბრუნება
                </button>
              )}

              {/* Level badge */}
              <div className="level-progress-badge">
                <span className="level-badge-text">დონე {levelId} / 5</span>
                <span className={`bond-type-tag ${level.tutorial.bondType}`}>{level.tutorial.bondTypeName}</span>
              </div>

              {/* Target molecule display */}
              <div className="target-molecule-card">
                <div className="target-formula-glow">{level.formula}</div>
                <div className="target-name">{level.nameGeo}</div>
              </div>

              {/* Progress bar */}
              <div className="bonds-progress-section">
                <div className="bonds-progress-label">
                  <span>ბმები</span>
                  <span className="bonds-count">{currentBonds} / {Math.round(totalRequiredBonds)}</span>
                </div>
                <div className="bonds-progress-track">
                  <div className="bonds-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              {/* Visual step-by-step tutorial */}
              <div className="visual-tutorial-panel">
                <div className="tutorial-panel-title">📋 ნაბიჯ-ნაბიჯ გეგმა</div>

                {/* Bond diagram mini-SVG */}
                <div className="bond-diagram-svg-wrapper">
                  {level.tutorial.bondType === 'covalent' ? (
                    <svg width="100%" height="52" viewBox="0 0 200 52">
                      <circle cx="40"  cy="26" r="18" fill="#1e293b" stroke="#60a5fa" strokeWidth="2" />
                      <circle cx="160" cy="26" r="18" fill="#1e293b" stroke="#f87171" strokeWidth="2" />
                      <text x="40"  y="31" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800">A</text>
                      <text x="160" y="31" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800">B</text>
                      {/* shared electrons */}
                      <circle cx="90" cy="26" r="5" fill="#39ff14" opacity="0.9" className="animate-pulse-glow" />
                      <circle cx="110" cy="26" r="5" fill="#39ff14" opacity="0.9" className="animate-pulse-glow" />
                      <line x1="58" y1="26" x2="85" y2="26" stroke="#00f2fe" strokeWidth="2" strokeDasharray="3 2" />
                      <line x1="115" y1="26" x2="142" y2="26" stroke="#00f2fe" strokeWidth="2" strokeDasharray="3 2" />
                    </svg>
                  ) : (
                    <svg width="100%" height="52" viewBox="0 0 200 52">
                      <circle cx="50"  cy="26" r="18" fill="#1e293b" stroke="#c084fc" strokeWidth="2" />
                      <circle cx="150" cy="26" r="18" fill="#1e293b" stroke="#34d399" strokeWidth="2" />
                      <text x="50"  y="31" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">Na⁺</text>
                      <text x="150" y="31" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800">Cl⁻</text>
                      {/* arrow showing electron transfer */}
                      <path d="M 75 22 L 120 22" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrowhead)" />
                      <circle cx="80" cy="22" r="4" fill="#c084fc" opacity="0.8" />
                      <defs>
                        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                          <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
                        </marker>
                      </defs>
                    </svg>
                  )}
                </div>

                {/* Step list */}
                <div className="tutorial-steps-list">
                  {level.tutorial.steps.map((step, idx) => (
                    <div key={idx} className={`tutorial-step-row ${tutorialStep === idx ? 'active' : tutorialStep > idx ? 'done' : ''}`}>
                      <span className="tutorial-step-num">{tutorialStep > idx ? '✓' : idx + 1}</span>
                      <span className="tutorial-step-icon">{step.icon}</span>
                      <span className="tutorial-step-text">{step.text}</span>
                    </div>
                  ))}
                </div>

                {/* Fun fact */}
                <div className="fun-fact-box">
                  {level.tutorial.funFact}
                </div>
              </div>
            </div>
          ) : (
            <>
              <h3>ატომების ყუთი</h3>
              <p className="sidebar-subtitle">დააწკაპუნეთ ატომის დასამატებლად</p>
              <div className="atom-spawner-list">
                {Object.entries(ATOM_DEFS).map(([symbol, def]) => (
                  <div key={symbol} className="spawner-card" onClick={() => spawnAtom(symbol)}
                    style={{ borderColor: def.color + '55' }}>
                    <div className="spawner-atom-preview"
                      style={{ background: `radial-gradient(circle at 35% 35%, ${def.color}bb, ${def.color}33)`, boxShadow: `0 0 14px ${def.color}66` }}>
                      {symbol}
                    </div>
                    <div className="spawner-details">
                      <span className="spawner-name">{def.name}</span>
                      <span className="spawner-valency">ვალენტობა: {def.valency} | ბმები: {def.requiredBonds}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Selected atom info (free-play only) */}
          {selectedAtom && selectedAtomDef && !puzzleMode && (
            <div className="selected-atom-card animate-fade-in">
              <div className="selected-card-header">
                <h4 style={{ color: selectedAtomDef.color }}>● {selectedAtomDef.name}</h4>
                <button className="delete-btn" onClick={deleteSelectedAtom} title="წაშლა">✕</button>
              </div>
              <div className="selected-atom-info">
                <div className="info-row"><span>სიმბოლო:</span><strong>{selectedAtomDef.symbol}</strong></div>
                <div className="info-row"><span>ვალენტობა:</span><strong>{selectedAtomDef.valency}</strong></div>
                <div className="info-row"><span>საჭ. ბმები:</span>
                  <strong>{selectedAtomDef.requiredBonds} / {getBondCountForAtom(selectedAtom)} შეერთ.</strong>
                </div>
              </div>
              <p className="info-desc">გაიღე ბმა მწვანე ელექტრონებიდან სხვა ატომამდე.</p>
            </div>
          )}
        </div>

        {/* ── Canvas ── */}
        <div className="sandbox-canvas-wrapper glass-panel glass-panel-upgrade">
          <div className="canvas-header">
            <span className="canvas-title">
              {puzzleMode ? `🧪 ${level?.nameGeo} — ${level?.formula}` : '🔬 ლაბორატორიის დაფა'}
            </span>
            <div className="canvas-controls">
              <button className="btn-secondary" onClick={clearCanvas}>
                <RotateCcw size={13} /> {puzzleMode ? 'თავიდან' : 'გასუფთავება'}
              </button>
              <button className="btn-primary" onClick={verifyMolecule}>
                <ShieldCheck size={13} /> შემოწმება
              </button>
            </div>
          </div>

          <svg
            ref={canvasRef}
            className="sandbox-svg cyber-grid-bg"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <defs>
              {gradientDefs}
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="strongGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="9" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="atom3dShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="4" dy="10" stdDeviation="6" floodColor="#000000" floodOpacity="0.55" />
              </filter>
            </defs>

            {/* Grid */}
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Empty state hint */}
            {atoms.length === 0 && (
              <g>
                <text x="50%" y="45%" textAnchor="middle" fill="rgba(255,255,255,0.12)"
                  fontSize="18" fontWeight="600" fontFamily="Inter, sans-serif">
                  {puzzleMode ? 'ატომები ავტომატურად განთავსდება' : '← ატომები დაამატეთ მარცხნიდან'}
                </text>
                <text x="50%" y="52%" textAnchor="middle" fill="rgba(255,255,255,0.07)"
                  fontSize="13" fontFamily="Inter, sans-serif">
                  {puzzleMode ? '' : 'შემდეგ დააკავშირეთ ელექტრონები ბმის შესაქმნელად'}
                </text>
              </g>
            )}

            {/* Bonds */}
            {bonds.map(bond => {
              const atomA = atoms.find(a => a.id === bond.atomAId);
              const atomB = atoms.find(a => a.id === bond.atomBId);
              if (!atomA || !atomB) return null;
              const start = getElectronCoords(atomA, bond.electronAIdx);
              const end   = getElectronCoords(atomB, bond.electronBIdx);
              const isIonic = (atomA.symbol === 'Na' && atomB.symbol === 'Cl') ||
                              (atomA.symbol === 'Cl' && atomB.symbol === 'Na');
              const bondColor = isIonic ? '#c084fc' : '#22d3ee';
              const glowColor = isIonic ? '#a855f7' : '#00f2fe';
              const bondLen = Math.hypot(end.x - start.x, end.y - start.y);
              return (
                <g key={bond.id} className={bond.isNew ? 'bond-glow' : ''}>
                  {/* glow trail */}
                  <line x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                    stroke={glowColor} strokeWidth="8" opacity="0.18" filter="url(#glow)" />
                  {/* main line */}
                  <line x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                    stroke={bondColor} strokeWidth={isIonic ? 2.5 : 3}
                    strokeDasharray={isIonic ? '5 4' : '0'}
                    strokeDashoffset={bond.isNew ? bondLen : 0}
                    style={bond.isNew ? { transition: 'stroke-dashoffset 0.5s ease' } : {}}
                  />
                  {/* center dot */}
                  <circle cx={(start.x + end.x) / 2} cy={(start.y + end.y) / 2}
                    r="3" fill={bondColor} opacity="0.7" />
                </g>
              );
            })}

            {/* Draft bond while dragging from electron */}
            {activeBondStart && (
              <line
                x1={activeBondStart.x} y1={activeBondStart.y}
                x2={mousePos.x}        y2={mousePos.y}
                stroke="#39ff14" strokeWidth="2" strokeDasharray="5 3" opacity="0.8"
              />
            )}

            {/* Atoms */}
            {atoms.map(atom => {
              const def       = ATOM_DEFS[atom.symbol];
              const isSelected = selectedAtom === atom.id;
              const isHovered  = hoveredAtom === atom.id;
              const bonded     = getBondCountForAtom(atom.id);
              const satisfied  = bonded >= def.requiredBonds;
              const scale      = isHovered || isSelected ? 1.08 : 1;

              return (
                <g key={atom.id}
                  transform={`translate(${atom.x}, ${atom.y}) scale(${scale})`}
                  style={{ cursor: draggingAtomId === atom.id ? 'grabbing' : 'grab', transition: 'transform 0.15s ease' }}
                  onMouseDown={e => handleMouseDownAtom(e, atom.id)}
                  onMouseEnter={() => setHoveredAtom(atom.id)}
                  onMouseLeave={() => setHoveredAtom(null)}
                >
                  {/* Outer orbit ring — spins */}
                  <circle r={def.radius + 2} fill="none"
                    stroke={isSelected ? 'var(--color-cyan)' : satisfied ? '#10b981' : def.color}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    strokeDasharray="4 3"
                    opacity={isSelected ? 1 : 0.5}
                    className="orbit-circle"
                  />

                  {/* Halo glow */}
                  {(isSelected || isHovered) && (
                    <circle r={def.radius + 8} fill={def.color} opacity="0.08" filter="url(#strongGlow)" />
                  )}

                  {/* Atom body with radial gradient */}
                  <circle r={def.radius - 6} fill={`url(#atomGrad_${atom.symbol})`} filter="url(#atom3dShadow)" />

                  {/* Nucleus core */}
                  <circle r={def.radius - 12}
                    fill="#0f172a"
                    stroke={satisfied ? '#10b981' : def.color}
                    strokeWidth={satisfied ? 2.5 : 2}
                    style={{ filter: `drop-shadow(0 0 ${isSelected ? 10 : 5}px ${def.color}aa)` }}
                  />

                  {/* Symbol */}
                  <text textAnchor="middle" dy=".35em" fill="#ffffff"
                    fontSize={atom.symbol.length > 1 ? '12px' : '15px'}
                    fontWeight="800" fontFamily="var(--font-display)"
                    style={{ pointerEvents: 'none', letterSpacing: '-0.5px' }}>
                    {atom.symbol}
                  </text>

                  {/* Satisfied badge */}
                  {satisfied && (
                    <text x={def.radius - 4} y={-(def.radius - 4)} textAnchor="middle"
                      fill="#10b981" fontSize="11" style={{ pointerEvents: 'none' }}>✓</text>
                  )}

                  {/* Valence electrons */}
                  {Array.from({ length: def.valency }).map((_, idx) => {
                    const local = getElectronCoords({ ...atom, x: 0, y: 0 }, idx);
                    const isBonded = bonds.some(b =>
                      (b.atomAId === atom.id && b.electronAIdx === idx) ||
                      (b.atomBId === atom.id && b.electronBIdx === idx)
                    );
                    return (
                      <circle key={idx}
                        cx={local.x} cy={local.y}
                        r={isBonded ? 4 : 5}
                        fill={isBonded ? '#22d3ee' : '#39ff14'}
                        stroke="#080c14" strokeWidth="1.5"
                        onMouseDown={e => handleMouseDownElectron(e, atom.id, idx)}
                        style={{ cursor: isBonded ? 'default' : 'crosshair' }}
                        className={isBonded ? '' : 'animate-pulse-glow'}
                      >
                        <title>{isBonded ? 'დაკავშირებული' : 'გაიღე ბმა'}</title>
                      </circle>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ── Inline verification result (non-celebration) ── */}
      {verificationResult && !celebrationVisible && (
        <div className={`verification-result-panel glass-panel animate-fade-in ${verificationResult.isValid ? 'success' : 'error'}`}
          style={{ borderColor: verificationResult.isValid ? 'var(--color-green)' : 'var(--color-red)' }}>
          <div className="result-header">
            <div className="result-status-icon"
              style={{ backgroundColor: verificationResult.isValid ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                       color: verificationResult.isValid ? 'var(--color-green)' : 'var(--color-red)' }}>
              {verificationResult.isValid ? <Award size={22} /> : <Info size={22} />}
            </div>
            <div className="result-title-block">
              <h3>{verificationResult.isValid ? `✅ ${verificationResult.formula}` : '❌ შეცდომა'}</h3>
              <span className="result-sub">{verificationResult.nameGeo} / {verificationResult.nameEng}</span>
            </div>
            {verificationResult.isValid && (
              <span className="xp-award-banner animate-pulse-glow">+{verificationResult.xpEarned} XP</span>
            )}
          </div>
          <p className="result-description">{verificationResult.description}</p>
          <button className="btn-secondary" onClick={() => setVerificationResult(null)}
            style={{ alignSelf: 'flex-end', marginTop: '0.25rem' }}>
            დახურვა ✕
          </button>
        </div>
      )}

      {/* ── Celebration overlay ── */}
      {celebrationVisible && verificationResult?.isValid && (
        <div className="celebration-overlay glass-panel animate-fade-in">
          {/* Confetti particles */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="confetti-particle" style={{
              left: `${10 + i * 11}%`,
              animationDelay: `${i * 0.08}s`,
              background: ['#00f2fe','#a855f7','#f59e0b','#10b981','#f87171','#60a5fa','#34d399','#c084fc'][i],
            }} />
          ))}

          <div className="celebration-content">
            <div className="celebration-formula">{verificationResult.formula}</div>
            <h2 className="celebration-title">🎉 {verificationResult.nameGeo}!</h2>
            <p className="celebration-desc">{verificationResult.description}</p>
            <div className="celebration-xp">+{verificationResult.xpEarned} XP</div>

            <div className="celebration-actions">
              <button className="btn-secondary" onClick={() => {
                setCelebrationVisible(false);
                setVerificationResult(null);
                setResetKey(k => k + 1);
              }}>
                <RotateCcw size={14} /> თავიდან
              </button>
              {levelId < 5 ? (
                <button className="btn-primary" onClick={() => {
                  setCelebrationVisible(false);
                  setVerificationResult(null);
                  onBackToPuzzles?.();
                }}>
                  შემდეგი დონე ➔
                </button>
              ) : (
                <button className="btn-primary" onClick={() => {
                  setCelebrationVisible(false);
                  setVerificationResult(null);
                  onBackToPuzzles?.();
                }}>
                  🏆 ყველა დონე დასრულდა!
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sandbox;
