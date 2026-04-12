# How to View ESG Survey Results in the Game

## Current Status

The ESG survey system is **fully implemented** in the game code. The 4 pillar NPCs (Frank, Otis, Suzy, Hazel) now have complete survey dialogues that record player responses with scoring values.

## How to Test It

### 1. Start the Game
```bash
cd /Users/biankasledzinska/Downloads/pixel.gap
npm run dev
```

Then open http://localhost:5173 in your browser.

### 2. Play Through Normally
- Create a player profile
- Walk around the town
- Visit the 4 pillar NPCs in order:
  1. **Frank the Fish** (town, near water)
  2. **Otis the Otter** (town)
  3. **Suzy the Sheep** (inside office building)
  4. **Hazel the Hedgehog** (inside office building)

### 3. Answer Their Survey Questions
Each NPC will ask you:
- **Behavioral question** - What would you do?
- **Org perception question** - What would the organization do?
- **Follow-up questions** - Conditional on your answers
- **Reflection question** - Open-ended thoughts

### 4. See Your Scores
In the browser Developer Tools (F12), open the Console and run:

```javascript
// After talking to NPCs, type this in console:
const results = aggregateSurveyResults(window.gameState.quest.choices);
console.log(results);
```

## How to Display Results in the Game UI

To add a results screen to the game, you need to:

### Option A: Add to Post-Game Screen (Easy)

Edit `src/components/ResultsOverlay.jsx` or create a new state in `useGameState`:

```javascript
// In useGameState.js, add a new state:
const [esgResultsOpen, setEsgResultsOpen] = useState(false);

// In the return, add the results screen:
{esgResultsOpen && (
  <ESGResultsScreen 
    quest={quest}
    onClose={() => setEsgResultsOpen(false)}
  />
)}

// Add a button to show results:
<button onClick={() => setEsgResultsOpen(true)}>
  View ESG Results
</button>
```

### Option B: Auto-Show After Rowan (Medium)

Edit `src/components/ResultsOverlay.jsx` to include the ESG results:

```javascript
import ESGResultsScreen from "./ESGResultsScreen";

// In the overlay component:
{showESGResults && (
  <ESGResultsScreen quest={quest} onClose={dismissOverlay} />
)}
```

### Option C: Create Dedicated Results Page (Advanced)

Create a new screen in `src/components/`:

```javascript
// src/components/ESGSurveyResultsPage.jsx
import ESGResultsScreen from "./ESGResultsScreen";

export default function ESGSurveyResultsPage({ quest, onBack }) {
  return (
    <div style={{ height: "100vh", background: "#dfe6da" }}>
      <ESGResultsScreen quest={quest} onClose={onBack} />
    </div>
  );
}
```

## Accessing Results Programmatically

### Get All Pillar Results
```javascript
import { aggregateSurveyResults } from "./src/engine/surveyResults";

const results = aggregateSurveyResults(quest.choices);
console.log("Results:", results);
```

### Get Specific Pillar
```javascript
import { getPillarResponses } from "./src/engine/surveyResults";

const envResults = getPillarResponses(quest.choices, "env");
console.log("Environmental pillar:", envResults);
```

### Get Personalized Profile
```javascript
import { generateSurveyProfile, formatSurveyResultsForDisplay } from "./src/engine/surveyResults";

const results = aggregateSurveyResults(quest.choices);
const profile = generateSurveyProfile(results);
const display = formatSurveyResultsForDisplay(results);

console.log("Profile:", profile);
console.log("Display format:", display);
```

## Data Available

After aggregating results, you have access to:

