import { NavLink, useLocation } from 'react-router-dom';
import './BottomNav.css';

/* Clean SVG icons */
const HomeIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
    <polyline points="9 21 9 14 15 14 15 21" />
  </svg>
);

const HistoryIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15.5 14" />
  </svg>
);

const SettingsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const navItems = [
  { path: '/', icon: HomeIcon, label: 'Home' },
  { path: '/history', icon: HistoryIcon, label: 'History' },
  { path: '/settings', icon: SettingsIcon, label: 'Settings' }
];

export default function BottomNav() {
  const location = useLocation();

  // Hide nav on survey, quick-add, decrypt, and gas-setup pages
  if (['/survey', '/quick-add', '/decrypt', '/gas-setup'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bottom-nav glass" id="bottom-nav">
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
            id={`nav-${item.label.toLowerCase()}`}
          >
            <span className="nav-icon">
              <Icon active={isActive} />
            </span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
