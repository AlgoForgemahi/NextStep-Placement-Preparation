# NextStep — Placement Preparation

React + Java 21/Spring Boot + PostgreSQL application. This project is separate from `Placement_Preparation_App`. All application source is in this folder.

## Start on Windows

### Quick restart on this computer

**Recommended:** double-click `Start-App.cmd` in this project folder, or run `npm run dev` from the project root or frontend directory. The frontend's `predev` step first starts PostgreSQL and the backend, waits for the backend to respond, then starts Vite. Keep the terminal open while using the app. Run this once after restarting Windows; the services do not start automatically at Windows login.

After restarting Windows, start the saved local database and packaged backend from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-local.ps1
```

Then run `npm run dev --prefix frontend` in your terminal if the frontend is not already running. Keep using port 4174. Running only the frontend causes `ECONNREFUSED 127.0.0.1:8081` when signing in or registering. The startup script uses private, machine-specific paths in `.local/runtime.json`, reuses an already running backend, and does not create or reset any database. It runs the packaged JAR; after editing Java source, rebuild with Java 21 and Maven first. Use the installation steps below on another computer.

1. Install Node.js 22.12 or newer, Java 21, Maven 3.9+, and PostgreSQL. Make `node`, `java`, and `mvn` available in your terminal.
2. Create a PostgreSQL database and a dedicated database user using [database/README.md](database/README.md).
3. Open this folder in VS Code. Copy `.env.example` to `.env` if `.env` does not already exist. Fill in your database URL, username, and password. Keep this file private. An existing local configuration must not be overwritten.
4. In the first PowerShell terminal, run:

```powershell
Set-Location 'C:\Users\acer\OneDrive\Desktop\Placement_Preparation_App_New'
powershell -ExecutionPolicy Bypass -File .\scripts\start-backend.ps1
```

5. In a second terminal, run:

```powershell
Set-Location 'C:\Users\acer\OneDrive\Desktop\Placement_Preparation_App_New'
npm ci --prefix frontend
npm run dev --prefix frontend
```

6. Open http://127.0.0.1:4174 and register your account. The API runs on port 8081. Vite proxies `/api` to the backend; use the frontend address to preserve same-origin session and CSRF handling.

Flyway creates tables and sample content on first startup. Never edit an already-applied migration; add a new migration instead. The application does not create PostgreSQL itself.

## Available modules

- Overview: saved activity, daily targets, milestones, charts, recommendations, and coverage.
- Aptitude and Technical: paginated study banks, timed randomized quizzes, palette, flags, bookmarks, server-side scoring, explanations, and history.
- Coding: syntax-highlighted editor, sample inputs, hints, submission history, and optional Judge0-compatible execution adapter.
- Resume Review: PDF/DOCX extraction, transparent rule-based completeness checks, skills and keyword matching, history, and JSON export.
- Interview Practice: text interviews, configurable sessions, timer, self-ratings, model answers, and saved history.
- My Progress: date-filtered persisted activity, topic accuracy, goals, streaks, and export.

Authentication uses BCrypt and server-side sessions. State-changing requests require CSRF tokens. Private history is scoped to the authenticated user. Uploaded resume files are parsed in memory; only the derived feedback report is saved.

## Validation

```powershell
npm run build --prefix frontend
mvn -f backend/pom.xml test
node scripts/integration.cjs
```

The integration script requires both services and PostgreSQL, creates synthetic test accounts, and verifies persistent authentication, scoring, ownership, CSRF, bookmarks, goals, and history. It currently expects the default seed dataset and an unconfigured execution service.

## External services and current limits

See [docs/STATUS.md](docs/STATUS.md) for implemented behavior, outstanding requirements, and actual validation results. This is a working development application; the full advanced feature specification is not yet complete.

Code execution requires a separately operated, securely sandboxed Judge0-compatible provider. Configure `EXECUTION_URL` and optionally `EXECUTION_KEY`. Without it, submissions are saved as ungraded and the interface explicitly says execution is unavailable. Never execute submitted code directly in Spring Boot.

Resume and interview feedback use documented rules, not AI. No ATS certification, grammar engine, speech recognition, or AI service is connected. Readiness coverage is learning coverage, not a hiring prediction.

For deployment use HTTPS, secure cookies (`COOKIE_SECURE=true`), a same-origin reverse proxy, managed secrets, backups, upload and request rate limits, and an independently secured execution service. Vite preview is for local verification, not a production web server.
