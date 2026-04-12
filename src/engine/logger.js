// Structured gameplay logging with a persistent user id and a per-tab session id.
// Events are posted to our own backend, which can forward them to Google Sheets.

const LOG_ENDPOINT = "/api/log-event";
const USER_ID_KEY = "pixel-gap-user-id";
const SESSION_ID_KEY = "pixel-gap-session-id";

let cachedUserId = null;
let cachedSessionId = null;

function canUseBrowserStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

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
    branch: playerProfile?.branch || "",
    country: playerProfile?.country || "",
  };
}

export function getUserId() {
  if (cachedUserId) return cachedUserId;

  if (!canUseBrowserStorage()) {
    cachedUserId = createId("user");
    return cachedUserId;
  }

  const stored = readStoredValue(window.localStorage, USER_ID_KEY);
  if (stored) {
    cachedUserId = stored;
    return cachedUserId;
  }

  cachedUserId = createId("user");
  writeStoredValue(window.localStorage, USER_ID_KEY, cachedUserId);
  return cachedUserId;
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
      userId: getUserId(),
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
