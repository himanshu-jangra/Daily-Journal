import CryptoJS from 'crypto-js';

/**
 * Generate an encryption key from system + user keys.
 * Uses SHA-256 hash of the concatenated keys.
 */
export function generateKey(systemKey, userKey) {
  const combined = `${systemKey}::${userKey}`;
  return CryptoJS.SHA256(combined).toString();
}

/**
 * Encrypt data using AES-256.
 * @param {Object|string} data - Data to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted string
 */
export function encrypt(data, key) {
  const plaintext = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(plaintext, key).toString();
}

/**
 * Decrypt an AES-256 encrypted string.
 * @param {string} ciphertext - Encrypted string
 * @param {string} key - Encryption key
 * @returns {Object|string} Decrypted data
 */
export function decrypt(ciphertext, key) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch {
    return null;
  }
}

/**
 * Store encryption keys securely in localStorage.
 */
export function storeKeys(systemKey, userKey) {
  localStorage.setItem('dj_system_key', systemKey);
  localStorage.setItem('dj_user_key', userKey);
}

export function getStoredKeys() {
  return {
    systemKey: localStorage.getItem('dj_system_key'),
    userKey: localStorage.getItem('dj_user_key')
  };
}

export function hasStoredKeys() {
  return !!(localStorage.getItem('dj_system_key') && localStorage.getItem('dj_user_key'));
}

export function clearKeys() {
  localStorage.removeItem('dj_system_key');
  localStorage.removeItem('dj_user_key');
}

/**
 * Get the derived encryption key from stored keys.
 */
export function getDerivedKey() {
  const { systemKey, userKey } = getStoredKeys();
  if (!systemKey || !userKey) return null;
  return generateKey(systemKey, userKey);
}
