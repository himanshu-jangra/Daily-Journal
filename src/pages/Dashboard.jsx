import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEntriesToday, calculateStreak, getEntryCount } from '../lib/db';
import { getDerivedKey, getStoredKeys } from '../lib/crypto';
import { isOnline } from '../lib/sync';
import StreakBadge from '../components/StreakBadge';
import './Dashboard.css';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return { text: 'Late night', emoji: '🌙' };
  if (hour < 12) return { text: 'Good morning', emoji: '☀️' };
  if (hour < 17) return { text: 'Good afternoon', emoji: '🌤️' };
  if (hour < 21) return { text: 'Good evening', emoji: '🌅' };
  return { text: 'Good night', emoji: '🌙' };
}

export default function Dashboard({ showToast }) {
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [online, setOnline] = useState(isOnline());
  const { userKey } = getStoredKeys();
  const greeting = getGreeting();

  useEffect(() => {
    loadData();

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function loadData() {
    const [s, today, total] = await Promise.all([
      calculateStreak(),
      getEntriesToday(),
      getEntryCount()
    ]);
    setStreak(s);
    setTodayCount(today.length);
    setTotalCount(total);
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="greeting-emoji">{greeting.emoji}</p>
          <h1>{greeting.text}, {userKey || 'Friend'}</h1>
          <p className="dashboard-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="header-right">
          <StreakBadge count={streak} />
          <span className={`online-dot ${online ? 'online' : 'offline'}`} title={online ? 'Online' : 'Offline'} />
        </div>
      </div>

      {/* Action Cards */}
      <div className="action-cards mt-lg">
        <button className="action-card card-survey" onClick={() => navigate('/survey')} id="btn-daily-checkin">
          <span className="action-icon">📋</span>
          <div>
            <h3>Daily Check-in</h3>
            <p>5 random questions to reflect on</p>
          </div>
          <span className="action-arrow">→</span>
        </button>

        <button className="action-card card-quick" onClick={() => navigate('/quick-add')} id="btn-quick-add">
          <span className="action-icon">✏️</span>
          <div>
            <h3>Quick Add</h3>
            <p>Write a free-form thought</p>
          </div>
          <span className="action-arrow">→</span>
        </button>
      </div>

      {/* Stats */}
      <div className="stats-row mt-lg">
        <div className="stat-card">
          <span className="stat-number">{todayCount}</span>
          <span className="stat-label">Today</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalCount}</span>
          <span className="stat-label">Total Entries</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{streak}</span>
          <span className="stat-label">Day Streak</span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links mt-lg">
        <button className="quick-link" onClick={() => navigate('/decrypt')} id="btn-decrypt-tool">
          🔓 Decryption Tool
        </button>
      </div>
    </div>
  );
}
