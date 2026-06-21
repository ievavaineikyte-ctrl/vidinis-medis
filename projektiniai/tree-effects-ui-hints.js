/**
 * Hover/touch hint logika išskirta iš tree-effects-ui.js,
 * kad UI hint atsakomybė būtų atskirame faile.
 */
let _lastHintZone = -1;
let _hintFadeStartMs = 0;
let _branchHintPlacementCache = {
  zid: -1,
  x: NaN,
  y: NaN,
  segCount: -1,
  result: null
};

const HOVER_ZONE_HINT_FADE_MS = 0;
const CAPTION_FADE_IN_ACTIVE_MS = 180;

/**
 * Ar viršutinis šakos hover pavadinimas / antraštė dar „įeina“ (fade).
 * Kol true — draw() laiko loop; kai false, noLoop, o atnaujinimą duoda mouse / touch.
 */
function isHoverZoneUiAnimating() {
  if (typeof hoveredZoneId !== "number" || hoveredZoneId < 1 || hoveredZoneId > 8) {
    return false;
  }
  if (typeof zoneStage === "undefined" || zoneStage[hoveredZoneId] !== 0) {
    return false;
  }
  // Hover hint is now instant — no continuous loop needed for it.
  if (hoveredZoneId === 1) {
    if (typeof _trunkPalieskHoverEnterMs === "number" && _trunkPalieskHoverEnterMs > 0) {
      if (millis() - _trunkPalieskHoverEnterMs < 100) {
        return true;
      }
    }
  }
  if (currentCaptionTitle || currentCaptionText) {
    let outMs =
      typeof CAPTION_FADE_OUT_MS !== "undefined" ? CAPTION_FADE_OUT_MS : 720;
    if (
      typeof currentCaptionUntilMs === "number" &&
      millis() <= currentCaptionUntilMs + outMs
    ) {
      if (
        millis() <= currentCaptionUntilMs &&
        millis() - _captionFadeStartMs < CAPTION_FADE_IN_ACTIVE_MS
      ) {
        return true;
      }
      if (millis() > currentCaptionUntilMs) {
        return true;
      }
    }
  }
  return false;
}

