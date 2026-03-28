import './MoodSelector.css';

const MOODS = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😔', label: 'Sad', value: 'sad' },
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
  { emoji: '🔥', label: 'Energized', value: 'energized' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '🥰', label: 'Grateful', value: 'grateful' }
];

export default function MoodSelector({ selected, onSelect }) {
  return (
    <div className="mood-selector">
      <p className="mood-label">How are you feeling?</p>
      <div className="mood-grid">
        {MOODS.map(mood => (
          <button
            key={mood.value}
            className={`mood-item ${selected === mood.value ? 'mood-item--active' : ''}`}
            onClick={() => onSelect(mood.value)}
            type="button"
            title={mood.label}
            id={`mood-${mood.value}`}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-name">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
