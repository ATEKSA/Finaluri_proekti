import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { audio } from '../utils/audio';
import { RotateCcw, ShieldCheck, Info, Trash2, Award } from 'lucide-react';

interface AtomType {
  symbol: string;
  name: string;
  nameEng: string;
  valency: number; // valence electrons
  requiredBonds: number; // to satisfy octet rule
  color: string;
  glowColor: string;
  radius: number;
}

const ATOM_DEFS: Record<string, AtomType> = {
  H: { symbol: 'H', name: 'წყალბადი', nameEng: 'Hydrogen', valency: 1, requiredBonds: 1, color: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.4)', radius: 30 },
  O: { symbol: 'O', name: 'ჟანგბადი', nameEng: 'Oxygen', valency: 6, requiredBonds: 2, color: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.4)', radius: 38 },
  C: { symbol: 'C', name: 'ნახშირბადი', nameEng: 'Carbon', valency: 4, requiredBonds: 4, color: '#6b7280', glowColor: 'rgba(107, 114, 128, 0.4)', radius: 42 },
  Na: { symbol: 'Na', name: 'ნატრიუმი', nameEng: 'Sodium', valency: 1, requiredBonds: 1, color: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.4)', radius: 45 },
  Cl: { symbol: 'Cl', name: 'ქლორი', nameEng: 'Chlorine', valency: 7, requiredBonds: 1, color: '#10b981', glowColor: 'rgba(16, 185, 129, 0.4)', radius: 40 }
};

export interface PuzzleLevelConfig {
  id: number;
  nameGeo: string;
  formula: string;
  description: string;
  atomsToSpawn: string[];
  xpReward: number;
}

export const PUZZLE_LEVELS: Record<number, PuzzleLevelConfig> = {
  1: { id: 1, nameGeo: 'წყალი', formula: 'H₂O', description: 'დააკავშირეთ 2 წყალბადის (H) და 1 ჟანგბადის (O) ატომი წყლის (H₂O) მოლეკულის მისაღებად.', atomsToSpawn: ['H', 'H', 'O'], xpReward: 50 },
  2: { id: 2, nameGeo: 'სუფრის მარილი', formula: 'NaCl', description: 'ნატრიუმის (Na) და ქლორის (Cl) ატომებისგან შექმენით იონური მარილი (NaCl).', atomsToSpawn: ['Na', 'Cl'], xpReward: 75 },
  3: { id: 3, nameGeo: 'ნახშირორჟანგი', formula: 'CO₂', description: 'შეაერთეთ ნახშირბადის (C) ატომი ჟანგბადის (O) ორ ატომთან ორმაგი კოვალენტური ბმებით.', atomsToSpawn: ['C', 'O', 'O'], xpReward: 100 },
  4: { id: 4, nameGeo: 'მეთანი', formula: 'CH₄', description: 'დააკავშირეთ ნახშირბადის (C) ატომი 4 წყალბადთან (H) მარტივი კოვალენტური კავშირებით.', atomsToSpawn: ['C', 'H', 'H', 'H', 'H'], xpReward: 120 },
  5: { id: 5, nameGeo: 'მარილმჟავა', formula: 'HCl', description: 'შეაერთეთ 1 წყალბადის (H) და 1 ქლორის (Cl) ატომი მჟავას მოლეკულის შესაქმნელად.', atomsToSpawn: ['H', 'Cl'], xpReward: 150 }
};

interface AtomInstance {
  id: string;
  symbol: string;
  x: number;
  y: number;
}

interface BondInstance {
  id: string;
  atomAId: string;
  electronAIdx: number;
  atomBId: string;
  electronBIdx: number;
}

interface SandboxProps {
  puzzleMode?: boolean;
  levelId?: number;
  onBackToPuzzles?: () => void;
  onLevelComplete?: (levelId: number, xpEarned: number) => void;
}

