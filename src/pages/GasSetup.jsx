import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGASUrl, setGASUrl } from '../lib/sync';
import './GasSetup.css';

const GAS_CODE = `/**
 * Google Apps Script — Daily Journal Backend
 * 
 * This receives encrypted journal entries and stores them
 * in your Google Sheet. It CANNOT read your entries.
 */

const SHEET_NAME = 'Journal Entries';

function doGet(e) {
  initSheet();
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Daily Journal backend is running.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const { timestamp, encryptedBlob } = data;
    if (!timestamp || !encryptedBlob) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'error', message: 'Missing data' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const sheet = initSheet();
    sheet.appendRow([timestamp, encryptedBlob, new Date().toISOString()]);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function initSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Encrypted Blob', 'Received At']);
    sheet.getRange('1:1').setFontWeight('bold');
  }
  return sheet;
}`;

export default function GasSetup() {
  const navigate = useNavigate();
  const [gasUrl, setGasUrlLocal] = useState(getGASUrl());
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopyScript = async () => {
    await navigator.clipboard.writeText(GAS_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveUrl = () => {
    if (gasUrl.trim()) {
      setGASUrl(gasUrl.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="gas-setup page-enter">
      <div className="gas-header">
        <button className="btn-ghost" onClick={() => navigate('/settings')} id="btn-gas-back">
          ← Back
        </button>
        <h2>Google Sheets Sync Setup</h2>
      </div>

      <p className="gas-intro">
        Follow these steps to connect your journal to a Google Sheet. Your entries are encrypted — the sheet only stores unreadable blobs.
      </p>

      {/* Step 1 */}
      <div className="gas-step">
        <div className="step-number">1</div>
        <div className="step-content">
          <h3>Create a Google Sheet</h3>
          <p>Go to <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="gas-link">sheets.new</a> to create a new Google Sheet. Give it a name like "My Journal".</p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="gas-step">
        <div className="step-number">2</div>
        <div className="step-content">
          <h3>Open Apps Script</h3>
          <p>In your new sheet, go to <strong>Extensions → Apps Script</strong>. This opens the script editor.</p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="gas-step">
        <div className="step-number">3</div>
        <div className="step-content">
          <h3>Paste the Script</h3>
          <p>Delete any existing code in the editor and paste the script below:</p>
          <div className="code-block">
            <div className="code-header">
              <span>Code.gs</span>
              <button className="btn btn-sm btn-secondary" onClick={handleCopyScript} id="btn-copy-gas">
                {copied ? '✓ Copied!' : '📋 Copy Script'}
              </button>
            </div>
            <pre className="code-content">{GAS_CODE}</pre>
          </div>
        </div>
      </div>

      {/* Step 4 */}
      <div className="gas-step">
        <div className="step-number">4</div>
        <div className="step-content">
          <h3>Deploy as Web App</h3>
          <ol className="deploy-steps">
            <li>Click <strong>Deploy → New deployment</strong></li>
            <li>Click the ⚙️ gear icon → Select <strong>"Web app"</strong></li>
            <li>Set <strong>"Execute as"</strong> to <strong>Me</strong></li>
            <li>Set <strong>"Who has access"</strong> to <strong>Anyone</strong></li>
            <li>Click <strong>Deploy</strong></li>
            <li>Click <strong>"Authorize access"</strong> and allow permissions</li>
            <li><strong>Copy the Web App URL</strong> — it looks like: <code>https://script.google.com/macros/s/ABC.../exec</code></li>
          </ol>
        </div>
      </div>

      {/* Step 5 */}
      <div className="gas-step">
        <div className="step-number">5</div>
        <div className="step-content">
          <h3>Paste the URL Here</h3>
          <div className="input-group">
            <label htmlFor="gas-url-setup">Web App URL</label>
            <input
              id="gas-url-setup"
              type="url"
              className="input-field"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={gasUrl}
              onChange={e => setGasUrlLocal(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary btn-full mt-md"
            onClick={handleSaveUrl}
            disabled={!gasUrl.trim()}
            id="btn-save-gas-url"
          >
            {saved ? '✓ URL Saved!' : 'Save & Connect'}
          </button>
        </div>
      </div>

      {/* Done */}
      <div className="gas-done card mt-lg">
        <p>
          <strong>That's it!</strong> Your journal entries will now sync to your Google Sheet automatically whenever you're online. You can verify by checking your sheet after creating a journal entry.
        </p>
      </div>

      <div style={{ height: 32 }} />
    </div>
  );
}
