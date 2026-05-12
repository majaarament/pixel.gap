import React from "react";

const PILLAR_LABELS = {
  env: "Environmental Stewardship",
  people: "People & Culture",
  conduct: "Business Conduct",
  chain: "Responsible Value Chain",
  // legacy keys kept for backward compatibility
  environment: "Environmental",
  social: "Social",
  governance: "Governance",
};

export default function ResultsOverlay({ report, onClose }) {
  if (!report) return null;

  const scoreEntries = Object.entries(report.scores || {});
  const gapCount = Object.values(report.pillars || {}).filter((pillar) => pillar.gap).length;
  const strongestEntry = scoreEntries.reduce(
    (best, entry) => (entry[1] > (best?.[1] ?? -1) ? entry : best),
    null
  );
  const strongestLabel = strongestEntry ? PILLAR_LABELS[strongestEntry[0]] || strongestEntry[0] : "not enough data yet";
  const confidenceAverage = average(Object.values(report.pillars || {}).map((pillar) => pillar.confidence));
  const nextFocus = report.finalReflection?.focusNext
    ? FOCUS_LABELS[report.finalReflection.focusNext] || report.finalReflection.focusNext
    : "make one visible next action easier to take";

  return (
    <div style={styles.backdrop}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div>
            <div style={styles.kicker}>Final Report</div>
            <h2 style={styles.title}>{report.profile.title}</h2>
            <p style={styles.summary}>{report.profile.summary}</p>
          </div>
          <button type="button" style={styles.closeButton} onClick={onClose}>
            back to site
          </button>
        </div>

        <div style={styles.content}>
          <p style={{ ...styles.reportNote, ...styles.wideSection }}>
            this is a reflection report, not a diagnosis. each pillar is based on a small set of scenarios — the useful part is the pattern it helps you discuss, not the score itself.
          </p>

          {report.openingPov && (
            <section style={styles.section}>
              <div style={styles.sectionTitle}>Your starting lens</div>
              <div style={styles.openingCard}>
                <div style={styles.openingTitle}>{report.openingPov.title}</div>
                <div style={styles.openingSummary}>{report.openingPov.routeSummary}</div>
                {report.openingCommitment && (
                  <div style={styles.openingCommitment}>
                    you backed that up by saying: {report.openingCommitment}
                  </div>
                )}
              </div>
            </section>
          )}

          <section style={styles.section}>
            <div style={styles.sectionTitle}>What this suggests</div>
            <div style={styles.insightGrid}>
              <div style={styles.insightCard}>
                <div style={styles.insightValue}>{gapCount}/4</div>
                <div style={styles.insightLabel}>pillar gaps between personal instinct and expected practice</div>
              </div>
              <div style={styles.insightCard}>
                <div style={styles.insightValue}>{strongestLabel}</div>
                <div style={styles.insightLabel}>most visible pillar in your answers</div>
              </div>
              <div style={styles.insightCard}>
                <div style={styles.insightValue}>{nextFocus}</div>
                <div style={styles.insightLabel}>next lever you selected</div>
              </div>
              <div style={styles.insightCard}>
                <div style={styles.insightValue}>{confidenceAverage !== null ? `${confidenceAverage.toFixed(1)}/5` : "not captured"}</div>
                <div style={styles.insightLabel}>average confidence in your pillar reads</div>
              </div>
            </div>
            {report.recommendedActions?.length > 0 && (
              <div style={styles.actionGrid}>
                {report.recommendedActions.map((action) => (
                  <div key={action.title} style={styles.actionCard}>
                    <div style={styles.actionTitle}>{action.title}</div>
                    <div style={styles.actionBody}>{action.body}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>Pillar visibility scores</div>
            <div style={styles.scoreGrid}>
              {scoreEntries.map(([pillar, value]) => (
                <div key={pillar} style={styles.scoreCard}>
                  <div style={styles.scoreTopRow}>
                    <span style={styles.scoreLabel}>{PILLAR_LABELS[pillar] || pillar}</span>
                    <span style={styles.scoreValue}>{value}%</span>
                  </div>
                  <div style={styles.scoreTrack}>
                    <div
                      style={{
                        ...styles.scoreFill,
                        width: `${value}%`,
                        background: PILLAR_FILL_COLORS[pillar] || styles.environmentFill.background,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionTitle}>Stats from your answers</div>
            <div style={styles.statsGrid}>
              {report.stats.map((stat) => (
                <div key={stat.label} style={styles.statCard}>
                  <div style={styles.statValue}>{stat.value}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ ...styles.section, ...styles.wideSection }}>
            <div style={styles.sectionTitle}>Your answers</div>
            <div style={styles.answerStack}>
              {report.choiceAnswers.map((answer, index) => (
                <article key={answer.id} style={styles.answerCard}>
                  <div style={styles.answerMeta}>
                    <span style={styles.answerIndex}>{index + 1}</span>
                    <span style={styles.answerSpeaker}>{answer.npcName}</span>
                    {answer.npcRole && <span style={styles.answerRole}>{answer.npcRole}</span>}
                  </div>
                  <div style={styles.answerPrompt}>{answer.prompt}</div>
                  <div style={styles.answerText}>{answer.answer}</div>
                </article>
              ))}
            </div>
          </section>

          {report.benchmark && report.benchmark.length > 0 && (
            <section style={{ ...styles.section, ...styles.wideSection }}>
              <div style={styles.sectionTitle}>How others answered</div>
              <p style={styles.benchmarkDisclaimer}>illustrative — based on early participant data</p>
              <div style={styles.benchmarkStack}>
                {report.benchmark.map((item) => (
                  <div key={item.stepId} style={styles.benchmarkCard}>
                    <div style={styles.benchmarkNpc}>{item.npcName}</div>
                    {item.bars.map((bar) => (
                      <div key={bar.key} style={styles.benchmarkRow}>
                        <div
                          style={{
                            ...styles.benchmarkLabel,
                            ...(bar.isPlayerChoice ? styles.benchmarkLabelActive : {}),
                          }}
                        >
                          {bar.isPlayerChoice && <span style={styles.benchmarkYou}>you</span>}
                          {bar.label}
                        </div>
                        <div style={styles.benchmarkTrack}>
                          <div
                            style={{
                              ...styles.benchmarkFill,
                              width: `${bar.percent}%`,
                              background: bar.isPlayerChoice ? "#6a9e78" : "#bcc8b8",
                            }}
                          />
                        </div>
                        <div style={styles.benchmarkPct}>{bar.percent}%</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          )}

          {report.reflectionAnswers.length > 0 && (
            <section style={{ ...styles.section, ...styles.wideSection }}>
              <div style={styles.sectionTitle}>Written reflections</div>
              <div style={styles.answerStack}>
                {report.reflectionAnswers.map((answer) => (
                  <article key={answer.id} style={styles.answerCard}>
                    <div style={styles.answerMeta}>
                      <span style={styles.answerSpeaker}>{answer.npcName}</span>
                    </div>
                    <div style={styles.answerPrompt}>{answer.prompt}</div>
                    <div style={styles.longAnswerText}>{answer.answer}</div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

const PILLAR_FILL_COLORS = {
  env: "#6ca36d",
  people: "#c58d55",
  conduct: "#718f89",
  chain: "#8d6aa3",
  // legacy
  environment: "#6ca36d",
  social: "#c58d55",
  governance: "#718f89",
};

const FOCUS_LABELS = {
  visible_action: "visible action",
  culture_safety: "speak-up culture",
  leadership_model: "leadership modeling",
  systems: "systems and measurement",
};

function average(values) {
  const numeric = values.filter((value) => Number.isFinite(value));
  if (!numeric.length) return null;
  return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
}

const styles = {
  backdrop: {
    position: "absolute",
    inset: 0,
    zIndex: 40,
    background: "rgba(14, 22, 16, 0.82)",
    backdropFilter: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  panel: {
    width: "min(1100px, calc(100% - 12px))",
    maxHeight: "calc(100% - 16px)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    borderRadius: 0,
    background: "#eadfbc",
    border: "4px solid #172012",
    boxShadow: "0 12px 0 #11180e",
    fontFamily: '"Courier New", "Lucida Console", monospace',
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    padding: "12px 16px 10px",
    borderBottom: "4px solid #172012",
    background: "#2e3e28",
  },
  kicker: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: "#9ecf8a",
    fontWeight: 900,
    marginBottom: 4,
  },
  title: {
    margin: 0,
    fontSize: "clamp(18px, 3.2vh, 26px)",
    lineHeight: 1.05,
    color: "#f0c94a",
    fontWeight: 900,
  },
  summary: {
    margin: "6px 0 0",
    maxWidth: 540,
    fontSize: "clamp(11px, 1.7vh, 14px)",
    lineHeight: 1.3,
    color: "#e8ecd7",
    fontWeight: 700,
  },
  closeButton: {
    border: "3px solid #10180e",
    borderRadius: 0,
    padding: "7px 10px",
    background: "#f0c94a",
    color: "#11180e",
    fontSize: 11,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 3px 0 #7c6020",
    whiteSpace: "nowrap",
  },
  content: {
    overflowY: "auto",
    padding: 10,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    alignContent: "start",
    gap: 8,
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(46,62,40,0.5) rgba(234,223,188,0.4)",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 0,
  },
  wideSection: {
    gridColumn: "1 / -1",
  },
  openingCard: {
    padding: 8,
    borderRadius: 0,
    background: "#f7f1df",
    border: "3px solid #26341f",
    boxShadow: "none",
  },
  openingTitle: {
    fontSize: 13,
    fontWeight: 900,
    color: "#304239",
  },
  openingSummary: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 1.3,
    color: "#57675d",
  },
  openingCommitment: {
    marginTop: 5,
    paddingTop: 5,
    borderTop: "1px solid rgba(111, 127, 109, 0.14)",
    fontSize: 12,
    lineHeight: 1.3,
    color: "#425247",
    fontWeight: 600,
  },
  sectionTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    color: "#536047",
    fontWeight: 900,
  },
  scoreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 6,
  },
  scoreCard: {
    padding: 8,
    borderRadius: 0,
    background: "#fffdf8",
    border: "3px solid #c9b487",
  },
  scoreTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 11,
    color: "#4e5f55",
    fontWeight: 700,
  },
  scoreValue: {
    fontSize: 14,
    color: "#2f4338",
    fontWeight: 800,
  },
  scoreTrack: {
    height: 8,
    borderRadius: 0,
    background: "#e3e8e0",
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    borderRadius: 0,
  },
  environmentFill: {
    background: "#6ca36d",
  },
  socialFill: {
    background: "#c58d55",
  },
  governanceFill: {
    background: "#718f89",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 6,
  },
  insightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 6,
  },
  insightCard: {
    padding: "8px 9px",
    background: "#f7f1df",
    border: "3px solid #26341f",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  insightValue: {
    fontSize: 13,
    lineHeight: 1.2,
    fontWeight: 900,
    color: "#172012",
  },
  insightLabel: {
    fontSize: 11,
    lineHeight: 1.25,
    color: "#5f6b50",
    fontWeight: 800,
  },
  reportNote: {
    margin: 0,
    padding: "9px 12px",
    background: "#2e3e28",
    border: "3px solid #172012",
    color: "#e8ecd7",
    fontSize: 12,
    lineHeight: 1.4,
    fontWeight: 700,
  },
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 6,
  },
  actionCard: {
    padding: 7,
    background: "#fffdf8",
    border: "3px solid #c9b487",
    minWidth: 0,
  },
  actionTitle: {
    fontSize: 11,
    lineHeight: 1.2,
    color: "#172012",
    fontWeight: 900,
    marginBottom: 3,
  },
  actionBody: {
    fontSize: 11,
    lineHeight: 1.3,
    color: "#4f6157",
    fontWeight: 700,
    overflow: "visible",
    overflowWrap: "anywhere",
  },
  statCard: {
    padding: "7px 8px",
    borderRadius: 0,
    background: "#eef2ea",
    border: "3px solid #c9b487",
  },
  statValue: {
    fontSize: 14,
    fontWeight: 800,
    color: "#2f4338",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    lineHeight: 1.25,
    color: "#607067",
  },
  answerStack: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 6,
  },
  answerCard: {
    padding: 7,
    borderRadius: 0,
    background: "#fffdf8",
    border: "3px solid #c9b487",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  answerMeta: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  answerIndex: {
    width: 18,
    height: 18,
    borderRadius: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#dce6d8",
    color: "#304239",
    fontSize: 10,
    fontWeight: 800,
  },
  answerSpeaker: {
    fontSize: 11,
    fontWeight: 800,
    color: "#364a3f",
  },
  answerRole: {
    fontSize: 10,
    color: "#7b7a6b",
    letterSpacing: 0.2,
  },
  answerPrompt: {
    fontSize: 11,
    lineHeight: 1.35,
    color: "#4f6157",
    fontWeight: 600,
  },
  answerText: {
    fontSize: 12,
    lineHeight: 1.35,
    color: "#2d3b34",
  },
  longAnswerText: {
    fontSize: 12,
    lineHeight: 1.35,
    color: "#2d3b34",
    whiteSpace: "pre-wrap",
  },
  benchmarkDisclaimer: {
    margin: 0,
    fontSize: 11,
    color: "#9aa394",
    letterSpacing: 0.3,
  },
  benchmarkStack: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 6,
  },
  benchmarkCard: {
    padding: "7px 8px",
    borderRadius: 0,
    background: "#fffdf8",
    border: "3px solid #c9b487",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  benchmarkNpc: {
    fontSize: 11,
    fontWeight: 800,
    color: "#4e5f55",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 1,
  },
  benchmarkRow: {
    display: "grid",
    gridTemplateColumns: "120px 1fr 32px",
    alignItems: "center",
    gap: 5,
  },
  benchmarkLabel: {
    fontSize: 11,
    color: "#607067",
    lineHeight: 1.35,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  benchmarkLabelActive: {
    color: "#2f4338",
    fontWeight: 700,
  },
  benchmarkYou: {
    fontSize: 8,
    fontWeight: 800,
    color: "#fff",
    background: "#4e7a5d",
    borderRadius: 0,
    padding: "2px 5px",
    letterSpacing: 0.3,
    flexShrink: 0,
  },
  benchmarkTrack: {
    height: 8,
    borderRadius: 0,
    background: "#e3e8e0",
    overflow: "hidden",
  },
  benchmarkFill: {
    height: "100%",
    borderRadius: 0,
    transition: "width 0.4s ease",
  },
  benchmarkPct: {
    fontSize: 11,
    fontWeight: 700,
    color: "#4e5f55",
    textAlign: "right",
  },
};
