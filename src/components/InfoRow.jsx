// Controls reference strip shown below the game canvas.

import React from "react";

const CONTROLS = [
  { key: "↑ ↓ ← →  /  W A S D", label: "move" },
  { key: "E / Space", label: "talk or interact" },
  { key: "Enter / Tab", label: "continue dialogue" },
  { key: "1  2  3  4  5", label: "choose answer" },
  { key: "warp", label: "jump near objective" },
];

const TOUCH_CONTROLS = [
  { key: "arrows", label: "tap to move" },
  { key: "E", label: "talk" },
  { key: "tap choices", label: "answer" },
  { key: "warp", label: "objective" },
];

export default function InfoRow({ compact = false }) {
  const controls = compact ? TOUCH_CONTROLS : CONTROLS;

  return (
    <div style={{ ...styles.strip, ...(compact ? styles.stripCompact : null) }}>
      {controls.map(({ key, label }, i) => (
        <div key={i} style={styles.item}>
          <span style={{ ...styles.key, ...(compact ? styles.keyCompact : null) }}>{key}</span>
          <span style={{ ...styles.label, ...(compact ? styles.labelCompact : null) }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  strip: {
    flexShrink: 0,
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "5px 10px",
    padding: "6px 10px",
    borderRadius: 0,
    background: "#2e3e28",
    border: "3px solid #172012",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    boxSizing: "border-box",
    maxWidth: "none",
    maxHeight: 56,
    overflow: "hidden",
  },
  stripCompact: {
    gap: "3px 7px",
    padding: "3px 6px",
    borderWidth: 2,
    maxHeight: 34,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  key: {
    fontSize: "clamp(8px, 1.1vw, 10px)",
    fontWeight: 800,
    color: "#11180e",
    background: "#f0c94a",
    border: "2px solid #10180e",
    borderRadius: 0,
    padding: "2px 5px",
    whiteSpace: "nowrap",
    letterSpacing: 0,
  },
  keyCompact: {
    fontSize: 8,
    padding: "1px 4px",
    borderWidth: 1,
  },
  label: {
    fontSize: "clamp(8px, 1.1vw, 10px)",
    color: "#e8ecd7",
    whiteSpace: "nowrap",
  },
  labelCompact: {
    fontSize: 8,
  },
};
