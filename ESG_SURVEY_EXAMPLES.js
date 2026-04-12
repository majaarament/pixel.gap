/**
 * Example: How to Use the ESG Survey System
 * This file demonstrates how to integrate survey results into the game
 */

// ============================================================================
// Example 1: Getting Survey Results
// ============================================================================

import { aggregateSurveyResults, formatSurveyResultsForDisplay } from "../engine/surveyResults";

function displaySurveyResults(quest) {
  // Assuming quest.choices contains all player responses
  const rawResults = aggregateSurveyResults(quest.choices);
  
  console.log("Raw Results:", rawResults);
  // {
  //   completedAt: "2024-04-12T...",
  //   pillars: {
  //     env: { key: "env", name: "Environmental Stewardship", behavior: 3, orgPerception: 1, gap: 2, ... },
  //     people: { key: "people", name: "People & Culture", behavior: 3, orgPerception: 2, gap: 1, ... },
  //     conduct: { ... },
  //     chain: { ... }
  //   },
  //   summary: {
  //     avgBehavior: 2.75,
  //     avgOrgPerception: 1.5,
  //     avgGap: 1.25,
  //     highestPillar: { name: "Environmental Stewardship", behavior: 3 },
  //     lowestPillar: { name: "Responsible Value Chain", behavior: 2 }
  //   }
  // }

  const displayResults = formatSurveyResultsForDisplay(rawResults);
  console.log("Formatted Results:", displayResults);
}

// ============================================================================
// Example 2: Accessing Individual Pillar Scores
// ============================================================================

import { getPillarResponses, calculateGap } from "../engine/surveyResults";

function analyzePillar(questChoices, pillarKey) {
  const responses = getPillarResponses(questChoices, pillarKey);
  
  if (!responses) {
    console.log(`No responses for pillar: ${pillarKey}`);
    return;
  }

  console.log(`${pillarKey} Responses:`, {
    personalBehavior: responses.behavior?.choiceValue,
    orgPerception: responses.orgPerception?.choiceValue,
    visibility: responses.visibility?.choiceValue,
    safety: responses.safety?.choiceValue,
  });

  const gap = calculateGap(responses);
  console.log(`Gap for ${pillarKey}: ${gap}`);
  // Positive gap = player acts more responsibly than org
  // Negative gap = player acts less responsibly than org
}

// Usage
analyzePillar(questChoices, "env");  // Environmental
analyzePillar(questChoices, "people");  // People & Culture
analyzePillar(questChoices, "conduct");  // Business Conduct
analyzePillar(questChoices, "chain");  // Responsible Value Chain

// ============================================================================
// Example 3: Using the Results Screen Component
// ============================================================================

import ESGResultsScreen from "../components/ESGResultsScreen";

// In your game component:
export default function GameComponent({ quest }) {
  const [showResults, setShowResults] = useState(false);

  return (
    <div>
      {/* Game content */}
      
      {/* Results screen overlay */}
      {showResults && (
        <ESGResultsScreen
          quest={quest}
          onClose={() => setShowResults(false)}
        />
      )}

      {/* Button to show results */}
      <button onClick={() => setShowResults(true)}>
        View ESG Survey Results
      </button>
    </div>
  );
}

// ============================================================================
// Example 4: Generating Custom Insights
// ============================================================================

import { generateSurveyProfile } from "../engine/surveyResults";

function createCustomReport(surveyResults) {
  const profile = generateSurveyProfile(surveyResults);

  const report = {
    playerName: "Jordan",
    completedDate: new Date(surveyResults.completedAt).toLocaleDateString(),
    dominantPillar: profile.dominantPillar,
    summary: surveyResults.summary,
    insights: {
      gapInterpretation: profile.gapInsight,
      strengths: profile.strengths,
      challenges: profile.challenges,
      recommendations: profile.recommendations,
    },
    pillars: Object.entries(surveyResults.pillars).map(([key, data]) => ({
      name: data.name,
      yourScore: data.behavior,
      orgPerception: data.orgPerception,
      gap: data.gap,
      visibility: data.visibility,
      safety: data.safety,
    })),
  };

  return report;
}

// Usage
const customReport = createCustomReport(surveyResults);
console.log(customReport);
// {
//   playerName: "Jordan",
//   completedDate: "4/12/2024",
//   dominantPillar: "env",
//   summary: { ... },
//   insights: {
//     gapInterpretation: "You see yourself acting more responsibly...",
//     strengths: ["Environmental Stewardship"],
//     challenges: [],
//     recommendations: [...]
//   },
//   pillars: [...]
// }

// ============================================================================
// Example 5: Conditional Logic Based on Survey Results
// ============================================================================

