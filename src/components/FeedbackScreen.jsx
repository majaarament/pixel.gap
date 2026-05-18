import React, { useEffect, useRef, useState } from "react";
import { drawHeroBeaverSprite } from "../renderer/beaverSprite";

const FEEDBACK_QUESTIONS = [
  {
    id: "postGame_understanding",
    type: "stars",
    prompt:
      "How clear do delaware's sustainability values feel to me now, compared with when I started?",
    choices: [
      { key: "1", label: "1 out of 5 stars" },
      { key: "2", label: "2 out of 5 stars" },
      { key: "3", label: "3 out of 5 stars" },
      { key: "4", label: "4 out of 5 stars" },
      { key: "5", label: "5 out of 5 stars" },
    ],
  },
  {
    id: "postGame_reflection",
    type: "slider",
    prompt:
      "Did the game make me think differently about how these values show up in my own work?",
    choices: [
      {
        key: "yes",
        label: "yes - it gave me new ways to think about it.",
        displayLabel: "yes",
      },
      {
        key: "somewhat",
        label: "somewhat - it confirmed some things and challenged others.",
        displayLabel: "somewhat",
      },
      {
        key: "not_really",
        label: "not particularly - it matched what i already thought.",
        displayLabel: "not really",
      },
    ],
  },
  {
    id: "postGame_learning",
    type: "stars",
    prompt: "How much do I feel I learned from this experience?",
    choices: [
      { key: "1", label: "1 out of 5 stars" },
      { key: "2", label: "2 out of 5 stars" },
      { key: "3", label: "3 out of 5 stars" },
      { key: "4", label: "4 out of 5 stars" },
      { key: "5", label: "5 out of 5 stars" },
    ],
  },
];

const FILLED_STAR = "\u2605";
const EMPTY_STAR = "\u2606";

function PixelCanvas({ width, height, scale, draw, style }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    draw(ctx);
  }, [draw, height, width]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: width * scale,
        height: height * scale,
        imageRendering: "pixelated",
        display: "block",
        ...style,
      }}
    />
  );
}

function drawBeaver(ctx) {
  drawHeroBeaverSprite(ctx, 0, 0);
}

