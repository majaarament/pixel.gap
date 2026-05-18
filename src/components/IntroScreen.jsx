import React, { useEffect, useRef } from "react";
import { drawTree } from "../renderer/props";

const TITLE_GLYPHS = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
};

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

function fill(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawPixelWord(ctx, word, x, y, color) {
  let cursor = x;
  for (const char of word) {
    const glyph = TITLE_GLYPHS[char];
    if (!glyph) {
      cursor += 6;
      continue;
    }
    glyph.forEach((row, rowIndex) => {
      [...row].forEach((bit, colIndex) => {
        if (bit === "1") fill(ctx, cursor + colIndex, y + rowIndex, 1, 1, color);
      });
    });
    cursor += 6;
  }
}

function drawTitle(ctx) {
  drawPixelWord(ctx, "BEAVERBUILD", 0, 0, "#000000");
  fill(ctx, 0, 8, 65, 1, "#000000");
}

function drawCloud(ctx) {
  const white = "#f7fbff";
  const blue1 = "#bfdcf7";
  const blue2 = "#8fc1f0";

  fill(ctx, 6, 3, 8, 5, white);
  fill(ctx, 11, 0, 7, 6, white);
  fill(ctx, 17, 4, 8, 4, white);
  fill(ctx, 3, 6, 22, 4, white);

  fill(ctx, 7, 4, 6, 3, blue1);
  fill(ctx, 12, 1, 5, 4, blue1);
  fill(ctx, 18, 5, 5, 2, blue1);
  fill(ctx, 4, 7, 19, 2, blue1);

  fill(ctx, 6, 7, 4, 2, blue2);
  fill(ctx, 13, 5, 4, 2, blue2);
  fill(ctx, 19, 7, 3, 1, blue2);
}

export default function IntroScreen({ onStart }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "2" || e.key === "Enter" || e.key === " " || e.key === "Tab") {
        e.preventDefault();
        onStart();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onStart]);

  return (
    <div style={styles.screen}>
      <div style={styles.panel}>
        <PixelCanvas
          width={26}
          height={10}
          scale={9}
          draw={drawCloud}
          style={styles.cloud}
        />

        <PixelCanvas
          width={65}
          height={9}
          scale={9}
          draw={drawTitle}
          style={styles.titleCanvas}
        />

        <div style={styles.content}>
          <p style={styles.subtitle}>
            a short interactive workplace
            <br />
            simulation about decisions that matter
          </p>

          <div style={styles.bodyCopy}>
            <p style={styles.bodyLine}>explore a workplace, meet different characters, and respond</p>
            <p style={styles.bodyLine}>to everyday situations that shape your team's culture, your</p>
            <p style={styles.bodyLine}>impact on people, and delaware's long-term future-readiness.</p>
            <p style={styles.bodyLine}>each choice reveals how values are understood — and lived —</p>
            <p style={styles.bodyLine}>inside real organisations.</p>
          </div>

          <div style={styles.noticeWrap}>
            <div style={styles.noticeLine} />
            <div style={styles.noticeText}>your answers are kept anonymous</div>
          </div>

          <button type="button" style={styles.playButton} onClick={onStart}>
            PLAY
          </button>
        </div>
      </div>

      <PixelCanvas
        width={16}
        height={17}
        scale={9}
        draw={(ctx) => drawTree(ctx, 0, 0, "pine")}
        style={styles.tree}
      />
    </div>
  );
}

const styles = {
  screen: {
    height: "100vh",
    background: "#a3b787",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    position: "relative",
    overflow: "hidden",
  },
  panel: {
    position: "relative",
    width: "min(1340px, calc(100vw - 64px))",
    height: "min(680px, calc(100vh - 36px))",
    background: "#e8ecd7",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  cloud: {
    position: "absolute",
    right: -16,
    top: -10,
  },
  titleCanvas: {
    position: "absolute",
    top: "clamp(24px, 6vh, 48px)",
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(585px, 76vw)",
    height: "auto",
  },
  content: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(60px, 10vh, 96px) 16px 14px",
    boxSizing: "border-box",
    color: "#000000",
  },
  subtitle: {
    margin: "0 0 clamp(10px, 2vh, 18px)",
    textAlign: "center",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(15px, 1.7vw, 26px)",
    lineHeight: 1.1,
    fontWeight: 900,
    letterSpacing: 0,
  },
  bodyCopy: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
    marginBottom: "clamp(10px, 2vh, 18px)",
  },
  bodyLine: {
    margin: 0,
    textAlign: "center",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(14px, 1.7vw, 26px)",
    lineHeight: 1.25,
    fontWeight: 900,
    letterSpacing: 0,
  },
  noticeWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    marginBottom: "clamp(8px, 1.8vh, 16px)",
  },
  noticeLine: {
    width: "min(540px, 52vw)",
    borderTop: "4px solid #000000",
  },
  noticeText: {
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(13px, 1.4vw, 22px)",
    fontWeight: 900,
    letterSpacing: 0,
  },
  playButton: {
    marginTop: 2,
    padding: "clamp(12px, 2vh, 18px) clamp(30px, 5vw, 52px)",
    background: "#f8efe7",
    color: "#000000",
    border: "8px solid #000000",
    outline: "8px solid #ffffff",
    boxShadow: "12px 12px 0 rgba(227, 200, 186, 0.9)",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(34px, 4.4vw, 72px)",
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: 0,
    cursor: "pointer",
  },
  tree: {
    position: "absolute",
    left: 22,
    bottom: 12,
  },
};