function drawHoverZoneHint() {
  if (millis() < deepReturnCalmUntilMs) {
    return;
  }
  if (millis() < trunkIntroCalmUntilMs) {
    return;
  }

  if (zoneStage[1] === 0 && hoveredZoneId < 1) {
    return;
  }

  if (zoneStage[1] === 0 && hoveredZoneId !== 1) {
    return;
  }

  if (hoveredZoneId < 1 || hoveredZoneId > 8) {
    return;
  }

  /* Kamienas: „PALIESK“ — tik `drawTouchPalieskHint` (išilgai artimiausio segmento). */
  if (hoveredZoneId === 1 && zoneStage[1] === 0) {
    if (hoveredZoneId !== _lastHintZone) {
      _lastHintZone = hoveredZoneId;
      _hintFadeStartMs = millis();
    }
    return;
  }

  let data = ZONE_DATA[hoveredZoneId];
  let hint = (data && data.title) || ZONE_HINTS[hoveredZoneId] || "";
  let flowLine =
    typeof TREE_UX !== "undefined" && TREE_UX.zoneHoverFlowLine
      ? TREE_UX.zoneHoverFlowLine
      : "";

  if (!hint) {
    return;
  }

  let _capOutMs =
    typeof CAPTION_FADE_OUT_MS !== "undefined" ? CAPTION_FADE_OUT_MS : 720;
  if (
    typeof currentCaptionZone === "number" &&
    currentCaptionZone === hoveredZoneId &&
    typeof currentCaptionUntilMs === "number" &&
    millis() < currentCaptionUntilMs + _capOutMs
  ) {
    return;
  }

  if (hoveredZoneId !== _lastHintZone) {
    _lastHintZone = hoveredZoneId;
    _hintFadeStartMs = millis();
  }
  let hFadeIn = 1;
  hFadeIn = hFadeIn * hFadeIn * (3 - 2 * hFadeIn);

  let hintColor = hoveredZoneId === 2 ? [255, 255, 255] : getCaptionZoneColor(hoveredZoneId);
  let pl =
    typeof getZoneLabelCompositionPlacement === "function"
      ? getZoneLabelCompositionPlacement(hoveredZoneId)
      : { x: width * 0.5, y: height * 0.22, ang: 0 };
  let touchLike =
    width < 520 ||
    (typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches);
  let ts = min(21, max(14, width * 0.021));
  if (touchLike) {
    ts = min(25, max(15.5, width * 0.027));
  }

  applyCaptionUiSansFont();
  textStyle(NORMAL);
  textSize(ts);
  textAlign(CENTER, CENTER);
  let halfW = textWidth(hint) * 0.5 + ts * 0.45;
  if (flowLine) {
    textSize(max(11, ts * 0.64));
    halfW = max(halfW, textWidth(flowLine) * 0.5 + ts * 0.38);
    textSize(ts);
  }
  /* Tik minimalus pastūmimas, jei užlenda už krašto — ne simetrinis clamp į vidurį. */
  let padHint = max(8, width * 0.024);
  let plx = pl.x;
  let leftEdge = plx - halfW;
  let rightEdge = plx + halfW;
  if (leftEdge < padHint) {
    plx += padHint - leftEdge;
  } else if (rightEdge > width - padHint) {
    plx -= rightEdge - (width - padHint);
  }

  push();
  translate(plx, pl.y + (1 - hFadeIn) * 4);
  rotate(0);
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx) {
    ctx.save();
    if ("letterSpacing" in ctx) {
      let breath = 0.0035 * sin(millis() * 0.00055 + hoveredZoneId * 0.7);
      ctx.letterSpacing = (0.052 + breath).toFixed(4) + "em";
    }
    ctx.shadowBlur = (touchLike ? 16 : 26) * hFadeIn;
    ctx.shadowColor = touchLike
      ? "rgba(0,0,0," + (0.48 * hFadeIn) + ")"
      : "rgba(4, 3, 2," + (0.52 * hFadeIn) + ")";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = touchLike ? 1 : 0;
  }
  if (touchLike) {
    noStroke();
    fill(
      min(255, hintColor[0] + 22),
      min(255, hintColor[1] + 20),
      min(255, hintColor[2] + 18),
      232 * hFadeIn
    );
  } else {
    stroke(0, 0, 0, 52 * hFadeIn);
    strokeWeight(max(1.1, ts * 0.055));
    fill(
      min(255, hintColor[0] + 12),
      min(255, hintColor[1] + 10),
      min(255, hintColor[2] + 8),
      228 * hFadeIn
    );
  }
  textAlign(CENTER, CENTER);
  textSize(ts);
  text(hint, 0, -ts * 0.42);
  if (flowLine) {
    noStroke();
    textSize(max(11, ts * 0.64));
    let subA = hoveredZoneId === 2 ? (touchLike ? 148 : 118) : touchLike ? 132 : 104;
    fill(
      min(255, hintColor[0] + (touchLike ? 22 : 0)),
      min(255, hintColor[1] + (touchLike ? 20 : 0)),
      min(255, hintColor[2] + (touchLike ? 18 : 0)),
      subA * hFadeIn
    );
    text(flowLine, 0, ts * 0.52);
  }
  noStroke();
  if (ctx) {
    if ("letterSpacing" in ctx) {
      ctx.letterSpacing = "0px";
    }
    ctx.restore();
  }
  pop();
}

/** Tik kamienui (zona 1): ant artimiausio segmento, pasisukęs kaip šaka. */
let _trunkPalieskHoverEnterMs = -1;

function _palieskClosestPointOnSegment(px, py, x1, y1, x2, y2) {
  let c = x2 - x1;
  let d = y2 - y1;
  let lenSq = c * c + d * d;
  if (lenSq < 1e-8) {
    return { x: x1, y: y1 };
  }
  let t = constrain(((px - x1) * c + (py - y1) * d) / lenSq, 0, 1);
  return { x: x1 + t * c, y: y1 + t * d };
}

