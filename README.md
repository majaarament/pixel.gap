# Bridging the ESG Gap — Gamified Diagnostic Tool (Layer 3)

This repository contains the source code for the employee-facing gamified component of the GAPI (Gap Alignment Performance Index) diagnostic tool, developed as the digital intervention for our Capstone Project in collaboration with Delaware.

The tool presents employees with a series of ESG decision scenarios inside an explorable pixel-art world (a town and an office). For each of the four ESG pillars — Environmental Stewardship, People & Culture, Business Conduct, and Responsible Value Chain — the player makes a personal choice, estimates what they believe the organisation would do, and rates how visible that pillar is in their daily work. A short reflection and an AI-driven council dialogue follow. All responses are logged anonymously and feed the GAPI scoring pipeline that powers the management dashboard.

This README documents the architecture and the steps needed to run and reproduce the application.

## Quick start

```bash
npm install
npm run dev
```

`npm run dev` starts the local Node API server on `http://localhost:8787`, and Vite proxies all `/api/*` requests to it during development. On Vercel, those same `/api/*` calls are served by the functions in the `api/` directory, so no code changes are needed between local and deployed environments.

## Architecture overview

The codebase separates concerns into four layers: **constants**, a stateless **engine**, immutable **data** maps, a pure **renderer**, and a thin React **component** layer driven by a single state hook. Rendering is intentionally side-effect free; all game logic lives in one hook.

### Configuration

| File | Responsibility |
| --- | --- |
| `constants/game.js` | Single source of truth for all numeric constants. |

### Engine (pure logic, no React)

| File | Responsibility |
| --- | --- |
| `engine/mapUtils.js` | Pure math helpers, canvas primitives (rect / outline), and coordinate transforms. |
| `engine/npcLogic.js` | NPC movement AI — stationary toggle and patrol pathfinding. |

### Data (map and NPC definitions)

| File | Responsibility |
| --- | --- |
| `data/townMap.js` | All town tile Sets and arrays, the blocking Set, and `townGroundTypeAt`. |
| `data/officeMap.js` | All office tile Sets and arrays, the blocking Set, and `officeGroundTypeAt`. |
| `data/scenes.js` | The `SCENES` registry, entry / exit tile coordinates, and `isWalkable`. |
| `data/npcs.js` | NPC start positions, dialogue strings, and `getTaskLabel`. |

### Renderer (pure drawing functions)

| File | Responsibility |
| --- | --- |
| `renderer/tiles.js` | Every ground-tile draw function plus the `drawGround` dispatcher. |
| `renderer/props.js` | Trees, fences, benches, signs, barrels, flowers, and rocks. |
| `renderer/buildings.js` | Lodge, house, cabin, office building, and statues. |
| `renderer/furniture.js` | Desks, counters, plants, and office decor items. |
| `renderer/characters.js` | `drawCritter` and `drawSpeechBubble`. |
| `renderer/drawScene.js` | Pure `drawScene(ctx, params)` — orchestrates the full frame. |

### State and components (React)

| File | Responsibility |
| --- | --- |
| `hooks/useGameState.js` | All `useState` / `useRef` / `useEffect` — the only place that holds game logic. |
| `components/GameCanvas.jsx` | The canvas element and requestAnimationFrame loop; passes state into `drawScene`. |
| `components/InfoRow.jsx` | Static info cards displayed at the bottom of the screen. |
| `App.jsx` | Calls `useGameState` and renders the three components. |

### Key design rule

`playerRef` and `npcRefs` are mutable refs that are always kept in sync with state inside `useGameState`. `GameCanvas` reads from them on every animation frame, so the draw loop never sees stale positions. At the same time, the `useEffect` dependency array still triggers a loop restart on the state changes that actually matter for rendering — dialog, nearby NPC, current scene, and so on. This gives us smooth per-frame updates without re-running the animation loop on every tick.

## AI integration

AI features are served entirely through same-origin serverless routes; the OpenAI key never reaches the React client.

| Client module | Endpoint | Purpose |
| --- | --- | --- |
| `src/engine/councilAI.js` | `POST /api/council-ai` | Drives the NPC council debate dialogue. |
| `src/engine/esgGuideAI.js` | `POST /api/esg-guide` | Provides the in-game ESG guide responses. |
| `src/engine/logger.js` | `POST /api/log-event` | Forwards anonymised events to the logging pipeline. |

React always calls `fetch("/api/...")`, and the serverless function calls OpenAI using `process.env.OPENAI_API_KEY`. To test the connection independently, you can call the generic route in `api/chat.js`:

```js
async function askAI(prompt) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data.text;
}
```

## Anonymous response logging (Google Sheets)

Sessions are logged to a Google Sheet via a Google Apps Script web app. Set the endpoint in `.env.local`:

```bash
SHEETS_ENDPOINT="https://script.google.com/macros/s/your-script-id/exec"
```

Before deployment, update `docs/google-apps-script.gs`:

- Set `SPREADSHEET_ID` to your target Google Sheet ID.
- Keep `SHEET_NAME` as `responses` if you are using the provided Apps Script.
- Deploy the web app with **Execute as: Me** and **Who has access: Anyone, even anonymous**.

A starter Apps Script receiver is included at `docs/google-apps-script.gs`.

The application logs three event types:

- `profile_submitted` — when the player starts a session.
- `question_answer` — for every in-game ESG question response.
- `council_message` — for every player and council turn in the debate.

Each row includes an anonymous, persistent browser `userId` and a per-tab `sessionId`, so events can be grouped per participant without ever collecting a name or email. This design directly supports the tool's anonymity and GDPR commitments described in the Final Report.

## Deployment (Vercel + OpenAI)

1. Push this repository to GitHub and import it into Vercel as a Vite project.
2. In Vercel, add the following environment variables:
   - `OPENAI_API_KEY` (required)
   - `SHEETS_ENDPOINT` (optional — only if Google Sheets logging is enabled)
3. Deploy. Vercel serves the React application and the serverless functions in `api/` from the same origin.

## Reproducibility notes

- The code is provided as static, self-contained source files; no external repository or live-storage links are required to run it.
- AI-generated content (council dialogue and ESG guide responses) is non-deterministic by design, so individual runs will vary in wording while following the same prompt logic.
- A sample logging payload and the Apps Script receiver are included so the data pipeline can be reproduced without access to the original Delaware deployment.
