import { useEffect, useState } from 'react';
import { getEntries } from '../lib/db';
import { decrypt, getDerivedKey } from '../lib/crypto';
import './History.css';

const MOOD_EMOJIS = {
  happy: '😊', calm: '😌', neutral: '😐', sad: '😔',
  frustrated: '😤', energized: '🔥', tired: '😴', grateful: '🥰'
};

export default function History() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    const key = getDerivedKey();
    const raw = await getEntries(100);

    const decrypted = raw.map(entry => {
      let content = null;
      if (key) {
        content = decrypt(entry.encryptedContent, key);
      }
      return { ...entry, content };
    });

    setEntries(decrypted);
    setLoading(false);
  }

  // Group by date
  const grouped = entries.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="page-enter" style={{ paddingTop: 60, textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>📖 History</h1>
        <p>{entries.length} total entries</p>
      </div>

      {entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <p>No entries yet. Start your first journal entry today!</p>
        </div>
      ) : (
        <div className="history-list">
          {Object.entries(grouped).map(([date, dayEntries]) => (
            <div key={date} className="history-group">
              <h3 className="history-date">{date}</h3>
              {dayEntries.map(entry => (
                <div key={entry.id} className="history-entry card">
                  <div className="entry-header">
                    <span className={`badge ${entry.type === 'survey' ? 'badge-survey' : 'badge-quick'}`}>
                      {entry.type === 'survey' ? '📋 Survey' : '✏️ Quick'}
                    </span>
                    <div className="entry-meta">
                      {entry.mood && <span className="entry-mood">{MOOD_EMOJIS[entry.mood]}</span>}
                      <span className="entry-time">
                        {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`sync-dot ${entry.syncStatus === 'synced' ? 'synced' : 'pending'}`}
                        title={entry.syncStatus === 'synced' ? 'Synced' : 'Pending sync'}
                      />
                    </div>
                  </div>

                  {entry.content ? (
                    <div className="entry-content">
                      {entry.content.type === 'survey' && entry.content.answers ? (
                        <div className="entry-answers">
                          {entry.content.answers.map((qa, i) => (
                            <div key={i} className="qa-item">
                              <p className="qa-question">{qa.question}</p>
                              <p className="qa-answer">{qa.answer || <em className="no-answer">Skipped</em>}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="entry-text">{entry.content.text || JSON.stringify(entry.content)}</p>
                      )}
                    </div>
                  ) : (
                    <p className="entry-encrypted">🔒 Content encrypted</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
