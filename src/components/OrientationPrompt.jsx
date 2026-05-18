import React from "react";

export default function OrientationPrompt({ ready, onContinue, onContinueAnyway }) {
  return (
    <div style={styles.screen}>
      <div style={styles.card} role="dialog" aria-modal="true" aria-labelledby="orientation-title">
        <div style={styles.phoneWrap} aria-hidden="true">
          <div style={{ ...styles.phone, ...(ready ? styles.phoneReady : null) }}>
            <div style={styles.phoneScreen}>
              <div style={styles.phonePixel} />
              <div style={styles.phoneLine} />
            </div>
          </div>
        </div>

        <div style={styles.copy}>
          <div style={styles.kicker}>phone setup</div>
          <h1 id="orientation-title" style={styles.title}>
            {ready ? "landscape ready" : "flip your phone"}
          </h1>
          <p style={styles.body}>
            This game is built for phone landscape mode. Rotate your phone sideways before
            starting so the map, dialogue, and controls have enough room.
          </p>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            style={{
              ...styles.primaryBtn,
              ...(ready ? null : styles.primaryBtnDisabled),
            }}
            onClick={onContinue}
            disabled={!ready}
          >
            continue
          </button>
          {!ready && (
            <button type="button" style={styles.secondaryBtn} onClick={onContinueAnyway}>
              continue anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    minHeight: "100svh",
    height: "100svh",
    width: "100%",
    background: "#7f9362",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    boxSizing: "border-box",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    color: "#26341f",
    overflow: "hidden",
  },
  card: {
    width: "min(480px, calc(100vw - 28px))",
    background: "#eadfbc",
    border: "4px solid #26341f",
    boxShadow: "0 10px 0 #1a2616, 0 20px 0 rgba(18, 26, 16, 0.28)",
    padding: "18px 18px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    textAlign: "center",
    boxSizing: "border-box",
  },
  phoneWrap: {
    width: 128,
    height: 84,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  phone: {
    width: 50,
    height: 82,
    background: "#2e3e28",
    border: "4px solid #172012",
    boxShadow: "4px 4px 0 rgba(18, 26, 16, 0.32)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: "rotate(0deg)",
    transition: "transform 180ms linear",
  },
  phoneReady: {
    transform: "rotate(90deg)",
  },
  phoneScreen: {
    width: 34,
    height: 58,
    background: "#e8ecd7",
    border: "2px solid #10180e",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  phonePixel: {
    width: 12,
    height: 12,
    background: "#f0c94a",
    border: "2px solid #10180e",
  },
  phoneLine: {
    width: 22,
    height: 4,
    background: "#9ecf8a",
    border: "1px solid #10180e",
  },
  copy: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
  },
  kicker: {
    padding: "4px 8px",
    background: "#32462f",
    color: "#edf3d2",
    fontSize: 10,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    border: "2px solid #24331f",
  },
  title: {
    margin: 0,
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(26px, 8vw, 42px)",
    lineHeight: 1,
    fontWeight: 900,
    color: "#1f2d1c",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  body: {
    margin: 0,
    maxWidth: 390,
    color: "#42523d",
    fontSize: "clamp(12px, 3.5vw, 15px)",
    lineHeight: 1.35,
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "9px 16px",
    background: "#f0c94a",
    color: "#11180e",
    border: "3px solid #10180e",
    boxShadow: "0 3px 0 #7c6020",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    cursor: "pointer",
    touchAction: "manipulation",
  },
  primaryBtnDisabled: {
    background: "#7f866f",
    color: "#3e4738",
    boxShadow: "none",
    cursor: "default",
  },
  secondaryBtn: {
    padding: "9px 12px",
    background: "#e8ecd7",
    color: "#31423a",
    border: "2px solid #536849",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    cursor: "pointer",
    touchAction: "manipulation",
  },
};
