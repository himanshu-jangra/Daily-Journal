## App masterplan.md

### 1. App Overview & Objectives

A privacy-centric, Progressive Web App (PWA) designed for daily journaling. The app acts as a "thick client" that handles data entry and encryption locally, using a user-owned Google Sheet (via Google Apps Script) as a "dumb" storage backend.

-   **Goal:**  Provide a mindful, low-friction journaling experience.
    
-   **Privacy:**  Zero-knowledge storage. Data is encrypted before it leaves the device.
    
-   **Availability:**  Works offline; syncs when online.
    

### 2. Target Audience

-   Individual users seeking a private, permanent record of their thoughts without relying on third-party database providers.
    

### 3. Core Features & Functionality

-   **Daily Check-in:**  A survey-style flow presenting 5 random questions from a user-managed pool.
    
-   **Quick Add:**  Ability to add subsequent free-form entries throughout the day without the survey.
    
-   **Offline-First Sync:**  Data is saved to IndexedDB/LocalStorage and synced to Google Sheets via a background queue.
    
-   **Customizable Settings:**  * Edit the pool of questions.
    
    -   Set a daily push notification reminder time.
        
    -   Toggle between Pastel Light Mode and Dark Mode.
        
-   **Manual Decryption Tool:**  A standalone utility page to decrypt "blobs" from the Google Sheet using the User/System keys.
    

### 4. Technical Stack Recommendations

-   **Frontend:**  React or Vue.js (for reactive UI) with Tailwind CSS (for the pastel/calm styling).
    
-   **PWA:**  Service Workers for offline caching and local notifications.
    
-   **Database (Local):**  **IndexedDB**  (via a library like Dexie.js) to manage the sync queue and local history.
    
-   **Backend (Storage):**  **Google Apps Script (GAS)**  deployed as a Web App. It receives encrypted strings and appends them to a Google Sheet.
    
-   **Encryption:**  **AES-256 (CryptoJS)**. The key is a hash of  `System_Key + User_Key`.
    

### 5. Conceptual Data Model

**Entry Object (Pre-Encryption):**

-   `timestamp`: ISO String
    
-   `type`: "survey" | "quick_add"
    
-   `content`: Object (Question/Answer pairs) or String
    
-   `sync_status`: "pending" | "synced"
    

**Google Sheet Structure (Post-Encryption):**

| Timestamp | Encrypted Blob (AES-256) |

| :--- | :--- |

| 2026-03-26 20:00 |  `U2FsdGVkX19...`  |

### 6. User Interface Design Principles

-   **Calm & Focused:**  Minimalist pastel colors (Mint, Soft Blue, Peach).
    
-   **Progressive Disclosure:**  One question at a time with a progress bar.
    
-   **Adaptive:**  PWA feel (no browser address bar when saved to home screen).
    

### 7. Security Considerations

-   **Key Security:**  The decryption key is never sent to the Google Sheet or Google Apps Script.
    
-   **Local Security:**  The keys are stored in the browser's secure storage. If the user clears site data, they must know their username to re-generate the key.
    
-   **Integrity:**  The app will detect if a Sheet exists; if not, it initializes a new one to prevent overwriting unrelated data.
    

### 8. Development Phases

1.  **Phase 1:**  UI/UX Mockups & Pastel Theme implementation.
    
2.  **Phase 2:**  Local Storage & Encryption logic (CryptoJS integration).
    
3.  **Phase 3:**  Google Apps Script setup & "Sync Queue" development.
    
4.  **Phase 4:**  Settings, Question Pool management, and PWA/Notification setup.
    
5.  **Phase 5:**  Manual Decryption tool and final testing.
    

### 9. Future Expansion

-   Adding "Mood Tracking" visualizations based on decrypted local data.
    
-   Image attachment support (converting images to Base64 before encryption).
    