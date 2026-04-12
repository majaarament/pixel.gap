# ESG Survey System - Visual Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PIXEL GAP ESG SURVEY SYSTEM                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  GAME FLOW                                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Player Starts Game                                                     │
│         ↓                                                               │
│  Meets Olive (Guide) → Answers baseline questions → Gets objective    │
│         ↓                                                               │
│  TOWN ZONE                    │  OFFICE ZONE                           │
│  ┌───────────────────────┐   │   ┌──────────────────────┐             │
│  │ Frank (Environment)   │   │   │ Suzy (Conduct)       │             │
│  │ [Survey Questions]    │   │   │ [Survey Questions]   │             │
│  │ ✓ Recorded choices    │   │   │ ✓ Recorded choices   │             │
│  └───────────────────────┘   │   └──────────────────────┘             │
│  ┌───────────────────────┐   │   ┌──────────────────────┐             │
│  │ Otis (People)         │   │   │ Hazel (Value Chain)  │             │
│  │ [Survey Questions]    │   │   │ [Survey Questions]   │             │
│  │ ✓ Recorded choices    │   │   │ ✓ Recorded choices   │             │
│  └───────────────────────┘   │   └──────────────────────┘             │
│         ↓                     │              ↓                          │
│  All visited + recorded      │  All visited + recorded                │
│         ↓                     └──────────────────┬───────────────────↓  │
│  Return to Olive at Council → Final reflection → Results Aggregation  │
│                                                        ↓               │
│                                            ESGResultsScreen displays   │
│                                                        ↓               │
│                                                   Player sees insights  │
│                                                                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  DATA STRUCTURE                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  quest.choices = [                                                      │
│    {                                                                     │
│      npcId: "frank",              ← Which NPC                          │
│      npcName: "Frank the Fish",   ← NPC name                           │
│      stepId: "env_behavioral",    ← Which question                     │
│      prompt: "What feels like...", ← Question text                     │
│      choiceKey: "env_b_suggest",  ← Which option selected              │
│      choiceLabel: "Bring it up...",← Option text                       │
│      choiceValue: 3               ← SCORE (0-4)                        │
│    },                                                                    │
│    { ... more choices ... },                                            │
│  ]                                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  RESULTS CALCULATION                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  INPUT: quest.choices (array of player responses)                      │
│         ↓                                                               │
│  aggregateSurveyResults()                                              │
│         ↓                                                               │
│  For each pillar (env, people, conduct, chain):                       │
│    • Find behavior score (Q1 answer)                                   │
│    • Find org perception score (Q2 answer)                             │
│    • Calculate gap = behavior - org_perception                         │
│    • Extract visibility or safety score                                │
│         ↓                                                               │
│  OUTPUT: surveyResults = {                                             │
│    pillars: {                                                           │
│      env: { behavior: 3, orgPerception: 1, gap: 2, visibility: 2 },   │
│      people: { behavior: 3, orgPerception: 2, gap: 1, safety: 2 },   │
│      conduct: { behavior: 3, orgPerception: 2, gap: 1, safety: 2 },  │
│      chain: { behavior: 2, orgPerception: 3, gap: -1, visibility: 2 } │
│    },                                                                    │
│    summary: {                                                            │
│      avgBehavior: 2.75,                                                │
│      avgOrgPerception: 2.0,                                            │
│      avgGap: 0.75,                                                     │
│      highestPillar: { name: "Environmental..." },                      │
│      lowestPillar: { name: "Value Chain..." }                         │
│    }                                                                     │
│  }                                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  RESULTS DISPLAY (ESGResultsScreen)                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Your ESG Perspective                                             │  │
│  │ Strongest lens: Environmental Stewardship                        │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                   │  │
│  │ Your Score: 2.8    Org Score: 1.9    Your Gap: +0.9            │  │
│  │                                                                   │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ By Pillar:                                                       │  │
│  │  • Environmental: You 3, Org 2, Visibility 2                    │  │
│  │  • People: You 3, Org 1, Safety 2                               │  │
│  │  • Conduct: You 3, Org 2, Safety 2                              │  │
│  │  • Value Chain: You 2, Org 3, Visibility 2                      │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ Your Insights:                                                   │  │
│  │                                                                   │  │
│  │ Gap: You see yourself acting more responsibly than the           │  │
│  │ organization typically does—you may experience tension between   │  │
│  │ your values and organizational norms.                            │  │
│  │                                                                   │  │
│  │ Strengths: Environmental Stewardship, People & Culture           │  │
│  │ Challenges: Responsible Value Chain                              │  │
│  │                                                                   │  │
│  │ Recommendations:                                                 │  │
│  │ 1. Consider how to bridge gaps through small advocacy efforts    │  │
│  │ 2. Psychological safety concerns are real—build trust first      │  │
│  │ 3. Even small vendor conversations influence larger choices      │  │
│  │                                                                   │  │
│  │ [Close Results]                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  FILE STRUCTURE (NEW FILES)                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  src/data/esgSurvey.js (649 lines)                                      │
│    ├── FRANK_SURVEY                                                     │
│    │   ├── steps[] (6 questions)                                        │
│    │   └── choices[] with values                                        │
│    ├── OTIS_SURVEY                                                      │
│    │   ├── steps[] (8 questions with conditionals)                      │
│    │   └── choices[] with values                                        │
│    ├── SUZY_SURVEY                                                      │
│    │   ├── steps[] (7 questions)                                        │
│    │   └── choices[] with values                                        │
│    ├── HAZEL_SURVEY                                                     │
│    │   ├── steps[] (7 questions)                                        │
│    │   └── choices[] with values                                        │
│    ├── getSurveySectionForNpc()                                         │
│    └── convertSurveyToDialogSequence()                                  │
│                                                                          │
│  src/engine/surveyResults.js (147 lines)                                │
│    ├── getPillarResponses()                                             │
│    ├── calculateGap()                                                   │
│    ├── aggregateSurveyResults()                                         │
│    ├── generateSurveyProfile()                                          │
│    ├── formatSurveyResultsForDisplay()                                  │
│    ├── generateGapInsight()                                             │
│    ├── generateStrengths()                                              │
│    ├── generateChallenges()                                             │
│    └── generateRecommendations()                                        │
│                                                                          │
│  src/components/ESGResultsScreen.jsx (195 lines)                        │
│    ├── Summary scores display                                           │
│    ├── Pillar breakdown                                                 │
│    ├── Insights section                                                 │
│    ├── Recommendations list                                             │
│    └── Professional styling                                             │
│                                                                          │
│  Documentation:                                                         │
│    ├── ESG_SURVEY_COMPLETE.md          (Summary)                        │
│    ├── ESG_SURVEY_QUICK_START.md       (5 min guide)                    │
│    ├── ESG_SURVEY_IMPLEMENTATION.md    (15 min deep dive)               │
│    ├── ESG_SURVEY_EXAMPLES.js          (10 code examples)               │
│    └── ESG_SURVEY_CHECKLIST.md         (Testing checklist)              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  MODIFIED FILES                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  src/data/npcs.js                                                       │
│    • Added import statements for esgSurvey modules                      │
│    • Updated getNpcDialog() function for frank/otis/suzy/hazel         │
│    • Added repeat-visit messages                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  SCORING REFERENCE                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Behavioral Questions (Typical):                                        │
│    0 = No action / Focus on own work                                    │
│    1 = Passive / Minimal engagement                                     │
│    2 = Balanced / Indirect action                                       │
│    3 = Proactive / Direct engagement                                    │
│                                                                          │
│  Perception Questions (Typical):                                        │
│    1 = Low organizational priority                                      │
│    2 = Medium / Sometimes addressed                                     │
│    3 = High priority / Usually addressed                                │
│    null = Depends on context                                            │
│                                                                          │
│  Visibility/Safety Questions:                                           │
│    1 = Almost never / Not safe                                          │
│    2 = Rarely / Not very safe                                           │
│    3 = Sometimes / Somewhat safe                                        │
│    4 = Very often / Very safe                                           │
│                                                                          │
│  Gap Interpretation:                                                    │
│    +2 or more = Strong gap (you ahead)                                  │
│    +0.5 to +2 = Moderate gap                                            │
│    -0.5 to +0.5 = Aligned                                               │
│    -0.5 to -2 = You less active than org                               │
│    -2 or less = Strong inverse gap                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | ~1,100 lines |
| **New Files Created** | 3 JS files + 5 docs |
| **Files Modified** | 1 (npcs.js) |
| **Survey Questions** | ~30 questions across 4 NPCs |
| **Multiple Choice Options** | 100+ answer combinations |
| **Result Metrics** | 15+ calculated metrics |
| **Documentation Pages** | 5 comprehensive guides |
| **Code Examples** | 10 working examples |

---

## Status: ✅ READY TO USE

The ESG survey system is **fully implemented and integrated**. 

**Next step:** Test by playing the game and visiting the pillar NPCs!
