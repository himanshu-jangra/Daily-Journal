import './StreakBadge.css';

export default function StreakBadge({ count }) {
  if (count === 0) return null;

  return (
    <div className="streak-badge" id="streak-badge">
      <span className="streak-fire">🔥</span>
      <span className="streak-count">{count}</span>
      <span className="streak-label">day{count !== 1 ? 's' : ''}</span>
    </div>
  );
}
