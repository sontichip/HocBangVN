Integration: User file uploads -> Gemini-generated lessons

Overview
- We add a small server to accept user file uploads and produce lesson JSON.
- Frontend components: `LoginScreen` to choose mode, `UserContentScreen` to upload and preview.

Server (Node for upload/lesson storage)
- `server/index.js` exposes `POST /api/process` that accepts files and returns a generated lesson JSON.
- Auth demo endpoints: `POST /api/login`, `GET /api/lessons`, `GET /api/lessons/:id`.

Run server locally
```bash
cd server
npm install express multer node-fetch
node index.js
```

Server (PHP for direct Gemini Q&A)
- `php-backend/public/index.php` exposes `POST /api/ask`.
- Uses `vlucas/phpdotenv` and reads `GOOGLE_API_KEY` from `php-backend/.env`.

Run PHP API locally
```bash
cd php-backend
composer install
cp .env.example .env
# set GOOGLE_API_KEY in .env
php -S localhost:8000 -t public
```

Notes for Gemini integration
- Node server can call Google API when `GOOGLE_API_KEY` exists in environment.
- PHP API calls `gemini-1.5-flash` directly via cURL and returns JSON.
- For larger files, extract text first (pdf/docx parsing) then send content to Gemini with system prompt instructing it to output JSON with fields: title, description, questions[].

Frontend
- `src/components/LoginScreen.jsx` lets the user choose curated vs upload vs AI assistant mode.
- `src/components/UserContentScreen.jsx` posts files to `http://localhost:5174/api/process` with Bearer token and can list user lessons.
- `src/components/AiAssistantScreen.jsx` posts questions to `http://localhost:8000/api/ask` and shows Gemini answers.

Security
- `.gitignore` blocks `.env` files.
- Never commit API keys. If a key was exposed, rotate it immediately.
