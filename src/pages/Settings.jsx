import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getQuestions, addQuestion, updateQuestion, deleteQuestion } from '../lib/db';
import { getGASUrl, syncPendingEntries } from '../lib/sync';
import { requestNotificationPermission, getNotificationTime, setNotificationTime } from '../lib/notifications';
import { clearKeys, getStoredKeys } from '../lib/crypto';
import './Settings.css';

export default function Settings({ showToast }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const gasUrl = getGASUrl();
  const [notifTime, setNotifTime] = useState(getNotificationTime());
  const [notifEnabled, setNotifEnabled] = useState(Notification.permission === 'granted');
  const [syncing, setSyncing] = useState(false);
  const { userKey } = getStoredKeys();

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    const q = await getQuestions();
    setQuestions(q);
  }

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;
    await addQuestion(newQuestion.trim());
    setNewQuestion('');
    loadQuestions();
    showToast('Question added!');
  };

  const handleEditQuestion = async (id) => {
    if (!editText.trim()) return;
    await updateQuestion(id, editText.trim());
    setEditingId(null);
    setEditText('');
    loadQuestions();
    showToast('Question updated');
  };

  const handleDeleteQuestion = async (id) => {
    await deleteQuestion(id);
    loadQuestions();
    showToast('Question removed');
  };



  const handleSync = async () => {
    setSyncing(true);
    const result = await syncPendingEntries();
    setSyncing(false);
    if (result.noUrl) {
      showToast('Set a Google Apps Script URL first', 'error');
    } else {
      showToast(`Synced ${result.synced} entries`);
    }
  };

  const handleEnableNotifs = async () => {
    const granted = await requestNotificationPermission();
    setNotifEnabled(granted);
    if (granted) {
      showToast('Notifications enabled!');
    } else {
      showToast('Notification permission denied', 'error');
    }
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setNotifTime(time);
    setNotificationTime(time);
    showToast('Reminder time updated');
  };

  const handleLogout = () => {
    if (window.confirm('This will remove your encryption keys from this device. Make sure you remember your username and system key!')) {
      clearKeys();
      window.location.reload();
    }
  };

  return (
    <div className="page-enter">
      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <p>Customize your journal</p>
      </div>

      {/* Theme */}
      <section className="settings-section">
        <h3 className="section-title">Appearance</h3>
        <div className="setting-row card">
          <div>
            <p className="setting-label">Theme</p>
            <p className="setting-desc">{theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}</p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} id="btn-theme-toggle">
            <span className={`toggle-track ${theme === 'dark' ? 'toggle-dark' : ''}`}>
              <span className="toggle-thumb" />
            </span>
          </button>
        </div>
      </section>

      {/* Sync */}
      <section className="settings-section">
        <h3 className="section-title">Google Sheets Sync</h3>
        <div className="card">
          {gasUrl ? (
            <>
              <div className="setting-row">
                <div>
                  <p className="setting-label">Connected</p>
                  <p className="setting-desc" style={{ wordBreak: 'break-all' }}>{gasUrl.slice(0, 50)}...</p>
                </div>
                <span style={{ color: 'var(--color-success)', fontSize: '1.2rem' }}>●</span>
              </div>
              <div className="flex gap-sm mt-md">
                <button className="btn btn-secondary btn-sm" onClick={handleSync} disabled={syncing} id="btn-sync-now">
                  {syncing ? 'Syncing...' : '🔄 Sync Now'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/gas-setup')} id="btn-reconfigure-gas">
                  Reconfigure
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="setting-desc mb-md">Not connected. Set up Google Sheets to back up your encrypted journal entries.</p>
              <button className="btn btn-primary btn-full" onClick={() => navigate('/gas-setup')} id="btn-setup-gas">
                📄 Set Up Google Sheets Sync
              </button>
            </>
          )}
        </div>
      </section>

      {/* Notifications */}
      <section className="settings-section">
        <h3 className="section-title">Reminders</h3>
        <div className="card">
          {!notifEnabled ? (
            <button className="btn btn-secondary btn-full" onClick={handleEnableNotifs} id="btn-enable-notifs">
              🔔 Enable Notifications
            </button>
          ) : (
            <div className="input-group">
              <label htmlFor="notif-time">Daily reminder time</label>
              <input
                id="notif-time"
                type="time"
                className="input-field"
                value={notifTime}
                onChange={handleTimeChange}
              />
            </div>
          )}
        </div>
      </section>

      {/* Question Pool */}
      <section className="settings-section">
        <h3 className="section-title">Question Pool ({questions.length})</h3>

        <div className="add-question-row">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Add a new question..."
            value={newQuestion}
            onChange={e => setNewQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddQuestion()}
            id="input-new-question"
          />
          <button className="btn btn-primary btn-sm" onClick={handleAddQuestion} id="btn-add-question">
            Add
          </button>
        </div>

        <div className="questions-list">
          {questions.map(q => (
            <div key={q.id} className="question-item card">
              {editingId === q.id ? (
                <div className="question-edit">
                  <input
                    type="text"
                    className="input-field"
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleEditQuestion(q.id)}
                    autoFocus
                  />
                  <div className="flex gap-sm mt-sm">
                    <button className="btn btn-primary btn-sm" onClick={() => handleEditQuestion(q.id)}>
                      Save
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="question-display">
                  <p className="question-text-item">{q.text}</p>
                  <div className="question-actions">
                    <button
                      className="btn-icon"
                      onClick={() => { setEditingId(q.id); setEditText(q.text); }}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      onClick={() => handleDeleteQuestion(q.id)}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Account */}
      <section className="settings-section">
        <h3 className="section-title">Account</h3>
        <div className="card">
          <p className="setting-desc mb-md">Logged in as <strong>{userKey}</strong></p>
          <button className="btn btn-secondary btn-full" onClick={handleLogout} id="btn-logout"
            style={{ color: 'var(--color-error)' }}>
            🔓 Remove Keys from Device
          </button>
        </div>
      </section>

      <div style={{ height: 40 }} />
    </div>
  );
}
