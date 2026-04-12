/**
 * Survey Results Analysis Engine
 * Processes responses and calculates scores, gaps, and themes
 */

import { SURVEY_SCORING } from "../data/esgSurvey.js";

/**
 * Extract all responses for a specific pillar from quest choices
 */
export function getPillarResponses(questChoices, pillarKey) {
  const scoring = SURVEY_SCORING[pillarKey];
  if (!scoring) return null;

  return {
    pillar: pillarKey,
    behavior: questChoices.find((c) => c.stepId === scoring.behavior_key),
    orgPerception: questChoices.find((c) => c.stepId === scoring.org_key),
    visibility: questChoices.find(
      (c) => c.stepId === scoring.visibility_key
    ),
    safety: questChoices.find((c) => c.stepId === scoring.safety_key),
    themes: questChoices.find((c) => c.stepId === scoring.themes_key),
    reflection: questChoices.find((c) => c.stepId === scoring.themes_key),
  };
}

/**
 * Calculate gap between personal behavior and org perception
 */
export function calculateGap(responses) {
  if (
    !responses.behavior?.choiceValue ||
    !responses.orgPerception?.choiceValue
  ) {
    return null;
  }
  return responses.behavior.choiceValue - responses.orgPerception.choiceValue;
}

/**
 * Aggregate all pillar results
 */
export function aggregateSurveyResults(questChoices) {
  const pillars = ["env", "people", "conduct", "chain"];

  const results = {
    completedAt: new Date().toISOString(),
    pillars: {},
    summary: {
      avgBehavior: 0,
      avgOrgPerception: 0,
      avgGap: 0,
      highestPillar: null,
      lowestPillar: null,
    },
    themes: [],
  };

  const behaviorScores = [];
  const orgScores = [];
  const gaps = [];

  pillars.forEach((pillarKey) => {
    const responses = getPillarResponses(questChoices, pillarKey);
    if (!responses) return;

    const gap = calculateGap(responses);
    const pillarResult = {
      key: pillarKey,
      name: SURVEY_SCORING[pillarKey].pillar,
      behavior: responses.behavior?.choiceValue || null,
      orgPerception: responses.orgPerception?.choiceValue || null,
      visibility: responses.visibility?.choiceValue || null,
      safety: responses.safety?.choiceValue || null,
      gap,
      themes: responses.reflection?.choiceLabel || null,
    };

    results.pillars[pillarKey] = pillarResult;

    if (responses.behavior?.choiceValue) {
      behaviorScores.push(responses.behavior.choiceValue);
    }
    if (responses.orgPerception?.choiceValue) {
      orgScores.push(responses.orgPerception.choiceValue);
    }
    if (gap !== null) {
      gaps.push(gap);
    }
  });

  // Calculate averages
  if (behaviorScores.length > 0) {
    results.summary.avgBehavior =
      behaviorScores.reduce((a, b) => a + b, 0) / behaviorScores.length;
  }
  if (orgScores.length > 0) {
    results.summary.avgOrgPerception =
      orgScores.reduce((a, b) => a + b, 0) / orgScores.length;
  }
  if (gaps.length > 0) {
    results.summary.avgGap =
      gaps.reduce((a, b) => a + b, 0) / gaps.length;
  }

  // Find highest and lowest pillars by behavior score
  const withBehavior = Object.values(results.pillars).filter(
    (p) => p.behavior !== null
  );
  if (withBehavior.length > 0) {
    results.summary.highestPillar = withBehavior.reduce((a, b) =>
      a.behavior > b.behavior ? a : b
    );
    results.summary.lowestPillar = withBehavior.reduce((a, b) =>
      a.behavior < b.behavior ? a : b
    );
  }

  return results;
}

/**
 * Generate human-readable profile based on survey results
 */
export function generateSurveyProfile(surveyResults) {
  const { pillars, summary } = surveyResults;

  // Determine dominant lens based on behavior scores
  const behaviorScores = Object.entries(pillars)
    .filter(([, p]) => p.behavior !== null)
    .sort(([, a], [, b]) => b.behavior - a.behavior);

  const profile = {
    dominantPillar: behaviorScores[0]?.[0] || null,
    gapInsight: generateGapInsight(summary.avgGap),
    strengths: generateStrengths(pillars),
    challenges: generateChallenges(pillars),
    recommendations: generateRecommendations(pillars, summary),
  };

  return profile;
}

/**
 * Interpret average gap
 */
function generateGapInsight(avgGap) {
  if (avgGap === null) return "Gap data unavailable";
  if (avgGap > 1.5) {
    return "You see yourself acting more responsibly than the organization typically does—you may experience tension between your values and organizational norms.";
  }
  if (avgGap > 0.5) {
    return "You generally align with organizational practices, though you see room for improvement in some areas.";
  }
  if (avgGap > -0.5) {
    return "You and the organization are closely aligned in practice.";
  }
  if (avgGap > -1.5) {
    return "You perceive the organization as generally more proactive than you personally tend to be.";
  }
  return "You perceive significant gaps between the organization's actions and your expectations.";
}

/**
 * Identify strengths
 */
function generateStrengths(pillars) {
  return Object.values(pillars)
    .filter((p) => p.behavior !== null && p.behavior >= 3)
    .map((p) => p.name)
    .slice(0, 2);
}

/**
 * Identify challenges
 */
function generateChallenges(pillars) {
  return Object.values(pillars)
    .filter((p) => p.behavior !== null && p.behavior <= 1)
    .map((p) => p.name)
    .slice(0, 2);
}

/**
 * Generate recommendations
 */
function generateRecommendations(pillars, summary) {
  const recommendations = [];

  if (summary.avgGap > 1.5) {
    recommendations.push(
      "Consider how to bridge the gap between your values and organizational norms—small advocacy efforts can shift culture."
    );
  }

  if (pillars.env?.gap && pillars.env.gap < -1) {
    recommendations.push(
      "Environmental stewardship may be more visible in your organization than you realized—look for existing initiatives to join."
    );
  }

  if (pillars.people?.safety && pillars.people.safety < 2) {
    recommendations.push(
      "Psychological safety concerns are real—consider one-on-one conversations to build trust before raising broader issues."
    );
  }

  if (pillars.conduct?.visibility && pillars.conduct.visibility < 2) {
    recommendations.push(
      "Integrity issues may feel invisible, but documentation and quiet escalation can be powerful."
    );
  }

  if (pillars.chain?.behavior && pillars.chain.behavior < 2) {
    recommendations.push(
      "Value chain decisions may feel outside your control—but even small vendor conversations influence larger choices."
    );
  }

  return recommendations.slice(0, 3);
}

/**
 * Format results for display
 */
export function formatSurveyResultsForDisplay(surveyResults) {
  const { pillars, summary } = surveyResults;
  const profile = generateSurveyProfile(surveyResults);

  return {
    title: "Your ESG Perspective",
    subtitle:
      profile.dominantPillar
        ? `Strongest lens: ${SURVEY_SCORING[profile.dominantPillar].pillar}`
        : "Multi-focus approach",
    summary: {
      yourBehavior: summary.avgBehavior.toFixed(1),
      orgPerception: summary.avgOrgPerception.toFixed(1),
      gap: summary.avgGap.toFixed(1),
    },
    pillars: Object.values(pillars).map((p) => ({
      name: p.name,
      behavior: p.behavior,
      orgPerception: p.orgPerception,
      gap: p.gap,
      visibility: p.visibility,
      safety: p.safety,
    })),
    insights: profile,
  };
}
