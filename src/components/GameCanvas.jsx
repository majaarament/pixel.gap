

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
  mobileLandscape = false,
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
  const canvasFrameRef = useRef(null);
  const [viewSize, setViewSize] = useState({ cols: VIEW_COLS, rows: VIEW_ROWS });
  const viewportWidth  = viewSize.cols * TILE;
  const viewportHeight = viewSize.rows * TILE;
  const [displayScale, setDisplayScale] = useState(SCALE);
  const [viewport, setViewport] = useState({ width: 1024, height: 768 });
  const [showTutorial, setShowTutorial] = useState(true);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const layoutFrozen = councilOpen || learningHouseOpen || reportOpen;
  const isPhoneLandscape = mobileLandscape || (viewport.width > viewport.height && viewport.height <= 520 && viewport.width <= 980);
  const isTight = isPhoneLandscape || viewport.width < 820 || viewport.height < 700 || displayScale < 2.25;
  const canvasInset = isPhoneLandscape ? 3 : 5;
  const npcLabels = getNpcLabels({ scene, player, townNpcs, officeNpcs, displayScale, viewportWidth, viewSize });
  const chapterProgress = getChapterProgress(quest);

  const dismissTutorial = useCallback(() => setShowTutorial(false), []);

  useEffect(() => {
    if (!showTutorial) return;
    function onKey() { setShowTutorial(false); }
    window.addEventListener("keydown", onKey, { once: true });
    return () => window.removeEventListener("keydown", onKey);
  }, [showTutorial]);

  useEffect(() => {
    const frame = canvasFrameRef.current;
    if (!frame) return undefined;

    function updateScale(entry) {
      const rect = entry?.contentRect || frame.getBoundingClientRect();
      const availableWidth = Math.max(240, rect.width);
      const availableHeight = Math.max(180, rect.height);
      setViewport((prev) => (
        prev.width === window.innerWidth && prev.height === window.innerHeight
          ? prev
          : { width: window.innerWidth, height: window.innerHeight }
      ));
      if (layoutFrozen) return;
      const nextView = chooseResponsiveViewport({
        availableWidth,
        availableHeight,
        scene,
        mobileLandscape: isPhoneLandscape,
      });
      setViewSize((prev) => (
        prev.cols === nextView.cols && prev.rows === nextView.rows
          ? prev
          : { cols: nextView.cols, rows: nextView.rows }
      ));
      setDisplayScale((prev) => (
        Math.abs(prev - nextView.scale) < 0.005 ? prev : nextView.scale
      ));
    }

    updateScale();
    const observer = new ResizeObserver((entries) => updateScale(entries[0]));
    observer.observe(frame);
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [scene, layoutFrozen, isPhoneLandscape]);

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
        viewportCols: viewSize.cols,
        viewportRows: viewSize.rows,
      });
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [scene, nearbyTarget, objectiveTarget, player, townNpcs, officeNpcs, viewportWidth, viewportHeight, viewSize.cols, viewSize.rows]); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <div style={{ ...styles.stageCard, ...(isPhoneLandscape ? styles.stageCardPhone : null) }}>
      <div style={{ ...styles.topHud, ...(isTight ? styles.topHudTight : null), ...(isPhoneLandscape ? styles.topHudPhone : null) }}>
        <div>
          <div style={{ ...styles.gameTitle, ...(isTight ? styles.gameTitleTight : null), ...(isPhoneLandscape ? styles.gameTitlePhone : null) }}>PIXEL GAP</div>
          <div style={{ ...styles.sceneLine, ...(isTight ? styles.sceneLineTight : null), ...(isPhoneLandscape ? styles.sceneLinePhone : null) }}>{scene === "office" ? "DELAWARE BUILDING" : scene === "owlhouse" ? "LEARNING HOUSE" : "CAMPUS ROUTE"}</div>
        </div>
        <div style={{ ...styles.objectivePanel, ...(isTight ? styles.objectivePanelTight : null), ...(isPhoneLandscape ? styles.objectivePanelPhone : null) }}>
          {!isPhoneLandscape && <span style={styles.objectiveTag}>OBJECTIVE</span>}
          <span style={{ ...styles.objectiveText, ...(isTight ? styles.objectiveTextTight : null), ...(isPhoneLandscape ? styles.objectiveTextPhone : null) }}>{status}</span>
        </div>
        <div style={{ ...styles.hudActions, ...(isTight ? styles.hudActionsTight : null), ...(isPhoneLandscape ? styles.hudActionsPhone : null) }}>
          <button type="button" style={{ ...styles.pixelButton, ...(isTight ? styles.pixelButtonTight : null), ...(isPhoneLandscape ? styles.pixelButtonPhone : null) }} onClick={onSkipToObjective}>
            warp
          </button>
          <button
            type="button"
            style={{
              ...styles.pixelButton,
              ...(isTight ? styles.pixelButtonTight : null),
              ...(isPhoneLandscape ? styles.pixelButtonPhone : null),
              ...(interactionLabel ? styles.pixelButtonActive : styles.pixelButtonDisabled),
            }}
            onClick={onInteract}
            disabled={!interactionLabel}
          >
            talk
          </button>
          <button
            type="button"
            style={{ ...styles.pixelButton, ...styles.leavePixelBtn, ...(isTight ? styles.pixelButtonTight : null), ...(isPhoneLandscape ? styles.pixelButtonPhone : null) }}
            onClick={() => setShowLeaveConfirm(true)}
          >
            leave
          </button>
        </div>
      </div>

      <div style={{ ...styles.progressRail, ...(isTight ? styles.progressRailTight : null), ...(isPhoneLandscape ? styles.progressRailPhone : null) }} aria-label="journey progress">
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

      <div style={{ ...styles.canvasShell, ...(isPhoneLandscape ? styles.canvasShellPhone : null) }}>
        <div ref={canvasFrameRef} style={{ ...styles.canvasInnerFrame, ...(isPhoneLandscape ? styles.canvasInnerFramePhone : null) }}>
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
          <div
            style={{
              ...styles.labelLayer,
              top: canvasInset,
              left: canvasInset,
              width: viewportWidth * displayScale,
              height: viewportHeight * displayScale,
            }}
          >
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
              compact={isPhoneLandscape}
              viewSize={viewSize}
            />
          )}
          {showTutorial && (
            <div style={{ ...styles.tutorialOverlay, ...(isPhoneLandscape ? styles.tutorialOverlayPhone : null) }} onClick={dismissTutorial}>
              <div style={{ ...styles.tutorialCard, ...(isPhoneLandscape ? styles.tutorialCardPhone : null) }}>
                <div style={{ ...styles.tutorialTitle, ...(isPhoneLandscape ? styles.tutorialTitlePhone : null) }}>how to play</div>
                <div style={{ ...styles.tutorialGrid, ...(isPhoneLandscape ? styles.tutorialGridPhone : null) }}>
                  <span style={{ ...styles.tutorialKey, ...(isPhoneLandscape ? styles.tutorialKeyPhone : null) }}>↑ ↓ ← →</span>
                  <span style={{ ...styles.tutorialDesc, ...(isPhoneLandscape ? styles.tutorialDescPhone : null) }}>move around</span>
                  <span style={{ ...styles.tutorialKey, ...(isPhoneLandscape ? styles.tutorialKeyPhone : null) }}>E / Space</span>
                  <span style={{ ...styles.tutorialDesc, ...(isPhoneLandscape ? styles.tutorialDescPhone : null) }}>talk when the prompt is visible</span>
                  <span style={{ ...styles.tutorialKey, ...(isPhoneLandscape ? styles.tutorialKeyPhone : null) }}>Enter / Tab</span>
                  <span style={{ ...styles.tutorialDesc, ...(isPhoneLandscape ? styles.tutorialDescPhone : null) }}>continue dialogue</span>
                  <span style={{ ...styles.tutorialKey, ...(isPhoneLandscape ? styles.tutorialKeyPhone : null) }}>1 · 2 · 3 · 4 · 5</span>
                  <span style={{ ...styles.tutorialDesc, ...(isPhoneLandscape ? styles.tutorialDescPhone : null) }}>choose an answer</span>
                  <span style={{ ...styles.tutorialKey, ...(isPhoneLandscape ? styles.tutorialKeyPhone : null) }}>warp</span>
                  <span style={{ ...styles.tutorialDesc, ...(isPhoneLandscape ? styles.tutorialDescPhone : null) }}>jump near the objective</span>
                </div>
                <div style={{ ...styles.tutorialDismiss, ...(isPhoneLandscape ? styles.tutorialDismissPhone : null) }}>tap to start</div>
              </div>
            </div>
          )}
          <DialogOverlay
            key={dialog ? `${dialog.npcId || "dialog"}-${dialog.stepId || ""}-${dialog.phase || ""}-${dialog.stepIndex ?? 0}` : "no-dialog"}
            compact={isPhoneLandscape}
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
              compact={isPhoneLandscape}
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
            <div style={{ ...styles.dpad, ...(isTight ? styles.dpadTight : null), ...(isPhoneLandscape ? styles.dpadPhone : null) }} aria-label="movement controls">
              <button type="button" style={{ ...styles.dpadBtn, ...(isTight ? styles.dpadBtnTight : null), ...(isPhoneLandscape ? styles.dpadBtnPhone : null), gridColumn: 2 }} onClick={() => onMove("up")}>▲</button>
              <button type="button" style={{ ...styles.dpadBtn, ...(isTight ? styles.dpadBtnTight : null), ...(isPhoneLandscape ? styles.dpadBtnPhone : null), gridColumn: 1, gridRow: 2 }} onClick={() => onMove("left")}>◀</button>
              <button type="button" style={{ ...styles.dpadBtn, ...(isTight ? styles.dpadBtnTight : null), ...(isPhoneLandscape ? styles.dpadBtnPhone : null), gridColumn: 2, gridRow: 2 }} onClick={() => onInteract()}>E</button>
              <button type="button" style={{ ...styles.dpadBtn, ...(isTight ? styles.dpadBtnTight : null), ...(isPhoneLandscape ? styles.dpadBtnPhone : null), gridColumn: 3, gridRow: 2 }} onClick={() => onMove("right")}>▶</button>
              <button type="button" style={{ ...styles.dpadBtn, ...(isTight ? styles.dpadBtnTight : null), ...(isPhoneLandscape ? styles.dpadBtnPhone : null), gridColumn: 2, gridRow: 3 }} onClick={() => onMove("down")}>▼</button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