function _palieskReadableLabelAngle(rad) {
  let a = rad;
  if (a > HALF_PI) {
    a -= PI;
  }
  if (a < -HALF_PI) {
    a += PI;
  }
  return a;
}

/**
 * Artimiausias nurodytos zonos segmentas rodyklei — pasukimas skaitomam intervalui.
 * Naudoja globalų `branchSegments` / `distToSegmentSq` iš `tree-geometry.js`.
 */
function getBranchHintPlacementForZone(mx, my, zid) {
  if (typeof branchSegments === "undefined" || !branchSegments || branchSegments.length === 0) {
    return null;
  }
  if (typeof distToSegmentSq !== "function") {
    return null;
  }
  let segCount = branchSegments.length | 0;
  if (
    _branchHintPlacementCache.zid === zid &&
    _branchHintPlacementCache.segCount === segCount &&
    isFinite(_branchHintPlacementCache.x) &&
    isFinite(_branchHintPlacementCache.y)
  ) {
    let dx = mx - _branchHintPlacementCache.x;
    let dy = my - _branchHintPlacementCache.y;
    if (dx * dx + dy * dy < 64) {
      return _branchHintPlacementCache.result;
    }
  }
  let minLen = zid === 1 ? 16 : 12;
  let best = null;
  let bestD = Infinity;
  for (let i = 0; i < branchSegments.length; i++) {
    let b = branchSegments[i];
    if (b.zoneId !== zid) {
      continue;
    }
    let segLen = dist(b.x1, b.y1, b.x2, b.y2);
    if (segLen < minLen) {
      continue;
    }
    let d = distToSegmentSq(mx, my, b.x1, b.y1, b.x2, b.y2);
    if (d < bestD) {
      bestD = d;
      best = b;
    }
  }
  if (!best) {
    return null;
  }
  let cp = _palieskClosestPointOnSegment(mx, my, best.x1, best.y1, best.x2, best.y2);
  let rawAng = atan2(best.y2 - best.y1, best.x2 - best.x1);
  if (zid === 1) {
    let dx = best.x2 - best.x1;
    let dy = best.y2 - best.y1;
    let segLen = max(sqrt(dx * dx + dy * dy), 1e-6);
    let tx = dx / segLen;
    let ty = dy / segLen;
    let nx = -ty;
    let ny = tx;
    let offDist = min(46, max(24, width * 0.044));
    let px = cp.x + nx * offDist;
    if (px > width - 40 || px < 40) {
      nx *= -1;
      ny *= -1;
      px = cp.x + nx * offDist;
    }
    let py = cp.y + ny * (offDist * 0.18);
    px = constrain(px, width * 0.08, width * 0.92);
    py = constrain(py, height * 0.28, height * 0.92);
    let out = { x: px, y: py, ang: 0 };
    _branchHintPlacementCache = {
      zid: zid,
      x: mx,
      y: my,
      segCount: segCount,
      result: out
    };
    return out;
  }
  let off = 10;
  let px = cp.x - sin(rawAng) * off;
  let py = cp.y + cos(rawAng) * off;
  px = constrain(px, 28, width - 28);
  py = constrain(py, 24, height - 24);
  let out = { x: px, y: py, ang: 0 };
  _branchHintPlacementCache = {
    zid: zid,
    x: mx,
    y: my,
    segCount: segCount,
    result: out
  };
  return out;
}

function getPalieskHintPlacementFromPointer(mx, my) {
  return getBranchHintPlacementForZone(mx, my, 1);
}

function _palieskHintFallbackPlacement() {
  if (typeof getZoneLabelCompositionPlacement === "function") {
    let p = getZoneLabelCompositionPlacement(1);
    return { x: p.x, y: p.y, ang: 0 };
  }
  return { x: width * 0.52, y: height * 0.76, ang: 0 };
}

