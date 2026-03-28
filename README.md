# Daily Journal PWA 📝

A privacy-centric Progressive Web App for daily journaling. Your thoughts are encrypted (AES-256) on your device before syncing to a Google Sheet you own. **Zero-knowledge storage** — nobody can read your entries but you.

## ✨ Features

- **Daily Check-in** — 5 random reflective questions per session
- **Quick Add** — Free-form journaling anytime
- **AES-256 Encryption** — Content encrypted before it leaves your device
- **Offline-First** — Works without internet, syncs when online
- **Google Sheets Backend** — Your data lives in your own Google Sheet
- **Dark/Light Mode** — Calm pastel themes
- **Streak Tracking** — Stay motivated with daily journaling streaks
- **Mood Tracking** — Quick emoji mood selection per entry
- **Push Notifications** — Daily reminder to journal
- **Decryption Tool** — Standalone utility to decrypt blobs from your Sheet

---

## 🚀 Deploy to GitHub Pages (Easiest)

### Steps:

1. **Create a GitHub repo** — Go to [github.com/new](https://github.com/new), name it (e.g., `Daily-Journal`)

2. **Upload the project folder**:
   ```bash
   cd "Daily Journal"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/Daily-Journal.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repo → **Settings → Pages**
   - Under **Source**, select **GitHub Actions**
   - That's it! The included `.github/workflows/deploy.yml` will auto-build and deploy on every push.

4. **Your app is live** at `https://YOUR_USERNAME.github.io/Daily-Journal/`

### Using a Custom Subdomain (e.g., journal.yourdomain.com)

1. In your repo → **Settings → Pages → Custom domain** → Enter `journal.yourdomain.com`
2. In your DNS provider, add a **CNAME record**:
   - Name: `journal`
   - Value: `YOUR_USERNAME.github.io`
3. Wait for DNS propagation (~5 min) and check "Enforce HTTPS"
4. Your app is now live at `https://journal.yourdomain.com`

> **Note:** When using a custom domain, `base` in `vite.config.js` should be `'/'` (which is the default).
> If deploying to `github.io/repo-name` without a custom domain, change `base` to `'/repo-name/'`.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

App runs at `http://localhost:5173`.

---

## 🔐 Google Sheets Sync Setup

The app includes a **built-in setup guide**: go to **Settings → Set Up Google Sheets Sync** in the app.

It walks you through:
1. Creating a Google Sheet
2. Opening **Extensions → Apps Script**
3. Pasting the sync script (one-click copy)
4. Deploying as a Web App
5. Pasting the URL back into the app

> The Google Sheet only stores encrypted blobs — it **cannot** read your journal content.

---

## 🔒 Security Model

```
Your Device                    Google Sheet
┌─────────────┐               ┌──────────────┐
│ Plaintext   │               │ Timestamp    │
│ ↓ AES-256   │──encrypted──→ │ Encrypted    │
│ Encrypted   │               │ Blob         │
└─────────────┘               └──────────────┘
```

- **Encryption key** = SHA-256(SystemKey + UserKey) — never leaves your device
- If you lose your keys, you cannot decrypt past entries. **Remember them!**

---

## 📁 Project Structure

```
Daily Journal/
├── .github/workflows/   # Auto-deploy to GitHub Pages
├── public/              # Static assets & PWA icons
├── src/
│   ├── components/      # Shared UI (BottomNav, MoodSelector, etc.)
│   ├── contexts/        # Theme context
│   ├── lib/             # Core logic (crypto, db, sync)
│   ├── pages/           # All route pages
│   ├── App.jsx          # Root + routing
│   └── index.css        # Design system
├── google-apps-script/  # GAS backend (also accessible in-app)
└── vite.config.js
```

---

## 📄 License

MIT