const styles = {
  stageCard: {
    flex: "1 1 auto",
    width: "100%",
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 10,
    boxSizing: "border-box",
    maxWidth: "none",
    maxHeight: "none",
    borderRadius: 0,
    background: "#eadfbc",
    border: "4px solid #26341f",
    boxShadow: "0 10px 0 #1a2616, 0 20px 0 rgba(18, 26, 16, 0.28)",
    fontFamily: '"Courier New", "Lucida Console", monospace',
  },
  stageCardPhone: {
    gap: 4,
    padding: 4,
    borderWidth: 3,
    boxShadow: "0 4px 0 #1a2616",
  },
  topHud: {
    flexShrink: 0,
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
  topHudPhone: {
    gridTemplateColumns: "76px minmax(0, 1fr) auto",
    gap: 4,
    padding: 4,
    borderWidth: 2,
    minHeight: 46,
  },
  progressRail: {
    flexShrink: 0,
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
  progressRailPhone: {
    gap: 2,
    padding: 2,
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
  gameTitlePhone: {
    fontSize: 13,
    letterSpacing: 0,
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
  sceneLinePhone: {
    fontSize: 7,
    marginTop: 2,
    letterSpacing: 0.4,
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
  objectivePanelPhone: {
    padding: "3px 5px",
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
  objectiveTextPhone: {
    fontSize: 9,
    lineHeight: 1.15,
    WebkitLineClamp: 2,
  },
  hudActions: {
    display: "flex",
    gap: 8,
    alignItems: "stretch",
  },
  hudActionsTight: {
    gap: 5,
  },
  hudActionsPhone: {
    gap: 3,
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
  pixelButtonPhone: {
    minWidth: 42,
    padding: "4px 5px",
    fontSize: 9,
    touchAction: "manipulation",
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
    flex: "1 1 auto",
    minWidth: 0,
    minHeight: 0,
    width: "100%",
    display: "flex",
    padding: 6,
    borderRadius: 0,
    background: "#4f6648",
    border: "4px solid #172012",
    boxShadow: "inset 0 0 0 3px #8ca36f",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  canvasShellPhone: {
    padding: 3,
    borderWidth: 3,
    boxShadow: "inset 0 0 0 2px #8ca36f",
  },
  canvasInnerFrame: {
    flex: "1 1 auto",
    minWidth: 0,
    minHeight: 0,
    width: "100%",
    position: "relative",
    padding: 5,
    borderRadius: 0,
    background: "#26341f",
    boxShadow: "none",
    boxSizing: "border-box",
    overflow: "hidden",
  },
  canvasInnerFramePhone: {
    padding: 3,
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
    zIndex: 18,
    pointerEvents: "none",
    overflow: "hidden",
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
  dpadPhone: {
    left: 5,
    bottom: 5,
    gridTemplateColumns: "27px 27px 27px",
    gridTemplateRows: "27px 27px 27px",
    gap: 2,
    padding: 3,
    background: "rgba(14, 22, 16, 0.68)",
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
  dpadBtnPhone: {
    width: 27,
    height: 27,
    fontSize: 11,
    touchAction: "manipulation",
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
  tutorialOverlayPhone: {
    alignItems: "flex-start",
    padding: 6,
    boxSizing: "border-box",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
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
  tutorialCardPhone: {
    width: "min(520px, calc(100% - 12px))",
    maxHeight: "calc(100% - 12px)",
    padding: "8px 10px",
    gap: 7,
    overflowY: "auto",
    boxShadow: "0 10px 24px rgba(0,0,0,0.42)",
  },
  tutorialTitle: {
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    color: "#7ab068",
    textAlign: "center",
  },
  tutorialTitlePhone: {
    fontSize: 9,
    letterSpacing: 1.4,
  },
  tutorialGrid: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gap: "10px 16px",
    alignItems: "start",
  },
  tutorialGridPhone: {
    gap: "5px 8px",
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
  tutorialKeyPhone: {
    fontSize: 9,
    padding: "2px 5px",
    lineHeight: 1.15,
  },
  tutorialDesc: {
    fontSize: 13,
    color: "rgba(190, 220, 185, 0.85)",
    lineHeight: 1.5,
    paddingTop: 4,
  },
  tutorialDescPhone: {
    fontSize: 10,
    lineHeight: 1.2,
    paddingTop: 1,
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
  tutorialDismissPhone: {
    fontSize: 9,
    marginTop: 0,
  },
};

function chooseResponsiveViewport({ availableWidth, availableHeight, scene, mobileLandscape = false }) {
  const sceneData = SCENES[scene] || SCENES.town;
  const aspect = availableWidth / Math.max(1, availableHeight);
  const minCols = Math.min(mobileLandscape ? 13 : VIEW_COLS, sceneData.w);
  const minRows = Math.min(mobileLandscape ? 6 : VIEW_ROWS, sceneData.h);
  const maxCols = Math.min(sceneData.w, Math.max(minCols, mobileLandscape ? 24 : 42));
  const maxRows = Math.min(sceneData.h, Math.max(minRows, mobileLandscape ? 7 : 22));
  const targetScale = mobileLandscape
    ? (availableHeight <= 240 ? 2.25 : 2.85)
    : availableWidth >= 960 ? 2.85 : availableWidth >= 760 ? 2.7 : 2.55;

  let best = {
    cols: minCols,
    rows: minRows,
    scale: Math.min(SCALE, availableWidth / (minCols * TILE), availableHeight / (minRows * TILE)),
    score: Number.POSITIVE_INFINITY,
  };

  for (let rows = minRows; rows <= maxRows; rows += 1) {
    for (let cols = minCols; cols <= maxCols; cols += 1) {
      const scale = Math.min(SCALE, availableWidth / (cols * TILE), availableHeight / (rows * TILE));
      const displayWidth = cols * TILE * scale;
      const displayHeight = rows * TILE * scale;
      const gapWidth = Math.max(0, availableWidth - displayWidth);
      const gapHeight = Math.max(0, availableHeight - displayHeight);
      const aspectMiss = Math.abs((cols / rows) - aspect);
      const scaleMiss = Math.abs(scale - targetScale);
      const visibleTiles = cols * rows;
      const score = gapWidth * 22 + gapHeight * 0.45 + aspectMiss * 8 + scaleMiss * 6 - visibleTiles * 0.003;

      if (score < best.score) {
        best = { cols, rows, scale, score };
      }
    }
  }

  return {
    cols: best.cols,
    rows: best.rows,
    scale: best.scale,
  };
}

function getNpcLabels({ scene, player, townNpcs, officeNpcs, displayScale, viewportWidth, viewSize }) {
  if (!player) return [];

  const sceneData = SCENES[scene];
  if (!sceneData) return [];

  const viewportCols = viewSize?.cols || VIEW_COLS;
  const viewportRows = viewSize?.rows || VIEW_ROWS;
  const camX = Math.max(0, Math.min(player.x - Math.floor(viewportCols / 2), Math.max(0, sceneData.w - viewportCols)));
  const camY = Math.max(0, Math.min(player.y - Math.floor(viewportRows / 2), Math.max(0, sceneData.h - viewportRows)));

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
        left: Math.round((screenX + 8) * displayScale),
        top: Math.round(Math.max(2, (screenY - 11) * displayScale)),
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
