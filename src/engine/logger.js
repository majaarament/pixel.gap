// Structured gameplay logging with a per-tab session id.
// Events are posted to our own backend, which can forward them to Google Sheets.

const LOG_ENDPOINT = "/api/log-event";
const SESSION_ID_KEY = "pixel-gap-session-id";

let cachedSessionId = null;

function createId(prefix) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function readStoredValue(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return "";
  }
}

function writeStoredValue(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    // Silent on purpose. Logging should never interrupt gameplay.
  }
}

function profileFields(playerProfile = {}) {
  return {
    roleLevel: playerProfile?.roleLevel || "",
    team: playerProfile?.team || playerProfile?.department || playerProfile?.branch || "",
    department: playerProfile?.department || playerProfile?.team || "",
    departmentPrimaryEntities: playerProfile?.departmentPrimaryEntities || "",
    departmentSupportingEntities: playerProfile?.departmentSupportingEntities || "",
    entity: playerProfile?.entity || "",
    entityCity: playerProfile?.entityCity || "",
    entityOfficeType: playerProfile?.entityOfficeType || "",
    entityLabel: playerProfile?.entityLabel || "",
    country: playerProfile?.country || "",
  };
}

export function getSessionId() {
  if (cachedSessionId) return cachedSessionId;

  if (typeof window === "undefined") {
    cachedSessionId = createId("session");
    return cachedSessionId;
  }

  const sessionStorage = window.sessionStorage;
  const stored = sessionStorage ? readStoredValue(sessionStorage, SESSION_ID_KEY) : "";
  if (stored) {
    cachedSessionId = stored;
    return cachedSessionId;
  }

  cachedSessionId = createId("session");
  if (sessionStorage) {
    writeStoredValue(sessionStorage, SESSION_ID_KEY, cachedSessionId);
  }
  return cachedSessionId;
}

export function logEvent(eventType, payload = {}) {
  if (typeof window === "undefined") return;

  fetch(LOG_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventType,
      userId: "",
      sessionId: getSessionId(),
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  }).catch(() => {});
}

export function logProfile(profile) {
  logEvent("profile_submitted", profileFields(profile));
}

export function logChoice({
  npcId,
  npcName,
  npcRole,
  stepId,
  prompt,
  choiceKey,
  choiceLabel,
  questStage,
  playerProfile,
}) {
  logEvent("question_answer", {
    questStage: questStage || "",
    npcId: npcId || "",
    npcName: npcName || "",
    npcRole: npcRole || "",
    stepId: stepId || "",
    prompt: prompt || "",
    choiceKey: choiceKey || "",
    choiceLabel: choiceLabel || "",
    ...profileFields(playerProfile),
  });
}

export function logFinalReport({ report, questStage, playerProfile, choices, reflections }) {
  logEvent("final_report", {
    questStage: questStage || "",
    text: JSON.stringify({ report, choices, reflections }),
    ...profileFields(playerProfile),
  });
}

export function logEarlyExit({ report, questStage, playerProfile, choices, reflections }) {
  logEvent("early_exit", {
    questStage: questStage || "",
    text: JSON.stringify({ report, choices, reflections }),
    ...profileFields(playerProfile),
  });
}

export function logCouncilMessage({
  turnIndex,
  conversationRole,
  npcId,
  npcName,
  npcRole,
  text,
  questStage,
  playerProfile,
}) {
  logEvent("council_message", {
    questStage: questStage || "",
    turnIndex: turnIndex ?? "",
    conversationRole: conversationRole || "",
    npcId: npcId || "",
    npcName: npcName || "",
    npcRole: npcRole || "",
    text: text || "",
    ...profileFields(playerProfile),
  });
}
