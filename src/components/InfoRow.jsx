// Controls reference strip shown below the game canvas.

import React from "react";

const CONTROLS = [
  { key: "↑ ↓ ← →  /  W A S D", label: "move" },
  { key: "E / Space", label: "talk or interact" },
  { key: "Enter / Tab", label: "continue dialogue" },
  { key: "1  2  3  4  5", label: "choose answer" },
  { key: "warp", label: "jump near objective" },
];

export default function InfoRow() {
  return (
    <div style={styles.strip}>
      {CONTROLS.map(({ key, label }, i) => (
        <div key={i} style={styles.item}>
          <span style={styles.key}>{key}</span>
          <span style={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  strip: {
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
    maxWidth: "100vw",
    maxHeight: 56,
    overflow: "hidden",
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
  label: {
    fontSize: "clamp(8px, 1.1vw, 10px)",
    color: "#e8ecd7",
    whiteSpace: "nowrap",
  },
};
