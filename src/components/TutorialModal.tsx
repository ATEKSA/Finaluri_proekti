import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Atom, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { audio } from '../utils/audio';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [agreement, setAgreement] = useState<'agree' | 'disagree' | null>(null);

  if (!isOpen) return null;

  const steps = [
    {
      title: "კეთილი იყოს თქვენი მობრძანება! 🧪",
      subtitle: "Welcome to The Bonding Sandbox",
      icon: <Sparkles className="tutorial-step-icon cyan-text animate-pulse-glow" size={48} />,
      content: (
        <>
          <p className="tutorial-text">
            ეს არის <strong>ქიმიური ბმების ინტერაქტიული ლაბორატორია</strong>, სადაც შენ გახდები ნამდვილი მეცნიერი!
          </p>
          <p className="tutorial-text">
            აქ ისწავლი როგორ უერთდებიან ატომები ერთმანეთს სხვადასხვა მოლეკულების შესაქმნელად, როგორიცაა წყალი, მარილი და გაზი.
          </p>
          <div className="tutorial-badge-container">
            <span className="badge badge-cyan">⚛️ მარტივი ქიმია</span>
            <span className="badge badge-green">🎮 თამაში</span>
            <span className="badge badge-purple">✨ ქულები (XP)</span>
          </div>
        </>
      ),
    },
    {
      title: "რა არის ატომი? ⚛️",
      subtitle: "The Building Blocks of Nature",
      icon: <Atom className="tutorial-step-icon purple-text animate-spin-slow" size={48} />,
      content: (
        <>
          <p className="tutorial-text">
            ყველაფერი ჩვენს გარშემო პატარა ნაწილაკებისგან — <strong>ატომებისგან</strong> შედგება.
          </p>

          {/* Local screen recording video */}
          <div className="video-container" style={{ margin: '0.75rem 0', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
            <video src="/0622.mp4" controls width="100%" style={{ display: 'block', maxHeight: '140px', objectFit: 'cover' }} />
          </div>

          {/* Funny agreement poll */}
          <div className="funny-poll-container" style={{ width: '100%', marginBottom: '0.75rem' }}>
            <p className="poll-question" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              ეთანხმები ამ სამეცნიერო ფაქტს?
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  audio.playSuccess();
                  setAgreement('agree');
                }}
                style={{
                  background: agreement === 'agree' ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255,255,255,0.03)',
                  borderColor: agreement === 'agree' ? 'var(--color-neon-green)' : 'var(--border-light)',
                  color: agreement === 'agree' ? 'var(--color-neon-green)' : '#ffffff',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem'
                }}
              >
                A) ვეთანხმები
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  audio.playError();
                  setAgreement('disagree');
                }}
                style={{
                  background: agreement === 'disagree' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                  borderColor: agreement === 'disagree' ? 'var(--color-red)' : 'var(--border-light)',
                  color: agreement === 'disagree' ? 'var(--color-red)' : '#ffffff',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem'
                }}
              >
                B) არ ვეთანხმები
              </button>
            </div>
            {agreement === 'agree' && (
              <p className="poll-feedback green-text animate-fade-in" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                🎉 შესანიშნავია! შენ ნამდვილი მომავალი მეცნიერი ხარ!
              </p>
            )}
            {agreement === 'disagree' && (
              <p className="poll-feedback red-text animate-fade-in" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                🙃 დარწმუნებული ხარ? ნიუტონი და მენდელეევი საფლავში ბრუნავენ!
              </p>
            )}
          </div>

          <p className="tutorial-text highlight-box" style={{ margin: '0' }}>
            სწორედ ამიტომ უერთდებიან ისინი ერთმანეთს და ქმნიან <strong>ბმებს</strong>!
          </p>
        </>
      ),
    },
    {
      title: "კოვალენტური ბმა 🤝",
      subtitle: "Covalent Bonding - Sharing Electrons",
      icon: <Atom className="tutorial-step-icon cyan-text" size={48} />,
      content: (
        <>
          <p className="tutorial-text">
            როდესაც ორ ატომს ელექტრონები აკლია, ისინი იწყებენ მათ <strong>გაზიარებას</strong> (Sharing).
          </p>
          <p className="tutorial-text">
            მაგალითად, <strong>წყალბადს (H)</strong> სჭირდება 1 ელექტრონი, ხოლო <strong>ჟანგბადს (O)</strong> სჭირდება 2. ისინი აზიარებენ ელექტრონებს და იქმნება <strong>წყლის მოლეკულა (H₂O)</strong>.
          </p>
          <div className="bonding-visual covalent-visual">
            <div className="visual-atom h-atom">H</div>
            <div className="visual-link">⚡ (გაზიარება) ⚡</div>
            <div className="visual-atom o-atom">O</div>
            <div className="visual-link">⚡ (გაზიარება) ⚡</div>
            <div className="visual-atom h-atom">H</div>
          </div>
        </>
      ),
    },
    {
      title: "იონური ბმა ⚡",
      subtitle: "Ionic Bonding - Transferring Electrons",
      icon: <Zap className="tutorial-step-icon amber-text animate-pulse-glow" size={48} />,
      content: (
        <>
          <p className="tutorial-text">
            ზოგიერთი ატომი ძლიერია და სხვას <strong>ართმევს (გადასცემს)</strong> ელექტრონს.
          </p>
          <p className="tutorial-text">
            მაგალითად, <strong>ნატრიუმი (Na)</strong> გასცემს 1 ელექტრონს, რომელსაც სიამოვნებით იღებს <strong>ქლორი (Cl)</strong>. ნატრიუმი ხდება დადებითი იონი (+), ხოლო ქლორი — უარყოფითი (-). ისინი ერთმანეთს იზიდავენ და იქმნება <strong>სუფრის მარილი (NaCl)</strong>.
          </p>
          <div className="bonding-visual ionic-visual">
            <div className="visual-atom na-atom">Na⁺</div>
            <div className="visual-arrow">➔ (ელექტრონი) ➔</div>
            <div className="visual-atom cl-atom">Cl⁻</div>
          </div>
        </>
      ),
    },
    {
      title: "როგორ ვითამაშოთ? 🎮",
      subtitle: "Step-by-Step Gameplay Rules",
      icon: <ShieldCheck className="tutorial-step-icon green-text" size={48} />,
      content: (
        <div className="how-to-play-list">
          <div className="play-step">
            <span className="step-num">1</span>
            <p><strong>გადმოათრიე ატომები:</strong> აირჩიე ატომი გვერდითა პანელიდან და განათავსე სამუშაო დაფაზე.</p>
          </div>
          <div className="play-step">
            <span className="step-num">2</span>
            <p><strong>დააკავშირე ელექტრონები:</strong> გაავლე ხაზი ერთი ატომის გარე ელექტრონიდან მეორე ატომის ელექტრონამდე ბმის შესაქმნელად.</p>
          </div>
          <div className="play-step">
            <span className="step-num">3</span>
            <p><strong>შეამოწმე მოლეკულა:</strong> როდესაც დაასრულებ კავშირებს, დააჭირე <em>„შემოწმებას“</em>. სწორი მოლეკულა მოგცემს <strong>XP</strong> ქულებს და ახალ მიღწევებს!</p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    audio.playClick();
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    audio.playClick();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="tutorial-modal-content glass-panel animate-fade-in">
        <button className="modal-close" onClick={() => { audio.playClick(); onClose(); }}>
          <X size={18} />
        </button>

        <div className="tutorial-progress-bar">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`progress-dot ${idx <= currentStep ? 'active' : ''}`}
              onClick={() => { audio.playClick(); setCurrentStep(idx); }}
            />
          ))}
        </div>

        <div className="tutorial-body">
          <div className="tutorial-icon-wrapper">
            {steps[currentStep].icon}
          </div>
          <h2 className="tutorial-title">{steps[currentStep].title}</h2>
          <span className="tutorial-subtitle">{steps[currentStep].subtitle}</span>
          
          <hr className="tutorial-divider" />

          <div className="tutorial-content-body">
            {steps[currentStep].content}
          </div>
        </div>

        <div className="tutorial-footer">
          <button
            className="btn-secondary"
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{ opacity: currentStep === 0 ? 0.3 : 1, cursor: currentStep === 0 ? 'default' : 'pointer' }}
          >
            <ArrowLeft size={16} /> უკან
          </button>

          <button className="btn-primary" onClick={handleNext}>
            {currentStep === steps.length - 1 ? "დაწყება! 🚀" : "შემდეგი"} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default TutorialModal;
