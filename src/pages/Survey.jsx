import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRandomQuestions } from '../lib/questions';
import { encrypt, getDerivedKey } from '../lib/crypto';
import { addEntry } from '../lib/db';
import ProgressBar from '../components/ProgressBar';
import MoodSelector from '../components/MoodSelector';
import './Survey.css';

export default function Survey({ showToast }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMood, setShowMood] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    const q = await getRandomQuestions(5);
    setQuestions(q);
    setLoading(false);
  }

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const totalSteps = questions.length + 1; // +1 for mood

  const handleAnswer = (value) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        question: currentQuestion.text,
        answer: value
      }
    }));
  };

  const handleNext = () => {
    if (isLast) {
      setShowMood(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (showMood) {
      setShowMood(false);
    } else if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const key = getDerivedKey();
      if (!key) {
        showToast('Encryption key not found', 'error');
        return;
      }

      const content = {
        type: 'survey',
        answers: Object.values(answers),
        timestamp: new Date().toISOString()
      };

      const encrypted = encrypt(content, key);
      await addEntry({ type: 'survey', encryptedContent: encrypted, mood });

      showToast('Journal entry saved!');
      navigate('/');
    } catch (err) {
      showToast('Failed to save entry', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="survey-loading flex flex-center">
        <div className="spinner" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="survey-container page-enter">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p>No questions found. Add some in Settings!</p>
          <button className="btn btn-primary mt-lg" onClick={() => navigate('/settings')}>
            Go to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="survey-container page-enter">
      {/* Header */}
      <div className="survey-header">
        <button className="btn-ghost survey-close" onClick={() => navigate('/')} id="btn-survey-close">
          ✕
        </button>
        <ProgressBar current={showMood ? totalSteps : currentIndex + 1} total={totalSteps} />
      </div>

      {!showMood ? (
        /* Question */
        <div className="survey-question page-enter" key={currentIndex}>
          <p className="question-number">Question {currentIndex + 1}</p>
          <h2 className="question-text">{currentQuestion.text}</h2>
          <textarea
            className="textarea-field survey-textarea"
            placeholder="Take your time... write what comes to mind"
            value={answers[currentQuestion.id]?.answer || ''}
            onChange={e => handleAnswer(e.target.value)}
            autoFocus
            id={`question-textarea-${currentIndex}`}
          />
        </div>
      ) : (
        /* Mood selector */
        <div className="survey-mood page-enter">
          <h2>One last thing...</h2>
          <MoodSelector selected={mood} onSelect={setMood} />
        </div>
      )}

      {/* Navigation */}
      <div className="survey-nav">
        {(currentIndex > 0 || showMood) && (
          <button className="btn btn-secondary" onClick={handleBack} id="btn-survey-back">
            ← Back
          </button>
        )}
        <div style={{ flex: 1 }} />
        {!showMood ? (
          <button className="btn btn-primary" onClick={handleNext} id="btn-survey-next">
            {isLast ? 'Almost Done →' : 'Next →'}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
            id="btn-survey-submit"
          >
            {saving ? 'Saving...' : 'Save Entry ✓'}
          </button>
        )}
      </div>
    </div>
  );
}
