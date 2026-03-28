import { getQuestions } from './db';

/**
 * Get N random questions from the pool.
 * Falls back to default if pool is empty.
 */
export async function getRandomQuestions(count = 5) {
  const allQuestions = await getQuestions();

  if (allQuestions.length === 0) return [];

  // Fisher-Yates shuffle
  const shuffled = [...allQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}
