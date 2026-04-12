/**
 * ESG Survey Results Display Component
 * Shows aggregated results from the pillar NPC surveys
 */

import React from "react";
import { aggregateSurveyResults, formatSurveyResultsForDisplay } from "../engine/surveyResults";

export default function ESGResultsScreen({ quest, onClose }) {
  const surveyResults = React.useMemo(() => {
    if (!quest?.choices || quest.choices.length === 0) {
      return null;
    }
    return aggregateSurveyResults(quest.choices);
  }, [quest]);

  const displayResults = surveyResults
    ? formatSurveyResultsForDisplay(surveyResults)
    : null;

  if (!displayResults) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Survey Results</h2>
          <p>No survey data available yet. Complete conversations with the guides to see your results.</p>
          <button onClick={onClose} style={styles.button}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const { summary, pillars, insights } = displayResults;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{displayResults.title}</h1>
        <p style={styles.subtitle}>{displayResults.subtitle}</p>

        {/* Summary Scores */}
        <div style={styles.summaryGrid}>
          <div style={styles.scoreBox}>
            <div style={styles.scoreLabel}>Your Behavior Score</div>
            <div style={styles.scoreValue}>{summary.yourBehavior}</div>
            <div style={styles.scoreDesc}>(scale: 0-3)</div>
          </div>
          <div style={styles.scoreBox}>
            <div style={styles.scoreLabel}>Org Perception</div>
            <div style={styles.scoreValue}>{summary.orgPerception}</div>
            <div style={styles.scoreDesc}>(scale: 0-3)</div>
          </div>
          <div style={styles.scoreBox}>
            <div style={styles.scoreLabel}>Your Gap</div>
            <div style={{
              ...styles.scoreValue,
              color: summary.gap > 0 ? "#d97f6d" : "#6fa86f"
            }}>
              {summary.gap}
            </div>
            <div style={styles.scoreDesc}>(positive = you're ahead)</div>
          </div>
        </div>

        {/* Pillar Details */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>By Pillar</h3>
          <div style={styles.pillarsList}>
            {pillars.map((pillar, idx) => (
              <div key={idx} style={styles.pillarItem}>
                <div style={styles.pillarName}>{pillar.name}</div>
                <div style={styles.pillarStats}>
                  <span>Your approach: {pillar.behavior !== null ? pillar.behavior : "—"}</span>
                  {" · "}
                  <span>Org perception: {pillar.orgPerception !== null ? pillar.orgPerception : "—"}</span>
                  {pillar.visibility !== null && (
                    <>
                      {" · "}
                      <span>Visibility: {pillar.visibility}</span>
                    </>
                  )}
                  {pillar.safety !== null && (
                    <>
                      {" · "}
                      <span>Safety: {pillar.safety}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        {insights && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Your Insights</h3>
            <div style={styles.insightBox}>
              <p style={styles.insightText}>
                <strong>Main Focus:</strong> {insights.dominantPillar
                  ? `${displayResults.pillars.find((p) => p.name === "Pillar " + insights.dominantPillar)?.name || insights.dominantPillar}`
                  : "Balanced across multiple areas"}
              </p>
              <p style={styles.insightText}>
                <strong>Gap Interpretation:</strong> {insights.gapInsight}
              </p>

              {insights.strengths.length > 0 && (
                <p style={styles.insightText}>
                  <strong>Strengths:</strong> {insights.strengths.join(", ")}
                </p>
              )}

              {insights.challenges.length > 0 && (
                <p style={styles.insightText}>
                  <strong>Areas of Challenge:</strong> {insights.challenges.join(", ")}
                </p>
              )}

              {insights.recommendations.length > 0 && (
                <div>
                  <strong>Recommendations:</strong>
                  <ul style={styles.recommendationsList}>
                    {insights.recommendations.map((rec, idx) => (
                      <li key={idx} style={styles.recommendationItem}>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <button onClick={onClose} style={styles.button}>
          Close Results
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  card: {
    background: "#faf8f4",
    border: "2px solid rgba(95, 112, 86, 0.2)",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "700px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(40, 56, 44, 0.15)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#263c2e",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6c7a72",
    marginBottom: "24px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  scoreBox: {
    background: "#eef1ec",
    border: "1px solid rgba(112, 126, 106, 0.15)",
    borderRadius: "12px",
    padding: "16px",
    textAlign: "center",
  },
  scoreLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#5c6b60",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "8px",
  },
  scoreValue: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#263c2e",
    marginBottom: "4px",
  },
  scoreDesc: {
    fontSize: "11px",
    color: "#8b9989",
  },
  section: {
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#263c2e",
    marginBottom: "12px",
    borderBottom: "2px solid rgba(95, 112, 86, 0.1)",
    paddingBottom: "8px",
  },
  pillarsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  pillarItem: {
    background: "#f5f7f3",
    border: "1px solid rgba(112, 126, 106, 0.1)",
    borderRadius: "8px",
    padding: "12px",
  },
  pillarName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#263c2e",
    marginBottom: "6px",
  },
  pillarStats: {
    fontSize: "12px",
    color: "#6c7a72",
    lineHeight: "1.5",
  },
  insightBox: {
    background: "#f5f7f3",
    border: "1px solid rgba(112, 126, 106, 0.1)",
    borderRadius: "8px",
    padding: "16px",
  },
  insightText: {
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#263c2e",
    marginBottom: "12px",
  },
  recommendationsList: {
    marginLeft: "20px",
    marginTop: "8px",
    listStyle: "disc",
  },
  recommendationItem: {
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#263c2e",
    marginBottom: "8px",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    background: "#588051",
    color: "#faf8f4",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
};
