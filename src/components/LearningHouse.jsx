import React, { useEffect, useRef, useState } from "react";

import { callESGGuideAI } from "../engine/esgGuideAI";

const INITIAL_MESSAGES = [
  {
    role: "assistant",
    content:
      "olive: welcome to my little learning house. ask me anything about esg, sustainability, ethics, or how these ideas show up in everyday work.",
  },
];

export default function LearningHouse({ quest, onClose, compact = false }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const chatScrollerRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const node = chatScrollerRef.current;
    if (!node || !shouldAutoScrollRef.current) return undefined;
    const frame = requestAnimationFrame(() => {
      node.scrollTop = node.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [messages.length, busy, error]);

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

  function handleChatScroll(event) {
    const node = event.currentTarget;
    const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 40;
  }

  return (
    <div style={{ ...styles.overlay, ...(compact ? styles.overlayCompact : null) }}>
      <div style={{ ...styles.panel, ...(compact ? styles.panelCompact : null) }}>
        <div style={{ ...styles.header, ...(compact ? styles.headerCompact : null) }}>
          <div>
            <div style={{ ...styles.kicker, ...(compact ? styles.kickerCompact : null) }}>olive's learning house</div>
            <h2 style={{ ...styles.title, ...(compact ? styles.titleCompact : null) }}>learn more about esg</h2>
            <p style={{ ...styles.subtitle, ...(compact ? styles.subtitleCompact : null) }}>
              ask questions and explore examples.
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ ...styles.closeButton, ...(compact ? styles.closeButtonCompact : null) }}>
            leave house
          </button>
        </div>

        <div style={{ ...styles.learnGrid, ...(compact ? styles.learnGridCompact : null) }}>
          <div style={styles.chatCard}>
            <div
              ref={chatScrollerRef}
              style={styles.chatScroller}
              onScroll={handleChatScroll}
            >
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  style={{
                    ...styles.message,
                    ...(compact ? styles.messageCompact : null),
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
                style={{ ...styles.textarea, ...(compact ? styles.textareaCompact : null) }}
                rows={compact ? 2 : 3}
              />
              <button type="button" onClick={handleSend} disabled={busy || !draft.trim()} style={{ ...styles.sendButton, ...(compact ? styles.sendButtonCompact : null) }}>
                send
              </button>
            </div>
            {error ? <div style={styles.errorText}>{error}</div> : null}
          </div>

          <div style={{ ...styles.sideCard, ...(compact ? styles.sideCardCompact : null) }}>
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
  overlayCompact: {
    padding: 4,
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
    minHeight: 0,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  panelCompact: {
    width: "calc(100% - 4px)",
    height: "calc(100% - 4px)",
    maxHeight: "calc(100% - 4px)",
    gap: 5,
    padding: 7,
    borderWidth: 3,
    boxShadow: "0 4px 0 #172012",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
    flexShrink: 0,
    minWidth: 0,
  },
  headerCompact: {
    gap: 6,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#6a7c45",
    fontWeight: 800,
  },
  kickerCompact: {
    fontSize: 8,
    letterSpacing: 0.8,
  },
  title: {
    margin: "4px 0 4px",
    fontSize: "clamp(18px, 4vh, 30px)",
    lineHeight: 1,
    color: "#3e4b21",
  },
  titleCompact: {
    margin: "2px 0",
    fontSize: 15,
  },
  subtitle: {
    margin: 0,
    maxWidth: 520,
    color: "#5e5b47",
    lineHeight: 1.25,
    fontSize: 12,
  },
  subtitleCompact: {
    display: "none",
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
    touchAction: "manipulation",
    flexShrink: 0,
  },
  closeButtonCompact: {
    padding: "5px 7px",
    fontSize: 10,
    borderWidth: 2,
  },
  learnGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.6fr) minmax(240px, 0.9fr)",
    gap: 10,
    minHeight: 0,
    flex: 1,
  },
  learnGridCompact: {
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: 5,
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
    minWidth: 0,
    overflow: "hidden",
  },
  chatScroller: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    paddingRight: 6,
    overscrollBehavior: "contain",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(47,74,46,0.55) rgba(255,250,240,0.4)",
  },
  message: {
    maxWidth: "88%",
    padding: "8px 10px",
    borderRadius: 0,
    lineHeight: 1.25,
    fontSize: 12,
    whiteSpace: "pre-wrap",
    flexShrink: 0,
    overflowWrap: "anywhere",
  },
  messageCompact: {
    maxWidth: "94%",
    padding: "6px 8px",
    fontSize: 10,
    lineHeight: 1.22,
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
    flexShrink: 0,
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
  textareaCompact: {
    padding: "6px 8px",
    fontSize: 11,
    borderWidth: 2,
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
    touchAction: "manipulation",
  },
  sendButtonCompact: {
    minWidth: 68,
    padding: "6px 8px",
    fontSize: 11,
    borderWidth: 2,
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
    minHeight: 0,
    overflowY: "auto",
  },
  sideCardCompact: {
    display: "none",
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
