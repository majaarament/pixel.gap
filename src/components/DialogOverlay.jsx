// HTML dialog overlay rendered on top of the game canvas.
// Always anchored to the bottom of the canvas — RPG dialog-box style.

import React, { useEffect, useRef, useState } from "react";
import { parseSpeechSegments } from "../engine/dialogSegments";
import { drawCritter } from "../renderer/characters";

const NPC_ACCENT = {
  olive: "#7ab068",
  frank: "#5ea8c4",
  otis:  "#c4955e",
  suzy:  "#b07ab8",
  hazel: "#7ab8a0",
  rowan: "#c4b45e",
  daisy: "#a0c47a",
};

const SPEAKER_META = {
  olive:  { label: "Olive",  species: "owl",      role: "Sustainability Guide" },
  frank:  { label: "Frank",  species: "fish",     role: "Environmental Stewardship" },
  otis:   { label: "Otis",   species: "otter",    role: "People & Culture" },
  suzy:   { label: "Suzy",   species: "sheep",    role: "Business Conduct" },
  hazel:  { label: "Hazel",  species: "hedgehog", role: "Responsible Value Chain" },
  rowan:  { label: "Rowan",  species: "hare",     role: "Post-Reflection" },
  daisy:  { label: "Daisy",  species: "deer",     role: "People & Culture" },
  player: { label: "You",    species: "beaver",   role: "Player" },
};

// How long (ms) to wait between revealing each segment during auto-play
const SEGMENT_DELAY_MS = 400;
// Typewriter speed
const CHAR_TICK_MS   = 28;  // ms between ticks
const CHARS_PER_TICK = 2;   // characters revealed per tick (~70 chars/sec)