export const Sandbox: React.FC<SandboxProps> = ({ 
  puzzleMode = false, 
  levelId = 1, 
  onBackToPuzzles, 
  onLevelComplete 
}) => {
  const { updateProgress } = useAuth();
  const [atoms, setAtoms] = useState<AtomInstance[]>([]);
  const [bonds, setBonds] = useState<BondInstance[]>([]);
  const [selectedAtom, setSelectedAtom] = useState<string | null>(null);
  
  // Dragging states
  const [draggingAtomId, setDraggingAtomId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [activeBondStart, setActiveBondStart] = useState<{ atomId: string; electronIdx: number; x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Verification results
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    nameGeo: string;
    nameEng: string;
    formula: string;
    description: string;
    xpEarned: number;
  } | null>(null);

  useEffect(() => {
    if (puzzleMode && levelId) {
      const config = PUZZLE_LEVELS[levelId];
      if (config) {
        const spawnedAtoms = config.atomsToSpawn.map((symbol, idx) => {
          const spacing = 120;
          const startX = 140;
          return {
            id: `${symbol}_puzzle_${idx}_${Math.random().toString(36).substr(2, 5)}`,
            symbol,
            x: startX + idx * spacing,
            y: 220 + (idx % 2 === 0 ? 30 : -30)
          };
        });
        setAtoms(spawnedAtoms);
        setBonds([]);
        setVerificationResult(null);
        setSelectedAtom(null);
      }
    } else {
      setAtoms([]);
      setBonds([]);
      setVerificationResult(null);
      setSelectedAtom(null);
    }
  }, [puzzleMode, levelId]);

  const canvasRef = useRef<SVGSVGElement | null>(null);

  // Spawns a new atom in the center of the canvas
  const spawnAtom = (symbol: string) => {
    audio.playClick();
    const id = `${symbol}_${Math.random().toString(36).substr(2, 9)}`;
    const canvas = canvasRef.current;
    let x = 300;
    let y = 200;
    
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      x = rect.width / 2 + (Math.random() - 0.5) * 50;
      y = rect.height / 2 + (Math.random() - 0.5) * 50;
    }

    setAtoms(prev => [...prev, { id, symbol, x, y }]);
    setVerificationResult(null);
  };

  // Clears the canvas
  const clearCanvas = () => {
    audio.playClick();
    setAtoms([]);
    setBonds([]);
    setVerificationResult(null);
    setSelectedAtom(null);
  };

  // Helper to calculate electron coordinates
  const getElectronCoords = (atom: AtomInstance, idx: number) => {
    const def = ATOM_DEFS[atom.symbol];
    const angle = (2 * Math.PI / def.valency) * idx;
    return {
      x: atom.x + def.radius * Math.cos(angle),
      y: atom.y + def.radius * Math.sin(angle)
    };
  };

  // Handle Dragging Atoms
  const handleMouseDownAtom = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedAtom(id);
    setDraggingAtomId(id);
    const atom = atoms.find(a => a.id === id);
    if (atom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - atom.x,
        y: e.clientY - rect.top - atom.y
      });
    }
  };

  // Start Drawing Bond from electron
  const handleMouseDownElectron = (e: React.MouseEvent, atomId: string, electronIdx: number) => {
    e.stopPropagation();
    const atom = atoms.find(a => a.id === atomId);
    if (atom) {
      // Check if this electron is already bonded
      const isAlreadyBonded = bonds.some(b => 
        (b.atomAId === atomId && b.electronAIdx === electronIdx) ||
        (b.atomBId === atomId && b.electronBIdx === electronIdx)
      );

      if (isAlreadyBonded) {
        audio.playError();
        return;
      }

      audio.playClick();
      const coords = getElectronCoords(atom, electronIdx);
      setActiveBondStart({ atomId, electronIdx, ...coords });
    }
  };

  // Canvas Mouse Move
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

  // Canvas Mouse Up
  const handleMouseUp = () => {
    setDraggingAtomId(null);

    if (activeBondStart) {
      // Find if released near an electron
      let target: { atomId: string; electronIdx: number } | null = null;
      let minDistance = 20; // snapping radius

      atoms.forEach(atom => {
        if (atom.id === activeBondStart.atomId) return; // Can't bond with self

        const def = ATOM_DEFS[atom.symbol];
        for (let i = 0; i < def.valency; i++) {
          // Check if this electron is already bonded
          const isBonded = bonds.some(b => 
            (b.atomAId === atom.id && b.electronAIdx === i) ||
            (b.atomBId === atom.id && b.electronBIdx === i)
          );

          if (isBonded) continue;

          const coords = getElectronCoords(atom, i);
          const dist = Math.hypot(mousePos.x - coords.x, mousePos.y - coords.y);
          if (dist < minDistance) {
            target = { atomId: atom.id, electronIdx: i };
            minDistance = dist;
          }
        }
      });

      if (target) {
        audio.playZap();
        const newBond: BondInstance = {
          id: `bond_${Math.random().toString(36).substr(2, 9)}`,
          atomAId: activeBondStart.atomId,
          electronAIdx: activeBondStart.electronIdx,
          atomBId: (target as any).atomId,
          electronBIdx: (target as any).electronIdx
        };
        setBonds(prev => [...prev, newBond]);
        setVerificationResult(null);
      } else {
        audio.playError();
      }

      setActiveBondStart(null);
    }
  };

  // Deletes selected atom
  const deleteSelectedAtom = () => {
    if (!selectedAtom) return;
    audio.playClick();
    setAtoms(prev => prev.filter(a => a.id !== selectedAtom));
    setBonds(prev => prev.filter(b => b.atomAId !== selectedAtom && b.atomBId !== selectedAtom));
    setSelectedAtom(null);
    setVerificationResult(null);
  };

  // Graph logic to verify molecule stability
  const verifyMolecule = () => {
    audio.playClick();
    if (atoms.length === 0) {
      audio.playError();
      return;
    }

    // 1. Calculate bonds count per atom
    const atomBondsCount: Record<string, number> = {};
    atoms.forEach(a => { atomBondsCount[a.id] = 0; });
    bonds.forEach(b => {
      if (atomBondsCount[b.atomAId] !== undefined) atomBondsCount[b.atomAId]++;
      if (atomBondsCount[b.atomBId] !== undefined) atomBondsCount[b.atomBId]++;
    });

    // 2. Check if all atoms meet their exact required bonds count (satisfied octet)
    let allSatisfied = true;
    const unsatisfiedAtoms: string[] = [];

    atoms.forEach(atom => {
      const def = ATOM_DEFS[atom.symbol];
      const bondsCount = atomBondsCount[atom.id];
      if (bondsCount !== def.requiredBonds) {
        allSatisfied = false;
        unsatisfiedAtoms.push(atom.symbol);
      }
    });

    if (!allSatisfied) {
      audio.playError();
      setVerificationResult({
        isValid: false,
        nameGeo: 'არასტაბილური ბმები',
        nameEng: 'Unstable Molecule',
        formula: '',
        description: `მოლეკულა ვერ შეიქმნა. ზოგიერთ ატომს ელექტრონები აკლია ან ზედმეტი აქვს. ატომები: ${unsatisfiedAtoms.join(', ')} არ არის კმაყოფილი.`,
        xpEarned: 0
      });
      return;
    }

    // 3. Count frequencies of atoms to identify formula
    const counts: Record<string, number> = {};
    atoms.forEach(a => {
      counts[a.symbol] = (counts[a.symbol] || 0) + 1;
    });

    // Match formula
    let moleculeNameGeo = '';
    let moleculeNameEng = '';
    let formula = '';
    let description = '';
    let xpAward = 50;

    // Chemical Formula Matching Keys
    const H = counts['H'] || 0;
    const O = counts['O'] || 0;
    const C = counts['C'] || 0;
    const Na = counts['Na'] || 0;
    const Cl = counts['Cl'] || 0;

    const totalAtoms = atoms.length;

    if (H === 2 && O === 1 && totalAtoms === 3) {
      moleculeNameGeo = 'წყალი';
      moleculeNameEng = 'Water';
      formula = 'H₂O';
      description = 'წყლის მოლეკულაში ჟანგბადის ერთი ატომი ორ წყალბადის ატომს უზიარებს თითო ელექტრონს კოვალენტური ბმით. ეს ყველაზე მნიშვნელოვანი სითხეა დედამიწაზე!';
    } else if (Na === 1 && Cl === 1 && totalAtoms === 2) {
      moleculeNameGeo = 'სუფრის მარილი';
      moleculeNameEng = 'Table Salt';
      formula = 'NaCl';
      description = 'ნატრიუმი (Na) გადასცემს თავის 1 სავალენტო ელექტრონს ქლორს (Cl), რითაც იქმნება იონური ბმა. ეს არის ჩვენი ყოველდღიური მარილი!';
    } else if (C === 1 && O === 2 && totalAtoms === 3) {
      moleculeNameGeo = 'ნახშირორჟანგი';
      moleculeNameEng = 'Carbon Dioxide';
      formula = 'CO₂';
      description = 'ნახშირბადის ერთი ატომი ქმნის ორმაგ კოვალენტურ ბმას ჟანგბადის ორ ატომთან. მას გამოყოფენ ცოცხალი ორგანიზმები სუნთქვისას.';
    } else if (C === 1 && H === 4 && totalAtoms === 5) {
      moleculeNameGeo = 'მეთანი';
      moleculeNameEng = 'Methane';
      formula = 'CH₄';
      description = 'მეთანი არის უმარტივესი ნახშირწყალბადი. ნახშირბადის ატომი აზიარებს თავის 4 ელექტრონს 4 სხვადასხვა წყალბადთან.';
    } else if (H === 1 && Cl === 1 && totalAtoms === 2) {
      moleculeNameGeo = 'მარილმჟავა';
      moleculeNameEng = 'Hydrochloric Acid';
      formula = 'HCl';
      description = 'წყალბადისა და ქლორის კოვალენტური კავშირით მიღებული ძლიერი მჟავა, რომელიც ადამიანის კუჭის წვენის შემადგენელი ნაწილია.';
    } else if (H === 2 && totalAtoms === 2) {
      moleculeNameGeo = 'წყალბადის გაზი';
      moleculeNameEng = 'Hydrogen Gas';
      formula = 'H₂';
      description = 'ორი წყალბადის ატომი აზიარებს თავის ერთადერთ ელექტრონს მარტივი კოვალენტური ბმით. ის სამყაროში ყველაზე გავრცელებული გაზია.';
    } else if (O === 2 && totalAtoms === 2) {
      moleculeNameGeo = 'ჟანგბადის გაზი';
      moleculeNameEng = 'Oxygen Gas';
      formula = 'O₂';
      description = 'ორი ჟანგბადის ატომი უზიარებს ერთმანეთს ორ-ორ ელექტრონს, ქმნის მტკიცე ორმაგ კოვალენტურ ბმას. ჩვენ მას ვსუნთქავთ!';
    } else {
      // Satisfied bonds but unrecognized molecule combination
      moleculeNameGeo = 'უცნობი ნაერთი';
      moleculeNameEng = 'Unrecognized Compound';
      formula = Object.entries(counts).map(([sym, count]) => `${sym}${count > 1 ? count : ''}`).join('');
      description = 'თქვენ შექმენით სტაბილური მოლეკულა, მაგრამ ის არ არის ჩვენს საგანმანათლებლო სიაში. შეეცადეთ შექმნათ ნაცნობი ნაერთები (მაგალითად H₂O, NaCl, CO₂)!';
      xpAward = 15;
    }

    // In puzzleMode, we check if the formula matches the target formula
    if (puzzleMode) {
      const config = PUZZLE_LEVELS[levelId];
      if (config && formula === config.formula) {
        audio.playSuccess();
        xpAward = config.xpReward;
        
        // Update user profile progress (automatically handles real firebase or mock fallback)
        updateProgress(xpAward, levelId + 1, `level_${levelId}_completed`);
        
        setVerificationResult({
          isValid: true,
          nameGeo: config.nameGeo,
          nameEng: config.nameGeo,
          formula: config.formula,
          description: `გილოცავთ! თქვენ წარმატებით შექმენით ${config.nameGeo} (${config.formula}) და დაასრულეთ მე-${levelId} დონე!`,
          xpEarned: xpAward
        });
        
        // Notify parent level completion
        onLevelComplete?.(levelId, xpAward);
      } else {
        audio.playError();
        setVerificationResult({
          isValid: false,
          nameGeo: 'არასწორი მოლეკულა',
          nameEng: 'Incorrect Molecule',
          formula: '',
          description: `ეს არ არის დონის მიზანი. გთხოვთ შეაერთოთ ატომები ისე, რომ მიიღოთ ${PUZZLE_LEVELS[levelId]?.nameGeo} (${PUZZLE_LEVELS[levelId]?.formula}).`,
          xpEarned: 0
        });
      }
      return;
    }

    audio.playSuccess();
    updateProgress(xpAward);

    setVerificationResult({
      isValid: true,
      nameGeo: moleculeNameGeo,
      nameEng: moleculeNameEng,
      formula,
      description,
      xpEarned: xpAward
    });
  };

  const selectedAtomDef = selectedAtom ? ATOM_DEFS[atoms.find(a => a.id === selectedAtom)?.symbol || ''] : null;

  return (
    <div className="sandbox-layout animate-fade-in">
      <div className="sandbox-grid-container">
        
        {/* Left Side: Atom Spawner Panel / Puzzle Info */}
        <div className="sandbox-sidebar glass-panel">
          {puzzleMode ? (
            <div className="puzzle-mission-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {onBackToPuzzles && (
                <button className="btn-secondary w-full" onClick={onBackToPuzzles} style={{ marginBottom: '1rem', height: '36px', fontSize: '0.8rem' }}>
                  ◀ ამოცანებზე დაბრუნება
                </button>
              )}
              <div className="mission-badge" style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', color: 'var(--color-cyan)', padding: '0.4rem 1rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center', marginBottom: '1rem' }}>
                დონე {levelId} / 5
              </div>
              <h3>დონის მიზანი 🎯</h3>
              <p className="mission-desc" style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: '0.75rem 0', textAlign: 'left' }}>
                {PUZZLE_LEVELS[levelId]?.description}
              </p>
              <div className="target-formula-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '0.85rem', textAlign: 'center', margin: '0.85rem 0' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>მოცემული მოლეკულა</span>
                <strong style={{ fontSize: '1.85rem', color: 'var(--color-cyan)', fontFamily: 'var(--font-display)', filter: 'drop-shadow(0 0 8px rgba(0,242,254,0.4))' }}>
                  {PUZZLE_LEVELS[levelId]?.formula}
                </strong>
              </div>
              <div className="mission-tips" style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', background: 'rgba(168, 85, 247, 0.05)', border: '1px dashed rgba(168, 85, 247, 0.25)', padding: '0.75rem', borderRadius: '8px', textAlign: 'left', marginTop: 'auto' }}>
                <strong>რჩევა:</strong> დააკავშირეთ ატომების გარე მწვანე ელექტრონები. ყველა ატომი უნდა იყოს კმაყოფილი და სრულად დაკავშირებული!
              </div>
            </div>
          ) : (
            <>
              <h3>ატომების ყუთი</h3>
              <p className="sidebar-subtitle">დააწკაპუნეთ ატომის დასამატებლად</p>
              
              <div className="atom-spawner-list">
                {Object.entries(ATOM_DEFS).map(([symbol, def]) => (
                  <div 
                    key={symbol} 
                    className="spawner-card"
                    onClick={() => spawnAtom(symbol)}
                    style={{ borderColor: def.color + '44' }}
                  >
                    <div className="spawner-atom-preview" style={{ backgroundColor: def.color, boxShadow: `0 0 15px ${def.color}77` }}>
                      {symbol}
                    </div>
                    <div className="spawner-details">
                      <span className="spawner-name">{def.name}</span>
                      <span className="spawner-valency">სავალენტო: {def.valency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {selectedAtom && selectedAtomDef && (
            <div className="selected-atom-card animate-fade-in">
              <div className="selected-card-header">
                <h4>აქტიური ატომი</h4>
                <button className="delete-btn" onClick={deleteSelectedAtom} title="წაშლა">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="selected-atom-info">
                <div className="info-row">
                  <span>ატომი:</span>
                  <strong>{selectedAtomDef.name} ({selectedAtomDef.symbol})</strong>
                </div>
                <div className="info-row">
                  <span>ბმები:</span>
                  <strong>საჭიროებს {selectedAtomDef.requiredBonds} ბმას</strong>
                </div>
                <p className="info-desc">
                  დააწკაპუნე და გაათრიე მისი გარე ორბიტის მწვანე ელექტრონიდან ხაზი სხვა ატომამდე ბმის შესაქმნელად.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center: Interactive SVG Sandbox Board */}
        <div className="sandbox-canvas-wrapper glass-panel">
          <div className="canvas-header">
            <span className="canvas-title">ლაბორატორიის დაფა</span>
            <div className="canvas-controls">
              <button className="btn-secondary" onClick={clearCanvas}>
                <RotateCcw size={14} /> გასუფთავება
              </button>
              <button className="btn-primary" onClick={verifyMolecule}>
                <ShieldCheck size={14} /> მოლეკულის შემოწმება
              </button>
            </div>
          </div>

          <svg
            ref={canvasRef}
            className="sandbox-svg"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Grid Pattern Background */}
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Render Chemistry Bonds */}
            {bonds.map(bond => {
              const atomA = atoms.find(a => a.id === bond.atomAId);
              const atomB = atoms.find(a => a.id === bond.atomBId);
              if (!atomA || !atomB) return null;
              
              const start = getElectronCoords(atomA, bond.electronAIdx);
              const end = getElectronCoords(atomB, bond.electronBIdx);
              
              const isIonic = (atomA.symbol === 'Na' && atomB.symbol === 'Cl') || (atomA.symbol === 'Cl' && atomB.symbol === 'Na');
              
              return (
                <g key={bond.id}>
                  {/* Glowing background path */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={isIonic ? '#a855f7' : '#00f2fe'}
                    strokeWidth="6"
                    opacity="0.3"
                    filter="url(#glow)"
                  />
                  {/* Clean front line */}
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={isIonic ? '#c084fc' : '#22d3ee'}
                    strokeWidth="3"
                    strokeDasharray={isIonic ? "4 4" : "0"}
                  />
                </g>
              );
            })}

            {/* Render Draft Bond while dragging */}
            {activeBondStart && (
              <line
                x1={activeBondStart.x}
                y1={activeBondStart.y}
                x2={mousePos.x}
                y2={mousePos.y}
                stroke="#39ff14"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            )}

            {/* Render Atoms */}
            {atoms.map(atom => {
              const def = ATOM_DEFS[atom.symbol];
              const isSelected = selectedAtom === atom.id;

              return (
                <g
                  key={atom.id}
                  transform={`translate(${atom.x}, ${atom.y})`}
                  onMouseDown={(e) => handleMouseDownAtom(e, atom.id)}
                  style={{ cursor: draggingAtomId === atom.id ? 'grabbing' : 'grab' }}
                >
                  {/* Outer Glowing Pulsing Orbit */}
                  <circle
                    r={def.radius}
                    fill="none"
                    stroke={isSelected ? 'var(--color-cyan)' : def.color}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray="3 3"
                    opacity={isSelected ? 0.9 : 0.4}
                    className="orbit-circle"
                  />

                  {/* Base Atom Body */}
                  <circle
                    r={def.radius - 8}
                    fill={def.color}
                    opacity="0.15"
                  />

                  {/* Inner Nucleus */}
                  <circle
                    r={def.radius - 12}
                    fill="#1e293b"
                    stroke={def.color}
                    strokeWidth="2.5"
                    filter="url(#glow)"
                    style={{ filter: `drop-shadow(0 0 6px ${def.color}aa)` }}
                  />

                  {/* Nucleus Symbol text */}
                  <text
                    textAnchor="middle"
                    dy=".3em"
                    fill="#ffffff"
                    fontSize="16px"
                    fontWeight="800"
                    fontFamily="var(--font-display)"
                    style={{ pointerEvents: 'none' }}
                  >
                    {atom.symbol}
                  </text>

                  {/* Render Valence Electrons */}
                  {Array.from({ length: def.valency }).map((_, idx) => {
                    const localCoords = getElectronCoords({ ...atom, x: 0, y: 0 }, idx);
                    
                    // Check if this specific electron is bonded
                    const isBonded = bonds.some(b => 
                      (b.atomAId === atom.id && b.electronAIdx === idx) ||
                      (b.atomBId === atom.id && b.electronBIdx === idx)
                    );

                    return (
                      <circle
                        key={idx}
                        cx={localCoords.x}
                        cy={localCoords.y}
                        r={isBonded ? 4.5 : 5.5}
                        fill={isBonded ? '#22d3ee' : '#39ff14'}
                        stroke="#08090c"
                        strokeWidth="1.5"
                        onMouseDown={(e) => handleMouseDownElectron(e, atom.id, idx)}
                        style={{ cursor: isBonded ? 'default' : 'crosshair' }}
                        className={isBonded ? '' : 'animate-pulse-glow'}
                      >
                        <title>{isBonded ? 'დაკავშირებულია' : 'გაავლე ბმა'}</title>
                      </circle>
                    );
                  })}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Verification Overlay Result Card */}
      {verificationResult && (
        <div className="verification-result-panel glass-panel animate-fade-in" style={{ borderColor: verificationResult.isValid ? 'var(--color-green)' : 'var(--color-red)' }}>
          <div className="result-header">
            <div className="result-status-icon" style={{ backgroundColor: verificationResult.isValid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: verificationResult.isValid ? 'var(--color-green)' : 'var(--color-red)' }}>
              {verificationResult.isValid ? <Award size={24} /> : <Info size={24} />}
            </div>
            <div className="result-title-block">
              <h3>{verificationResult.isValid ? `წარმატება! ${verificationResult.formula}` : 'შეცდომა'}</h3>
              <span className="result-sub">{verificationResult.nameGeo} / {verificationResult.nameEng}</span>
            </div>
            {verificationResult.isValid && (
              <span className="xp-award-banner animate-pulse-glow">+{verificationResult.xpEarned} XP</span>
            )}
          </div>
          <p className="result-description">{verificationResult.description}</p>
          <button 
            className="btn-secondary" 
            onClick={() => setVerificationResult(null)}
            style={{ alignSelf: 'flex-end', marginTop: '0.5rem' }}
          >
            დახურვა
          </button>
        </div>
      )}
    </div>
  );
};
export default Sandbox;
