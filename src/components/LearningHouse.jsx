import React, { useState } from "react";

import { callESGGuideAI } from "../engine/esgGuideAI";

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content:
      "olive: welcome to my little learning house. ask me anything about esg, sustainability, ethics, or how these ideas show up in everyday work.",
  },
];

export default function LearningHouse({ quest, onClose }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSend() {
    const text = draft.trim();
    if (!text || busy) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    setError("");

    try {
      const reply = await callESGGuideAI(quest, nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: reply }]);
    } catch (requestError) {
      setMessages(nextMessages);
      setError(String(requestError?.message || requestError));
    } finally {
      setBusy(false);
    }
  }

  function handleDraftKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
      return;
    }
    if (event.key === "Tab" && !event.shiftKey && draft.trim() && !busy) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div>
            <div style={styles.kicker}>olive's learning house</div>
            <h2 style={styles.title}>learn more about esg</h2>
            <p style={styles.subtitle}>
              ask questions and explore examples.
            </p>
          </div>
          <button type="button" onClick={onClose} style={styles.closeButton}>
            leave house
          </button>
        </div>

        <div style={styles.learnGrid}>
          <div style={styles.chatCard}>
            <div style={styles.chatScroller}>
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  style={{
                    ...styles.message,
                    ...(message.role === "user" ? styles.userMessage : styles.assistantMessage),
                  }}
                >
                  {message.content}
                </div>
              ))}
              {busy && <div style={styles.statusBubble}>olive is thinking...</div>}
            </div>
            <div style={styles.inputRow}>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleDraftKeyDown}
                placeholder="ask about esg, ethics, sustainability, or workplace questions..."
                style={styles.textarea}
                rows={3}
              />
              <button type="button" onClick={handleSend} disabled={busy || !draft.trim()} style={styles.sendButton}>
                send
              </button>
            </div>
            {error ? <div style={styles.errorText}>{error}</div> : null}
          </div>

          <div style={styles.sideCard}>
            <div style={styles.sideTitle}>good topics to ask about</div>
            <ul style={styles.promptList}>
              <li>what does esg actually mean in simple terms?</li>
              <li>how is sustainability different from compliance?</li>
              <li>what counts as responsible sourcing in hospitality?</li>
              <li>how can i raise a concern without sounding accusatory?</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 34,
    background: "rgba(24, 32, 23, 0.44)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    boxSizing: "border-box",
  },
  panel: {
    width: "min(980px, calc(100% - 24px))",
    height: "calc(100% - 20px)",
    maxHeight: "calc(100% - 20px)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 12,
    borderRadius: 0,
    border: "4px solid #2f4a2e",
    background: "#eadfbc",
    boxShadow: "0 10px 0 #172012",
    fontFamily: '"Courier New", "Lucida Console", monospace',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#6a7c45",
    fontWeight: 800,
  },
  title: {
    margin: "4px 0 4px",
    fontSize: "clamp(18px, 4vh, 30px)",
    lineHeight: 1,
    color: "#3e4b21",
  },
  subtitle: {
    margin: 0,
    maxWidth: 520,
    color: "#5e5b47",
    lineHeight: 1.25,
    fontSize: 12,
  },
  closeButton: {
    border: "3px solid #2f4a2e",
    background: "#d8ebb0",
    color: "#2a3920",
    borderRadius: 0,
    padding: "7px 10px",
    fontWeight: 800,
    cursor: "pointer",
    textTransform: "lowercase",
  },
  learnGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.6fr) minmax(240px, 0.9fr)",
    gap: 10,
    minHeight: 0,
    flex: 1,
  },
  chatCard: {
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    borderRadius: 0,
    padding: 10,
    background: "#fffaf0",
    border: "3px solid #cfbf93",
    boxShadow: "none",
  },
  chatScroller: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    paddingRight: 0,
  },
  message: {
    maxWidth: "88%",
    padding: "8px 10px",
    borderRadius: 0,
    lineHeight: 1.25,
    fontSize: 12,
    whiteSpace: "pre-wrap",
  },
  assistantMessage: {
    alignSelf: "flex-start",
    background: "#edf5d7",
    color: "#344124",
    border: "2px solid #bcd08f",
  },
  userMessage: {
    alignSelf: "flex-end",
    background: "#e5eef8",
    color: "#314257",
    border: "2px solid #b4cbe6",
  },
  statusBubble: {
    alignSelf: "flex-start",
    color: "#65724a",
    fontSize: 13,
    fontWeight: 700,
  },
  inputRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto",
    gap: 8,
    marginTop: 8,
    alignItems: "end",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    resize: "none",
    borderRadius: 0,
    border: "3px solid #d7c79e",
    padding: "8px 10px",
    font: "inherit",
    background: "#fffdf7",
    color: "#3b3a2f",
    outline: "none",
  },
  sendButton: {
    border: "3px solid #35532b",
    background: "#87b65d",
    color: "#f7faef",
    borderRadius: 0,
    padding: "8px 12px",
    fontWeight: 800,
    cursor: "pointer",
    textTransform: "lowercase",
    minWidth: 110,
  },
  errorText: {
    marginTop: 10,
    color: "#9f3c32",
    fontSize: 13,
    fontWeight: 700,
  },
  sideCard: {
    borderRadius: 0,
    padding: 10,
    background: "#f4ecd5",
    border: "3px solid #ceb982",
    color: "#54472e",
  },
  sideTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#4a5829",
    marginBottom: 10,
  },
  promptList: {
    margin: 0,
    paddingLeft: 18,
    display: "flex",
    flexDirection: "column",
    gap: 5,
    lineHeight: 1.25,
    fontSize: 12,
  },
};
