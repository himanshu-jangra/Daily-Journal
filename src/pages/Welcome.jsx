import { useState } from 'react';
import { storeKeys, generateKey } from '../lib/crypto';
import './Welcome.css';

export default function Welcome({ onComplete }) {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState('');
  const [systemKey, setSystemKey] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      if (!username.trim()) {
        setError('Please enter a username');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!systemKey.trim()) {
        setError('Please enter a system key');
        return;
      }
      setError('');
      // Generate and store keys
      storeKeys(systemKey.trim(), username.trim());
      setStep(3);
      setTimeout(() => onComplete(), 1500);
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        {step === 0 && (
          <div className="welcome-step page-enter">
            <div className="welcome-icon">📝</div>
            <h1>Daily Journal</h1>
            <p className="welcome-subtitle">Your private space for reflection</p>
            <p className="welcome-desc">
              Everything is encrypted before it leaves your device.
              Your thoughts belong to you alone.
            </p>
            <button className="btn btn-primary btn-full mt-lg" onClick={handleNext} id="btn-get-started">
              Get Started
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="welcome-step page-enter">
            <div className="welcome-icon">👤</div>
            <h2>What should we call you?</h2>
            <p className="welcome-desc">This also serves as part of your encryption key.</p>
            <div className="input-group mt-lg">
              <label htmlFor="username-input">Username</label>
              <input
                id="username-input"
                type="text"
                className="input-field"
                placeholder="Enter your name"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                autoFocus
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn-primary btn-full mt-lg" onClick={handleNext} id="btn-next-key">
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="welcome-step page-enter">
            <div className="welcome-icon">🔐</div>
            <h2>Set your system key</h2>
            <p className="welcome-desc">
              This is a secret passphrase only you know.
              Combined with your username, it creates a unique encryption key.
            </p>
            <div className="input-group mt-lg">
              <label htmlFor="system-key-input">System Key</label>
              <input
                id="system-key-input"
                type="password"
                className="input-field"
                placeholder="Enter a secret passphrase"
                value={systemKey}
                onChange={e => setSystemKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                autoFocus
              />
            </div>
            <p className="key-warning">
              ⚠️ Remember both your username and system key. If you clear browser data, you'll need them to recover access.
            </p>
            {error && <p className="error-text">{error}</p>}
            <button className="btn btn-primary btn-full mt-lg" onClick={handleNext} id="btn-complete-setup">
              Complete Setup 🔒
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="welcome-step page-enter">
            <div className="welcome-icon welcome-success">✅</div>
            <h2>You're all set!</h2>
            <p className="welcome-desc">Your encryption key has been generated. Time to start journaling.</p>
          </div>
        )}
      </div>

      <div className="welcome-dots">
        {[0, 1, 2, 3].map(i => (
          <span key={i} className={`dot ${step >= i ? 'dot--active' : ''}`} />
        ))}
      </div>
    </div>
  );
}
