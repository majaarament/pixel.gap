# ESG Survey System Implementation

## Overview
This implementation adds a comprehensive ESG (Environmental, Social, Governance) survey questionnaire to the Pixel Gap game. Players interact with 4 NPC guides (Frank, Otis, Suzy, and Hazel) who represent different pillars of sustainability, each asking behavioral and perception-based questions.

## Files Created/Modified

### New Files Created

1. **`src/data/esgSurvey.js`** - Survey dialogue data
   - Defines all 4 pillar surveys with branching questions
   - `FRANK_SURVEY` - Environmental Stewardship pillar
   - `OTIS_SURVEY` - People & Culture pillar
   - `SUZY_SURVEY` - Business Conduct pillar
   - `HAZEL_SURVEY` - Responsible Value Chain pillar
   - Helper functions to convert survey data to game dialogue format

2. **`src/engine/surveyResults.js`** - Results analysis engine
   - `aggregateSurveyResults()` - Processes all player choices and calculates scores
   - `generateSurveyProfile()` - Creates a personalized profile based on responses
   - `formatSurveyResultsForDisplay()` - Prepares results for UI display
   - Functions to calculate gaps, identify strengths/challenges, and generate recommendations

3. **`src/components/ESGResultsScreen.jsx`** - Results display component
   - Beautiful React component showing aggregated results
   - Displays scores by pillar
   - Shows insights, strengths, challenges, and recommendations
   - Modal overlay with scrollable content

### Modified Files

1. **`src/data/npcs.js`**
   - Added imports for new ESG survey modules
   - Updated `getNpcDialog()` function to use new survey data for frank/otis/suzy/hazel NPCs
   - Fallback messages for repeat NPC visits

## Survey Structure

Each pillar survey includes:

### Environmental Stewardship (Frank)
- Intro dialogue about waste/environmental shortcuts
- Q1: Behavioral - What would you do?
- Q2: Org Perception - What would Delaware prioritize?
- Q3: Visibility - How often do people think about environmental impact?
- Q4: Reflection - Gap between goals and practice

### People & Culture (Otis)
- Intro dialogue about overwhelmed team member
- Q1: Behavioral - How would you support them?
- Q2: Org Perception - What usually happens in the organization?
- Q2.1: Follow-up (conditional) - What makes the difference?
- Q3: Safety - How safe to speak up?
- Q3.1: Follow-up (conditional) - What makes it harder?
- Q4: Reflection - What would help people feel supported?

### Business Conduct (Suzy)
- Intro dialogue about small rule-bending patterns
- Q1: Behavioral - How would you respond?
- Q2: Org Perception - What usually happens with compliance issues?
- Q2.1: Follow-up (conditional) - What does it depend on?
- Q3: Safety - How comfortable speaking up?
- Q4: Reflection - What makes it easier or harder?

### Responsible Value Chain (Hazel)
- Intro dialogue about supplier selection dilemma
- Q1: Behavioral - Which supplier to choose?
- Q2: Org Perception - What's usually prioritized?
- Q2.1: Follow-up (conditional) - When do priorities shift?
- Q3: Visibility - How often is long-term impact considered?
- Q4: Reflection - Where could company make bigger difference?

## Scoring System

Each answer choice has a **value** (typically 0-4 scale):
- 0 = Low alignment with pillar values
- 1 = Low-medium alignment
- 2 = Medium alignment
- 3 = High alignment
- 4 = Very high alignment (typically for "safety/visibility" questions)

Some questions may have `null` values for "depends on context" answers.

## Results Calculation

The `surveyResults.js` engine:

1. **Extracts responses** for each pillar across all NPCs
2. **Calculates individual metrics**:
   - Behavior score (what they said they'd do)
   - Org Perception score (what they think organization does)
   - Gap = behavior - org perception
   - Visibility/Safety scores

3. **Aggregates to summary**:
   - Average behavior across pillars
   - Average org perception
   - Average gap
   - Identifies strongest and weakest pillars

4. **Generates insights**:
   - Gap interpretation (are you ahead or behind org?)
   - Identified strengths (high behavior scores)
   - Identified challenges (low behavior scores)
   - Personalized recommendations

## Integration Points

### In `useGameState.js`
The game state already handles:
- Recording choices via `recordChoice()`
- Storing all choices in `quest.choices`
- Managing quest stages and NPC beats

### Display Results
To show results in the game, integrate `ESGResultsScreen` component:

```jsx
// In GameCanvas or appropriate component:
import ESGResultsScreen from "../components/ESGResultsScreen";

// When results should display:
{resultScreenOpen && (
  <ESGResultsScreen 
    quest={quest} 
    onClose={() => setResultScreenOpen(false)} 
  />
)}
```

## Usage Flow

1. Player encounters each pillar NPC (frank, otis, suzy, hazel)
2. NPC opens dialogue sequence with branching questions
3. Player's choices are recorded with their corresponding values
4. After completing all NPCs, results can be aggregated
5. `ESGResultsScreen` displays personalized insights

## Example Output

```
Your ESG Perspective
Strongest lens: Environmental Stewardship

Summary Scores:
- Your Behavior: 2.8/4.0
- Organization Perception: 1.9/4.0
- Your Gap: +0.9 (you're ahead)

By Pillar:
- Environmental: You 3, Org 2, Gap +1
- People & Culture: You 3, Org 1, Gap +2
- Business Conduct: You 3, Org 2, Gap +1
- Value Chain: You 2, Org 3, Gap -1

Insights:
- You see yourself acting more responsibly than the organization typically does
- Strengths: Environmental Stewardship, People & Culture
- Challenges: Responsible Value Chain
- Recommendation: Consider how to bridge gaps through advocacy
```

## Next Steps

1. **Open-ended responses**: Handle text responses for reflection questions
2. **Advanced analytics**: Store results in backend/database
3. **Profile branching**: Unlock different NPCs or quests based on survey profile
4. **Visual enhancements**: Add charts, progress bars, comparative visualizations
5. **Export functionality**: Allow players to export their results
6. **Team comparison**: (Optional) Compare individual results with team aggregates

## Technical Notes

- All survey data is stored as JavaScript objects for easy modification
- Scoring values can be customized per choice without changing logic
- Results are calculated client-side; no backend required initially
- All player responses are in `quest.choices` array with full context
- The results component is designed to work with existing game styling