function drawTouchPalieskHint() {
  if (typeof asBreakSequenceActive !== "undefined" && asBreakSequenceActive) {
    return;
  }
  if (typeof showTouchHint === "undefined" || !showTouchHint) {
    return;
  }
  if (typeof hasAnyZoneFill !== "undefined" && hasAnyZoneFill) {
    return;
  }
  if (typeof zoneStage !== "undefined" && zoneStage[1] > 0) {
    return;
  }
  if (typeof hoveredZoneId === "undefined" || hoveredZoneId !== 1) {
    _trunkPalieskHoverEnterMs = -1;
    return;
  }
  if (millis() < trunkIntroCalmUntilMs) {
    return;
  }
  if (millis() < deepReturnCalmUntilMs) {
    return;
  }

  if (_trunkPalieskHoverEnterMs < 0) {
    _trunkPalieskHoverEnterMs = millis();
  }
  let age = millis() - _trunkPalieskHoverEnterMs;
  if (age > 3200) {
    return;
  }
  let tFade = constrain(age / 80, 0, 1);
  let a = 255 * tFade;
  let labelDraw =
    typeof TREE_UX !== "undefined" && TREE_UX.touchLabel ? TREE_UX.touchLabel : "PALIESK";
  let place = getPalieskHintPlacementFromPointer(mouseX, mouseY) || _palieskHintFallbackPlacement();
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx && typeof ctx.letterSpacing !== "undefined") {
    ctx.letterSpacing = "0.055em";
  }
  applyCaptionUiSansFont();
  let tSize = min(18.5, max(12, width * 0.0152));
  push();
  translate(place.x, place.y);
  rotate(0);
  textAlign(CENTER, CENTER);
  textSize(tSize);
  if (ctx) {
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
  }
  noStroke();
  fill(255, 255, 255, a * 0.94);
  text(labelDraw, 0, 0);
  if (ctx) {
    ctx.restore();
  }
  if (ctx && typeof ctx.letterSpacing !== "undefined") {
    ctx.letterSpacing = "0px";
  }
  pop();
}

/** Antras paspaudimas (stage 1): užuomina — tik jei TREE_UX.zoneSecondTapHint ne tuščia. */
function drawZoneStageSecondClickHint() {
  let deepHint =
    typeof TREE_UX !== "undefined" && TREE_UX.zoneSecondTapHint
      ? String(TREE_UX.zoneSecondTapHint).trim()
      : "";
  if (!deepHint) {
    return;
  }
  if (typeof deepEnterFadePhase !== "undefined" && deepEnterFadePhase === 1) {
    return;
  }
  if (millis() < deepReturnCalmUntilMs || millis() < trunkIntroCalmUntilMs) {
    return;
  }
  if (hoveredZoneId < 1 || hoveredZoneId > 8) {
    return;
  }
  if (zoneStage[hoveredZoneId] !== 1) {
    return;
  }
  let hintColor = getCaptionZoneColor(hoveredZoneId);
  let tFade = 0.86 + 0.14 * (0.5 + 0.5 * sin(millis() * 0.006 + hoveredZoneId * 0.4));
  let hx = constrain(mouseX, 36, width - 36);
  let hy = constrain(mouseY - 20, 28, height - 10);
  let pulse = 0.5 + 0.5 * sin(millis() * 0.0075 + hoveredZoneId * 0.55);
  noStroke();
  applyCaptionUiSansFont();
  textAlign(CENTER, BOTTOM);
  let ts = (min(17, max(14, width * 0.034)) + 0.85 * pulse) * 1.04;
  textSize(ts);
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx) {
    ctx.save();
    ctx.shadowBlur = 22 + pulse * 10;
    ctx.shadowColor = "rgba(255, 248, 252, 0.55)";
  }
  fill(
    min(255, hintColor[0] + 42),
    min(255, hintColor[1] + 38),
    min(255, hintColor[2] + 30),
    255 * tFade
  );
  text(deepHint, hx, hy);
  if (ctx) {
    ctx.restore();
  }
  textStyle(NORMAL);
}