```javascript
results = {
  completedAt: "2024-04-12T...",
  
  pillars: {
    env: {
      key: "env",
      name: "Environmental Stewardship",
      behavior: 3,           // 0-4 scale
      orgPerception: 1,      // 0-4 scale
      visibility: 2,         // 1-4 scale
      gap: 2,                // positive = user ahead
      themes: "Text response"
    },
    people: {
      key: "people",
      name: "People & Culture",
      behavior: 3,
      orgPerception: 2,
      safety: 2,             // 1-4 scale
      gap: 1,
      themes: "Text response"
    },
    conduct: {
      key: "conduct",
      name: "Business Conduct",
      behavior: 3,
      orgPerception: 2,
      safety: 2,
      gap: 1,
      themes: "Text response"
    },
    chain: {
      key: "chain",
      name: "Responsible Value Chain",
      behavior: 2,
      orgPerception: 3,
      visibility: 2,
      gap: -1,               // negative = org ahead
      themes: "Text response"
    }
  },
  
  summary: {
    avgBehavior: 2.75,           // average across pillars
    avgOrgPerception: 2.0,       // average across pillars
    avgGap: 0.75,                // average gap
    highestPillar: {...},        // pillar object with highest behavior
    lowestPillar: {...}          // pillar object with lowest behavior
  }
}
```

## For Right Now

The quickest way to see results is to:

1. **Play the game** - Talk to all 4 pillar NPCs
2. **Open browser console** (F12)
3. **Paste this code:**

```javascript
// Get the game state from React
const gameState = document.querySelector('[data-game-state]')?.__reactPropsHook;

// Or access through window if exposed
if (window.__gameState) {
  const results = aggregateSurveyResults(window.__gameState.quest.choices);
  console.table(results.pillars);
  console.table(results.summary);
}
```

Or check the Network tab in DevTools to see what data is being logged.

## Verifying It Works

### Check 1: Choices Are Being Recorded
```javascript
console.log(window.__gameState?.quest?.choices || "No choices recorded");
```

Should show an array of choice objects with npcId, choiceValue, etc.

### Check 2: Results Can Be Aggregated
```javascript
// If aggregateSurveyResults is exported
const results = aggregateSurveyResults(questChoices);
console.log(results.summary);
```

Should show avgBehavior, avgOrgPerception, avgGap values.

### Check 3: ESGResultsScreen Component Works
```javascript
// Import and render
import ESGResultsScreen from "./src/components/ESGResultsScreen";

// Should render without errors
ReactDOM.render(
  <ESGResultsScreen quest={{choices: [...]}} onClose={() => {}} />,
  document.getElementById('root')
);
```

## Next: Integration with Game

Once verified working, integrate into the game by:

1. **Add button** to show results (in HUD, menu, or post-game)
2. **Import component** at top of file
3. **Add state** to track if results should show
4. **Render component** when state is true
5. **Handle close** to dismiss overlay

Example minimal integration:

```jsx
// In GameCanvas.jsx or App.jsx
import ESGResultsScreen from "./components/ESGResultsScreen";
import { useState } from "react";

export default function Game({ quest }) {
  const [showResults, setShowResults] = useState(false);

  return (
    <>
      {/* Game content */}
      <div>Game Here</div>

      {/* Results overlay */}
      {showResults && (
        <ESGResultsScreen quest={quest} onClose={() => setShowResults(false)} />
      )}

      {/* Button to trigger results */}
      {quest.stage === QUEST_STAGES.COMPLETE && (
        <button onClick={() => setShowResults(true)}>
          View Your ESG Results
        </button>
      )}
    </>
  );
}
```

---

## Troubleshooting

### "aggregateSurveyResults is not defined"
→ Need to import it: `import { aggregateSurveyResults } from "../engine/surveyResults"`

### "No choices recorded"
→ Make sure you talked to all 4 NPCs and selected answers

### "Results show NaN or undefined"
→ Check that choice objects have `choiceValue` property set

### "ESGResultsScreen not rendering"
→ Check browser console for errors, verify quest object is passed correctly

---

## File References

- **Results engine**: `src/engine/surveyResults.js`
- **Results component**: `src/components/ESGResultsScreen.jsx`
- **Survey data**: `src/data/esgSurvey.js`
- **Game state**: `src/hooks/useGameState.js` (contains quest.choices)
- **NPC dialogues**: `src/data/npcs.js` (updated getNpcDialog)

---

## Summary

✅ Survey is implemented in game  
✅ Responses are being recorded  
✅ Results can be calculated  
✅ Display component is ready  

**Just need to:** Connect the results screen to the game UI

Choose option A (easy) for quickest integration, or explore the console logs first to verify everything is working!
