

import React, { useEffect, useRef, useState, useCallback } from "react";
import { VIEW_COLS, VIEW_ROWS, TILE, SCALE } from "../constants/game";
import { QUEST_STAGES } from "../data/npcs";
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
  npcRefs,
  quest,
  nearbyTarget,
  objectiveTarget,
  status,
  banner,
  dialog,
  interactionLabel,
  reportOpen,
  resultsReport,
  councilOpen,
  learningHouseOpen,
  onChoice,
  onAdvance,
  onInteract,
  onMove,
  onSkipToObjective,
  onSubmitReflection,
  onCloseResults,
  onOpenResults,
  onCloseCouncil,
  onOpenLearningHouse,
  onCloseLearningHouse,
  onLeaveGame,
}) {
  const canvasRef      = useRef(null);
  const viewportWidth  = VIEW_COLS * TILE;
  const viewportHeight = VIEW_ROWS * TILE;
  const [displayScale, setDisplayScale] = useState(SCALE);
  const [viewport, setViewport] = useState({ width: 1024, height: 768 });
  const [showTutorial, setShowTutorial] = useState(true);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const isTight = viewport.width < 820 || viewport.height < 700 || displayScale < 2.25;
  const npcLabels = getNpcLabels({ scene, player, townNpcs, officeNpcs, displayScale, viewportWidth });
  const chapterProgress = getChapterProgress(quest);

  const dismissTutorial = useCallback(() => setShowTutorial(false), []);

  useEffect(() => {
    if (!showTutorial) return;
    function onKey() { setShowTutorial(false); }
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [showTutorial]);

  useEffect(() => {
    function updateScale() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const horizontalChrome = width < 820 ? 56 : 88;
      const verticalChrome = height < 700 ? 236 : 274;
      const widthScale = (width - horizontalChrome) / viewportWidth;
      const heightScale = (height - verticalChrome) / viewportHeight;
      const nextScale = Math.max(0.65, Math.min(SCALE, widthScale, heightScale));
      setViewport({ width, height });
      setDisplayScale(nextScale);
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [viewportHeight, viewportWidth]);

  // The draw loop restarts whenever these state values change so the RAF
  // closure always captures their latest versions.
  // playerRef / npcRefs are mutable refs, read fresh on every frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    let raf = 0;
    function draw() {
      drawScene(ctx, {
        scene,
        player:     playerRef.current || player,
        townNpcs:   npcRefs.town.current || townNpcs,
        officeNpcs: npcRefs.office.current || officeNpcs,
        nearbyTarget,
        objectiveTarget,
        viewportWidth,
        viewportHeight,
      });
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [scene, nearbyTarget, objectiveTarget, player, townNpcs, officeNpcs]); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <div style={styles.stageCard}>
      <div style={{ ...styles.topHud, ...(isTight ? styles.topHudTight : null) }}>
        <div>
          <div style={{ ...styles.gameTitle, ...(isTight ? styles.gameTitleTight : null) }}>PIXEL GAP</div>
          <div style={{ ...styles.sceneLine, ...(isTight ? styles.sceneLineTight : null) }}>{scene === "office" ? "DELAWARE BUILDING" : scene === "owlhouse" ? "LEARNING HOUSE" : "CAMPUS ROUTE"}</div>
        </div>
        <div style={{ ...styles.objectivePanel, ...(isTight ? styles.objectivePanelTight : null) }}>
          <span style={styles.objectiveTag}>OBJECTIVE</span>
          <span style={{ ...styles.objectiveText, ...(isTight ? styles.objectiveTextTight : null) }}>{status}</span>
        </div>
        <div style={{ ...styles.hudActions, ...(isTight ? styles.hudActionsTight : null) }}>
          <button type="button" style={{ ...styles.pixelButton, ...(isTight ? styles.pixelButtonTight : null) }} onClick={onSkipToObjective}>
            warp
          </button>
          <button
            type="button"
            style={{
              ...styles.pixelButton,
              ...(isTight ? styles.pixelButtonTight : null),
              ...(interactionLabel ? styles.pixelButtonActive : styles.pixelButtonDisabled),
            }}
            onClick={onInteract}
            disabled={!interactionLabel}
          >
            talk
          </button>
          <button
            type="button"
            style={{ ...styles.pixelButton, ...styles.leavePixelBtn, ...(isTight ? styles.pixelButtonTight : null) }}
            onClick={() => setShowLeaveConfirm(true)}
          >
            leave
          </button>
        </div>
      </div>

      <div style={{ ...styles.progressRail, ...(isTight ? styles.progressRailTight : null) }} aria-label="journey progress">
        {chapterProgress.map((chapter) => (
          <div
            key={chapter.id}
            style={{
              ...styles.progressStep,
              ...(chapter.state === "done" ? styles.progressStepDone : null),
              ...(chapter.state === "current" ? styles.progressStepCurrent : null),
              ...(isTight ? styles.progressStepTight : null),
            }}
            title={chapter.label}
          >
            <span style={{ ...styles.progressNumber, ...(isTight ? styles.progressNumberTight : null) }}>{chapter.number}</span>
            {!isTight && <span style={styles.progressLabel}>{chapter.label}</span>}
          </div>
        ))}
      </div>

      <div style={styles.canvasShell}>
        <div style={styles.canvasInnerFrame}>
          <canvas
            ref={canvasRef}
            width={viewportWidth}
            height={viewportHeight}
            style={{
              width: viewportWidth * displayScale,
              height: viewportHeight * displayScale,
              imageRendering: "pixelated",
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
              player={player}
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
                  <span style={styles.tutorialKey}>E / Space</span>
                  <span style={styles.tutorialDesc}>talk when the prompt is visible</span>
                  <span style={styles.tutorialKey}>Enter / Tab</span>
                  <span style={styles.tutorialDesc}>continue dialogue</span>
                  <span style={styles.tutorialKey}>1 · 2 · 3 · 4 · 5</span>
                  <span style={styles.tutorialDesc}>choose an answer (or click)</span>
                  <span style={styles.tutorialKey}>warp</span>
                  <span style={styles.tutorialDesc}>jump near the current objective</span>
                </div>
                <div style={styles.tutorialDismiss}>press any key or click to start</div>
              </div>
            </div>
          )}
          <DialogOverlay
            key={dialog ? `${dialog.npcId || "dialog"}-${dialog.stepId || ""}-${dialog.phase || ""}-${dialog.stepIndex ?? 0}` : "no-dialog"}
            dialog={dialog}
            onChoice={onChoice}
            onAdvance={onAdvance}
            onSubmitReflection={onSubmitReflection}
          />
          {showLeaveConfirm && (
            <div style={styles.leaveOverlay}>
              <div style={styles.leaveCard}>
                <div style={styles.leaveTitle}>leave the game?</div>
                <p style={styles.leaveBody}>your answers so far will be saved and submitted.</p>
                <div style={styles.leaveActions}>
                  <button
                    type="button"
                    style={styles.leaveConfirmBtn}
                    onClick={() => { setShowLeaveConfirm(false); onLeaveGame(); }}
                  >
                    yes, save &amp; leave
                  </button>
                  <button
                    type="button"
                    style={styles.leaveCancelBtn}
                    onClick={() => setShowLeaveConfirm(false)}
                  >
                    cancel
                  </button>
                </div>
              </div>
            </div>
          )}
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
          {!dialog && !reportOpen && !councilOpen && !learningHouseOpen && (
            <div style={{ ...styles.dpad, ...(isTight ? styles.dpadTight : null) }} aria-label="movement controls">
              <button type="button" style={{ ...styles.dpadBtn, ...(isTight ? styles.dpadBtnTight : null), gridColumn: 2 }} onClick={() => onMove("up")}>▲</button>
              <button type="button" style={{ ...styles.dpadBtn, ...(isTight ? styles.dpadBtnTight : null), gridColumn: 1, gridRow: 2 }} onClick={() => onMove("left")}>◀</button>
              <button type="button" style={{ ...styles.dpadBtn, ...(isTight ? styles.dpadBtnTight : null), gridColumn: 2, gridRow: 2 }} onClick={() => onInteract()}>E</button>
              <button type="button" style={{ ...styles.dpadBtn, ...(isTight ? styles.dpadBtnTight : null), gridColumn: 3, gridRow: 2 }} onClick={() => onMove("right")}>▶</button>
              <button type="button" style={{ ...styles.dpadBtn, ...(isTight ? styles.dpadBtnTight : null), gridColumn: 2, gridRow: 3 }} onClick={() => onMove("down")}>▼</button>
            </div>
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
    padding: 10,
    boxSizing: "border-box",
    maxWidth: "100vw",
    maxHeight: "100vh",
    borderRadius: 0,
    background: "#eadfbc",
    border: "4px solid #26341f",
    boxShadow: "0 10px 0 #1a2616, 0 20px 0 rgba(18, 26, 16, 0.28)",
    fontFamily: '"Courier New", "Lucida Console", monospace',
  },
  topHud: {
    display: "grid",
    gridTemplateColumns: "150px minmax(0, 1fr) auto",
    gap: 10,
    alignItems: "stretch",
    background: "#2e3e28",
    border: "4px solid #172012",
    padding: 8,
    minHeight: 86,
    boxSizing: "border-box",
  },
  topHudTight: {
    gridTemplateColumns: "108px minmax(0, 1fr) auto",
    gap: 6,
    padding: 5,
    borderWidth: 3,
    minHeight: 63,
  },
  progressRail: {
    display: "grid",
    gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    gap: 5,
    background: "#26341f",
    border: "3px solid #172012",
    padding: 5,
  },
  progressRailTight: {
    gap: 3,
    padding: 3,
    borderWidth: 2,
  },
  progressStep: {
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    padding: "4px 5px",
    border: "2px solid #11180e",
    background: "#758066",
    color: "#2d3428",
    fontSize: 9,
    fontWeight: 900,
    textTransform: "uppercase",
    overflow: "hidden",
  },
  progressStepTight: {
    padding: 2,
    minHeight: 16,
    borderWidth: 1,
  },
  progressStepDone: {
    background: "#9ecf8a",
    color: "#11180e",
  },
  progressStepCurrent: {
    background: "#f0c94a",
    color: "#11180e",
  },
  progressNumber: {
    flexShrink: 0,
    width: 14,
    height: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#11180e",
    color: "#f7f1df",
    fontSize: 9,
    lineHeight: 1,
  },
  progressNumberTight: {
    width: 13,
    height: 13,
    fontSize: 8,
  },
  progressLabel: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  gameTitle: {
    color: "#f0c94a",
    fontSize: 22,
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: 1,
  },
  gameTitleTight: {
    fontSize: 16,
  },
  sceneLine: {
    marginTop: 5,
    color: "#9ecf8a",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1,
  },
  sceneLineTight: {
    fontSize: 8,
    marginTop: 3,
  },
  objectivePanel: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "#e8ecd7",
    border: "3px solid #10180e",
    padding: "6px 10px",
    minWidth: 0,
  },
  objectivePanelTight: {
    padding: "4px 6px",
    borderWidth: 2,
  },
  objectiveTag: {
    color: "#5d6b48",
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 1.4,
  },
  objectiveText: {
    color: "#11180e",
    fontSize: 12,
    fontWeight: 900,
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  objectiveTextTight: {
    fontSize: 10,
    lineHeight: 1.2,
  },
  hudActions: {
    display: "flex",
    gap: 8,
    alignItems: "stretch",
  },
  hudActionsTight: {
    gap: 5,
  },
  pixelButton: {
    border: "3px solid #10180e",
    borderRadius: 0,
    background: "#f0c94a",
    color: "#11180e",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 12,
    fontWeight: 900,
    padding: "7px 10px",
    cursor: "pointer",
    textTransform: "uppercase",
    boxShadow: "0 3px 0 #7c6020",
    minWidth: 72,
  },
  pixelButtonTight: {
    minWidth: 48,
    padding: "5px 6px",
    fontSize: 10,
    borderWidth: 2,
    boxShadow: "0 2px 0 #7c6020",
  },
  pixelButtonActive: {
    background: "#9ecf8a",
    boxShadow: "0 3px 0 #4c723d",
  },
  pixelButtonDisabled: {
    background: "#7f866f",
    color: "#3e4738",
    cursor: "default",
    boxShadow: "none",
  },
  canvasShell: {
    padding: 6,
    borderRadius: 0,
    background: "#4f6648",
    border: "4px solid #172012",
    boxShadow: "inset 0 0 0 3px #8ca36f",
  },
  canvasInnerFrame: {
    position: "relative",
    padding: 5,
    borderRadius: 0,
    background: "#26341f",
    boxShadow: "none",
  },
  objectiveBanner: {
    position: "absolute",
    top: 8,
    left: "50%",
    transform: "translateX(-50%)",
    width: "min(680px, calc(100% - 32px))",
    padding: "10px 20px",
    borderRadius: 0,
    background: "#f7f1df",
    border: "3px solid #172012",
    boxShadow: "4px 4px 0 rgba(0,0,0,0.35)",
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
    fontFamily: '"Courier New", "Lucida Console", monospace',
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
    border: "3px solid #10180e",
    borderRadius: 0,
    padding: "10px 14px",
    background: "#f0c94a",
    color: "#11180e",
    fontSize: 13,
    fontWeight: 900,
    fontFamily: '"Courier New", "Lucida Console", monospace',
    letterSpacing: 0.2,
    cursor: "pointer",
    boxShadow: "0 3px 0 #7c6020",
  },
  learningButton: {
    position: "absolute",
    right: 14,
    bottom: 14,
    zIndex: 25,
    border: "3px solid #10180e",
    borderRadius: 0,
    padding: "11px 16px",
    background: "#9ecf8a",
    color: "#11180e",
    fontSize: 13,
    fontWeight: 900,
    fontFamily: '"Courier New", "Lucida Console", monospace',
    letterSpacing: 0.2,
    cursor: "pointer",
    boxShadow: "0 3px 0 #4c723d",
  },
  dpad: {
    position: "absolute",
    left: 12,
    bottom: 12,
    zIndex: 26,
    display: "grid",
    gridTemplateColumns: "32px 32px 32px",
    gridTemplateRows: "32px 32px 32px",
    gap: 4,
    padding: 5,
    background: "rgba(14, 22, 16, 0.78)",
    border: "3px solid #172012",
  },
  dpadTight: {
    left: 8,
    bottom: 8,
    gridTemplateColumns: "26px 26px 26px",
    gridTemplateRows: "26px 26px 26px",
    gap: 3,
    padding: 4,
    borderWidth: 2,
  },
  dpadBtn: {
    width: 32,
    height: 32,
    border: "3px solid #10180e",
    borderRadius: 0,
    background: "#f0c94a",
    color: "#11180e",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 13,
    fontWeight: 900,
    lineHeight: 1,
    padding: 0,
    cursor: "pointer",
    boxShadow: "0 2px 0 #7c6020",
  },
  dpadBtnTight: {
    width: 26,
    height: 26,
    borderWidth: 2,
    fontSize: 11,
    boxShadow: "0 1px 0 #7c6020",
  },
  tutorialOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(8, 14, 10, 0.82)",
    backdropFilter: "none",
    cursor: "pointer",
    fontFamily: '"Courier New", "Lucida Console", monospace',
  },
  tutorialCard: {
    width: "min(420px, calc(100% - 32px))",
    background: "rgba(14, 22, 16, 0.98)",
    border: "2px solid rgba(122, 176, 104, 0.6)",
    borderRadius: 0,
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
    borderRadius: 0,
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
  leavePixelBtn: {
    background: "#c4756a",
    color: "#fff8f5",
    boxShadow: "0 3px 0 #7a3a30",
    border: "3px solid #6b2f26",
  },
  leaveOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 300,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(8, 14, 10, 0.82)",
    fontFamily: '"Courier New", "Lucida Console", monospace',
  },
  leaveCard: {
    width: "min(380px, calc(100% - 32px))",
    background: "rgba(14, 22, 16, 0.98)",
    border: "2px solid rgba(196, 117, 106, 0.6)",
    padding: "22px 24px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  },
  leaveTitle: {
    fontSize: 14,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: "#f0c94a",
    textAlign: "center",
  },
  leaveBody: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.45,
    color: "rgba(200, 220, 195, 0.85)",
    textAlign: "center",
  },
  leaveActions: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  leaveConfirmBtn: {
    padding: "9px 16px",
    background: "#c4756a",
    border: "3px solid #6b2f26",
    color: "#fff8f5",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    cursor: "pointer",
    boxShadow: "0 3px 0 #7a3a30",
  },
  leaveCancelBtn: {
    padding: "9px 16px",
    background: "rgba(255,255,255,0.06)",
    border: "2px solid rgba(180,210,175,0.3)",
    color: "rgba(180,210,175,0.8)",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    cursor: "pointer",
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

function getChapterProgress(quest) {
  const stage = quest?.stage;
  const visited = quest?.visited || [];
  const townDone = ["frank", "otis"].every((id) => visited.includes(id));
  const officeDone = ["suzy", "hazel"].every((id) => visited.includes(id));

  const chapters = [
    {
      id: "start",
      number: 1,
      label: "olive",
      stages: [QUEST_STAGES.MEET_OLIVE, QUEST_STAGES.BASELINE_DILEMMA],
      done: ![QUEST_STAGES.MEET_OLIVE, QUEST_STAGES.BASELINE_DILEMMA].includes(stage),
    },
    {
      id: "outside",
      number: 2,
      label: "outside",
      stages: [QUEST_STAGES.TOWN_PILLARS],
      done: townDone || ![QUEST_STAGES.MEET_OLIVE, QUEST_STAGES.BASELINE_DILEMMA, QUEST_STAGES.TOWN_PILLARS].includes(stage),
    },
    {
      id: "office",
      number: 3,
      label: "office",
      stages: [QUEST_STAGES.GO_TO_OFFICE, QUEST_STAGES.OFFICE_PILLARS],
      done: officeDone || [QUEST_STAGES.RETURN_TO_OLIVE, QUEST_STAGES.POST_GAME, QUEST_STAGES.COMPLETE].includes(stage),
    },
    {
      id: "council",
      number: 4,
      label: "council",
      stages: [QUEST_STAGES.RETURN_TO_OLIVE],
      done: [QUEST_STAGES.POST_GAME, QUEST_STAGES.COMPLETE].includes(stage),
    },
    {
      id: "rowan",
      number: 5,
      label: "rowan",
      stages: [QUEST_STAGES.POST_GAME],
      done: stage === QUEST_STAGES.COMPLETE,
    },
    {
      id: "report",
      number: 6,
      label: "report",
      stages: [QUEST_STAGES.COMPLETE],
      done: false,
    },
  ];

  return chapters.map((chapter) => ({
    ...chapter,
    state: chapter.done ? "done" : chapter.stages.includes(stage) ? "current" : "upcoming",
  }));
}