function unlockContentBasedOnSurvey(surveyResults) {
  const profile = generateSurveyProfile(surveyResults);
  const { avgGap, avgBehavior } = surveyResults.summary;

  // Unlock different NPCs or quests based on profile
  const unlocked = {
    highActionTaker: avgBehavior >= 2.5,
    highGap: avgGap >= 1.5,
    environmentalChampion: surveyResults.pillars.env?.behavior >= 3,
    peopleFocused: surveyResults.pillars.people?.behavior >= 3,
    integrityDriven: surveyResults.pillars.conduct?.behavior >= 3,
    supplyChainAdvocate: surveyResults.pillars.chain?.behavior >= 3,
  };

  // Example: Unlock special quest if high action taker
  if (unlocked.highActionTaker && unlocked.environmentalChampion) {
    console.log("UNLOCK: Advanced Environmental Quests");
    // gameState.unlockedQuests.push("advanced_environment");
  }

  // Example: Suggest mentorship if high gap
  if (unlocked.highGap) {
    console.log("SUGGESTION: Consider mentorship program");
  }

  return unlocked;
}

// ============================================================================
// Example 6: Exporting Results to JSON
// ============================================================================

function exportSurveyResults(quest) {
  const results = aggregateSurveyResults(quest.choices);

  const exportData = {
    timestamp: new Date().toISOString(),
    playerProfile: quest.playerProfile,
    openingPov: quest.openingPov,
    surveyResults: results,
    allResponses: quest.choices.map(c => ({
      npcName: c.npcName,
      question: c.prompt,
      answer: c.choiceLabel,
      score: c.choiceValue || null,
    })),
  };

  // Download as JSON file
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `esg-survey-results-${Date.now()}.json`;
  link.click();
}

// Usage
// exportSurveyResults(quest);

// ============================================================================
// Example 7: Sending Results to Backend
// ============================================================================

async function saveResultsToBackend(quest, playerEmail) {
  const results = aggregateSurveyResults(quest.choices);

  const payload = {
    playerEmail,
    openingPov: quest.openingPov,
    playerProfile: quest.playerProfile,
    surveyResults: results,
    allChoices: quest.choices,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch("/api/survey-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Results saved successfully:", data);
      return true;
    } else {
      console.error("Failed to save results:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Error sending results:", error);
    return false;
  }
}

// ============================================================================
// Example 8: Creating a Comparison Report
// ============================================================================

function compareWithTeamAverage(personalResults, teamAverageResults) {
  const comparison = {};

  Object.keys(personalResults.pillars).forEach(pillarKey => {
    const personal = personalResults.pillars[pillarKey];
    const teamAvg = teamAverageResults.pillars[pillarKey];

    comparison[pillarKey] = {
      name: personal.name,
      personalBehavior: personal.behavior,
      teamAverage: teamAvg.behavior,
      difference: personal.behavior - teamAvg.behavior,
      personalIsAhead: personal.behavior > teamAvg.behavior,
    };
  });

  console.log("Comparison with Team:", comparison);
  return comparison;
}

// Usage
// const teamResults = await fetchTeamAverageResults();
// compareWithTeamAverage(personalResults, teamResults);

// ============================================================================
// Example 9: Generating Text-based Report
// ============================================================================

function generateTextReport(surveyResults) {
  const profile = generateSurveyProfile(surveyResults);
  const { pillars, summary } = surveyResults;

  let report = "=== ESG SURVEY RESULTS REPORT ===\n\n";

  report += `Overall Scores:\n`;
  report += `  Your approach: ${summary.avgBehavior.toFixed(1)}/4.0\n`;
  report += `  Organization perception: ${summary.avgOrgPerception.toFixed(1)}/4.0\n`;
  report += `  Your gap: ${summary.avgGap.toFixed(1)}\n\n`;

  report += `By Pillar:\n`;
  Object.values(pillars).forEach(pillar => {
    report += `  ${pillar.name}:\n`;
    report += `    Your approach: ${pillar.behavior || "—"}\n`;
    report += `    Org perception: ${pillar.orgPerception || "—"}\n`;
    if (pillar.gap !== null) report += `    Gap: ${pillar.gap}\n`;
    report += "\n";
  });

  report += `Key Insights:\n`;
  report += `  ${profile.gapInsight}\n\n`;

  if (profile.strengths.length > 0) {
    report += `Strengths: ${profile.strengths.join(", ")}\n`;
  }
  if (profile.challenges.length > 0) {
    report += `Challenges: ${profile.challenges.join(", ")}\n`;
  }

  report += `\nRecommendations:\n`;
  profile.recommendations.forEach((rec, i) => {
    report += `  ${i + 1}. ${rec}\n`;
  });

  return report;
}

// Usage
// const textReport = generateTextReport(surveyResults);
// console.log(textReport);
// Save to file or display in game

// ============================================================================
// Example 10: Tracking Survey Progress
// ============================================================================

function getSurveyProgress(quest) {
  const npcs = ["frank", "otis", "suzy", "hazel"];
  const visited = quest.visited || [];

  const progress = {
    completed: visited.filter(id => npcs.includes(id)).length,
    total: npcs.length,
    percentage: Math.round((visited.filter(id => npcs.includes(id)).length / npcs.length) * 100),
    remaining: npcs.filter(id => !visited.includes(id)),
  };

  console.log(`Survey Progress: ${progress.completed}/${progress.total} (${progress.percentage}%)`);
  console.log(`Remaining NPCs: ${progress.remaining.map(id => id.toUpperCase()).join(", ")}`);

  return progress;
}

// Usage
// getSurveyProgress(quest);
// Output:
// Survey Progress: 2/4 (50%)
// Remaining NPCs: SUZY, HAZEL
