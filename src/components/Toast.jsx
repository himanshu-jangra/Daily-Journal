export default function Toast({ message, type = 'success' }) {
  return (
    <div className={`toast toast-${type}`} role="alert">
      {type === 'success' ? '✓ ' : '✕ '}{message}
    </div>
  );
}
