import './ProgressBar.css';

export default function ProgressBar({ current, total }) {
  const percentage = (current / total) * 100;

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="progress-text">{current} of {total}</span>
    </div>
  );
}
