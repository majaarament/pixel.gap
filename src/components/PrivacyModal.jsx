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
            organisational level. Here is exactly how your data is handled.
          </p>

          <div style={styles.items}>
            <div style={styles.item}>
              <div style={styles.itemIcon}>✕</div>
              <div>
                <div style={styles.itemTitle}>No personal data collected</div>
                <div style={styles.itemDetail}>
                  We do not store your name, email address, or any other identifier that
                  could be used to trace a response back to you.
                </div>
              </div>
            </div>

            <div style={styles.item}>
              <div style={styles.itemIcon}>◎</div>
              <div>
                <div style={styles.itemTitle}>All answers are anonymised</div>
                <div style={styles.itemDetail}>
                  Results are aggregated at the organisational level. No individual
                  response is visible to management or any other party.
                </div>
              </div>
            </div>

            <div style={styles.item}>
              <div style={styles.itemIcon}>⬡</div>
              <div>
                <div style={styles.itemTitle}>Session ID for security only</div>
                <div style={styles.itemDetail}>
                  A temporary session ID is stored to keep the experience stable. It is
                  not linked to you as an individual and is discarded after your session ends.
                </div>
              </div>
            </div>
          </div>

          <p style={styles.note}>
            If at any point you are not comfortable continuing, you can close this window.
            No partial responses are retained.
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
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    width: "min(560px, calc(100vw - 40px))",
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
    padding: "18px 24px 16px",
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
    fontSize: 26,
    fontWeight: 900,
    letterSpacing: "-0.04em",
    color: "#e8f0e2",
    lineHeight: 1.1,
  },
  body: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  lead: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.65,
    color: "#3a4a34",
  },
  items: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  item: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
    background: "#ede9d6",
    border: "2px solid #c9b98a",
    padding: "12px 14px",
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
    letterSpacing: "-0.01em",
  },
  itemDetail: {
    fontSize: 12,
    lineHeight: 1.6,
    color: "#4a5c44",
  },
  note: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.55,
    color: "#6a7a60",
    borderTop: "1px solid #d4c99a",
    paddingTop: 14,
  },
  footer: {
    padding: "14px 24px 20px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
    borderTop: "3px solid #2e3e28",
    background: "#ede9d6",
  },
  acceptBtn: {
    padding: "12px 22px",
    background: "#f0c94a",
    border: "3px solid #6a4e1a",
    color: "#1f2d1c",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: "-0.03em",
    cursor: "pointer",
    boxShadow: "0 4px 0 #a07828",
  },
  exitBtn: {
    padding: "10px 0",
    background: "transparent",
    border: "none",
    color: "#7a6a50",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.02em",
    cursor: "pointer",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
};