export default function DialogOverlay({ dialog, onChoice, onAdvance, onSubmitReflection }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [values, setValues]         = useState(() => (
    dialog?.phase === "reflection" ? dialog.initialValues || {} : {}
  ));
  const [openText, setOpenText]     = useState("");
  const [revealState, setRevealState] = useState({ key: "closed", count: 1 });
  const [charState, setCharState]   = useState({ key: "closed", count: 0 });
  const dialogScrollRef             = useRef(null);
  const shouldAutoScrollRef         = useRef(true);
  const revealTimerRef              = useRef(null);
  const charTimerRef                = useRef(null);

  const phase        = dialog?.phase || null;
  const isQuestion   = phase === "question";
  const isReaction   = phase === "reaction";
  const isReflection = phase === "reflection";
  const isInfo       = phase === "info";
  const bodyText     = isReaction ? dialog?.reaction : dialog?.message;
  const dialogKey    = dialog
    ? `${dialog.npcId || "npc"}:${phase || "phase"}:${dialog.stepIndex ?? "step"}:${bodyText || ""}`
    : "closed";

  const accent       = dialog ? (NPC_ACCENT[dialog.npcId] || "#7ab068") : "#7ab068";
  const allSegments  = dialog && !isReflection && bodyText ? parseSpeechSegments(dialog, bodyText) : [];
  const history      = dialog && !isReflection && dialog.history?.length > 0 ? dialog.history : [];
  const hasPromptValues = dialog?.prompts?.every((p) => (values[p.id] || "").trim());
  const revealedCount = revealState.key === dialogKey ? revealState.count : 1;

  // Auto-reveal segments one at a time for any multi-speaker exchange.
  // Applies to all phases (info, question, reaction) — sequence steps all
  // use phase:"question" internally, so we can't restrict to isInfo only.
  const isSmallTalk    = allSegments.length > 1;
  const allSegRevealed = revealedCount >= allSegments.length;
  const segments       = isSmallTalk ? allSegments.slice(0, revealedCount) : allSegments;
  const activeSpeaker  = getActiveSpeaker(dialog, segments);
  const hasChoices     = isQuestion && dialog?.choices?.length > 0;

  // Typewriter: compute how much of the latest segment to show.
  const latestSegText = segments.length > 0
    ? stripVisibleQuotes(segments[segments.length - 1].text)
    : (bodyText ? stripVisibleQuotes(bodyText) : "");
  const charKey = `${dialogKey}:${revealedCount}:${latestSegText}`;
  const charCount = charState.key === charKey ? charState.count : 0;
  const isTypingActive = latestSegText.length > 0 && charCount < latestSegText.length;
  const allRevealed    = allSegRevealed && !isTypingActive;

  // Auto-follow the newest dialog content, but stop once the player scrolls up
  // to reread older lines. Each new dialog step opts back into auto-follow.
  useEffect(() => {
    shouldAutoScrollRef.current = true;
  }, [dialogKey]);

  useEffect(() => {
    const node = dialogScrollRef.current;
    if (!node || !shouldAutoScrollRef.current) return undefined;
    const frame = requestAnimationFrame(() => {
      node.scrollTop = node.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [dialogKey, revealedCount, history.length, segments.length, allRevealed, hasChoices]);

  // Typewriter: advance charCount one tick at a time.
  useEffect(() => {
    if (!isTypingActive) return undefined;
    charTimerRef.current = setTimeout(() => {
      setCharState((prev) => {
        const count = prev.key === charKey ? prev.count : 0;
        return { key: charKey, count: Math.min(count + CHARS_PER_TICK, latestSegText.length) };
      });
    }, CHAR_TICK_MS);
    return () => clearTimeout(charTimerRef.current);
  }, [isTypingActive, charCount, charKey, latestSegText.length]);

  // Reveal the next segment only after the current one finishes typing.
  useEffect(() => {
    clearTimeout(revealTimerRef.current);
    if (!isSmallTalk || allSegRevealed) return;
    if (isTypingActive) return;
    revealTimerRef.current = setTimeout(() => {
      setRevealState((prev) => {
        const count = prev.key === dialogKey ? prev.count : 1;
        return { key: dialogKey, count: count + 1 };
      });
    }, SEGMENT_DELAY_MS);
    return () => clearTimeout(revealTimerRef.current);
  }, [dialogKey, isSmallTalk, allSegRevealed, revealedCount, isTypingActive]);

  // Step progress for multi-step sequences
  const totalSteps    = dialog?.steps?.length ?? 0;
  const currentStep   = dialog?.stepIndex ?? 0;
  const showProgress  = dialog?.type === "sequence" && totalSteps > 1;

  // During reaction phase, surface the last Q&A pair as a pinned recap
  const lastPlayerIdx   = history.length - 1;
  const lastPlayerEntry = isReaction && lastPlayerIdx >= 0 && history[lastPlayerIdx]?.variant === "player"
    ? history[lastPlayerIdx]
    : null;
  const lastNpcEntry    = isReaction && lastPlayerIdx >= 1 && history[lastPlayerIdx - 1]?.variant !== "player"
    ? history[lastPlayerIdx - 1]
    : null;

  // Tab/Enter: skip reveal if still in progress, otherwise advance
  useEffect(() => {
    if (!dialog) return undefined;

    function handleWindowKeyDown(event) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const isPrimaryShortcut =
        (event.key === "Tab" && !event.shiftKey) ||
        (event.key === "Enter" && !event.shiftKey);
      if (!isPrimaryShortcut) return;

      if (!allRevealed) {
        event.preventDefault();
        clearTimeout(revealTimerRef.current);
        clearTimeout(charTimerRef.current);
        setCharState({ key: charKey, count: latestSegText.length });
        setRevealState({ key: dialogKey, count: allSegments.length });
        return;
      }

      // Only advance on Enter/Tab when there are no choices waiting
      if (!hasChoices && (isInfo || isReaction || isQuestion)) {
        event.preventDefault();
        onAdvance();
      }
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [dialog, dialogKey, charKey, isInfo, isReaction, isQuestion, hasChoices, allRevealed, allSegments.length, onAdvance, latestSegText]);

  // Number keys select choices (only after all segments revealed).
  useEffect(() => {
    if (!dialog || !isQuestion || !allRevealed) return;
    const regularChoices = (dialog.choices || []).filter((c) => !c.isOpenEnded);
    if (!regularChoices.length) return;

    function handleNumberKey(e) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= regularChoices.length) {
        e.preventDefault();
        setHoveredIdx(null);
        onChoice(regularChoices[num - 1]);
      }
    }

    window.addEventListener("keydown", handleNumberKey);
    return () => window.removeEventListener("keydown", handleNumberKey);
  }, [dialog, isQuestion, allRevealed, onChoice]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!hasPromptValues) return;
    onSubmitReflection(values);
  }

  function handleDialogScroll(event) {
    const node = event.currentTarget;
    const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom < 32;
  }

  if (!dialog) return null;

  // ── Centered reflection form (legacy path) ────────────────────────────────
  if (isReflection) {
    return (
      <div style={styles.reflectionBackdrop}>
        <div style={styles.reflectionCard}>
          <div style={{ ...styles.cardHeader, borderColor: accent }}>
            <PixelPortrait speakerId={dialog.npcId} accent={accent} size={34} />
            <div>
              <div style={{ ...styles.npcName, color: accent }}>{dialog.npcName}</div>
              {dialog.npcRole && <div style={styles.npcRole}>{dialog.npcRole}</div>}
            </div>
          </div>
          <form style={styles.form} onSubmit={handleSubmit}>
            {dialog.prompts.map((prompt, index) => (
              <label key={prompt.id} style={styles.promptBlock}>
                <span style={styles.promptText}>{prompt.prompt}</span>
                <textarea
                  value={values[prompt.id] || ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [prompt.id]: e.target.value }))}
                  onKeyDown={(event) => {
                    const isLastPrompt = index === dialog.prompts.length - 1;
                    const isPrimaryShortcut =
                      (event.key === "Tab" && !event.shiftKey) ||
                      (event.key === "Enter" && !event.shiftKey);
                    if (isPrimaryShortcut && isLastPrompt && hasPromptValues) {
                      event.preventDefault();
                      handleSubmit(event);
                    }
                  }}
                  rows={3}
                  style={styles.textarea}
                />
              </label>
            ))}
            <button
              type="submit"
              disabled={!dialog.prompts.every((p) => (values[p.id] || "").trim())}
              style={styles.submitBtn}
            >
              continue to Rowan ▶
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── RPG dialog box — always at the bottom of the canvas ──────────────────
  return (
    <div style={styles.backdrop}>
      <div style={{ ...styles.gameCard, borderTopColor: accent }}>
        <div style={{ ...styles.activeSpeakerBar, borderColor: `${activeSpeaker.accent}88` }}>
          <PixelPortrait speakerId={activeSpeaker.id} accent={activeSpeaker.accent} size={42} active />
          <div style={styles.activeSpeakerText}>
            <div style={{ ...styles.activeSpeakerName, color: activeSpeaker.accent }}>
              {activeSpeaker.label}
            </div>
            <div style={styles.activeSpeakerRole}>{activeSpeaker.role}</div>
          </div>
          {showProgress && (
            <div style={{ ...styles.stepBadge, borderColor: activeSpeaker.accent, color: activeSpeaker.accent }}>
              {currentStep + 1} / {totalSteps}
            </div>
          )}
        </div>

        <div ref={dialogScrollRef} style={styles.dialogScroll} onScroll={handleDialogScroll}>
          {/* Pinned recap during reaction: show the question and the player's answer */}
          {isReaction && (lastNpcEntry || lastPlayerEntry) && (
            <div style={{ ...styles.pinnedRecap, borderColor: `${accent}44` }}>
              {lastNpcEntry && (
                <div style={styles.pinnedQuestion}>
                  <PixelPortrait speakerId={dialog.npcId} accent={accent} size={22} />
                  <span style={styles.pinnedLabel}>Q</span>
                  <span style={styles.pinnedQText}>{lastNpcEntry.text}</span>
                </div>
              )}
              {lastPlayerEntry && (
                <div style={styles.pinnedAnswer}>
                  <PixelPortrait speakerId="player" accent="#9ecf8a" size={22} />
                  <span style={{ ...styles.pinnedLabel, background: `${accent}33`, color: accent }}>You</span>
                  <span style={styles.pinnedAText}>{lastPlayerEntry.text}</span>
                </div>
              )}
            </div>
          )}

          {/* History: previous exchanges in this dialog (only in non-reaction phases) */}
          {!isReaction && history.length > 0 && (
            <div style={styles.historyArea}>
              {history.map((seg, i) => (
                <div
                  key={i}
                  style={
                    seg.variant === "player"
                      ? styles.historyPlayer
                      : styles.historyNpc
                  }
                >
                  <span
                    style={{
                      ...styles.historyLabel,
                      color: seg.variant === "player" ? "rgba(200,230,195,0.6)" : accent,
                    }}
                  >
                    {seg.variant === "player" ? "You" : seg.speaker}:
                  </span>{" "}
                  {seg.text}
                </div>
              ))}
            </div>
          )}

          {/* Current message */}
          <div style={styles.messageArea}>
            {segments.length > 0
              ? segments.map((seg, i) => {
                  const isLast   = i === segments.length - 1;
                  const isPlayer = seg.variant === "player";
                  const isNote   = seg.variant === "note";
                  const speaker  = getSpeakerMeta(dialog, seg);
                  const stripped = stripVisibleQuotes(seg.text);
                  const display  = isLast ? stripped.slice(0, charCount) : stripped;
                  return (
                    <div key={i} style={{ ...styles.segmentRow, ...(isPlayer ? styles.segmentRowPlayer : {}) }}>
                      {!isNote && (
                        <PixelPortrait speakerId={speaker.id} accent={speaker.accent} size={24} active={isLast} />
                      )}
                      <div style={{ ...styles.segmentBlock, ...(isPlayer ? styles.segmentPlayer : {}) }}>
                        <p style={{ ...styles.message, ...(isPlayer ? styles.messagePlayer : isNote ? styles.messageNote : {}) }}>
                          {display}
                        </p>
                      </div>
                    </div>
                  );
                })
              : bodyText && <p style={styles.message}>{stripVisibleQuotes(bodyText).slice(0, charCount)}</p>}
          </div>
        </div>

        {/* Choices — only shown once all segments have been revealed */}
        {isQuestion && allRevealed && dialog.choices && dialog.choices.length > 0 && (() => {
          const openChoice = dialog.choices.length === 1 && dialog.choices[0].isOpenEnded
            ? dialog.choices[0]
            : null;

          if (openChoice) {
            return (
              <div style={styles.openEndedArea}>
                <textarea
                  style={styles.openTextarea}
                  placeholder="type your response here..."
                  value={openText}
                  onChange={(e) => setOpenText(e.target.value)}
                  onKeyDown={(event) => {
                    const isPrimaryShortcut =
                      (event.key === "Tab" && !event.shiftKey) ||
                      (event.key === "Enter" && !event.shiftKey);
                    if (isPrimaryShortcut && openText.trim()) {
                      event.preventDefault();
                      onChoice({ ...openChoice, label: openText.trim() });
                    }
                  }}
                  rows={3}
                  autoFocus
                />
                <div style={styles.continueRow}>
                  <button
                    type="button"
                    disabled={!openText.trim()}
                    style={{
                      ...styles.continueBtn,
                      borderColor: openText.trim() ? accent : "rgba(180,210,175,0.2)",
                      color: openText.trim() ? accent : "rgba(180,210,175,0.3)",
                    }}
                    onClick={() => onChoice({ ...openChoice, label: openText.trim() })}
                  >
                    submit ▶
                  </button>
                </div>
              </div>
            );
          }

          return (
            <>
              <div style={styles.choices}>
                {dialog.choices.map((c, i) => (
                  <button
                    key={c.key}
                    style={{
                      ...styles.choice,
                      ...(hoveredIdx === i
                        ? { ...styles.choiceHover, borderColor: accent }
                        : {}),
                    }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => { setHoveredIdx(null); onChoice(c); }}
                  >
                    <span style={{ ...styles.choiceNum, background: accent }}>{i + 1}</span>
                    <span style={styles.choiceLabel}>{cleanChoiceLabel(c.label, i)}</span>
                  </button>
                ))}
              </div>
              <div style={styles.choiceHint}>press 1–{dialog.choices.length} or click to answer</div>
            </>
          );
        })()}

        {/* Skip button while text is still appearing */}
        {!allRevealed && (
          <div style={styles.continueRow}>
            <button
              type="button"
              style={{ ...styles.continueBtn, borderColor: `${accent}99`, color: `${accent}bb` }}
              onClick={() => {
                clearTimeout(revealTimerRef.current);
                clearTimeout(charTimerRef.current);
                setCharState({ key: charKey, count: latestSegText.length });
                setRevealState({ key: dialogKey, count: allSegments.length });
              }}
            >
              skip ▶
            </button>
          </div>
        )}

        {/* Continue button — only when all revealed and no choices pending */}
        {allRevealed && (isInfo || isReaction || (isQuestion && (!dialog.choices || dialog.choices.length === 0))) && (
          <div style={styles.continueRow}>
            <button
              type="button"
              style={{ ...styles.continueBtn, borderColor: accent, color: accent }}
              onClick={onAdvance}
            >
              continue ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PixelPortrait({ speakerId, accent, size = 32, active = false }) {
  const canvasRef = useRef(null);
  const meta = SPEAKER_META[speakerId] || SPEAKER_META.olive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 24, 24);
    ctx.fillStyle = "#223020";
    ctx.fillRect(0, 0, 24, 24);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(2, 2, 20, 2);
    drawCritter(ctx, 4, 7, meta.species, "down", 0, speakerId === "player");
  }, [meta.species, speakerId]);

  return (
    <span
      style={{
        ...styles.portraitFrame,
        ...(active ? styles.portraitFrameActive : null),
        width: size,
        height: size,
        borderColor: accent,
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        width={24}
        height={24}
        style={{
          ...styles.portraitCanvas,
          width: size,
          height: size,
        }}
      />
    </span>
  );
}

function getSpeakerMeta(dialog, segment) {
  if (segment?.variant === "player" || segment?.speaker === "You") {
    return { id: "player", accent: "#9ecf8a", ...SPEAKER_META.player };
  }

  const speakerKey = String(segment?.speaker || dialog?.npcName || "")
    .split(" ")[0]
    .toLowerCase();
  const id = Object.keys(SPEAKER_META).find((key) => SPEAKER_META[key].label.toLowerCase() === speakerKey) || dialog?.npcId || "olive";
  const meta = SPEAKER_META[id] || SPEAKER_META.olive;
  return {
    id,
    accent: NPC_ACCENT[id] || NPC_ACCENT.olive,
    ...meta,
  };
}

function getActiveSpeaker(dialog, segments) {
  const latest = segments.length ? segments[segments.length - 1] : null;
  return getSpeakerMeta(dialog, latest || { speaker: dialog?.npcName, variant: "npc" });
}

function stripVisibleQuotes(text) {
  return String(text || "")
    .trim()
    .replace(/^["“]+/, "")
    .replace(/["”]+(?=[\s.,!?;:]*$)/, "")
    .trim();
}

function cleanChoiceLabel(label, index) {
  const expected = index + 1;
  return String(label || "")
    .replace(new RegExp(`^\\s*${expected}\\s*[—-]\\s*`), "")
    .trim();
}

const styles = {
  // ── Backdrop ──────────────────────────────────────────────────────────────
  backdrop: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "stretch",
    zIndex: 100,
    pointerEvents: "none",
    fontFamily: '"Courier New", "Lucida Console", monospace',
  },

  // ── Main game card — RPG dialog box at the bottom ─────────────────────────
  gameCard: {
    width: "100%",
    maxHeight: "min(62%, calc(100% - 16px))",
    minHeight: 0,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "9px 12px 12px",
    background: "rgba(14, 20, 16, 0.97)",
    borderTop: "3px solid",
    pointerEvents: "auto",
  },
  activeSpeakerBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 7px",
    background: "rgba(255,255,255,0.035)",
    border: "2px solid",
    flexShrink: 0,
  },
  activeSpeakerText: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 1,
    flex: 1,
  },
  activeSpeakerName: {
    fontSize: 11,
    lineHeight: 1,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  activeSpeakerRole: {
    fontSize: 9,
    lineHeight: 1.1,
    color: "rgba(190,210,185,0.58)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  portraitFrame: {
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#10170f",
    border: "2px solid",
    boxShadow: "2px 2px 0 rgba(0,0,0,0.35)",
    imageRendering: "pixelated",
  },
  portraitFrameActive: {
    background: "#192216",
    boxShadow: "0 0 0 2px rgba(240,201,74,0.22), 2px 2px 0 rgba(0,0,0,0.45)",
  },
  portraitCanvas: {
    display: "block",
    imageRendering: "pixelated",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  cardHeader: {
    display: "none",
  },
  legacyCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingBottom: 8,
    borderBottom: "1px solid rgba(255,255,255,0.07)",
  },
  accentDot: {
    width: 10,
    height: 10,
    borderRadius: 0,
    flexShrink: 0,
  },
  headerText: {
    display: "flex",
    alignItems: "baseline",
    gap: 0,
    flexWrap: "wrap",
    flex: 1,
  },
  npcName: {
    fontSize: 11,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  npcRole: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "rgba(180,200,175,0.55)",
  },
  stepBadge: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.5,
    border: "1px solid",
    borderRadius: 0,
    padding: "2px 7px",
    opacity: 0.75,
    flexShrink: 0,
  },

  // ── Pinned recap (shown during reaction) ─────────────────────────────────
  dialogScroll: {
    minHeight: 0,
    flex: "0 1 auto",
    maxHeight: "min(34vh, 280px)",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 7,
    paddingRight: 6,
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(122,176,104,0.65) rgba(255,255,255,0.06)",
  },
  pinnedRecap: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    padding: "8px 10px",
    borderRadius: 0,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid",
  },
  pinnedQuestion: {
    display: "flex",
    alignItems: "flex-start",
    gap: 7,
  },
  pinnedAnswer: {
    display: "flex",
    alignItems: "flex-start",
    gap: 7,
  },
  pinnedLabel: {
    fontSize: 9,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    background: "rgba(255,255,255,0.08)",
    color: "rgba(180,210,175,0.7)",
    borderRadius: 0,
    padding: "2px 5px",
    flexShrink: 0,
    marginTop: 1,
  },
  pinnedQText: {
    fontSize: 11,
    lineHeight: 1.45,
    color: "rgba(180,210,175,0.7)",
  },
  pinnedAText: {
    fontSize: 11,
    lineHeight: 1.45,
    color: "rgba(210,235,205,0.9)",
    fontWeight: 600,
  },

  // ── History area ─────────────────────────────────────────────────────────
  historyArea: {
    overflow: "visible",
    display: "flex",
    flexDirection: "column",
    gap: 3,
    paddingBottom: 8,
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    flexShrink: 0,
  },
  historyNpc: {
    fontSize: 11,
    lineHeight: 1.4,
    color: "rgba(160,190,155,0.82)",
  },
  historyPlayer: {
    fontSize: 11,
    lineHeight: 1.4,
    color: "rgba(200,230,195,0.88)",
    textAlign: "right",
  },
  historyLabel: {
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 10,
  },

  // ── Current message ───────────────────────────────────────────────────────
  messageArea: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  segmentRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 7,
  },
  segmentRowPlayer: {
    flexDirection: "row-reverse",
  },
  segmentBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  segmentPlayer: {
    alignItems: "flex-end",
  },
  segmentSpeaker: {
    display: "none",
    fontSize: 9,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    border: "1px solid",
    borderRadius: 0,
    padding: "1px 6px",
    alignSelf: "flex-start",
    alignItems: "center",
    gap: 0,
  },
  segmentRole: {
    fontWeight: 400,
    opacity: 0.75,
    textTransform: "none",
    letterSpacing: 0.3,
    fontSize: 8,
  },
  message: {
    margin: 0,
    fontSize: "clamp(11px, 1.55vh, 14px)",
    lineHeight: 1.38,
    color: "#ddeedd",
    whiteSpace: "pre-line",
  },
  messagePlayer: {
    color: "rgba(210,235,205,0.9)",
    fontSize: "clamp(11px, 1.5vh, 13px)",
    fontStyle: "italic",
  },
  messageNote: {
    color: "rgba(160,190,155,0.7)",
    fontSize: "clamp(10px, 1.45vh, 12px)",
    fontStyle: "italic",
  },

  // ── Choices ───────────────────────────────────────────────────────────────
  choices: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginTop: 4,
    flexShrink: 0,
  },
  choice: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 9px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(180,210,175,0.2)",
    borderRadius: 0,
    color: "#c8ddc4",
    fontSize: "clamp(12px, 1.55vh, 14px)",
    fontFamily: "inherit",
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    transition: "background 0.1s, border-color 0.1s",
  },
  choiceHover: {
    background: "rgba(122,176,104,0.18)",
    color: "#e8f5e4",
  },
  choiceNum: {
    flexShrink: 0,
    width: 20,
    height: 20,
    borderRadius: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#0e1410",
    fontSize: 11,
    fontWeight: 900,
  },
  choiceLabel: {
    lineHeight: 1.25,
  },
  choiceHint: {
    fontSize: 10,
    color: "rgba(140,170,135,0.5)",
    letterSpacing: 0.3,
    textAlign: "right",
    marginTop: 2,
    flexShrink: 0,
  },

  // ── Continue ──────────────────────────────────────────────────────────────
  continueRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 2,
    flexShrink: 0,
  },
  continueBtn: {
    padding: "7px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid",
    borderRadius: 0,
    fontSize: 12,
    fontFamily: "inherit",
    fontWeight: 800,
    letterSpacing: 1,
    cursor: "pointer",
    textTransform: "uppercase",
  },

  // ── Reflection (centered overlay) ─────────────────────────────────────────
  reflectionBackdrop: {
    position: "absolute",
    inset: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(8,14,10,0.55)",
    backdropFilter: "none",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    pointerEvents: "auto",
  },
  reflectionCard: {
    width: "min(680px, calc(100% - 32px))",
    maxHeight: "calc(100% - 32px)",
    overflow: "hidden",
    background: "rgba(14,20,16,0.97)",
    border: "2px solid rgba(122,176,104,0.5)",
    borderRadius: 0,
    padding: "14px 16px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  promptBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  promptText: {
    fontSize: "clamp(11px, 1.6vh, 13px)",
    lineHeight: 1.35,
    color: "#c8ddc4",
  },
  textarea: {
    resize: "vertical",
    minHeight: 58,
    borderRadius: 0,
    border: "1px solid rgba(122,176,104,0.4)",
    background: "rgba(255,255,255,0.04)",
    padding: "10px",
    font: "inherit",
    color: "#ddeedd",
    fontSize: 14,
    outline: "none",
  },
  openEndedArea: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 4,
    flexShrink: 0,
  },
  openTextarea: {
    resize: "vertical",
    minHeight: 52,
    borderRadius: 0,
    border: "1px solid rgba(122,176,104,0.4)",
    background: "rgba(255,255,255,0.04)",
    padding: "10px",
    font: "inherit",
    color: "#ddeedd",
    fontSize: 13,
    outline: "none",
    fontFamily: '"Courier New", "Lucida Console", monospace',
  },
  submitBtn: {
    alignSelf: "flex-end",
    padding: "9px 18px",
    background: "rgba(122,176,104,0.15)",
    border: "1px solid #7ab068",
    borderRadius: 0,
    color: "#7ab068",
    font: "inherit",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    cursor: "pointer",
  },
};
