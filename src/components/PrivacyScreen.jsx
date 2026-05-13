import React, { useEffect, useRef, useState } from "react";
import { drawTree } from "../renderer/props";
import { drawHeroBeaverSprite } from "../renderer/beaverSprite";

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

function PixelCanvas({ width, height, scale, draw, style, button = false, onClick, label, buttonStyle }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    draw(ctx);
  }, [draw, height, width]);

  const canvas = (
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

  if (!button) return canvas;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ ...styles.beaverButton, ...buttonStyle }}
    >
      {canvas}
    </button>
  );
}

function fill(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawStartBeaver(ctx) {
  drawHeroBeaverSprite(ctx, 0, 0);
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
  const w = "#f7fbff";
  const c1 = "#bfdcf7";
  const c2 = "#8fc1f0";

  fill(ctx, 6, 3, 8, 5, w);
  fill(ctx, 11, 0, 7, 6, w);
  fill(ctx, 17, 4, 8, 4, w);
  fill(ctx, 3, 6, 22, 4, w);

  fill(ctx, 7, 4, 6, 3, c1);
  fill(ctx, 12, 1, 5, 4, c1);
  fill(ctx, 18, 5, 5, 2, c1);
  fill(ctx, 4, 7, 19, 2, c1);

  fill(ctx, 6, 7, 4, 2, c2);
  fill(ctx, 13, 5, 4, 2, c2);
  fill(ctx, 19, 7, 3, 1, c2);
}

function drawCursor(ctx) {
  const o = "#101010";
  const w = "#f7f7f7";

  fill(ctx, 4, 0, 2, 7, o);
  fill(ctx, 2, 2, 2, 7, o);
  fill(ctx, 6, 2, 2, 6, o);
  fill(ctx, 8, 4, 2, 5, o);
  fill(ctx, 3, 8, 6, 2, o);
  fill(ctx, 5, 10, 3, 2, o);
  fill(ctx, 6, 12, 2, 2, o);

  fill(ctx, 4, 1, 1, 5, w);
  fill(ctx, 3, 3, 1, 5, w);
  fill(ctx, 6, 3, 1, 4, w);
  fill(ctx, 8, 5, 1, 3, w);
  fill(ctx, 4, 8, 4, 1, w);
  fill(ctx, 6, 10, 1, 2, w);
}

export default function PrivacyScreen({ canStart = false, onConsent }) {
  const viewport = useViewportSize();
  const isPhonePortrait = viewport.width <= 740 && viewport.height > viewport.width;

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "2" || e.key === "Enter" || e.key === " " || e.key === "Tab") {
        e.preventDefault();
        if (canStart) onConsent();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canStart, onConsent]);

  return (
    <div style={{ ...styles.screen, ...(isPhonePortrait ? styles.screenPhone : null) }}>
      <div style={{ ...styles.panel, ...(isPhonePortrait ? styles.panelPhone : null) }}>
        <PixelCanvas
          width={26}
          height={10}
          scale={isPhonePortrait ? 6 : 8}
          draw={drawCloud}
          style={{ ...styles.cloud, ...(isPhonePortrait ? styles.cloudPhone : null) }}
        />

        <PixelCanvas
          width={65}
          height={9}
          scale={isPhonePortrait ? 5.6 : 8}
          draw={drawTitle}
          style={{ ...styles.titleCanvas, ...(isPhonePortrait ? styles.titleCanvasPhone : null) }}
        />

        <div style={styles.centerArea}>
          <PixelCanvas
            width={26}
            height={28}
            scale={isPhonePortrait ? 6.8 : 9}
            draw={drawStartBeaver}
            button
            onClick={onConsent}
            label="Start game"
            style={{
              ...styles.beaverCanvas,
              ...(isPhonePortrait ? styles.beaverCanvasPhone : null),
            }}
            buttonStyle={isPhonePortrait ? styles.beaverButtonPhone : null}
          />

          <div style={{ ...styles.startPrompt, ...(isPhonePortrait ? styles.startPromptPhone : null) }}>
            <PixelCanvas
              width={12}
              height={14}
              scale={isPhonePortrait ? 3.1 : 4}
              draw={drawCursor}
              style={{ ...styles.cursor, ...(isPhonePortrait ? styles.cursorPhone : null) }}
            />
            <div style={{ ...styles.startText, ...(isPhonePortrait ? styles.startTextPhone : null) }}>
              {canStart ? (isPhonePortrait ? "Tap to start" : "Press 2 start") : "Read notice first"}
            </div>
          </div>
        </div>
      </div>

      <PixelCanvas
        width={16}
        height={17}
        scale={isPhonePortrait ? 6 : 8}
        draw={(ctx) => drawTree(ctx, 0, 0, "pine")}
        style={{ ...styles.tree, ...(isPhonePortrait ? styles.treePhone : null) }}
      />
    </div>
  );
}

function getViewportSize() {
  if (typeof window === "undefined") return { width: 1024, height: 768 };
  return {
    width: window.innerWidth || 1024,
    height: window.innerHeight || 768,
  };
}

function useViewportSize() {
  const [viewport, setViewport] = useState(getViewportSize);

  useEffect(() => {
    function handleResize() {
      setViewport(getViewportSize());
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return viewport;
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
  screenPhone: {
    height: "100svh",
    padding: 10,
    alignItems: "center",
  },
  panel: {
    position: "relative",
    width: "min(1000px, calc(100vw - 56px))",
    height: "min(520px, calc(100vh - 40px))",
    background: "#e8ecd7",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  panelPhone: {
    width: "min(430px, calc(100vw - 32px))",
    height: "min(620px, calc(100svh - 128px))",
    minHeight: 430,
  },
  titleCanvas: {
    position: "absolute",
    top: "clamp(28px, 7vh, 58px)",
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(520px, 68vw)",
    height: "auto",
  },
  titleCanvasPhone: {
    top: "clamp(28px, 6svh, 52px)",
    width: "min(364px, calc(100% - 42px))",
  },
  cloud: {
    position: "absolute",
    right: -8,
    top: -16,
  },
  cloudPhone: {
    right: -18,
    top: -8,
    opacity: 0.9,
  },
  centerArea: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  beaverButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -10%)",
    background: "transparent",
    border: "none",
    padding: 0,
    margin: 0,
    cursor: "pointer",
  },
  beaverButtonPhone: {
    top: "55%",
    transform: "translate(-50%, -18%)",
  },
  beaverCanvas: {
    filter: "drop-shadow(0 0 0 rgba(0,0,0,0))",
  },
  beaverCanvasPhone: {
    maxWidth: "calc(100vw - 96px)",
    height: "auto",
  },
  startPrompt: {
    position: "absolute",
    left: "clamp(58%, calc(50% + 112px), 74%)",
    top: "clamp(62%, calc(50% + 36px), 76%)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  startPromptPhone: {
    left: "50%",
    top: "calc(55% + 150px)",
    transform: "translateX(-50%)",
    gap: 6,
    maxWidth: "calc(100% - 24px)",
    justifyContent: "center",
  },
  cursor: {
    transform: "rotate(-16deg)",
  },
  cursorPhone: {
    transform: "rotate(-16deg)",
    flexShrink: 0,
  },
  startText: {
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(14px, 2vw, 24px)",
    fontWeight: 900,
    letterSpacing: 0,
    color: "#000000",
    whiteSpace: "nowrap",
  },
  startTextPhone: {
    fontSize: "clamp(15px, 4.3vw, 19px)",
  },
  tree: {
    position: "absolute",
    left: 10,
    bottom: 8,
  },
  treePhone: {
    left: 18,
    bottom: 16,
  },
};
