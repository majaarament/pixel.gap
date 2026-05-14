// Thin orchestrator — wires the hook to the component tree.
// Should contain no game logic, no canvas code, no data definitions.

import React, { useEffect, useState } from "react";
import { useGameState } from "./hooks/useGameState";
import GameCanvas     from "./components/GameCanvas";
import IntroScreen    from "./components/IntroScreen";
import PrivacyScreen  from "./components/PrivacyScreen";
import PrivacyModal   from "./components/PrivacyModal";
import ProfileScreen  from "./components/ProfileScreen";
import InfoRow        from "./components/InfoRow";
import OrientationPrompt from "./components/OrientationPrompt";
import FeedbackScreen from "./components/FeedbackScreen";
import { QUEST_STAGES } from "./data/npcs";

const PROGRESS_KEY = "pixel-gap-progress";

function hasSavedProgress() {
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.playerProfile && parsed?.stage);
  } catch { return false; }
}

export default function App() {
  const [screen, setScreen] = useState("start");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const viewport = useViewportSize();
  const game = useGameState();
  const needsPhoneLandscape = isPhonePortrait(viewport);
  const isPhoneLandscape = isPhoneLandscapeViewport(viewport);

  function handlePrivacyAccept() { setPrivacyAccepted(true); }
  function handlePrivacyExit()   { window.location.href = "about:blank"; }

  function enterGame() {
    setScreen(needsPhoneLandscape ? "orientation" : "game");
  }

  function handleConsent() {
    if (!privacyAccepted) return;
    // Skip intro + profile if there's a saved session to resume
    if (hasSavedProgress()) {
      enterGame();
    } else {
      setScreen("intro");
    }
  }

  function handleLeaveGame() {
    if (![QUEST_STAGES.POST_GAME, QUEST_STAGES.COMPLETE].includes(game.quest.stage)) {
      setScreen("feedback");
      return;
    }

    game.leaveGame();
    setScreen("thanks");
  }

  function handleFeedbackSubmit(feedbackAnswers) {
    game.leaveGame(feedbackAnswers);
    setScreen("thanks");
  }

  useEffect(() => {
    if (screen !== "orientation" || needsPhoneLandscape) return undefined;
    const timer = window.setTimeout(() => setScreen("game"), 450);
    return () => window.clearTimeout(timer);
  }, [screen, needsPhoneLandscape]);

  if (screen === "start") {
    return (
      <>
        <PrivacyScreen
          canStart={privacyAccepted}
          onConsent={handleConsent}
        />
        {!privacyAccepted && (
          <PrivacyModal onAccept={handlePrivacyAccept} onExit={handlePrivacyExit} />
        )}
      </>
    );
  }

  if (screen === "intro")   return <IntroScreen onStart={() => setScreen("profile")} />;

  if (screen === "profile") {
    return (
      <ProfileScreen
        onSubmit={(profile) => {
          game.setPlayerProfile(profile);
          enterGame();
        }}
      />
    );
  }

  if (screen === "orientation") {
    return (
      <OrientationPrompt
        ready={!needsPhoneLandscape}
        onContinue={() => setScreen("game")}
        onContinueAnyway={() => setScreen("game")}
      />
    );
  }

  if (screen === "feedback") {
    return <FeedbackScreen onSubmit={handleFeedbackSubmit} />;
  }

  if (screen === "thanks") {
    return (
      <div style={styles.thanksScreen}>
        <div style={styles.thanksCard}>
          <div style={styles.thanksTitle}>THANK YOU FOR PLAYING</div>
          <p style={styles.thanksBody}>your answers have been saved.</p>
          <p style={styles.thanksBody}>you can close this window.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.page, ...(isPhoneLandscape ? styles.pagePhoneLandscape : null) }}>
      <div style={{ ...styles.gameWrap, ...(isPhoneLandscape ? styles.gameWrapPhoneLandscape : null) }}>
        <GameCanvas
          mobileLandscape={isPhoneLandscape}
          scene={game.scene}
          player={game.player}
          townNpcs={game.townNpcs}
          officeNpcs={game.officeNpcs}
          playerRef={game.playerRef}
          npcRefs={{ town: game.townNpcsRef, office: game.officeNpcsRef }}
          nearbyTarget={game.nearbyTarget}
          objectiveTarget={game.objectiveTarget}
          objectiveLabel={game.objectiveLabel}
          status={game.status}
          quest={game.quest}
          banner={game.banner}
          dialog={game.dialog}
          interactionLabel={game.interactionLabel}
          reportOpen={game.reportOpen}
          resultsReport={game.resultsReport}
          councilOpen={game.councilOpen}
          learningHouseOpen={game.learningHouseOpen}
          onChoice={game.handleChoice}
          onAdvance={game.handleAdvanceDialog}
          onInteract={game.handleInteract}
          onMove={game.nudgePlayer}
          onSkipToObjective={game.skipToObjective}
          onSubmitReflection={game.handleReflectionSubmit}
          onCloseResults={game.closeResultsReport}
          onOpenResults={game.openResultsReport}
          onCloseCouncil={game.closeCouncil}
          onOpenLearningHouse={game.openLearningHouse}
          onCloseLearningHouse={game.closeLearningHouse}
          onLeaveGame={handleLeaveGame}
        />
        <InfoRow compact={isPhoneLandscape} />
      </div>
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

function isPhonePortrait(viewport) {
  return viewport.width <= 740 && viewport.height > viewport.width;
}

function isPhoneLandscapeViewport(viewport) {
  return viewport.width > viewport.height && viewport.height <= 520 && viewport.width <= 980;
}

const styles = {
  page: {
    minHeight: "100vh",
    height: "100vh",
    background: "#7f9362",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(8px, 2vh, 16px) clamp(10px, 3vw, 28px)",
    fontFamily: '"Courier New", "Lucida Console", monospace',
    color: "#31423a",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  },
  pagePhoneLandscape: {
    minHeight: "100svh",
    height: "100svh",
    padding: 4,
    alignItems: "center",
  },
  gameWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    width: "min(68vw, 1320px)",
    height: "min(calc(100vh - clamp(10px, 2vh, 20px)), 1160px)",
    maxWidth: "1320px",
    maxHeight: "calc(100vh - clamp(10px, 2vh, 20px))",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
    overflow: "hidden",
    boxSizing: "border-box",
  },
  gameWrapPhoneLandscape: {
    width: "calc(100vw - 8px)",
    height: "calc(100svh - 8px)",
    maxWidth: "none",
    maxHeight: "none",
    gap: 3,
  },
  thanksScreen: {
    minHeight: "100vh",
    height: "100vh",
    background: "#a3b787",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    fontFamily: '"Courier New", "Lucida Console", monospace',
  },
  thanksCard: {
    background: "#e8ecd7",
    border: "8px solid #000000",
    outline: "8px solid #ffffff",
    padding: "clamp(24px, 5vh, 56px) clamp(32px, 7vw, 80px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
    textAlign: "center",
    boxShadow: "12px 12px 0 rgba(180, 200, 160, 0.8)",
  },
  thanksTitle: {
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(28px, 4vw, 60px)",
    fontWeight: 900,
    color: "#000000",
    letterSpacing: 0,
    lineHeight: 1,
  },
  thanksBody: {
    fontFamily: '"Courier New", "Lucida Console", monospace',
    fontSize: "clamp(14px, 1.6vw, 22px)",
    fontWeight: 900,
    color: "#000000",
    margin: 0,
  },
};
