import React, { useEffect } from "react";

export default function PrivacyModal({ onAccept, onExit }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onAccept();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onAccept, onExit]);

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} role="dialog" aria-modal="true" aria-labelledby="privacy-title">
        <div style={styles.header}>
          <div style={styles.pill}>before you begin</div>
          <h2 id="privacy-title" style={styles.title}>about your data</h2>
        </div>

        <div style={styles.body}>
          <p style={styles.lead}>
            This experience is designed to give delaware a picture of ESG maturity at an
            organisational level. Here is the practical version of how your data is handled.
          </p>

          <div style={styles.items}>
            <div style={styles.item}>
              <div style={styles.itemIcon}>✕</div>
              <div>
                <div style={styles.itemTitle}>No name or email requested</div>
                <div style={styles.itemDetail}>
                  The game asks for role level, team, and entity so results can be grouped.
                  It does not ask for your name or email address.
                </div>
              </div>
            </div>

            <div style={styles.item}>
              <div style={styles.itemIcon}>◎</div>
              <div>
                <div style={styles.itemTitle}>Answers are reported in aggregate</div>
                <div style={styles.itemDetail}>
                  Individual answers are meant for pattern analysis, not for identifying
                  a person. Results should be reviewed at group level only.
                </div>
              </div>
            </div>

            <div style={styles.item}>
              <div style={styles.itemIcon}>⬡</div>
              <div>
                <div style={styles.itemTitle}>Anonymous ID, not a personal profile</div>
                <div style={styles.itemDetail}>
                  A random browser ID and session ID are stored on this device so responses
                  can be grouped without asking for your name or email address.
                </div>
              </div>
            </div>
          </div>

          <p style={styles.note}>
            If you are not comfortable continuing, exit now. During play, answers may be
            saved locally and submitted when the journey is completed.
          </p>
        </div>

        <div style={styles.footer}>
          <button type="button" style={styles.acceptBtn} onClick={onAccept}>
            I understand — continue
          </button>
          <button type="button" style={styles.exitBtn} onClick={onExit}>
            I'm not comfortable — exit
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 9000,
    background: "rgba(14, 22, 16, 0.82)",
    backdropFilter: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    boxSizing: "border-box",
  },
  modal: {
    width: "min(560px, calc(100vw - 40px))",
    maxHeight: "calc(100vh - 24px)",
    background: "#f7f3e8",
    border: "4px solid #2e3e28",
    boxShadow: "0 20px 0 #1a2616, 0 32px 64px rgba(10,20,12,0.5)",
    display: "flex",
    flexDirection: "column",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    overflow: "hidden",
  },
  header: {
    background: "#2e3e28",
    padding: "12px 18px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  pill: {
    display: "inline-block",
    padding: "3px 9px",
    background: "rgba(122,176,104,0.22)",
    border: "1px solid rgba(122,176,104,0.45)",
    color: "#9ecf8a",
    fontSize: 10,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
    alignSelf: "flex-start",
  },
  title: {
    margin: 0,
    fontSize: "clamp(18px, 3.2vh, 24px)",
    fontWeight: 900,
    letterSpacing: 0,
    color: "#e8f0e2",
    lineHeight: 1.1,
  },
  body: {
    padding: "12px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  lead: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.45,
    color: "#3a4a34",
  },
  items: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  item: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    background: "#ede9d6",
    border: "2px solid #c9b98a",
    padding: "8px 10px",
  },
  itemIcon: {
    width: 28,
    height: 28,
    background: "#2e3e28",
    color: "#9ecf8a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 900,
    flexShrink: 0,
    marginTop: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: "#1f2d1c",
    marginBottom: 4,
    letterSpacing: 0,
  },
  itemDetail: {
    fontSize: 11,
    lineHeight: 1.35,
    color: "#4a5c44",
  },
  note: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.35,
    color: "#6a7a60",
    borderTop: "1px solid #d4c99a",
    paddingTop: 8,
  },
  footer: {
    padding: "10px 18px 12px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    borderTop: "3px solid #2e3e28",
    background: "#ede9d6",
  },
  acceptBtn: {
    padding: "9px 16px",
    background: "#f0c94a",
    border: "3px solid #6a4e1a",
    color: "#1f2d1c",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: 0,
    cursor: "pointer",
    boxShadow: "0 4px 0 #a07828",
  },
  exitBtn: {
    padding: "9px 14px",
    background: "#ede9d6",
    border: "3px solid #7a6a50",
    color: "#5a4a38",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: "0.02em",
    cursor: "pointer",
    boxShadow: "0 3px 0 #b09870",
  },
};
