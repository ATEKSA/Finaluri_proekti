import { useState } from 'react';
import Navbar from './components/Navbar';
import TutorialModal from './components/TutorialModal';
import Sandbox from './components/Sandbox';
import Puzzles from './components/Puzzles';
import { audio } from './utils/audio';
import { useAuth } from './context/AuthContext';
import { LogIn, UserPlus, Key, Mail, User as UserIcon, X, Atom } from 'lucide-react';


const TrophyIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="placeholder-svg-icon amber-text animate-float">
    <defs>
      <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#d97706" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <path d="M6 9H4.5A2.5 2.5 0 0 1 2 6.5v0A2.5 2.5 0 0 1 4.5 4H6" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 9h1.5A2.5 2.5 0 0 0 22 6.5v0A2.5 2.5 0 0 0 19.5 4H18" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
    <path d="M6 4V11a6 6 0 0 0 12 0V4H6Z" fill="url(#trophyGrad)" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 17v4M8 21h8" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BookIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="placeholder-svg-icon green-text animate-float">
    <defs>
      <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3Z" fill="url(#bookGrad)" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3Z" fill="url(#bookGrad)" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" />
    <path d="M6 8h2M6 12h2M16 8h2M16 12h2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('sandbox');

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(() => {
    return localStorage.getItem('bonding_sandbox_tutorial_completed') !== 'true';
  });

  const handleOpenAuth = () => {
    audio.playClick();
    setError('');
    setIsAuthOpen(true);
  };

  const handleCloseAuth = () => {
    audio.playClick();
    setIsAuthOpen(false);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (authMode === 'register' && !name)) {
      setError('გთხოვთ შეავსოთ ყველა ველი');
      audio.playError();
      return;
    }

    try {
      if (authMode === 'register') {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
      setIsAuthOpen(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'დაფიქსირდა შეცდომა');
      audio.playError();
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="app-loading-container">
        <Atom className="animate-spin-slow cyan-text" size={64} />
        <h2>ლაბორატორია იტვირთება...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        xp={user ? user.xp : 0}
        unlockedLevels={user ? user.unlockedLevels : 1}
        user={user && user.uid !== 'guest' ? { name: user.name, email: user.email } : null}
        onLoginClick={handleOpenAuth}
        onLogoutClick={handleLogout}
        onHelpClick={() => setIsTutorialOpen(true)}
      />

      {/* Main Tab Views */}
      <main className="main-content flex-1">
        {activeTab === 'sandbox' && (
          <div className="tab-view animate-fade-in">
            <header className="section-header">
              <h1>ქიმიური ბმების ლაბორატორია</h1>
              <p>აღმოაჩინე და შექმენი მოლეკულები ატომების შეერთებით. დააკავშირე სავალენტო ელექტრონები კოვალენტური ან იონური ბმების მისაღებად!</p>
            </header>

            <Sandbox />
          </div>
        )}

        {activeTab === 'puzzles' && (
          <Puzzles />
        )}

        {activeTab === 'leaderboard' && (
          <div className="tab-view animate-fade-in">
            <header className="section-header">
              <h1>მოსწავლეთა რეიტინგი</h1>
              <p>იხილე ლიდერბორდი და შეეჯიბრე შენს კლასელებს საუკეთესო ქიმიკოსის ტიტულისთვის!</p>
            </header>

            <div className="placeholder-card glass-panel">
              <div className="placeholder-icon"><TrophyIcon /></div>
              <h2>ლიდერბორდი მზადების პროცესშია</h2>
              <p>დააკავშირე შენი ანგარიში Firebase-თან, რათა შენი რეიტინგი რეალურ დროში განახლდეს და სხვებმაც დაინახონ შენი მიღწევები.</p>
            </div>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="tab-view animate-fade-in">
            <header className="section-header">
              <h1>ინფორმაციის წყაროები და სანდოობა</h1>
              <p>აპლიკაციაში წარმოდგენილი თეორიული მასალა და ქიმიური მოდელები ეყრდნობა რეალურ, აკადემიურ და საგანმანათლებლო რესურსებს.</p>
            </header>

            <div className="placeholder-card glass-panel">
              <div className="placeholder-icon"><BookIcon /></div>
              <h2>გამოყენებული ლიტერატურა მალე დაემატება</h2>
              <p>აქ განთავსდება დეტალური ბმულები PhET-ის ქიმიურ სიმულატორებზე, IUPAC-ის სახელმძღვანელოებსა და სკოლის ქიმიის პროგრამაზე.</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer glass-panel">
        <p>© 2026 თბილისის ტექსკოლა x ჯეოლაბი. ყველა უფლება დაცულია.</p>
        <p className="footer-sub">პროექტი შექმნილია Gemini AI და Anti Gravity პლატფორმის დახმარებით.</p>
      </footer>

      {/* Auth Modal */}
      {isAuthOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel animate-float">
            <button className="modal-close" onClick={handleCloseAuth}>
              <X size={18} />
            </button>

            <div className="modal-header">
              <div className="modal-icon-container">
                {authMode === 'login' ? <LogIn size={24} className="cyan-text" /> : <UserPlus size={24} className="purple-text" />}
              </div>
              <h2>{authMode === 'login' ? 'ავტორიზაცია' : 'რეგისტრაცია'}</h2>
              <p>{authMode === 'login' ? 'შედი შენს ანგარიშში პროგრესის შესანახად' : 'შექმენი ახალი პროფილი და დაიწყე ქულების დაგროვება'}</p>
            </div>

            {error && <div className="modal-error">{error}</div>}

            <form onSubmit={handleAuthSubmit} className="modal-form">
              {authMode === 'register' && (
                <div className="form-group">
                  <label><UserIcon size={14} /> სახელი</label>
                  <input
                    type="text"
                    placeholder="შეიყვანე სახელი"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label><Mail size={14} /> ელ-ფოსტა</label>
                <input
                  type="email"
                  placeholder="შეიყვანე ელ-ფოსტა"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label><Key size={14} /> პაროლი</label>
                <input
                  type="password"
                  placeholder="შეიყვანე პაროლი"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary w-full">
                {authMode === 'login' ? 'შესვლა' : 'რეგისტრაცია'}
              </button>
            </form>

            <div className="modal-toggle-mode">
              {authMode === 'login' ? (
                <p>
                  არ გაქვს ანგარიში?{' '}
                  <span onClick={() => { audio.playClick(); setAuthMode('register'); setError(''); }}>რეგისტრაცია</span>
                </p>
              ) : (
                <p>
                  უკვე გაქვს ანგარიში?{' '}
                  <span onClick={() => { audio.playClick(); setAuthMode('login'); setError(''); }}>შესვლა</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Walkthrough */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => {
          localStorage.setItem('bonding_sandbox_tutorial_completed', 'true');
          setIsTutorialOpen(false);
        }}
      />
    </div>
  );
}

export default App;
