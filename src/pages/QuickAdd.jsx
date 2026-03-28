import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { encrypt, getDerivedKey } from '../lib/crypto';
import { addEntry } from '../lib/db';
import MoodSelector from '../components/MoodSelector';
import './QuickAdd.css';

export default function QuickAdd({ showToast }) {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [mood, setMood] = useState(null);
  const [saving, setSaving] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSubmit = async () => {
    if (!text.trim()) {
      showToast('Write something first!', 'error');
      return;
    }

    setSaving(true);
    try {
      const key = getDerivedKey();
      if (!key) {
        showToast('Encryption key not found', 'error');
        return;
      }

      const content = {
        type: 'quick_add',
        text: text.trim(),
        timestamp: new Date().toISOString()
      };

      const encrypted = encrypt(content, key);
      await addEntry({ type: 'quick_add', encryptedContent: encrypted, mood });

      showToast('Thought captured! 💭');
      navigate('/');
    } catch (err) {
      showToast('Failed to save', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="quickadd-container page-enter">
      <div className="quickadd-header">
        <button className="btn-ghost" onClick={() => navigate('/')} id="btn-quickadd-close">
          ✕ Close
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSubmit}
          disabled={saving || !text.trim()}
          id="btn-quickadd-save"
        >
          {saving ? 'Saving...' : 'Save ✓'}
        </button>
      </div>

      <div className="quickadd-body">
        <textarea
          className="quickadd-textarea"
          placeholder="What's on your mind?&#10;&#10;Write freely — this will be encrypted before saving..."
          value={text}
          onChange={e => setText(e.target.value)}
          autoFocus
          id="quickadd-text"
        />

        <div className="quickadd-meta">
          <span className="word-count">{wordCount} word{wordCount !== 1 ? 's' : ''}</span>
          <span className="quickadd-time">
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="quickadd-mood">
        <MoodSelector selected={mood} onSelect={setMood} />
      </div>
    </div>
  );
}
