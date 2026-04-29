// Controls reference strip shown below the game canvas.

import React from "react";

const CONTROLS = [
  { key: "↑ ↓ ← →  /  W A S D", label: "move" },
  { key: "walk near NPC", label: "start conversation" },
  { key: "Space / Enter", label: "continue dialogue" },
  { key: "1  2  3  4  or click", label: "choose answer" },
  { key: "Space (while moving)", label: "show objective" },
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
    gap: "8px 18px",
    padding: "10px 18px",
    borderRadius: 10,
    background: "rgba(245, 243, 238, 0.72)",
    border: "1px solid rgba(149,169,132,0.22)",
    fontFamily: '"Courier New", "Lucida Console", monospace',
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 7,
  },
  key: {
    fontSize: 11,
    fontWeight: 800,
    color: "#3e5c48",
    background: "rgba(122,176,104,0.12)",
    border: "1px solid rgba(88,140,76,0.28)",
    borderRadius: 4,
    padding: "3px 8px",
    whiteSpace: "nowrap",
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 11,
    color: "#6a776d",
    whiteSpace: "nowrap",
  },
};
