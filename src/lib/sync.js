import { getPendingSync, markSynced, updateSyncAttempt } from './db';

const MAX_ATTEMPTS = 3;

/**
 * Get the Google Apps Script URL from settings.
 */
export function getGASUrl() {
  return localStorage.getItem('dj_gas_url') || '';
}

export function setGASUrl(url) {
  localStorage.setItem('dj_gas_url', url);
}

/**
 * Sync a single entry to Google Sheets via GAS.
 */
async function syncEntry(queueItem) {
  const gasUrl = getGASUrl();
  if (!gasUrl) return false;

  try {
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: queueItem.timestamp,
        encryptedBlob: queueItem.payload
      }),
      mode: 'no-cors'
    });

    // no-cors mode returns opaque response, we assume success
    await markSynced(queueItem.entryId);
    return true;
  } catch (error) {
    console.warn('Sync failed for entry:', queueItem.entryId, error);
    await updateSyncAttempt(queueItem.id);
    return false;
  }
}

/**
 * Process the sync queue — send all pending entries.
 */
export async function syncPendingEntries() {
  if (!navigator.onLine) return { synced: 0, failed: 0 };

  const gasUrl = getGASUrl();
  if (!gasUrl) return { synced: 0, failed: 0, noUrl: true };

  const pending = await getPendingSync();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    if (item.attempts >= MAX_ATTEMPTS) {
      failed++;
      continue;
    }

    // Exponential backoff
    if (item.lastAttempt) {
      const waitTime = Math.pow(2, item.attempts) * 1000;
      const elapsed = Date.now() - new Date(item.lastAttempt).getTime();
      if (elapsed < waitTime) continue;
    }

    const success = await syncEntry(item);
    if (success) synced++;
    else failed++;
  }

  return { synced, failed };
}

/**
 * Set up auto-sync on reconnection.
 */
export function setupAutoSync() {
  window.addEventListener('online', () => {
    syncPendingEntries();
  });
}

/**
 * Check if we're online.
 */
export function isOnline() {
  return navigator.onLine;
}
