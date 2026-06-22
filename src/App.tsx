import { useState } from 'react';
import Navbar from './components/Navbar';
import TutorialModal from './components/TutorialModal';
import Sandbox from './components/Sandbox';
import Puzzles from './components/Puzzles';
import Leaderboard from './components/Leaderboard';
import Sources from './components/Sources';
import { audio } from './utils/audio';
import { useAuth } from './context/AuthContext';
import { LogIn, UserPlus, Key, Mail, User as UserIcon, X, Atom } from 'lucide-react';



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
          <Leaderboard />
        )}

        {activeTab === 'sources' && (
          <Sources />
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
