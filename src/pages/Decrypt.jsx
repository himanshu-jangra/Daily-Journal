import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decrypt, generateKey } from '../lib/crypto';
import './Decrypt.css';

export default function Decrypt() {
  const navigate = useNavigate();
  const [systemKey, setSystemKey] = useState('');
  const [userKey, setUserKey] = useState('');
  const [blob, setBlob] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleDecrypt = () => {
    setError('');
    setResult(null);

    if (!systemKey.trim() || !userKey.trim()) {
      setError('Both keys are required');
      return;
    }
    if (!blob.trim()) {
      setError('Paste an encrypted blob');
      return;
    }

    try {
      const key = generateKey(systemKey.trim(), userKey.trim());
      const decrypted = decrypt(blob.trim(), key);

      if (decrypted === null) {
        setError('Decryption failed. Check your keys and blob.');
      } else {
        setResult(typeof decrypted === 'object' ? JSON.stringify(decrypted, null, 2) : decrypted);
      }
    } catch {
      setError('Decryption failed. Invalid data or keys.');
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="decrypt-container page-enter">
      <div className="decrypt-header">
        <button className="btn-ghost" onClick={() => navigate('/')} id="btn-decrypt-back">
          ← Back
        </button>
        <h2>🔓 Decrypt Tool</h2>
      </div>

      <p className="decrypt-desc">
        Paste an encrypted blob from your Google Sheet and enter your keys to decrypt it.
      </p>

      <div className="input-group mt-lg">
        <label htmlFor="decrypt-user">Username (User Key)</label>
        <input
          id="decrypt-user"
          type="text"
          className="input-field"
          placeholder="Your username"
          value={userKey}
          onChange={e => setUserKey(e.target.value)}
        />
      </div>

      <div className="input-group mt-md">
        <label htmlFor="decrypt-system">System Key</label>
        <input
          id="decrypt-system"
          type="password"
          className="input-field"
          placeholder="Your secret passphrase"
          value={systemKey}
          onChange={e => setSystemKey(e.target.value)}
        />
      </div>

      <div className="input-group mt-md">
        <label htmlFor="decrypt-blob">Encrypted Blob</label>
        <textarea
          id="decrypt-blob"
          className="textarea-field"
          placeholder="Paste U2FsdGVkX19... here"
          value={blob}
          onChange={e => setBlob(e.target.value)}
          rows={4}
        />
      </div>

      {error && <p className="error-text mt-sm">{error}</p>}

      <button className="btn btn-primary btn-full mt-lg" onClick={handleDecrypt} id="btn-do-decrypt">
        Decrypt 🔑
      </button>

      {result && (
        <div className="decrypt-result mt-lg">
          <div className="result-header">
            <h3>Decrypted Content</h3>
            <button className="btn btn-ghost btn-sm" onClick={handleCopy} id="btn-copy-result">
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          <pre className="result-content">{result}</pre>
        </div>
      )}
    </div>
  );
}
