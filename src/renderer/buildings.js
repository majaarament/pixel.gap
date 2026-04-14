// Outdoor structure drawing: lodge, office building, house, cabin, statues.

import { TILE } from "../constants/game";
import { rect, outline } from "../engine/mapUtils";
import { drawPixelText } from "./props";

// ─── House / Office / Cabin ───────────────────────────────────────────────────
export function drawHouse(ctx, building, x, y) {
  const px = x;
  const py = y - TILE * 2;
  const width  = building.w * TILE;
  const height = building.h * TILE + TILE * 2;

  if (building.type === "office") {
    // Drop shadow
    rect(ctx, px + width,  py + 12, 7, height - 12, "rgba(0,0,0,0.22)");
    rect(ctx, px + 4, py + height, width, 6, "rgba(0,0,0,0.16)");
    // Roof
    rect(ctx, px, py, width, 16, "#8a9aa4");
    rect(ctx, px, py, width, 2, "#a8b8c2");
    rect(ctx, px, py + 14, width, 2, "#627080");
    rect(ctx, px + 8,  py + 3, 16,  9, "#70808e");
    rect(ctx, px + 8,  py + 3, 16,  2, "#92a2ae");
    rect(ctx, px + 10, py + 9, 12,  2, "#566470");
    rect(ctx, px + 10, py + 10,12,  1, "#404e58");
    rect(ctx, px + width - 28, py + 3, 20, 10, "#68787e");
    rect(ctx, px + width - 28, py + 3, 20,  2, "#8898a0");
    for (let vv = px + width - 26; vv < px + width - 10; vv += 4)
      rect(ctx, vv, py + 7, 2, 4, "#4a5860");
    rect(ctx, px + width / 2 - 2, py + 5, 4, 5, "#5a6870");
    rect(ctx, px + width / 2 - 3, py + 4, 6, 2, "#8898a0");
    // Cornice
    rect(ctx, px - 2, py + 16, width + 4,  8, "#2e4a64");
    rect(ctx, px - 2, py + 16, width + 4,  2, "#4a6e90");
    rect(ctx, px - 2, py + 22, width + 4,  2, "#162234");
    rect(ctx, px + width / 2 - 31, py + 17, 62, 10, "#132030");
    rect(ctx, px + width / 2 - 30, py + 18, 60,  2, "#2f5278");
    rect(ctx, px + width / 2 - 30, py + 25, 60,  1, "#09111a");
    rect(ctx, px + width / 2 - 32, py + 18,  1,  8, "#0b1420");
    rect(ctx, px + width / 2 + 31, py + 18,  1,  8, "#0b1420");
    // Main wall
    rect(ctx, px + 2, py + 24, width - 4, 50, "#c8d4de");
    rect(ctx, px + 6, py + 26, width - 12, 2, "#e8f0f6");
    rect(ctx, px + 2, py + 24,          4, 50, "#aab6c2");
    rect(ctx, px + width - 6, py + 24,  4, 50, "#aab6c2");
    for (let jy = py + 40; jy < py + 74; jy += 16)
      rect(ctx, px + 2, jy, width - 4, 1, "#a8b4c0");
    rect(ctx, px + 32, py + 24, 1, 50, "#a8b4c0");
    rect(ctx, px + 96, py + 24, 1, 50, "#a8b4c0");
    // Curtain wall
    const cwLeft = px + 30, cwRight = px + 98, cwTop = py + 24, cwH = 50;
    rect(ctx, cwLeft, cwTop, cwRight - cwLeft, cwH, "#1c2e40");
    rect(ctx, cwLeft + 1, py + 46, cwRight - cwLeft - 2, 4, "#243444");
    rect(ctx, cwLeft + 1, py + 46, cwRight - cwLeft - 2, 1, "#304e68");
    rect(ctx, cwLeft, py + 26, cwRight - cwLeft, 1, "#152030");
    rect(ctx, cwLeft, py + 50, cwRight - cwLeft, 1, "#152030");
    rect(ctx, cwLeft, py + 69, cwRight - cwLeft, 1, "#152030");
    rect(ctx, px + 48, cwTop, 2, cwH, "#162030");
    rect(ctx, px + 64, cwTop, 2, cwH, "#162030");
    rect(ctx, px + 80, cwTop, 2, cwH, "#162030");
    // Pilasters
    rect(ctx, cwLeft - 4, cwTop, 6, cwH, "#b0bec8");
    rect(ctx, cwLeft - 4, cwTop, 6,   2, "#d8e4ec");
    rect(ctx, cwLeft, cwTop, 2, cwH, "#8a9aa6");
    rect(ctx, cwRight - 2, cwTop, 6, cwH, "#b0bec8");
    rect(ctx, cwRight - 2, cwTop, 6,   2, "#d8e4ec");
    rect(ctx, cwRight + 2, cwTop, 2, cwH, "#8a9aa6");
    // Name
    drawPixelText(ctx, "DELAWARE", px + width / 2 - 17, py + 20, "#5d8fb4", 1);
    drawPixelText(ctx, "DELAWARE", px + width / 2 - 16, py + 19, "#eef7ff", 1);
    // Windows
    for (const winY of [py + 26, py + 50]) {
      for (let i = 0; i < 5; i++) {
        const wx = px + 8 + i * 24;
        const center = i >= 1 && i <= 3;
        const g = center ? "#2272a8" : "#3e8fc2";
        const gl = center ? "#44aad8" : "#78c8f0";
        const eg = center ? "#2e8ec0" : "#52a8d8";
        rect(ctx, wx, winY, 16, 20, "#14202e");
        rect(ctx, wx + 2, winY + 2,  12, 16, g);
        rect(ctx, wx + 2, winY + 2,  12,  6, gl);
        rect(ctx, wx + 3, winY + 3,   4,  3, "#d9f7ff");
        rect(ctx, wx + 2, winY + 2,   3, 16, eg);
        rect(ctx, wx + 2, winY + 11, 12,  1, "#0e1c2a");
        rect(ctx, wx + 9, winY + 2,   1, 16, "#0e1c2a");
        rect(ctx, wx + 13,winY + 2,   1, 18, "#08101a");
        rect(ctx, wx + 2, winY + 17, 12,  1, "#08101a");
        rect(ctx, wx + 4, winY + 13,  6,  1, "rgba(255,255,255,0.18)");
      }
    }
    // Entry
    const entryY = py + 74, doorW = 20, doorH = 20;
    const doorX = px + width / 2 - doorW / 2;
    rect(ctx, px + 2, entryY, width - 4, 18, "#d4e0ea");
    rect(ctx, px + 2, entryY, width - 4,  2, "#eaf4fc");
    rect(ctx, doorX - 10, entryY - 5, doorW + 20, 6, "#18293c");
    rect(ctx, doorX - 10, entryY - 5, doorW + 20, 2, "#2a4460");
    rect(ctx, doorX - 10, entryY + 1, doorW + 20, 1, "#08111a");
    rect(ctx, doorX - 8,  entryY - 3, 2, 18, "#1e3048");
    rect(ctx, doorX + doorW + 6, entryY - 3, 2, 18, "#1e3048");
    rect(ctx, px + 6,         entryY + 2, 22, 16, "#18293c");
    rect(ctx, px + 7,         entryY + 3, 20, 14, "#3e8fc2");
    rect(ctx, px + 7,         entryY + 3, 20,  5, "#78c8f0");
    rect(ctx, px + width - 28,entryY + 2, 22, 16, "#18293c");
    rect(ctx, px + width - 27,entryY + 3, 20, 14, "#3e8fc2");
    rect(ctx, px + width - 27,entryY + 3, 20,  5, "#78c8f0");
    const half = Math.floor((doorW - 2) / 2);
    rect(ctx, doorX, entryY + 2, doorW, doorH, "#18293c");
    rect(ctx, doorX + 1,         entryY + 3, half, doorH - 4, "#3e8fc2");
    rect(ctx, doorX + half + 2,  entryY + 3, half, doorH - 4, "#3e8fc2");
    rect(ctx, doorX + 1,         entryY + 3, half,  6, "#88d4f8");
    rect(ctx, doorX + half + 2,  entryY + 3, half,  6, "#88d4f8");
    rect(ctx, doorX + doorW / 2 - 1, entryY + 2,  2, doorH, "#18293c");
    rect(ctx, doorX + 3,  entryY + 13, 4, 1, "#90b8cc");
    rect(ctx, doorX + doorW - 7, entryY + 13, 4, 1, "#90b8cc");
    rect(ctx, doorX - 6,  py + height - 6, doorW + 12, 3, "#a4b4c2");
    rect(ctx, doorX - 8,  py + height - 4, doorW + 16, 2, "#b8c8d4");
    rect(ctx, doorX - 6,  py + height - 2, doorW + 12, 2, "#ccd8e2");
  } else if (building.type === "owlhouse") {
    // ── Library / Learning House — classical stone facade ──────────────────
    const stone  = "#d8cda8";   // warm sandstone
    const stoneL = "#ece0c0";   // lighter (column/pilaster face)
    const stoneD = "#b0a278";   // shadowed stone
    const dark   = "#18120a";   // outlines / window frames
    const glass  = "#1c2e3e";   // window glass (dark)
    const glassH = "#3a6080";   // glass highlight

    // Drop shadow
    rect(ctx, px + 2, py + height, width - 2, 5, "rgba(0,0,0,0.18)");

    // ── Base wall
    rect(ctx, px + 2, py + 22, width - 4, height - 36, stone);
    rect(ctx, px + 2, py + 22, width - 4, 2, "#f0e6c6");
    rect(ctx, px + 2, py + 70, width - 4, 6, "#c5b78b");
    rect(ctx, px + 2, py + 70, width - 4, 1, "#e8dcb7");
    rect(ctx, px + 2, py + 75, width - 4, 1, "#927f57");

    // ── Pilasters (columns) left and right
    rect(ctx, px + 4,          py + 22, 10, height - 36, stoneL);
    rect(ctx, px + 4,          py + 22, 10, 2,           "#f8f0d4");
    rect(ctx, px + width - 14, py + 22, 10, height - 36, stoneL);
    rect(ctx, px + width - 14, py + 22, 10, 2,           "#f8f0d4");
    // Central bay framing the entrance and plaque
    rect(ctx, px + width / 2 - 18, py + 24, 36, 46, stoneL);
    rect(ctx, px + width / 2 - 18, py + 24, 36, 2,  "#f8f0d4");
    rect(ctx, px + width / 2 - 18, py + 68, 36, 2,  "#afa175");

    // ── Entablature (band below pediment)
    rect(ctx, px,     py + 17, width,   6, stoneD);
    rect(ctx, px,     py + 17, width,   2, "#c8ba90");
    rect(ctx, px,     py + 21, width,   2, "#8c7e58");

    // ── Pediment (classical triangular roof, built from stacked rects)
    rect(ctx, px + 2,  py + 8,  width - 4,  10, "#bfb07a");
    rect(ctx, px + 2,  py + 8,  width - 4,   2, "#d4c688");
    rect(ctx, px + 8,  py + 5,  width - 16,  4, "#a89860");
    rect(ctx, px + 16, py + 3,  width - 32,  3, "#9a8c58");
    rect(ctx, px + 22, py + 1,  width - 44,  3, "#887a4c");
    // Pediment baseline
    rect(ctx, px + 2,  py + 16, width - 4,   2, "#9a8e62");

    // ── Windows — books visible on shelves
    for (const wx of [px + 16, px + width - 30]) {
      // Window frame
      rect(ctx, wx,     py + 34, 14, 24, dark);
      // Glass pane
      rect(ctx, wx + 1, py + 35, 12, 22, glass);
      rect(ctx, wx + 1, py + 35, 12,  3, glassH);
      // Shelf dividers
      rect(ctx, wx + 1, py + 43, 12, 1, "#0c1822");
      rect(ctx, wx + 1, py + 50, 12, 1, "#0c1822");
      // Book spines — shelf 1
      const bc = ["#8b3010", "#1a6030", "#28468a", "#701a60", "#807010"];
      for (let b = 0; b < 4; b++)
        rect(ctx, wx + 1 + b * 3, py + 44, 2, 6, bc[b]);
      // Book spines — shelf 2
      for (let b = 0; b < 3; b++)
        rect(ctx, wx + 1 + b * 4, py + 51, 3, 6, bc[(b + 2) % 5]);
      // Window sill
      rect(ctx, wx - 1, py + 58, 16, 2, "#aa9a6c");
      rect(ctx, wx - 1, py + 58, 16, 1, "#ddd0a8");
    }

    // ── Door (central, dark wood with panels)
    const dw = 14, dh = 18;
    const dox = px + width / 2 - dw / 2;
    rect(ctx, dox - 2, py + 56, dw + 4, dh + 2, dark);          // surround
    rect(ctx, dox,     py + 58, dw,      dh,     "#3a2210");    // door body
    rect(ctx, dox + 1, py + 59, dw - 2,  4,      "#5a3820");    // top panel
    rect(ctx, dox + 1, py + 59, dw - 2,  1,      "#7a5435");    // panel highlight
    rect(ctx, dox + dw / 2 - 1, py + 59, 2, dh - 2, "#28180a"); // centre split
    // Door handles
    rect(ctx, dox + 4,      py + 69, 2, 1, "#c09838");
    rect(ctx, dox + dw - 6, py + 69, 2, 1, "#c09838");
    // Flat threshold / plinth instead of steps
    rect(ctx, dox - 4, py + 76, dw + 8, 3, "#bcae84");
    rect(ctx, dox - 4, py + 76, dw + 8, 1, "#e2d6ae");
    rect(ctx, dox - 4, py + 78, dw + 8, 1, "#8e7a54");

    // ── Central plaque between the library windows
    rect(ctx, px + width / 2 - 24, py + 34, 48, 15, "#efe2bc");
    rect(ctx, px + width / 2 - 24, py + 34, 48, 2,  "#fbf2d6");
    rect(ctx, px + width / 2 - 24, py + 47, 48, 2,  "#c8b487");
    rect(ctx, px + width / 2 - 24, py + 34, 2, 15,  "#d8c59b");
    rect(ctx, px + width / 2 + 22, py + 34, 2, 15,  "#b8a06f");
    outline(ctx, px + width / 2 - 24, py + 34, 48, 15, "#7d6b43");
    drawPixelText(ctx, "KNOWLEDGE", px + width / 2 - 18, py + 37, "#5e4a29", 1);
    drawPixelText(ctx, "HUB",       px + width / 2 - 5,  py + 43, "#5e4a29", 1);
  } else {
    // Generic house
    rect(ctx, px + 1, py + height, width, 4, "rgba(0,0,0,0.14)");
    rect(ctx, px + 2, py + 12, width - 4, height - 14, "#f8ecdd");
    rect(ctx, px + 2, py + 12, width - 4, 3, "#fffaf0");
    rect(ctx, px,     py + 6,  width, 18, "#c66f62");
    rect(ctx, px + 3, py + 3,  width - 6, 8, "#dd8e7b");
    rect(ctx, px + 8, py + 28, 12, 10, "#b9c7e8");
    rect(ctx, px + 8, py + 28, 12,  2, "#eaf0ff");
    rect(ctx, px + width - 20, py + 28, 12, 10, "#b9c7e8");
    rect(ctx, px + width - 20, py + 28, 12,  2, "#eaf0ff");
    rect(ctx, px + width / 2 - 6, py + 34, 12, 14, "#9d7458");
    rect(ctx, px + width / 2 - 5, py + 36, 10, 10, "#c69772");
  }
}

