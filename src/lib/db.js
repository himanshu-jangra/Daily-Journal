import Dexie from 'dexie';

const db = new Dexie('DailyJournalDB');

db.version(1).stores({
  entries: '++id, timestamp, type, syncStatus, mood, createdAt',
  syncQueue: '++id, entryId, attempts, lastAttempt',
  questions: '++id, text, isDefault, createdAt'
});

export default db;

// --- Entry Operations ---

export async function addEntry({ type, encryptedContent, mood = null }) {
  const now = new Date().toISOString();
  const id = await db.entries.add({
    timestamp: now,
    type,
    encryptedContent,
    syncStatus: 'pending',
    mood,
    createdAt: now
  });

  // Add to sync queue
  await db.syncQueue.add({
    entryId: id,
    payload: encryptedContent,
    timestamp: now,
    attempts: 0,
    lastAttempt: null
  });

  return id;
}

export async function getEntries(limit = 50) {
  return db.entries
    .orderBy('timestamp')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getEntriesToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return db.entries
    .where('timestamp')
    .aboveOrEqual(today.toISOString())
    .toArray();
}

export async function getEntryCount() {
  return db.entries.count();
}

export async function deleteEntry(id) {
  await db.entries.delete(id);
  await db.syncQueue.where('entryId').equals(id).delete();
}

// --- Sync Queue Operations ---

export async function getPendingSync() {
  return db.syncQueue.toArray();
}

export async function markSynced(entryId) {
  await db.entries.update(entryId, { syncStatus: 'synced' });
  await db.syncQueue.where('entryId').equals(entryId).delete();
}

export async function updateSyncAttempt(queueId) {
  const item = await db.syncQueue.get(queueId);
  if (item) {
    await db.syncQueue.update(queueId, {
      attempts: item.attempts + 1,
      lastAttempt: new Date().toISOString()
    });
  }
}

// --- Question Operations ---

export async function getQuestions() {
  return db.questions.orderBy('createdAt').toArray();
}

export async function addQuestion(text, isDefault = false) {
  return db.questions.add({
    text,
    isDefault,
    createdAt: new Date().toISOString()
  });
}

export async function updateQuestion(id, text) {
  return db.questions.update(id, { text });
}

export async function deleteQuestion(id) {
  return db.questions.delete(id);
}

export async function getQuestionCount() {
  return db.questions.count();
}

// --- Streak Calculation ---

export async function calculateStreak() {
  const entries = await db.entries
    .orderBy('timestamp')
    .reverse()
    .toArray();

  if (entries.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkDate = new Date(today);

  // Check if there's an entry today
  const todayEntries = entries.filter(e => {
    const d = new Date(e.timestamp);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  if (todayEntries.length === 0) {
    // No entry today, check from yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dayEntries = entries.filter(e => {
      const d = new Date(e.timestamp);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === checkDate.getTime();
    });

    if (dayEntries.length > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// --- Seed Default Questions ---

const DEFAULT_QUESTIONS = [
  "What are you grateful for today?",
  "What was the highlight of your day?",
  "What challenged you today, and how did you handle it?",
  "What did you learn today?",
  "How are you feeling right now, and why?",
  "What's one thing you'd like to do differently tomorrow?",
  "Who made a positive impact on your day?",
  "What's something small that brought you joy today?",
  "What are you looking forward to?",
  "What's on your mind that you haven't said out loud?",
  "How did you take care of yourself today?",
  "What's a goal you're working towards?",
  "What would make today even better?",
  "Describe a moment today when you felt at peace.",
  "What's something you're proud of recently?",
  "If you could relive one moment from today, what would it be?",
  "What's a fear you'd like to overcome?",
  "Write about someone who inspires you and why.",
  "What's a habit you'd like to build or break?",
  "How have you grown as a person this month?",
  "What does your ideal day look like?",
  "What's something you've been overthinking?",
  "Describe your current mood in three words.",
  "What boundary did you set or need to set?",
  "What would you tell your younger self right now?"
];

export async function seedDefaultQuestions() {
  const count = await db.questions.count();
  if (count === 0) {
    const questions = DEFAULT_QUESTIONS.map(text => ({
      text,
      isDefault: true,
      createdAt: new Date().toISOString()
    }));
    await db.questions.bulkAdd(questions);
  }
}
