export function parseSpeechSegments(dialog, bodyText) {
  if (!bodyText) return [];

  const parts = bodyText
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  const segments = [];
  let currentSpeaker = dialog.npcName || null;
  let currentRole = dialog.npcRole || null;
  const npcFirstName = dialog.npcName?.split(" ")[0] || null;

  parts.forEach((part) => {
    const lines = part
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    let contentLines = [...lines];
    const firstLine = lines[0];
    const firstLineIsCurrentNpcHeader =
      firstLine === dialog.npcName ||
      firstLine === npcFirstName ||
      (dialog.npcName && firstLine === `${dialog.npcName} — ${dialog.npcRole}`);
    const firstLineIsSpeakerRoleHeader =
      !firstLine.includes('"') &&
      !firstLine.includes("“") &&
      /^[A-Za-z][A-Za-z\s'-]{0,40}\s+—\s+[A-Za-z][A-Za-z\s&/-]{0,50}$/.test(firstLine);

    if (firstLine === "Player") {
      currentSpeaker = "You";
      currentRole = null;
      contentLines = lines.slice(1);
    } else if (firstLineIsCurrentNpcHeader) {
      currentSpeaker = npcFirstName || dialog.npcName;
      currentRole = dialog.npcRole || null;
      contentLines = lines.slice(1);
    } else if (firstLineIsSpeakerRoleHeader) {
      const [speaker, role] = firstLine.split(/\s+—\s+/);
      currentSpeaker = speaker.trim();
      currentRole = role?.trim() || null;
      contentLines = lines.slice(1);
    } else {
      const isStandaloneSpeakerLabel =
        !firstLine.includes('"') &&
        !firstLine.includes("“") &&
        !firstLine.includes(".") &&
        !firstLine.includes("?") &&
        !firstLine.includes("!") &&
        /^[A-Za-z][A-Za-z\s'-]{0,30}$/.test(firstLine);

      if (isStandaloneSpeakerLabel) {
        currentSpeaker =
          firstLine === "Player"
            ? "You"
            : firstLine.trim();
        currentRole =
          firstLine === "Player"
            ? null
            : currentSpeaker === dialog.npcName || currentSpeaker === npcFirstName
              ? dialog.npcRole || null
              : null;
        contentLines = lines.slice(1);
      }
    }

    if (contentLines.length === 0) return;

    const text = cleanSpeechText(contentLines.join(" "));
    if (!text) return;

    if (!currentSpeaker) {
      segments.push({
        speaker: "Site Note",
        role: null,
        text,
        variant: "note",
      });
      return;
    }

    segments.push({
      speaker: currentSpeaker,
      role: currentRole,
      text,
      variant: currentSpeaker === "You" ? "player" : "npc",
    });
  });

  return segments;
}

function cleanSpeechText(text) {
  return text
    .trim()
    .replace(/^["“]+/, "")
    .replace(/["”]+(?=[\s.,!?;:]*$)/, "")
    .trim();
}

export function makePlayerChoiceSegment(text) {
  return {
    speaker: "You",
    role: null,
    text,
    variant: "player",
  };
}