export function drawLodge(ctx, building, x, y) {
  const px = x, py = y - TILE * 2;
  const width = building.w * TILE;
  rect(ctx, px + 2,  py + 64, width - 4,  4, "rgba(0,0,0,0.14)");
  rect(ctx, px,      py + 8,  width,      18, "#b96d60");
  rect(ctx, px + 3,  py + 3,  width - 6,  10, "#d98d7a");
  rect(ctx, px + 5,  py + 24, width - 10, 40, "#f3e4cb");
  rect(ctx, px + 5,  py + 24, width - 10,  3, "#fffaf0");
  for (let i = 0; i < 5; i++) {
    rect(ctx, px + 18 + i * 40, py + 34, 16, 10, "#b9c7e8");
    rect(ctx, px + 18 + i * 40, py + 34, 16,  2, "#eef4ff");
  }
  rect(ctx, px + width / 2 - 12, py + 44, 24, 20, "#9f7558");
  rect(ctx, px + width / 2 - 10, py + 46, 20, 16, "#c79a76");
}

export function drawCabin(ctx, building, x, y) {
  const px = x, py = y - TILE;
  const width = building.w * TILE;
  rect(ctx, px + 1,  py + 32, width - 2,  3, "rgba(0,0,0,0.14)");
  rect(ctx, px,      py + 8,  width,      16, "#e0ab79");
  rect(ctx, px + 3,  py + 3,  width - 6,  10, "#d07f69");
  rect(ctx, px + 10, py + 16, 14,         16, "#977052");
  rect(ctx, px + 12, py + 18, 10,         12, "#c89b77");
  rect(ctx, px + width - 24, py + 16, 18, 10, "#b9d6e8");
  rect(ctx, px + width - 24, py + 16, 18,  2, "#eef8ff");
}

/** Dispatcher — calls the correct building draw function by type. */
export function drawBuilding(ctx, building, screenX, screenY) {
  if      (building.type === "lodge") drawLodge(ctx, building, screenX, screenY);
  else if (building.type === "cabin") drawCabin(ctx, building, screenX, screenY);
  else                                drawHouse(ctx, building, screenX, screenY);
}

// ─── Statues ──────────────────────────────────────────────────────────────────
export function drawStatue(ctx, x, y, type) {
  rect(ctx, x + 5, y + 8, 6, 8, "#6b7280");
  rect(ctx, x + 4, y + 4, 8, 5, "#8b949f");
  if (type === "owl") {
    rect(ctx, x + 6, y + 2, 4, 3, "#5e6a75");
    rect(ctx, x + 6, y,     1, 2, "#c6f84e");
    rect(ctx, x + 9, y,     1, 2, "#c6f84e");
  } else {
    rect(ctx, x + 4, y + 1, 8, 4, "#7d5a38");
    rect(ctx, x + 7, y,     2, 2, "#a6e36b");
  }
}
