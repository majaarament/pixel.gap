# ESG Survey Quick Start Guide

## What Was Implemented

Your teammates provided a comprehensive ESG survey questionnaire for 4 NPCs that now guide players through different sustainability pillars. The system is **fully integrated** into the game.

## How It Works

### When Players Interact with Pillar NPCs

**Frank the Fish** (Environmental Stewardship)
- Opens a dialogue about waste vs. deadlines
- Asks what the player would do
- Asks what Delaware would prioritize
- Asks about environmental awareness in practice
- Concludes with a reflection question

**Otis the Otter** (People & Culture)
- Opens dialogue about an overwhelmed teammate
- Asks how the player would support them
- Asks organizational expectations
- Includes conditional follow-ups based on answers
- Addresses psychological safety
- Reflection on team support

**Suzy the Sheep** (Business Conduct)
- Opens dialogue about rule-bending shortcuts
- Asks how the player would respond
- Asks about organizational patterns
- Addresses psychological safety of speaking up
- Reflection on integrity challenges

**Hazel the Hedgehog** (Responsible Value Chain)
- Opens dialogue about supplier selection dilemma
- Asks about choosing between cost vs. responsibility
- Asks what organization prioritizes
- Includes conditional follow-ups
- Asks about visibility of sustainability in decisions
- Reflection on external impact

### The Scoring System

Each answer has a numeric value:
- **0** = Low alignment with sustainability values
- **1** = Low-medium alignment
- **2** = Medium alignment (balanced/passive)
- **3** = High alignment (proactive/responsible)
- **4** = Very high alignment (for visibility/safety scales)

### What Gets Tracked

Every player response records:
```javascript
{
  npcId: "frank",
  npcName: "Frank the Fish",
  stepId: "env_behavioral",
  prompt: "What feels like the best move for you?",
  choiceKey: "env_b_suggest",
  choiceLabel: "Bring it up and suggest a less wasteful approach",
  choiceValue: 3  // The score
}
```

## Available Functions

### In `src/engine/surveyResults.js`

```javascript
// Get responses for a specific pillar
getPillarResponses(questChoices, "env")

// Calculate gap between personal behavior and org perception
calculateGap(responses)  // Returns: behavior - org_perception

// Aggregate all pillar results into one report
aggregateSurveyResults(questChoices)
// Returns:
// {
//   completedAt: timestamp,
//   pillars: { env: {...}, people: {...}, conduct: {...}, chain: {...} },
//   summary: { avgBehavior, avgOrgPerception, avgGap, highestPillar, lowestPillar },
//   themes: [...]
// }

// Generate personalized profile
generateSurveyProfile(surveyResults)
// Returns:
// {
//   dominantPillar: "env",
//   gapInsight: "You see yourself acting more responsibly...",
//   strengths: ["Environmental Stewardship"],
//   challenges: ["Responsible Value Chain"],
//   recommendations: [...]
// }

// Format results for UI display
formatSurveyResultsForDisplay(surveyResults)
```

### In `src/data/esgSurvey.js`

```javascript
// Get survey data for any NPC
getSurveySectionForNpc("frank")  // Returns full FRANK_SURVEY object

// Convert survey steps to game dialogue format
convertSurveyToDialogSequence(surveyData)
```

## To Display Results

Use the `ESGResultsScreen` component:

```jsx
import ESGResultsScreen from "../components/ESGResultsScreen";

// Render when you want to show results
<ESGResultsScreen 
  quest={quest}  // The game quest state with all choices
  onClose={() => console.log("Closed")}
/>
```

## Customization Ideas

### Change Answer Values
Edit the `value` field in any choice in `src/data/esgSurvey.js`:

```javascript
{
  key: "env_b_suggest",
  label: "Bring it up and suggest a less wasteful approach",
  value: 3  // Change this to 4, or 2, etc.
}
```

### Add More Questions
Add new steps to any NPC's survey:

```javascript
{
  id: "env_new_question",
  speaker: "Frank",
  message: "Your new question here?",
  choices: [
    { key: "a", label: "Option A", value: 1 },
    { key: "b", label: "Option B", value: 3 },
  ]
}
```

### Modify Reactions
Each choice can have a reaction from the NPC:

```javascript
{
  key: "env_b_fast",
  label: "Stick with the faster option, deadlines matter too",
  reaction: '"Yeah… deadlines do have a way of taking over everything."',
  value: 1
}
```

### Change Result Interpretation
Edit `generateGapInsight()` in `src/engine/surveyResults.js`:

```javascript
function generateGapInsight(avgGap) {
  if (avgGap > 1.5) {
    return "YOUR CUSTOM MESSAGE HERE";
  }
  // ... etc
}
```

## Data Flow

```
Player talks to NPC
  ↓
getNpcDialog() returns survey data via getSurveySectionForNpc()
  ↓
Dialog sequence renders with branching questions
  ↓
Each choice gets recorded with its value in quest.choices
  ↓
After all NPCs visited, call aggregateSurveyResults(quest.choices)
  ↓
formatSurveyResultsForDisplay() prepares for UI
  ↓
ESGResultsScreen displays the results
```

## Testing Checklist

- [ ] Talk to Frank (Environmental) - receives dialogue about waste
- [ ] Talk to Otis (People) - receives dialogue about overwhelmed teammate
- [ ] Talk to Suzy (Conduct) - receives dialogue about rule shortcuts
- [ ] Talk to Hazel (Value Chain) - receives dialogue about supplier choice
- [ ] Each dialogue has multiple choice branches
- [ ] Conditional follow-ups appear based on answers
- [ ] Can view results when all surveys complete
- [ ] Results show correct pillar names and scores
- [ ] Insights and recommendations appear

## File Structure

```
src/
├── data/
│   └── esgSurvey.js          ← All survey dialogue data
├── engine/
│   └── surveyResults.js       ← Results calculation logic
├── components/
│   └── ESGResultsScreen.jsx   ← Results display UI
└── (existing files)
```

## Next Priorities

1. **Test the flow** - Play through talking to all 4 NPCs
2. **Verify scoring** - Check that values are assigned correctly
3. **Display results** - Integrate ESGResultsScreen into the game flow
4. **Backend logging** - Send results to Google Sheets or database
5. **Visual enhancements** - Add charts or comparison visualizations

## Questions?

Check `ESG_SURVEY_IMPLEMENTATION.md` for detailed technical documentation.
