// Canvas component: owns the canvas element and the RAF draw loop.
// Receives all render-relevant state as props so the draw loop is
// always working with current values.

import React, { useEffect, useRef, useState, useCallback } from "react";
import { VIEW_COLS, VIEW_ROWS, TILE, SCALE } from "../constants/game";
import { SCENES } from "../data/scenes";
import { owlHouseGuide } from "../data/owlHouseMap";
import { drawScene } from "../renderer/drawScene";
import DialogOverlay from "./DialogOverlay";
import MiniMap from "./MiniMap";
import ResultsOverlay from "./ResultsOverlay";
import CouncilMeeting from "./CouncilMeeting";
import LearningHouse from "./LearningHouse";

export default function GameCanvas({
  scene,
  player,
  townNpcs,
  officeNpcs,
  playerRef,
  npcRefs,      // { town: Ref, office: Ref }
  quest,
  nearbyTarget,
  objectiveTarget,
  banner,
  dialog,
  reportOpen,
  resultsReport,
  councilOpen,
  learningHouseOpen,
  onChoice,
  onAdvance,
  onSubmitReflection,
  onCloseResults,
  onOpenResults,
  onCloseCouncil,
  onOpenLearningHouse,
  onCloseLearningHouse,
}) {
  const canvasRef      = useRef(null);
  const viewportWidth  = VIEW_COLS * TILE;
  const viewportHeight = VIEW_ROWS * TILE;
  const [displayScale, setDisplayScale] = useState(SCALE);
  const [showTutorial, setShowTutorial] = useState(true);
  const npcLabels = getNpcLabels({ scene, player, townNpcs, officeNpcs, displayScale, viewportWidth });

  const dismissTutorial = useCallback(() => setShowTutorial(false), []);

  useEffect(() => {
    if (!showTutorial) return;
    function onKey() { setShowTutorial(false); }
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [showTutorial]);

  useEffect(() => {
    function updateScale() {
      const widthScale = (window.innerWidth - 40) / viewportWidth;
      const heightScale = (window.innerHeight - 150) / viewportHeight;
      const nextScale = Math.max(1.5, Math.min(SCALE, widthScale, heightScale));
      setDisplayScale(nextScale);
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [viewportHeight, viewportWidth]);

  // The draw loop restarts whenever these state values change so the RAF
  // closure always captures their latest versions.
  // playerRef / npcRefs are mutable refs — read fresh on every frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    function draw() {
      drawScene(ctx, {
        scene,
        player:     playerRef.current,
        townNpcs:   npcRefs.town.current,
        officeNpcs: npcRefs.office.current,
        nearbyTarget,
        objectiveTarget,
        viewportWidth,
        viewportHeight,
      });
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [scene, nearbyTarget, objectiveTarget]); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <div style={styles.stageCard}>
      <div style={styles.canvasShell}>
        <div style={styles.canvasInnerFrame}>
          <canvas
            ref={canvasRef}
            width={viewportWidth}
            height={viewportHeight}
            style={{
              width: viewportWidth * displayScale,
              height: viewportHeight * displayScale,
              imageRendering: "auto",
              display: "block",
            }}
          />
          {banner && (
            <div style={styles.objectiveBanner}>
              <div style={styles.bannerTitle}>{banner.title}</div>
              <div style={styles.bannerText}>{banner.message}</div>
            </div>
          )}
          <div style={styles.labelLayer}>
            {npcLabels.map((label) => (
              <div
                key={`${label.name}-${label.left}-${label.top}`}
                style={{
                  ...styles.npcLabel,
                  left: label.left,
                  top: label.top,
                }}
              >
                {label.name}
              </div>
            ))}
          </div>
          {scene !== "owlhouse" && (
            <MiniMap
              scene={scene}
              player={playerRef.current}
              objectiveTarget={objectiveTarget}
            />
          )}
          {showTutorial && (
            <div style={styles.tutorialOverlay} onClick={dismissTutorial}>
              <div style={styles.tutorialCard}>
                <div style={styles.tutorialTitle}>how to play</div>
                <div style={styles.tutorialGrid}>
                  <span style={styles.tutorialKey}>↑ ↓ ← →</span>
                  <span style={styles.tutorialDesc}>move around (or W A S D)</span>
                  <span style={styles.tutorialKey}>walk near an NPC</span>
                  <span style={styles.tutorialDesc}>starts conversation automatically</span>
                  <span style={styles.tutorialKey}>Space / Enter</span>
                  <span style={styles.tutorialDesc}>continue dialogue</span>
                  <span style={styles.tutorialKey}>1 · 2 · 3 · 4</span>
                  <span style={styles.tutorialDesc}>choose an answer (or click)</span>
                  <span style={styles.tutorialKey}>Space (while moving)</span>
                  <span style={styles.tutorialDesc}>flash current objective</span>
                </div>
                <div style={styles.tutorialDismiss}>press any key or click to start</div>
              </div>
            </div>
          )}
          <DialogOverlay
            dialog={dialog}
            onChoice={onChoice}
            onAdvance={onAdvance}
            onSubmitReflection={onSubmitReflection}
          />
          {councilOpen && !reportOpen && (
            <CouncilMeeting
              quest={quest}
              onClose={onCloseCouncil}
            />
          )}
          {learningHouseOpen && !councilOpen && !reportOpen && (
            <LearningHouse
              quest={quest}
              onClose={onCloseLearningHouse}
            />
          )}
          {reportOpen && (
            <ResultsOverlay
              report={resultsReport}
              onClose={onCloseResults}
            />
          )}
          {scene === "owlhouse" && !learningHouseOpen && !councilOpen && !reportOpen && (
            <button type="button" style={styles.learningButton} onClick={onOpenLearningHouse}>
              talk to olive
            </button>
          )}
          {!reportOpen && quest?.stage === "complete" && (
            <button type="button" style={styles.reportButton} onClick={onOpenResults}>
              view report
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

const styles = {
  stageCard: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 12,
    borderRadius: 16,
    background: "rgba(250, 248, 244, 0.99)",
    border: "1.5px solid rgba(95, 112, 86, 0.2)",
    boxShadow:
      "0 16px 40px rgba(38, 54, 42, 0.14), 0 2px 8px rgba(38, 54, 42, 0.06)",
  },
  canvasShell: {
    padding: 7,
    borderRadius: 11,
    background: "#c0ccbc",
    border: "1px solid rgba(72, 92, 68, 0.24)",
    boxShadow: "inset 0 2px 5px rgba(0,0,0,0.1)",
  },
  canvasInnerFrame: {
    position: "relative",
    padding: 5,
    borderRadius: 7,
    background: "linear-gradient(180deg, #4c6852 0%, #3a5240 100%)",
    boxShadow:
      "inset 0 2px 0 rgba(255,255,255,0.16), inset 0 -2px 0 rgba(0,0,0,0.24), 0 3px 10px rgba(0,0,0,0.2)",
  },
  objectiveBanner: {
    position: "absolute",
    top: 8,
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(680px, calc(100% - 32px))",
    padding: "10px 20px",
    borderRadius: 12,
    background: "rgba(253, 250, 243, 0.96)",
    border: "1px solid rgba(110, 138, 88, 0.3)",
    boxShadow: "0 8px 20px rgba(38, 54, 42, 0.18)",
    backdropFilter: "blur(8px)",
    zIndex: 20,
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column",
    gap: 1,
    alignItems: "center",
  },
  labelLayer: {
    position: "absolute",
    top: 5,
    left: 5,
    width: "calc(100% - 10px)",
    height: "calc(100% - 10px)",
    zIndex: 18,
    pointerEvents: "none",
  },
  npcLabel: {
    position: "absolute",
    fontSize: 13,
    fontWeight: 800,
    lineHeight: 1,
    color: "#d8e8b7",
    fontFamily: '"Avenir Next", "Trebuchet MS", system-ui, sans-serif',
    textShadow: "0 1px 2px rgba(20, 28, 23, 0.95), 0 0 5px rgba(20, 28, 23, 0.5)",
    transform: "translateX(-50%)",
    whiteSpace: "nowrap",
  },
  bannerTitle: {
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#7a6e56",
    fontWeight: 700,
  },
  bannerText: {
    textAlign: "center",
    fontSize: 14,
    color: "#37463c",
    lineHeight: 1.4,
    fontWeight: 500,
  },
  reportButton: {
    position: "absolute",
    right: 14,
    bottom: 14,
    zIndex: 25,
    border: "none",
    borderRadius: 999,
    padding: "10px 14px",
    background: "rgba(248, 244, 235, 0.96)",
    color: "#33453b",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0.2,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(38, 54, 42, 0.2)",
  },
  learningButton: {
    position: "absolute",
    right: 14,
    bottom: 14,
    zIndex: 25,
    border: "none",
    borderRadius: 999,
    padding: "11px 16px",
    background: "rgba(230, 241, 208, 0.96)",
    color: "#304023",
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 0.2,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(38, 54, 42, 0.2)",
  },
  tutorialOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(8, 14, 10, 0.82)",
    backdropFilter: "blur(3px)",
    cursor: "pointer",
    fontFamily: '"Courier New", "Lucida Console", monospace',
  },
  tutorialCard: {
    width: "min(420px, calc(100% - 32px))",
    background: "rgba(14, 22, 16, 0.98)",
    border: "2px solid rgba(122, 176, 104, 0.6)",
    borderRadius: 10,
    padding: "22px 24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  },
  tutorialTitle: {
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    color: "#7ab068",
    textAlign: "center",
  },
  tutorialGrid: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: "10px 16px",
    alignItems: "start",
  },
  tutorialKey: {
    fontSize: 12,
    fontWeight: 800,
    color: "#ddeedd",
    background: "rgba(122,176,104,0.15)",
    border: "1px solid rgba(122,176,104,0.35)",
    borderRadius: 5,
    padding: "4px 8px",
    whiteSpace: "nowrap",
    lineHeight: 1.4,
  },
  tutorialDesc: {
    fontSize: 13,
    color: "rgba(190, 220, 185, 0.85)",
    lineHeight: 1.5,
    paddingTop: 4,
  },
  tutorialDismiss: {
    textAlign: "center",
    fontSize: 11,
    color: "rgba(140, 170, 135, 0.6)",
    letterSpacing: 0.5,
    marginTop: 4,
  },
};

function getNpcLabels({ scene, player, townNpcs, officeNpcs, displayScale, viewportWidth }) {
  if (!player) return [];

  const sceneData = SCENES[scene];
  if (!sceneData) return [];

  const camX = Math.max(0, Math.min(player.x - Math.floor(VIEW_COLS / 2), Math.max(0, sceneData.w - VIEW_COLS)));
  const camY = Math.max(0, Math.min(player.y - Math.floor(VIEW_ROWS / 2), Math.max(0, sceneData.h - VIEW_ROWS)));

  const npcs = scene === "town"
    ? townNpcs
    : scene === "office"
      ? officeNpcs
      : [owlHouseGuide];

  return (npcs || [])
    .filter((npc) => npc?.name)
    .map((npc) => {
      const screenX = (npc.x - camX) * TILE;
      const screenY = (npc.y - camY) * TILE;
      return {
        name: npc.name.split(" ")[0],
        left: (screenX + 8) * displayScale,
        top: Math.max(2, (screenY - 11) * displayScale),
      };
    })
    .filter((label) => label.left >= -40 && label.left <= viewportWidth * displayScale + 40);
}