export default function FeedbackScreen({ onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [hoverRatings, setHoverRatings] = useState({});
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const activeQuestion =
    FEEDBACK_QUESTIONS.find((question) => !answers[question.id]) || null;
  const allAnswered = !activeQuestion;

  function handleSubmit(e) {
    e.preventDefault();
    setSubmittedOnce(true);
    if (!allAnswered) return;

    onSubmit(
      FEEDBACK_QUESTIONS.map((question) => {
        const choiceKey = answers[question.id];
        const choice = question.choices.find((item) => item.key === choiceKey);
        return {
          stepId: question.id,
          prompt: question.prompt,
          choiceKey,
          choiceLabel: choice?.label || choiceKey,
        };
      })
    );
  }

  return (
    <div style={styles.screen}>
      <div style={styles.panel}>
        <div style={styles.beaverPane}>
          <div style={styles.speechBubble}>
            <div style={styles.bubbleKicker}>before you leave</div>
            <div style={styles.bubbleTitle}>one last reflection</div>
          </div>
          <PixelCanvas
            width={26}
            height={28}
            scale={9}
            draw={drawBeaver}
            style={styles.beaverCanvas}
          />
        </div>

        <form style={styles.formPane} onSubmit={handleSubmit}>
          <div style={styles.questions}>
            {FEEDBACK_QUESTIONS.map((question, questionIndex) => (
              <section key={question.id} style={styles.questionBlock}>
                <div style={styles.questionHeader}>
                  <span style={styles.questionNumber}>{questionIndex + 1}</span>
                  <span>{question.prompt}</span>
                </div>
                <div style={styles.choiceGrid}>
                  {question.type === "stars" ? (
                    <div
                      style={styles.starRow}
                      onMouseLeave={() =>
                        setHoverRatings((prev) => ({ ...prev, [question.id]: 0 }))
                      }
                    >
                      {question.choices.map((choice) => {
                        const rating = Number(choice.key);
                        const selectedRating = Number(answers[question.id] || 0);
                        const previewRating = hoverRatings[question.id] || selectedRating;
                        return (
                          <button
                            key={choice.key}
                            type="button"
                            aria-label={choice.label}
                            aria-pressed={selectedRating === rating}
                            style={{
                              ...styles.starButton,
                              ...(rating <= previewRating ? styles.starButtonSelected : null),
                            }}
                            onMouseEnter={() =>
                              setHoverRatings((prev) => ({ ...prev, [question.id]: rating }))
                            }
                            onFocus={() =>
                              setHoverRatings((prev) => ({ ...prev, [question.id]: rating }))
                            }
                            onBlur={() =>
                              setHoverRatings((prev) => ({ ...prev, [question.id]: 0 }))
                            }
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [question.id]: choice.key }))
                            }
                          >
                            {rating <= previewRating ? FILLED_STAR : EMPTY_STAR}
                          </button>
                        );
                      })}
                    </div>
                  ) : question.type === "slider" ? (
                    <div style={styles.sliderWrap}>
                      {(() => {
                        const selectedIndex = Math.max(
                          0,
                          question.choices.findIndex((choice) => choice.key === answers[question.id])
                        );
                        const sliderIndex = answers[question.id] ? selectedIndex : 1;

                        return (
                          <>
                            <input
                              type="range"
                              min="0"
                              max={question.choices.length - 1}
                              step="1"
                              value={sliderIndex}
                              aria-label={question.prompt}
                              style={{
                                ...styles.sliderInput,
                                ...(answers[question.id] ? null : styles.sliderInputUnset),
                              }}
                              onChange={(event) => {
                                const nextChoice = question.choices[Number(event.target.value)];
                                setAnswers((prev) => ({ ...prev, [question.id]: nextChoice.key }));
                              }}
                            />
                            <div style={styles.sliderLabels}>
                              {question.choices.map((choice) => {
                                const selected = answers[question.id] === choice.key;
                                return (
                                  <button
                                    key={choice.key}
                                    type="button"
                                    style={{
                                      ...styles.sliderLabel,
                                      ...(selected ? styles.sliderLabelSelected : null),
                                    }}
                                    onClick={() =>
                                      setAnswers((prev) => ({ ...prev, [question.id]: choice.key }))
                                    }
                                  >
                                    {choice.displayLabel || choice.label}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : question.choices.map((choice) => {
                    const selected = answers[question.id] === choice.key;
                    return (
                      <button
                        key={choice.key}
                        type="button"
                        aria-pressed={selected}
                        style={{
                          ...styles.choiceButton,
                          ...(selected ? styles.choiceButtonSelected : null),
                        }}
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [question.id]: choice.key }))
                        }
                      >
                        {choice.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          {submittedOnce && !allAnswered && (
            <p style={styles.error}>please answer all three before leaving.</p>
          )}

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(allAnswered ? null : styles.submitButtonDisabled),
            }}
          >
            save answers
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  screen: {
    minHeight: "100svh",
    height: "100svh",
    background: "#a3b787",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    boxSizing: "border-box",
    overflow: "hidden",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    color: "#11180e",
  },
  panel: {
    width: "min(1120px, calc(100vw - 32px))",
    maxHeight: "calc(100svh - 36px)",
    background: "#e8ecd7",
    border: "6px solid #11180e",
    outline: "6px solid #ffffff",
    boxShadow: "12px 12px 0 rgba(92, 125, 83, 0.7)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
    gap: 24,
    padding: "clamp(16px, 3vw, 30px)",
    boxSizing: "border-box",
    overflowY: "auto",
  },
  beaverPane: {
    minHeight: "clamp(260px, 48vh, 420px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  speechBubble: {
    position: "relative",
    width: "min(340px, 100%)",
    minHeight: 108,
    background: "#fff9ea",
    border: "4px solid #11180e",
    boxShadow: "6px 6px 0 #d9c58b",
    padding: "14px 16px",
    boxSizing: "border-box",
    fontSize: "clamp(13px, 1.35vw, 17px)",
    fontWeight: 900,
    lineHeight: 1.25,
  },
  bubbleKicker: {
    display: "inline-block",
    marginBottom: 8,
    padding: "4px 7px",
    background: "#32462f",
    color: "#edf3d2",
    border: "2px solid #24331f",
    fontSize: "clamp(10px, 1vw, 12px)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  bubbleTitle: {
    color: "#11180e",
    fontSize: "clamp(26px, 3.3vw, 42px)",
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  beaverCanvas: {
    width: "min(260px, 70vw)",
    height: "auto",
  },
  formPane: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  kicker: {
    alignSelf: "flex-start",
    padding: "5px 9px",
    background: "#32462f",
    color: "#edf3d2",
    border: "2px solid #24331f",
    fontSize: 11,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    margin: 0,
    color: "#11180e",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(28px, 4vw, 54px)",
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: 0,
  },
  questions: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  questionBlock: {
    margin: 0,
    padding: "14px 18px 16px",
    border: "3px solid #c9b487",
    background: "#f5ecd1",
    boxShadow: "inset 0 2px 0 #fff8e6",
  },
  questionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
    padding: 0,
    color: "#21301d",
    fontSize: "clamp(13px, 1.35vw, 17px)",
    fontWeight: 900,
    lineHeight: 1.25,
  },
  questionNumber: {
    width: 26,
    height: 26,
    background: "#32462f",
    color: "#edf3d2",
    border: "2px solid #24331f",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: 12,
    fontWeight: 900,
  },
  choiceGrid: {
    display: "block",
  },
  starRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
  },
  starButton: {
    width: 48,
    height: 48,
    padding: 0,
    background: "#dde5cf",
    color: "#67705a",
    border: "3px solid #b4c0a3",
    boxShadow: "0 3px 0 #b8c3a7",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 30,
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  starButtonSelected: {
    background: "#fff4df",
    color: "#c48a1e",
    border: "3px solid #24401e",
    boxShadow: "0 3px 0 #8b935e",
  },
  sliderWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: "4px 2px 0",
  },
  sliderInput: {
    width: "100%",
    accentColor: "#c48a1e",
    cursor: "pointer",
  },
  sliderInputUnset: {
    opacity: 0.65,
  },
  sliderLabels: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
  },
  sliderLabel: {
    minHeight: 42,
    padding: "8px 6px",
    background: "#dde5cf",
    color: "#2f412b",
    border: "3px solid #b4c0a3",
    boxShadow: "0 3px 0 #b8c3a7",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(11px, 1.2vw, 15px)",
    fontWeight: 900,
    lineHeight: 1.1,
    letterSpacing: 0,
    cursor: "pointer",
  },
  sliderLabelSelected: {
    background: "#fff4df",
    color: "#1b2917",
    border: "3px solid #24401e",
    boxShadow: "0 3px 0 #8b935e",
  },
  choiceButton: {
    minHeight: 48,
    padding: "9px 10px",
    background: "#dde5cf",
    color: "#2f412b",
    border: "3px solid #b4c0a3",
    boxShadow: "0 3px 0 #b8c3a7",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(11px, 1.15vw, 14px)",
    fontWeight: 900,
    lineHeight: 1.2,
    letterSpacing: 0,
    textAlign: "left",
    cursor: "pointer",
  },
  choiceButtonSelected: {
    background: "#fff4df",
    color: "#1b2917",
    border: "3px solid #24401e",
    boxShadow: "0 3px 0 #8b935e",
  },
  error: {
    margin: 0,
    padding: "9px 12px",
    background: "#f6ddd5",
    border: "2px solid #d9a497",
    color: "#8b3a2a",
    fontSize: 13,
    fontWeight: 900,
  },
  submitButton: {
    alignSelf: "flex-start",
    marginTop: 2,
    padding: "12px 22px",
    background: "#f4d17c",
    color: "#24321f",
    border: "4px solid #6f5524",
    boxShadow: "0 5px 0 #a27b32",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(16px, 2vw, 24px)",
    fontWeight: 900,
    letterSpacing: 0,
    cursor: "pointer",
  },
  submitButtonDisabled: {
    background: "#b7bf9f",
    color: "#556047",
    borderColor: "#717c60",
    boxShadow: "0 5px 0 #7d886b",
  },
};
