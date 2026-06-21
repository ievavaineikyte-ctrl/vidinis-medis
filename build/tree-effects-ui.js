/** Medžio UI (ne „Aš“) — fontUI_clean → Inter. */
function treeUiFont() {
  if (typeof fontUI_clean === "function") {
    fontUI_clean();
  } else if (typeof setUiSansFont === "function") {
    setUiSansFont();
  } else if (typeof uiSansFont !== "undefined" && uiSansFont) {
    textFont(uiSansFont);
    textStyle(NORMAL);
  } else {
    textFont(FONT_SANS);
    textStyle(NORMAL);
  }
}

/** Antraštės ant drobės — tas pats Inter kaip `setUiSansFont` (po `sketch-core` įkrovos). */
function applyCaptionUiSansFont() {
  if (typeof setUiSansFont === "function") {
    setUiSansFont();
  } else {
    treeUiFont();
  }
}

/** Entry overlay: „Atrask“ hitbox (tikslinis paspaudimas į kūrinį). */
let _entryAtraskHit = null;

function scheduleStartupGlitch() {
  startupMs = -1;
  isSwaying = false;
  sway = 0;
  swayStartMs = startupMs;
  initZoneFillStates();
  loop();
}

function initZoneFillStates() {
  zoneFillProgress.fill(0);
  zoneActivated.fill(0);
  zoneFillTarget.fill(0);
  zoneStage.fill(0);
  hasAnyZoneFill = false;
  activeZoneCount = 0;
  pointerDirty = true;
  revealPulseUntilMs = 0;
  revealPulseStrength = 0;
  revealPulseDurationMs = 190;
  revealPulseMode = 0;
  finaleGlitchUntilMs = 0;
  if (typeof pyktisRejectionFlashUntilMs !== "undefined") {
    pyktisRejectionFlashUntilMs = 0;
  }
  if (typeof pyktisRejectionFlashDurationMs !== "undefined") {
    pyktisRejectionFlashDurationMs = 780;
  }
  currentCaptionTitle = "";
  currentCaptionText = "";
  if (typeof currentCaptionEpilogue !== "undefined") {
    currentCaptionEpilogue = "";
  }
  currentCaptionUntilMs = 0;
  currentCaptionZone = -1;
  if (typeof showTouchHint !== "undefined") {
    showTouchHint = true;
  }
  if (typeof touchHintStartMs !== "undefined") {
    touchHintStartMs = -1;
  }
  if (typeof deepEnterFadePhase !== "undefined") {
    deepEnterFadePhase = 0;
    deepEnterPendingZone = -1;
  }
  if (typeof resetDeepEnterCentroidCache === "function") {
    resetDeepEnterCentroidCache();
  }
  zoneBloomUntilMs.fill(0);
  if (typeof heartUnlockBranchPulseUntilMs !== "undefined") {
    heartUnlockBranchPulseUntilMs = 0;
  }
  zoneShapeMorphStrength.fill(0);
  zoneShapeMorphTarget.fill(0);
  zoneShapeMorphFrom.fill(0);
  zoneShapeMorphStartMs.fill(0);
  deepZoneVisited.fill(0);
  outerZoneLeafGrowth.fill(0);
  asBreakSequenceActive = false;
  asBreakStartMs = 0;
  asStopPromptVisible = false;
  trunkIntroCalmUntilMs = 0;
  trunkZoneUnlockAtMs = 0;
  deepReturnStatusText = "";
  deepReturnStatusStartMs = 0;
  deepReturnStatusUntilMs = 0;
  deepReturnStatusVariant = "none";
  deepReturnCalmUntilMs = 0;
  if (typeof asBreakExitCalmStartMs !== "undefined") {
    asBreakExitCalmStartMs = -1;
  }
  if (typeof deepExitCount !== "undefined") {
    deepExitCount = 0;
  }
  if (typeof oneTimeShockPendingAtMs !== "undefined") {
    oneTimeShockPendingAtMs = 0;
  }
  if (typeof oneTimeShockStartAtMs !== "undefined") {
    oneTimeShockStartAtMs = -1;
  }
  if (typeof generativeRegenArmedAtMs !== "undefined") {
    generativeRegenArmedAtMs = 0;
  }
  if (typeof asHeartUnlockFanfareDone !== "undefined") {
    asHeartUnlockFanfareDone = false;
  }
  if (typeof pyktisCoreHoldLatched !== "undefined") {
    pyktisCoreHoldLatched = false;
  }
  if (typeof deepFirstReturnHintShownByZone !== "undefined") {
    deepFirstReturnHintShownByZone.fill(0);
  }
  if (typeof _lastDeepFirstReturnHintLine !== "undefined") {
    _lastDeepFirstReturnHintLine = "";
  }
}

function areAllZonesOpened() {
  for (let z = 2; z <= 8; z++) {
    if (zoneStage[z] !== 2) {
      return false;
    }
  }

  return true;
}

function triggerFinaleGlitch() {
  finaleGlitchUntilMs = millis() + FINALE_GLITCH_MS;
  currentCaptionTitle = "Viskas atverta";
  currentCaptionText =
    "Pasirinkai tokias savybes:\n" + buildSelectedTraitsCaption();
  if (typeof currentCaptionEpilogue !== "undefined") {
    currentCaptionEpilogue =
      typeof NARRATIVE_FINALE_EPILOGUE !== "undefined" ? NARRATIVE_FINALE_EPILOGUE : "";
  }
  currentCaptionUntilMs = millis() + 9000;
  currentCaptionZone = -1;
}

function buildSelectedTraitsCaption() {
  return [
    "kamienas",
    "pagrindas, atrama",
    "mano esybė",
    "branduolys, laikymas",
    "juokas",
    "lengvumas, ironija",
    "jautrumas",
    "gilus jausmas",
    "drama",
    "intensyvumas, reakcija",
    "meilė",
    "prisirišimas, šiluma",
    "empatija",
    "įsijautimas, supratimas",
    "pyktis",
    "reakcija, ribos"
  ].join("\n");
}

function setZoneCaption(zone) {
  if (zone === 1) {
    return;
  }
  let data = ZONE_DATA[constrain(zone, 1, 8)];

  if (!data) {
    return;
  }

  if (typeof currentCaptionEpilogue !== "undefined") {
    currentCaptionEpilogue = "";
  }
  // Tik pavadinimas – be spalvos etiketės (ne debug / UI).
  currentCaptionTitle = data.title;
  currentCaptionText = pickZoneTextVariant(zone, data.text);
  currentCaptionUntilMs = millis() + (zone === 1 ? 900 : 1200);
  currentCaptionZone = zone;
}

/** Po paspaudimo: aiškus ZONE_DATA tekstas + trumpas laikas. */
function setZoneCaptionFromClick(zone) {
  if (zone === 1) {
    return;
  }
  let data = ZONE_DATA[constrain(zone, 1, 8)];
  if (!data) {
    return;
  }
  if (typeof currentCaptionEpilogue !== "undefined") {
    currentCaptionEpilogue = "";
  }
  let flowTitle =
    typeof TREE_UX !== "undefined" && TREE_UX.zoneAfterFirstTapTitle
      ? TREE_UX.zoneAfterFirstTapTitle
      : "";
  if (zone >= 2 && zone <= 8 && flowTitle) {
    currentCaptionTitle = flowTitle + " · " + data.title;
  } else {
    currentCaptionTitle = data.title;
  }
  currentCaptionText = data.text;
  let capMs = zone === 1 ? 750 : 1400;
  currentCaptionUntilMs = millis() + capMs;
  currentCaptionZone = zone;
  _lastCaptionKey = "";
  _captionFadeStartMs = millis();
}

function pickZoneTextVariant(zone, fallbackText) {
  let variants = (typeof ZONE_TEXT_VARIANTS !== "undefined" && ZONE_TEXT_VARIANTS[zone]) || null;
  if (!variants || variants.length === 0) {
    return fallbackText;
  }
  let emotion = typeof getEmotionWeight === "function" ? getEmotionWeight(zone) : 0;
  let h =
    ((zone * 7919 + variants.length * 193 + floor(emotion * 997)) >>> 0) %
    variants.length;
  return variants[h];
}

function areOuterZonesUnlocked() {
  return zoneStage[1] > 0 && millis() >= trunkZoneUnlockAtMs;
}

let _lastCaptionKey = "";
let _captionFadeStartMs = 0;

function getZoneBranchTop(zoneId) {
  let txF =
    typeof getDeepMemoryTextColumnCenterX === "function"
      ? getDeepMemoryTextColumnCenterX()
      : width * 0.36;
  if (!branchSegments || branchSegments.length === 0) {
    return { x: txF, y: height * 0.25 };
  }
  let sx = 0, cnt = 0, minY = height;
  for (let i = 0; i < branchSegments.length; i++) {
    let b = branchSegments[i];
    if (b.zoneId === zoneId || b.zoneA === zoneId || b.zoneB === zoneId) {
      sx += (b.x1 + b.x2) * 0.5;
      let segTop = min(b.y1, b.y2);
      if (segTop < minY) minY = segTop;
      cnt++;
    }
  }
  if (cnt === 0) return { x: txF, y: height * 0.25 };
  return { x: sx / cnt, y: minY };
}

let _zoneLabelPlacementCache = {};
let _zoneLabelPlacementCacheKey = "";

function getZoneLabelCompositionPlacement(zoneId) {
  let cacheKey = (width | 0) + "x" + (height | 0);
  if (zoneId !== 1) {
    if (cacheKey !== _zoneLabelPlacementCacheKey) {
      _zoneLabelPlacementCache = {};
      _zoneLabelPlacementCacheKey = cacheKey;
    }
    if (_zoneLabelPlacementCache[zoneId]) {
      return _zoneLabelPlacementCache[zoneId];
    }
  }
  let result = _computeZoneLabelPlacement(zoneId);
  if (zoneId !== 1) {
    _zoneLabelPlacementCache[zoneId] = result;
  }
  return result;
}

function _computeZoneLabelPlacement(zoneId) {
  if (zoneId === 1) {
    let nudgeRX = width * 0.023;
    let nudgeUY = height * 0.026;
    /** Švelnus nuleidimas — „Kamienas“ / „Čia viskas stovi“ vos žemiau. */
    let trunkCaptionDown = height * 0.011;
    let fallback = {
      x: width * 0.54 + nudgeRX,
      y: height * 0.72 - nudgeUY + height * 0.019 + trunkCaptionDown,
      ang: -0.12
    };
    if (!branchSegments || branchSegments.length === 0) {
      return fallback;
    }
    let sumWX = 0,
      sumWY = 0,
      sumLen = 0;
    let sumDX = 0,
      sumDY = 0;
    for (let i = 0; i < branchSegments.length; i++) {
      let b = branchSegments[i];
      if (b.zoneId !== 1) {
        continue;
      }
      let dx = b.x2 - b.x1;
      let dy = b.y2 - b.y1;
      let len = sqrt(dx * dx + dy * dy);
      if (len < 3) {
        continue;
      }
      let mx = (b.x1 + b.x2) * 0.5;
      let my = (b.y1 + b.y2) * 0.5;
      let upward = constrain((height * 0.74 - my) / max(height * 0.38, 1), 0, 1);
      let w = len * (1 + 0.52 * upward);
      sumWX += mx * w;
      sumWY += my * w;
      sumLen += w;
      let ux = dx / len;
      let uy = dy / len;
      sumDX += ux * len;
      sumDY += uy * len;
    }
    if (sumLen < 2) {
      return fallback;
    }
    let cx = sumWX / sumLen;
    let cy = sumWY / sumLen;
    let dmag = sqrt(sumDX * sumDX + sumDY * sumDY);
    let tx = sumDX / max(dmag, 1e-6);
    let ty = sumDY / max(dmag, 1e-6);
    let nx = -ty;
    let ny = tx;
    let offDist = min(54, max(30, width * 0.05));
    let px = cx + nx * offDist;
    if (px > width - 44 || px < 44) {
      nx *= -1;
      ny *= -1;
      px = cx + nx * offDist;
    }
    let py = cy + ny * (offDist * 0.2);
    px = constrain(px, width * 0.12, width * 0.88);
    py = constrain(py, height * 0.38, height * 0.86);
    px += nudgeRX;
    py -= nudgeUY;
    px = constrain(px, width * 0.1, width * 0.93);
    py = constrain(py, height * 0.32, height * 0.85);
    py += height * 0.019;
    py = constrain(py, height * 0.33, height * 0.865);
    py += trunkCaptionDown;
    py = constrain(py, height * 0.33, height * 0.878);
    let lean = constrain(atan2(tx, -ty), -0.26, 0.26);
    return { x: px, y: py, ang: lean };
  }

  if (!branchSegments || branchSegments.length === 0) {
    return { x: width * 0.5, y: height * 0.12, ang: 0 };
  }

  let tcx = width * 0.5;
  let tcy = height * 0.55;
  let sumX = 0, sumY = 0, cnt = 0;
  for (let i = 0; i < branchSegments.length; i++) {
    let b = branchSegments[i];
    if (b.zoneId !== zoneId) continue;
    sumX += (b.x1 + b.x2) * 0.5;
    sumY += (b.y1 + b.y2) * 0.5;
    cnt++;
  }
  if (cnt === 0) return { x: width * 0.5, y: height * 0.15, ang: 0 };
  let centX = sumX / cnt;
  let centY = sumY / cnt;
  let odx = centX - tcx;
  let ody = centY - tcy;
  let olen = sqrt(odx * odx + ody * ody);
  if (olen < 1) olen = 1;
  let onx = odx / olen;
  let ony = ody / olen;

  let bestProj = -Infinity, bestX = centX, bestY = centY;
  for (let i = 0; i < branchSegments.length; i++) {
    let b = branchSegments[i];
    if (b.zoneId !== zoneId) continue;
    let p1 = b.x1 * onx + b.y1 * ony;
    let p2 = b.x2 * onx + b.y2 * ony;
    if (p1 > bestProj) { bestProj = p1; bestX = b.x1; bestY = b.y1; }
    if (p2 > bestProj) { bestProj = p2; bestX = b.x2; bestY = b.y2; }
  }

  /* Arčiau šakos — mažesnis „išstūmimas“ nuo lajos (buvo per toli nuo medžio). */
  let offDist = min(58, max(34, width * 0.048));
  let px, py;
  px = constrain(bestX + onx * offDist, 12, width - 12);
  py = constrain(bestY + ony * offDist, 12, height * 0.95);
  let textAng = onx * constrain(abs(ony) * 0.50, 0, 0.40);
  return { x: px, y: py, ang: textAng };
}

/** Viršutiniai dešinieji „unified“ hintai — letter-spacing + lengvas jitter (ne medžio hover). */
function applyUnifiedHintLetterSpacing() {
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx && "letterSpacing" in ctx) {
    let fadeAge = millis() - (typeof _captionFadeStartMs !== "undefined" ? _captionFadeStartMs : 0);
    let jit = 0.006 * sin(millis() * 0.00145 + fadeAge * 0.0035);
    let base = 0.026;
    if (typeof width === "number" && width < 380) {
      base = 0.021;
    } else if (typeof width === "number" && width < 420) {
      base = 0.024;
    }
    ctx.letterSpacing = (base + jit).toFixed(4) + "em";
  }
}

/** Tas pats Playfair kaip gylio poetikai — tik unified stulpeliui (ne zonų etiketėms ant šakų). */
function applyUnifiedPoetryFontForHints() {
  if (typeof setDeepEmotionFont === "function") {
    setDeepEmotionFont();
  } else if (typeof treeCanvasFontFallback === "function") {
    textFont(treeCanvasFontFallback("deepPoeticMono"));
    textStyle(NORMAL);
  } else {
    applyCaptionUiSansFont();
  }
}

function drawZoneCaption() {
  if (millis() < deepReturnCalmUntilMs) {
    return;
  }
  if (millis() < trunkIntroCalmUntilMs) {
    return;
  }

  let title = currentCaptionTitle;
  let textBody = currentCaptionText;
  let forceShowFromHover = false;
  let captionZoneForColor = currentCaptionZone;

  let pradekTxt =
    typeof TREE_UX !== "undefined" && TREE_UX.lockedStartPrompt
      ? TREE_UX.lockedStartPrompt
      : "Pradėk nuo pagrindo";
  if (typeof lockedStartPromptFromZone === "number" && lockedStartPromptFromZone >= 2) {
    if (textBody !== pradekTxt) {
      lockedStartPromptFromZone = -1;
    } else if (millis() > currentCaptionUntilMs && !forceShowFromHover) {
      lockedStartPromptFromZone = -1;
    }
  }

  if (!title && !textBody) {
    return;
  }

  let capFadeOutMs =
    typeof CAPTION_FADE_OUT_MS !== "undefined" ? CAPTION_FADE_OUT_MS : 720;
  if (!forceShowFromHover && millis() > currentCaptionUntilMs + capFadeOutMs) {
    return;
  }
  let captionFadeOutMul = 1;
  if (!forceShowFromHover && millis() > currentCaptionUntilMs) {
    let tOut = constrain((millis() - currentCaptionUntilMs) / capFadeOutMs, 0, 1);
    captionFadeOutMul = 1 - tOut * tOut * (3 - 2 * tOut);
  }

  let captionKey =
    (title || "") +
    "|" +
    (textBody || "") +
    "|" +
    captionZoneForColor +
    "|" +
    (typeof currentCaptionEpilogue === "string" ? currentCaptionEpilogue : "");
  if (captionKey !== _lastCaptionKey) {
    _lastCaptionKey = captionKey;
    _captionFadeStartMs = millis();
  }
  let fadeAge = millis() - _captionFadeStartMs;
  let isPradekStartPrompt = textBody === pradekTxt;
  let fadeIn = isPradekStartPrompt
    ? constrain(fadeAge / 190, 0, 1)
    : constrain(fadeAge / CAPTION_FADE_IN_MS, 0, 1);
  fadeIn = fadeIn * fadeIn * (3 - 2 * fadeIn);
  let driftY = (1 - fadeIn) * (captionZoneForColor === 1 ? 26 : 4);

  let isLockedStartPrompt = isPradekStartPrompt;
  let isAsHoverCaption = hoveredZoneId === 2 && forceShowFromHover;
  let zoneColor = isLockedStartPrompt || isAsHoverCaption ? [255, 255, 255] : getCaptionZoneColor(captionZoneForColor);

  let captionPresenceMul = 0.36;
  if (isPradekStartPrompt) {
    captionPresenceMul = 0.98;
  } else if (isLockedStartPrompt) {
    captionPresenceMul = 0.88;
  } else if (isAsHoverCaption) {
    captionPresenceMul = 0.58;
  } else if (!forceShowFromHover) {
    captionPresenceMul = captionZoneForColor === 1 ? 0.82 : 0.78;
  }

  let a = min(fadeIn * 250, 250) * captionPresenceMul * captionFadeOutMul;
  let topY = height * 0.05 + driftY;
  let zForPradek =
    typeof lockedStartPromptFromZone === "number" &&
    lockedStartPromptFromZone >= 2 &&
    lockedStartPromptFromZone <= 8
      ? lockedStartPromptFromZone
      : hoveredZoneId >= 2 && hoveredZoneId <= 8
        ? hoveredZoneId
        : -1;
  let pradekOnBranch = false;
  if (isPradekStartPrompt && zForPradek >= 2) {
    let p =
      typeof getBranchHintPlacementForZone === "function"
        ? getBranchHintPlacementForZone(mouseX, mouseY, zForPradek)
        : null;
    if (p) {
      pradekOnBranch = true;
      push();
      if (typeof isOneTimeShockActive === "function" && isOneTimeShockActive()) {
        let wob = millis() * 0.081;
        translate(sin(wob) * 3.2, cos(wob * 1.31) * 2.6);
      }
      let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
      applyCaptionUiSansFont();
      noStroke();
      push();
      translate(p.x, p.y);
      rotate(0);
      if (ctx && typeof ctx.letterSpacing !== "undefined") {
        ctx.letterSpacing = "0.055em";
      }
      textAlign(CENTER, CENTER);
      let baseUi =
        typeof treeSansUiTextSizePx === "function"
          ? treeSansUiTextSizePx()
          : min(10.2, max(7.5, width * 0.0172));
      let tS = max(11, baseUi * 1.06);
      textSize(tS);
      if (ctx) {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      stroke(0, 0, 0, a * 0.42);
      strokeWeight(max(2, tS * 0.2));
      fill(252, 253, 255, a * 0.99);
      text(textBody, 0, 0);
      noStroke();
      if (ctx) {
        ctx.restore();
        ctx.letterSpacing = "0px";
      }
      pop();
      pop();
    }
  }

  if (isPradekStartPrompt) {
    if (pradekOnBranch) {
      return;
    }
    if (!textBody) {
      return;
    }
    push();
    if (typeof isOneTimeShockActive === "function" && isOneTimeShockActive()) {
      let wob = millis() * 0.081;
      translate(sin(wob) * 3.2, cos(wob * 1.31) * 2.6);
    }
    noStroke();
    applyCaptionUiSansFont();
    textAlign(CENTER, CENTER);
    let ctx2 = typeof drawingContext !== "undefined" ? drawingContext : null;
    if (ctx2) {
      ctx2.save();
      ctx2.shadowBlur = 16;
      ctx2.shadowColor = "rgba(0,0,0,0.55)";
    }
    let topFallbackY = min(height * 0.11, 110);
    let headS =
      typeof treeSansUiTextSizePx === "function"
        ? treeSansUiTextSizePx()
        : min(21, max(16, width * 0.0215));
    textSize(min(24, max(17, headS * 1.62)));
    stroke(0, 0, 0, a * 0.35);
    strokeWeight(max(2.5, headS * 0.22));
    fill(255, 255, 255, a * 0.99);
    text(textBody, width * 0.5, topFallbackY, min(width * 0.9, 720), 120);
    noStroke();
    if (ctx2) {
      ctx2.restore();
    }
    pop();
    return;
  }

  push();
  if (typeof isOneTimeShockActive === "function" && isOneTimeShockActive()) {
    let wob = millis() * 0.081;
    translate(sin(wob) * 3.2, cos(wob * 1.31) * 2.6);
  }

  noStroke();
  applyCaptionUiSansFont();
  textStyle(NORMAL);

  if (isLockedStartPrompt) {
    let lockTs = min(16, max(12, width * 0.014));
    textSize(lockTs);
    textLeading(lockTs * 1.55);
    textAlign(CENTER, TOP);
    fill(zoneColor[0], zoneColor[1], zoneColor[2], a * 0.82);
    let lockPad = width < 400 ? 14 : 18;
    let lockBoxW = min(width * 0.6, 400, width - 2 * lockPad);
    text(textBody, width * 0.5 - lockBoxW * 0.5, topY, lockBoxW, height * 0.22);
    pop();
    return;
  }

  if (captionZoneForColor === -1 && (title || textBody)) {
    let edgePad = width < 360 ? 16 : width < 400 ? 15 : width < 520 ? 12 : 9;
    let maxW = min(width - 2 * edgePad, width * 0.9, 520);
    let trunkTint = getCaptionZoneColor(1);
    let isUnifiedHintBaseline =
      typeof captionTextUsesUnifiedPoeticHintStyle === "function" &&
      captionTextUsesUnifiedPoeticHintStyle(textBody);
    let isEmotionToast =
      typeof textBody === "string" &&
      (textBody.indexOf("Nyksta greičiau") >= 0 || textBody.indexOf("Lieka ilgiau") >= 0);
    let isSecondaryUnifiedBody =
      typeof textBody === "string" &&
      (textBody.indexOf("greičiau") >= 0 ||
        textBody.indexOf("ilgiau") >= 0 ||
        textBody.indexOf("Nurimsta") >= 0);
    let y = max(height * 0.048 + driftY, height * 0.034);
    let touchCaption =
      width < 520 ||
      (typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(pointer: coarse)").matches);
    let hintAnchorX = width * 0.5;
    let yAnchorUnified = y;
    /* Vienodi viršutiniai hintai — dešinėje (klasikinė vieta); tik siaubinai siaurame — minimalus koregavimas nuo kirpimo. */
    if (isUnifiedHintBaseline) {
      textAlign(RIGHT, TOP);
      let colW = min(320, max(188, width * 0.36));
      maxW = colW;
      let colRight = width * (width < 400 ? 0.78 : 0.8);
      let hintLeft = colRight - colW;
      let minLeft = width * (width < 400 ? 0.34 : 0.36);
      hintAnchorX = max(minLeft, hintLeft);
      let bleed = touchCaption ? 10 : 8;
      if (width < 400) {
        bleed += 2;
      }
      let minAnchor = bleed + maxW;
      if (hintAnchorX < minAnchor) {
        hintAnchorX = minAnchor;
      }
      hintAnchorX = min(hintAnchorX, width - bleed);
      maxW = min(maxW, hintAnchorX - bleed);
      if (title) {
        y = max(height * 0.056 + driftY, height * 0.042);
      } else if (isEmotionToast) {
        /* Emocijos toastas — žemiau, arčiau lajos (ne „danguje“). */
        y = max(height * 0.1 + driftY, height * 0.068);
      } else {
        y = max(height * 0.05 + driftY, height * 0.038);
      }
      yAnchorUnified = y;
    } else {
      textAlign(CENTER, TOP);
    }
    let heartUnlockUnified =
      isUnifiedHintBaseline &&
      typeof captionTextIsHeartUnlockFanfare === "function" &&
      captionTextIsHeartUnlockFanfare(textBody);
    let alphaHint = isUnifiedHintBaseline ? a * (heartUnlockUnified ? 1 : 0.78) : a;
    let ctxMist = typeof drawingContext !== "undefined" ? drawingContext : null;
    let motionReduce =
      typeof prefersReducedMotionCanvas === "function" && prefersReducedMotionCanvas();
    let jitMul = (motionReduce || heartUnlockUnified) ? 0 : 1;
    if (isUnifiedHintBaseline) {
      push();
      let orgS = 0.996 + 0.004 * fadeIn;
      translate(hintAnchorX, yAnchorUnified);
      scale(orgS);
      translate(-hintAnchorX, -yAnchorUnified);
      translate(
        sin(millis() * 0.0011 + fadeAge * 0.0025) * 0.07 * jitMul,
        cos(millis() * 0.00092 + fadeAge * 0.0018) * 0.055 * jitMul
      );
      if (ctxMist && typeof ctxMist.filter !== "undefined") {
        ctxMist.filter = "blur(0.12px)";
      }
    }
    if (isUnifiedHintBaseline) {
      applyUnifiedPoetryFontForHints();
    } else {
      applyCaptionUiSansFont();
    }
    textStyle(NORMAL);
    if (isUnifiedHintBaseline) {
      applyUnifiedHintLetterSpacing();
    } else if (typeof deepUiApplyLetterSpacing === "function") {
      deepUiApplyLetterSpacing();
    }
    if (title) {
      let titleTs = min(22, max(13, width * (width < 400 ? 0.038 : 0.046)));
      if (touchCaption && isUnifiedHintBaseline) {
        titleTs = min(titleTs, max(12, width * 0.042));
      }
      textSize(titleTs);
      textLeading(titleTs * 1.25);
      let ctxT = typeof drawingContext !== "undefined" ? drawingContext : null;
      if (ctxT && isUnifiedHintBaseline) {
        ctxT.save();
        ctxT.shadowBlur = 28;
        ctxT.shadowColor = "rgba(255, 248, 238, 0.09)";
        ctxT.shadowOffsetX = 0;
        ctxT.shadowOffsetY = 1;
      }
      if (isUnifiedHintBaseline) {
        if (touchCaption) {
          noStroke();
        } else {
          stroke(0, 0, 0, alphaHint * 0.28);
          strokeWeight(max(1.6, titleTs * 0.11));
        }
        fill(
          min(255, trunkTint[0] + 28),
          min(255, trunkTint[1] + 26),
          min(255, trunkTint[2] + 22),
          alphaHint * (touchCaption ? 0.82 : 0.8)
        );
      } else {
        noStroke();
        fill(
          min(255, trunkTint[0] + 40),
          min(255, trunkTint[1] + 36),
          min(255, trunkTint[2] + 28),
          a * 0.96
        );
      }
      let titleBoxH = isUnifiedHintBaseline ? min(100, height * 0.14) : 72;
      text(title, hintAnchorX, y, maxW, titleBoxH);
      noStroke();
      if (ctxT && isUnifiedHintBaseline) {
        ctxT.restore();
      }
      y += titleTs * (isUnifiedHintBaseline ? 1.32 : 2.05);
    }
    if (textBody) {
      let bodyTs = isUnifiedHintBaseline
        ? min(20, max(13.5, width * 0.03))
        : min(12.5, max(10, width * 0.0265));
      if (heartUnlockUnified) {
        bodyTs = min(24, bodyTs * 1.2);
      }
      if (touchCaption && isUnifiedHintBaseline) {
        bodyTs = min(bodyTs, max(13, width * 0.034));
        if (heartUnlockUnified) {
          bodyTs = min(bodyTs, max(14.5, width * 0.038));
        }
      }
      if (isUnifiedHintBaseline) {
        applyUnifiedPoetryFontForHints();
      }
      textSize(bodyTs);
      textLeading(bodyTs * (isUnifiedHintBaseline ? 1.3 : 1.42));
      let ctxB = typeof drawingContext !== "undefined" ? drawingContext : null;
      if (ctxB && isUnifiedHintBaseline) {
        ctxB.save();
        let narrowTouch = touchCaption && width < 440;
        ctxB.shadowBlur = heartUnlockUnified ? (narrowTouch ? 34 : 48) : narrowTouch ? 20 : 24;
        ctxB.shadowColor = heartUnlockUnified
          ? narrowTouch
            ? "rgba(255, 248, 230, 0.3)"
            : "rgba(255, 248, 230, 0.38)"
          : "rgba(255, 244, 232, 0.08)";
        ctxB.shadowOffsetX = 0;
        ctxB.shadowOffsetY = 1;
      }
      let bodyAlphaMul = 1;
      let isHeartUnlockFan =
        typeof captionTextIsHeartUnlockFanfare === "function" &&
        captionTextIsHeartUnlockFanfare(textBody);
      if (isUnifiedHintBaseline) {
        if (isHeartUnlockFan) {
          bodyAlphaMul = 0.99;
        } else if (isEmotionToast) {
          bodyAlphaMul = 0.4;
        } else if (isSecondaryUnifiedBody) {
          bodyAlphaMul = 0.38;
        } else if (
          (typeof textBody === "string" && textBody.indexOf("Grįžti") >= 0) ||
          (typeof captionTextIsDeepFirstReturnHint === "function" &&
            captionTextIsDeepFirstReturnHint(textBody))
        ) {
          bodyAlphaMul = 0.55;
        } else {
          bodyAlphaMul = 0.66;
        }
      }
      if (isUnifiedHintBaseline) {
        if (touchCaption) {
          noStroke();
        } else {
          stroke(
            0,
            0,
            0,
            alphaHint * (isHeartUnlockFan ? 0.42 : 0.26) * min(1, bodyAlphaMul + 0.35)
          );
          strokeWeight(max(1.5, bodyTs * (isHeartUnlockFan ? 0.14 : 0.1)));
        }
        if (isHeartUnlockFan) {
          fill(255, 252, 248, alphaHint * (touchCaption ? 1 : 0.98) * bodyAlphaMul);
        } else {
          fill(228, 220, 208, alphaHint * (touchCaption ? 0.92 : 0.9) * bodyAlphaMul);
        }
      } else {
        noStroke();
        fill(220, 214, 204, a * (title ? 0.9 : 0.92));
      }
      let bodyH = title ? min(height * 0.48, 400) : min(height * 0.58, 460);
      if (isUnifiedHintBaseline) {
        let estTw = textWidth(textBody);
        let wrapW = max(10, maxW - bodyTs * 0.52);
        let estLines = max(1, ceil(estTw / wrapW));
        estLines = min(estLines + 1, 16);
        let tightH = bodyTs * (1.06 + estLines * 1.22);
        let bodyHMax = heartUnlockUnified ? 0.36 : 0.28;
        bodyH = min(height * bodyHMax, max(tightH, bodyTs * 2.08));
        if (title) {
          bodyH = min(height * (heartUnlockUnified ? 0.4 : 0.32), max(tightH, bodyTs * 2.5));
        }
      }
      text(textBody, hintAnchorX, y, maxW, bodyH);
      noStroke();
      if (ctxB && isUnifiedHintBaseline) {
        ctxB.restore();
      }
      if (isUnifiedHintBaseline) {
        y += bodyH + bodyTs * 0.16;
      } else {
        y += bodyH + bodyTs * 0.55;
      }
    }
    let ep =
      typeof currentCaptionEpilogue === "string" ? currentCaptionEpilogue.trim() : "";
    if (ep) {
      if (isUnifiedHintBaseline) {
        applyUnifiedPoetryFontForHints();
        applyUnifiedHintLetterSpacing();
      } else {
        applyCaptionUiSansFont();
        if (typeof deepUiApplyLetterSpacing === "function") {
          deepUiApplyLetterSpacing();
        }
      }
      let epTs = min(15, max(12, width * 0.032));
      textSize(epTs);
      textLeading(epTs * 1.38);
      fill(235, 228, 218, alphaHint * (isUnifiedHintBaseline ? 0.44 : 0.9));
      let epW = maxW * 0.96;
      let epX = hintAnchorX;
      text(ep, epX, y, epW, height * 0.2);
      if (typeof deepUiResetLetterSpacing === "function") {
        deepUiResetLetterSpacing();
      }
    }
    if (typeof deepUiResetLetterSpacing === "function") {
      deepUiResetLetterSpacing();
    }
    if (isUnifiedHintBaseline) {
      if (ctxMist && typeof ctxMist.filter !== "undefined") {
        ctxMist.filter = "none";
      }
      pop();
    }
    pop();
    return;
  }

  if (!title) {
    pop();
    return;
  }

  let pl2 =
    typeof getZoneLabelCompositionPlacement === "function"
      ? getZoneLabelCompositionPlacement(captionZoneForColor)
      : { x: width * 0.5, y: height * 0.22, ang: 0 };

  let slideEase = captionZoneForColor === 1 ? (1 - fadeIn) * (1 - fadeIn) : 0;
  let slideX = 0;
  let slideY = 0;

  let tsTitle =
    captionZoneForColor === 1
      ? min(19, max(12.5, width * 0.0156))
      : min(25, max(15.5, width * 0.021));

  translate(pl2.x + slideX, pl2.y + driftY + slideY);
  rotate(0);

  let ctx2 = typeof drawingContext !== "undefined" ? drawingContext : null;
  let trunkBody =
    captionZoneForColor === 1 &&
    textBody &&
    textBody.trim().length > 0 &&
    textBody.trim() !== title;

  let subFade = 1;
  if (trunkBody) {
    let subDelay = 92;
    let capIn =
      typeof CAPTION_FADE_IN_MS !== "undefined" ? CAPTION_FADE_IN_MS : 560;
    let fadeSubRaw = constrain((fadeAge - subDelay) / (capIn * 1.08), 0, 1);
    fadeSubRaw = fadeSubRaw * fadeSubRaw * (3 - 2 * fadeSubRaw);
    subFade = fadeSubRaw;
  }

  textAlign(CENTER, CENTER);

  if (captionZoneForColor === 1) {
    let tsBody = tsTitle * 0.71;
    let gap = tsTitle * 0.44;
    if (ctx2 && typeof ctx2.letterSpacing !== "undefined") {
      ctx2.letterSpacing = "0.055em";
    }
    textSize(tsTitle);
    if (ctx2) {
      ctx2.save();
      ctx2.shadowBlur = 10;
      ctx2.shadowColor = "rgba(8,10,18,0.58)";
    }
    fill(
      min(255, zoneColor[0] + 8),
      min(255, zoneColor[1] + 6),
      min(255, zoneColor[2] + 4),
      a * 0.97
    );
    text(title, 0, trunkBody ? -gap * 0.48 : 0);
    if (trunkBody) {
      textSize(tsBody);
      textLeading(tsBody * 1.38);
      if (ctx2 && typeof ctx2.letterSpacing !== "undefined") {
        ctx2.letterSpacing = "0.03em";
      }
      fill(
        min(255, zoneColor[0] + 4),
        min(255, zoneColor[1] + 3),
        min(255, zoneColor[2] + 2),
        a * subFade * 0.82
      );
      text(textBody.trim(), 0, gap * 1.03);
    }
    if (ctx2) {
      ctx2.restore();
    }
    if (ctx2 && typeof ctx2.letterSpacing !== "undefined") {
      ctx2.letterSpacing = "0px";
    }
  } else {
    textSize(tsTitle);
    if (ctx2) {
      ctx2.save();
      ctx2.shadowBlur = 11;
      ctx2.shadowColor = "rgba(0,0,0,0.62)";
    }
    fill(zoneColor[0], zoneColor[1], zoneColor[2], a);
    text(title, 0, 0);
    if (ctx2) {
      ctx2.restore();
    }
  }

  pop();
}

function drawConflictDebugHud() {
  if (!showConflictDebug) {
    return;
  }

  let hotspotCount = conflictHotspots ? conflictHotspots.length : 0;
  noStroke();
  fill(0, 170);
  rect(16, 16, 560, 104, 8);

  fill(255, 245, 140, 240);
  textAlign(LEFT, TOP);
  treeUiFont();
  textSize(14);
  text("DERINIMO TAŠKAI ĮJUNGTI", 28, 28);

  fill(220, 235, 255, 235);
  textSize(12);
  text(
    "kiekis: " + hotspotCount + " | konfliktas: " + nf(emotionConflict, 1, 2),
    28,
    50
  );
  fill(190, 255, 210, 235);
  textSize(11);
  text("dominuoja: " + ((ZONE_DATA[dominantEmotionZone] && ZONE_DATA[dominantEmotionZone].title) || "-"), 28, 66);
  fill(255, 255, 255, 210);
  textSize(10);
  let chain = lastCauseChainText || "-";
  text("grandinė: " + chain, 28, 82);
}

/** Kai visos zonos atvertos — švelnus spalvų susiliejimas fone. */
function drawFinaleHarmonyOverlay() {
  if (typeof areAllZonesOpened !== "function" || !areAllZonesOpened()) {
    return;
  }
  push();
  blendMode(SOFT_LIGHT);
  noStroke();
  let cx = width * 0.5;
  let cy = height * 0.42;
  for (let z = 2; z <= 8; z++) {
    let c = getCaptionZoneColor(z);
    let ang = (z / 8) * TWO_PI + 0.4;
    let px = cx + cos(ang) * width * 0.28;
    let py = cy + sin(ang) * height * 0.22;
    fill(c[0], c[1], c[2], 14);
    ellipse(px, py, width * 0.44, height * 0.4);
  }
  blendMode(BLEND);
  pop();
}

function drawGhostCaptionText(txt, x, y, boxW, boxH, baseColor, alpha, strength, wobbleSeed) {
  if (!txt) {
    return;
  }
  let drift = (0.4 + 1.8 * strength) * sin(millis() * 0.006 + wobbleSeed);
  x += sin(millis() * 0.00025 + wobbleSeed * 1.7) * 1.2;
  y += cos(millis() * 0.0002 + wobbleSeed * 2.3) * 0.8;
  let c1 = [255, 70, 145];
  let c2 = [120, 220, 255];

  blendMode(ADD);
  fill(c1[0], c1[1], c1[2], alpha * (0.15 + strength * 0.2));
  if (boxW && boxH) {
    text(txt, x - 1.6 - drift, y + 0.9, boxW, boxH);
  } else {
    text(txt, x - 1.6 - drift, y + 0.9);
  }
  fill(c2[0], c2[1], c2[2], alpha * (0.12 + strength * 0.18));
  if (boxW && boxH) {
    text(txt, x + 1.7 + drift, y - 0.9, boxW, boxH);
  } else {
    text(txt, x + 1.7 + drift, y - 0.9);
  }
  blendMode(BLEND);

  fill(baseColor[0], baseColor[1], baseColor[2], alpha);
  if (boxW && boxH) {
    text(txt, x, y, boxW, boxH);
  } else {
    text(txt, x, y);
  }
}

function getCaptionZoneColor(zoneId) {
  if (zoneId >= 1 && zoneId <= 8) {
    return getRuntimeZoneColor(zoneId);
  }
  return [255, 255, 255];
}

function applyTrunkEntryCalm() {
  if (typeof TRUNK_ENTRY_CALM_MS === "number" && TRUNK_ENTRY_CALM_MS <= 0) {
    return;
  }
  if (millis() > trunkIntroCalmUntilMs) {
    return;
  }

  let t = constrain((trunkIntroCalmUntilMs - millis()) / TRUNK_ENTRY_CALM_MS, 0, 1);
  noStroke();
  fill(0, 58 + 62 * t);
  rect(0, 0, width, height);
}

function triggerRevealPulse() {
  let opened = 0;

  for (let z = 1; z <= 8; z++) {
    if (zoneStage[z] === 2) {
      opened++;
    }
  }

  // Dramaturgy curve: very subtle first, aggressive near the end.
  let t = constrain(opened / 8, 0, 1);
  let curve = pow(t, 1.9);
  revealPulseStrength = 0.2 + 2.1 * curve;
  revealPulseDurationMs = floor(150 + 720 * curve);
  revealPulseUntilMs = millis() + revealPulseDurationMs;

  /* Tik horizontalus / vertikalus „plyšimas“ – be blokinio ir scanline (skaitmeninis glitch paliktas „Aš“ gilyje). */
  revealPulseMode = (revealPulseMode + 1 + floor(random(0, 2))) % 2;
}

function applyRevealPulseGlitch() {
  if (millis() > revealPulseUntilMs || revealPulseStrength <= 0) {
    return;
  }

  let p = constrain(
    (revealPulseUntilMs - millis()) / revealPulseDurationMs,
    0,
    1
  );

  let intensity = revealPulseStrength * p;
  let gMul =
    typeof getGlitchMoodMultiplier === "function"
      ? getGlitchMoodMultiplier()
      : 1;
  intensity *= gMul;
  let treeGlitchScale =
    typeof getTreeSceneDigitalGlitchScale === "function" ? getTreeSceneDigitalGlitchScale() : 0.36;
  intensity *= treeGlitchScale;
  let k = intensity * intensity;
  let frame = get();

  if (revealPulseMode === 0) {
    // Type A: horizontal tearing + split jitter.
    let dx1 = sin(frameCount * 0.71) * 28 * k;
    let dy1 = cos(frameCount * 0.57) * 10 * k;
    image(frame, dx1, dy1, width, height);

    tint(255, 180 * k);
    image(frame, -sin(frameCount * 0.49) * 20 * k, 0, width, height);

    tint(255, 150 * k);
    image(
      frame,
      sin(frameCount * 0.61) * 16 * k,
      -cos(frameCount * 0.43) * 8 * k,
      width,
      height
    );

    noTint();

    let stripCount = floor(8 + 54 * k);

    for (let i = 0; i < stripCount; i++) {
      let y = random(height);
      let h = random(2, 12);
      let shift = random(-320, 320) * k;
      copy(0, y, width, h, shift, y + random(-10, 10) * k, width, h);
    }
  } else if (revealPulseMode === 1) {
    // Type B: vertical slice shatter.
    image(frame, random(-9, 9) * k, random(-7, 7) * k, width, height);

    let sliceCount = floor(14 + 66 * k);

    for (let i = 0; i < sliceCount; i++) {
      let sx = random(width);
      let sw = random(3, 18);
      let dx = random(-420, 420) * k;
      copy(sx, 0, sw, height, sx + dx, random(-18, 18) * k, sw, height);
    }
  }

  // Shared accent bars (švelniau – mažiau „broadcast“ ant medžio).
  noStroke();

  let barCount = floor((6 + 30 * k) * 0.55);

  for (let i = 0; i < barCount; i++) {
    fill(random() < 0.5 ? color(255, 110 * k) : color(0, 130 * k));
    rect(
      random(-30, width),
      random(height),
      random(60, 220),
      random(2, 10)
    );
  }
}

/** Pyktis: antras bandymas į gylį — trumpas juodas „užsidarymas“ ant medžio. */
function drawPyktisRejectionClosureFlash() {
  if (
    typeof pyktisRejectionFlashUntilMs !== "number" ||
    millis() >= pyktisRejectionFlashUntilMs
  ) {
    return;
  }
  let dur =
    typeof pyktisRejectionFlashDurationMs === "number" && pyktisRejectionFlashDurationMs > 80
      ? pyktisRejectionFlashDurationMs
      : 780;
  let u = 1 - constrain((pyktisRejectionFlashUntilMs - millis()) / dur, 0, 1);
  let bell = sin(u * PI);
  noStroke();
  rectMode(CORNER);
  fill(8, 2, 4, 120 * bell);
  rect(0, 0, width, height);
  if (bell > 0.35) {
    stroke(190, 50, 60, 55 * bell);
    strokeWeight(1.2);
    let y = height * (0.36 + 0.22 * sin(u * TWO_PI * 1.3));
    line(0, y, width, y);
    noStroke();
  }
}

function applyFinaleChaosGlitch() {
  if (millis() > finaleGlitchUntilMs) {
    return;
  }

  let p = constrain((finaleGlitchUntilMs - millis()) / FINALE_GLITCH_MS, 0, 1);
  let treeGlitchScale =
    typeof getTreeSceneDigitalGlitchScale === "function" ? getTreeSceneDigitalGlitchScale() : 0.36;
  let intensity = (1.15 + 1.95 * p) * treeGlitchScale;
  let frame = get();

  // Violent camera wobble + scale warping.
  push();
  imageMode(CENTER);
  translate(
    width * 0.5 + random(-120, 120) * intensity,
    height * 0.5 + random(-75, 75) * intensity
  );
  rotate(random(-0.75, 0.75) * intensity);
  scale(
    1 + random(-0.85, 1.15) * intensity,
    1 + random(-0.8, 1.05) * intensity
  );
  tint(255, 190);
  image(frame, 0, 0, width, height);
  pop();
  noTint();

  // Tree-zone destruction (not only colors): massive local tearing.
  let treeZoneX = width * 0.18;
  let treeZoneY = height * 0.06;
  let treeZoneW = width * 0.64;
  let treeZoneH = height * 0.9;
  let treeFrame = get(treeZoneX, treeZoneY, treeZoneW, treeZoneH);

  let treeSliceCount = floor(70 + 240 * intensity);

  for (let i = 0; i < treeSliceCount; i++) {
    let sx = treeZoneX + random(treeZoneW);
    let sw = random(4, 32);
    let sy = treeZoneY + random(treeZoneH * 0.1);
    let sh = treeZoneH * random(0.55, 1);

    copy(
      sx,
      sy,
      sw,
      sh,
      sx + random(-760, 760) * intensity,
      sy + random(-360, 360) * intensity,
      sw,
      sh
    );
  }

  // RGB channel offsets (color breakup) layered on top.
  tint(255, 0, 0, 170 * intensity);
  image(
    treeFrame,
    treeZoneX + random(-90, 90) * intensity,
    treeZoneY + random(-48, 48) * intensity,
    treeZoneW,
    treeZoneH
  );

  tint(0, 255, 255, 150 * intensity);
  image(
    treeFrame,
    treeZoneX + random(-88, 88) * intensity,
    treeZoneY + random(-52, 52) * intensity,
    treeZoneW,
    treeZoneH
  );

  tint(255, 255, 0, 140 * intensity);
  image(
    treeFrame,
    treeZoneX + random(-84, 84) * intensity,
    treeZoneY + random(-44, 44) * intensity,
    treeZoneW,
    treeZoneH
  );

  noTint();

  // Big tearing strips.
  let stripCount = floor(70 + 210 * intensity);

  for (let i = 0; i < stripCount; i++) {
    let y = random(height);
    let h = random(2, 34);
    let shift = random(-980, 980) * intensity;
    copy(0, y, width, h, shift, y + random(-45, 45) * intensity, width, h);
  }

  // Block corruption.
  let blockCount = floor(90 + 280 * intensity);

  for (let i = 0; i < blockCount; i++) {
    let bw = random(20, 280);
    let bh = random(8, 120);
    let sx = random(width - bw);
    let sy = random(height - bh);

    copy(
      sx,
      sy,
      bw,
      bh,
      sx + random(-860, 860) * intensity,
      sy + random(-460, 460) * intensity,
      bw,
      bh
    );
  }

  // Aggressive bars and grain.
  noStroke();

  let barCount = floor(80 + 210 * intensity);

  for (let i = 0; i < barCount; i++) {
    fill(
      random(255),
      random(255),
      random(255),
      random(55, 210) * intensity
    );
    rect(
      random(-120, width),
      random(height),
      random(120, 760),
      random(2, 46)
    );
  }

  strokeWeight(1);

  let grainCount = floor(4200 + 18000 * intensity);

  for (let i = 0; i < grainCount; i++) {
    stroke(
      random(255),
      random(255),
      random(255),
      random(30, 130) * intensity
    );
    point(random(width), random(height));
  }
}

function triggerFirstClickGlitch() {
  if (firstClickGlitchDone) {
    return;
  }

  firstClickGlitchDone = true;

  // Start glitch immediately on first click.
  startupMs = millis();
  loop();
}

function triggerFirstScreenGlitch() {
  if (firstClickGlitchDone) {
    return;
  }

  firstClickGlitchDone = true;
  firstScreenGlitchUntilMs = millis() + FIRST_SCREEN_GLITCH_MS;
  loop();
}

// Per-zone emotion multiplier for bloom duration (1.0 = neutral, higher = more dramatic)
function _getZoneBloomEmotionMult(zone) {
  if (zone === 8) return 1.32;  // Pyktis: vis dar stipriausias, bet trumpesnis bloom = mažiau get/copy per kadrą
  if (zone === 5) return 1.35;  // Drama: theatrical
  if (zone === 6) return 1.20;  // Meilė: warm, wide
  if (zone === 7) return 1.15;  // Empatija
  if (zone === 4) return 1.10;  // Jautrumas
  if (zone === 3) return 1.05;  // Juokas
  return 1.0;
}

// Per-zone max morph target (how extreme branches deform at max visits)
function _getZoneMorphPeak(zone) {
  if (zone === 8) return 0.95;  // Pyktis: most extreme
  if (zone === 5) return 0.88;  // Drama
  if (zone === 4) return 0.80;  // Jautrumas: sensitive, expressive
  if (zone === 6) return 0.78;  // Meilė
  if (zone === 7) return 0.76;  // Empatija
  if (zone === 3) return 0.72;  // Juokas
  return 0.70;                  // Aš
}

// Per-zone emotion color [r,g,b] used for the bloom overlay tint
function _getZoneBloomColor(zone) {
  if (zone === 3) return [140, 210, 255];
  if (zone === 4) return [160, 195, 255];
  if (zone === 5) return [195, 120, 255];
  if (zone === 6) return [255, 155, 185];
  if (zone === 7) return [120, 240, 185];
  if (zone === 8) return [255, 72, 72];
  return [255, 255, 255];
}

let _zoneBloomDuration = new Float32Array(9);

function triggerZoneBloomWarp(zone, visits) {
  if (zone < 1 || zone > 8) return;
  if (zoneBloomUntilMs[zone] > millis()) return;

  visits = (visits | 0) || 0;
  let emotionMult = _getZoneBloomEmotionMult(zone);
  let visitBoost = 1 + 0.55 * min(visits, 5) / 5;
  let dur = ZONE_BLOOM_WARP_MS * emotionMult * visitBoost;
  _zoneBloomDuration[zone] = dur;
  zoneBloomUntilMs[zone] = millis() + dur;
  if (typeof isLooping === "function" && !isLooping()) {
    loop();
  }
}

function triggerZoneShapeMorph(zone, visits, instant) {
  if (zone < 2 || zone > 8) return;

  visits = (visits | 0) || 0;
  instant = instant === true;
  let persist =
    typeof getEmotionPersistenceSmooth === "function"
      ? getEmotionPersistenceSmooth()
      : 0.5;

  let peak = _getZoneMorphPeak(zone);
  // Viena kreivė: „gylio ekvivalentas“ — pirmas paspaudimas ≈ 3.2, kiekvienas gylio įrašas +1.
  let depthEq = visits <= 0 ? 3.2 : visits + 3.2;
  let u = constrain(depthEq / 5.35, 0, 1);
  u = u * u * (3 - 2 * u);
  let floorT = lerp(0.18, 0.32, persist);
  let newTarget = lerp(floorT, peak, u);
  newTarget = constrain(newTarget, 0.1, peak);

  if (instant) {
    let cur = zoneShapeMorphStrength[zone] || 0;
    if (cur >= newTarget - 0.0005) {
      return;
    }
    zoneShapeMorphStrength[zone] = newTarget;
    zoneShapeMorphTarget[zone] = 0;
    zoneShapeMorphFrom[zone] = newTarget;
    zoneShapeMorphStartMs[zone] = 0;
  } else {
    if (zoneShapeMorphTarget[zone] >= newTarget) {
      return;
    }
    zoneShapeMorphFrom[zone] = zoneShapeMorphStrength[zone];
    zoneShapeMorphTarget[zone] = newTarget;
    zoneShapeMorphStartMs[zone] = millis();
  }

  // Regenerate static tree cache so geometry change becomes persistent.
  treeBaseValid = false;
  treeBaseBuffer = null;
  cachedBranchSegments = null;
  cachedHoverGrid = null;
  pointerDirty = true;
  if (typeof _zoneLabelPlacementCache !== "undefined") {
    _zoneLabelPlacementCache = {};
    _zoneLabelPlacementCacheKey = "";
  }
  if (typeof isLooping === "function" && !isLooping()) {
    loop();
  }
}

function updateZoneShapeMorphAnimation() {
  let now = millis();
  let animating = false;

  for (let z = 2; z <= 8; z++) {
    let target = zoneShapeMorphTarget[z] || 0;
    if (target <= 0) {
      continue;
    }

    let startMs = zoneShapeMorphStartMs[z] || 0;
    let morphMs =
      z === 8 && typeof ZONE_SHAPE_MORPH_MS_PYKTIS === "number"
        ? ZONE_SHAPE_MORPH_MS_PYKTIS
        : typeof ZONE_SHAPE_MORPH_MS === "number"
          ? ZONE_SHAPE_MORPH_MS
          : 940;
    let t = constrain((now - startMs) / morphMs, 0, 1);
    let eased = t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
    zoneShapeMorphStrength[z] = lerp(zoneShapeMorphFrom[z] || 0, target, eased);

    if (t >= 1) {
      // Animation complete — keep strength at target but clear flag so a
      // subsequent re-entry with a higher target can re-trigger the morph.
      zoneShapeMorphTarget[z] = 0;
    } else {
      animating = true;
    }
  }

  if (animating) {
    // treeBaseValid nebegriauname kas kadrą — sketch-core morph šaka saugo buferį
    // ir pakaitomis naudoja allowMorphCacheFrame (kitaip branch() ~45×/s).
    pointerDirty = true;
    loop();
  }

  return animating;
}

function applyFirstScreenGlitch() {
  if (millis() > firstScreenGlitchUntilMs) {
    return;
  }

  let p = constrain((firstScreenGlitchUntilMs - millis()) / FIRST_SCREEN_GLITCH_MS, 0, 1);
  let k = p * p;
  k *= typeof getGlitchMoodMultiplier === "function" ? getGlitchMoodMultiplier() : 1;
  k *= typeof getTreeSceneDigitalGlitchScale === "function" ? getTreeSceneDigitalGlitchScale() : 0.36;
  let frame = get();

  image(frame, random(-16, 16) * k, random(-10, 10) * k, width, height);
  tint(255, 170 * k);
  image(frame, random(-22, 22) * k, random(-8, 8) * k, width, height);
  noTint();

  let stripCount = floor(16 + 56 * k);
  for (let i = 0; i < stripCount; i++) {
    let y = random(height);
    let h = random(2, 14);
    let dx = random(-280, 280) * k;
    copy(0, y, width, h, dx, y + random(-12, 12) * k, width, h);
  }
}

function getZoneWarpFocus(zone) {
  let scene = getTreeSceneMetrics();
  let cx = scene.cx;

  if (zone === 1) {
    return { x: cx, y: height * 0.74 };
  }

  let crownCx = scene.cx;
  let crownCy = height * 0.43;
  let crownRx = scene.w * 0.395;
  let crownRy = height * 0.275;
  let slice = constrain(zone - 2, 0, 6);
  let a = -PI + ((slice + 0.5) / 7) * TWO_PI;

  return {
    x: crownCx + cos(a) * crownRx * 0.72,
    y: crownCy + sin(a) * crownRy * 0.72
  };
}

function applyZoneBloomWarp() {
  let now = millis();
  let anyActive = false;
  let morphActive = false;
  let pyktisMorphActive = false;
  let w8Py = typeof getEmotionWeight === "function" ? getEmotionWeight(8) : 0;
  let pyktisBloomEase = w8Py > 9;

  for (let z = 2; z <= 8; z++) {
    if ((zoneShapeMorphTarget[z] || 0) > 0) {
      morphActive = true;
    }
  }
  pyktisMorphActive =
    (zoneShapeMorphTarget[8] || 0) > 0 ||
    (zoneShapeMorphStrength[8] || 0) > 0.26;

  for (let z = 1; z <= 8; z++) {
    if (now < zoneBloomUntilMs[z]) {
      anyActive = true;
      break;
    }
  }

  if (!anyActive) {
    return;
  }

  let bloomStridePyktis = pyktisBloomEase ? 5 : 3;
  let bloomBaseFrame =
    !morphActive && !pyktisMorphActive
      ? true
      : (zoneShapeMorphTarget[8] || 0) > 0
        ? (frameCount % bloomStridePyktis) === 0
        : pyktisBloomEase && pyktisMorphActive
          ? (frameCount % 6) === 0
          : (frameCount & 1) === 0;
  if (bloomBaseFrame) {
    let frame = get();
    image(frame, 0, 0);
  }

  for (let z = 1; z <= 8; z++) {
    let until = zoneBloomUntilMs[z];
    if (now >= until) continue;

    let dur = _zoneBloomDuration[z] || ZONE_BLOOM_WARP_MS;
    let t = constrain((until - now) / dur, 0, 1);
    let intensity = t * t;
    let f = getZoneWarpFocus(z);

    // Pixel-copy burst — „Aš“ (2) kelias į gylį: šiek tiek ryškesnis; kitos zonos – švelniau (skaitmeninis glitch ten).
    let emotionMult = _getZoneBloomEmotionMult(z);
    let zoneGlitchMul = z === 2 ? 1 : 0.58;
    let burst = floor((4 + 18 * intensity) * min(emotionMult, 1.4) * zoneGlitchMul);
    if (morphActive) {
      burst = max(2, floor(burst * 0.62));
    }
    if (pyktisMorphActive && z === 8) {
      burst = max(2, floor(burst * 0.38));
    }
    if (pyktisBloomEase) {
      burst = max(1, floor(burst * 0.58));
    }
    if (z === 8) {
      burst = min(burst, 13);
    }
    for (let i = 0; i < burst; i++) {
      let a = random(TWO_PI);
      let r = random(6, 80) * (1 - t * 0.55);
      let sx = f.x + cos(a) * r;
      let sy = f.y + sin(a) * r;
      let bw = random(6, 28);
      let bh = random(3, 14);
      let pushOut = random(18, 110) * intensity * emotionMult;
      let dx = sx + cos(a) * pushOut;
      let dy = sy + sin(a) * pushOut;
      copy(sx, sy, bw, bh, dx, dy, bw, bh);
    }

  }
}

function applyStartupMonochromeGlitch(progress) {
  let frame = get();
  let intensity = pow(1 - constrain(progress, 0, 1), 1.8);
  intensity *= typeof getGlitchMoodMultiplier === "function" ? getGlitchMoodMultiplier() : 1;
  intensity *= typeof getTreeSceneDigitalGlitchScale === "function" ? getTreeSceneDigitalGlitchScale() : 0.36;

  // Subtle full-frame shake.
  image(
    frame,
    random(-10, 10) * intensity,
    random(-4, 4) * intensity,
    width,
    height
  );

  // Monochrome horizontal tearing strips.
  let stripCount = floor(12 + 44 * intensity);

  for (let i = 0; i < stripCount; i++) {
    let y = random(height);
    let h = random(2, 12);
    let dx = random(-190, 190) * intensity;
    copy(0, y, width, h, dx, y + random(-3, 3) * intensity, width, h);
  }

  // Keep original glitch, plus heavy tree-only distortion during glitch window.
  let treeZoneX = width * 0.22;
  let treeZoneY = height * 0.08;
  let treeZoneW = width * 0.56;
  let treeZoneH = height * 0.9;
  let treeFrame = get(treeZoneX, treeZoneY, treeZoneW, treeZoneH);

  push();
  imageMode(CENTER);
  translate(
    width * 0.5 + random(-28, 28) * intensity,
    height * 0.56 + random(-24, 24) * intensity
  );
  rotate(random(-0.28, 0.28) * intensity);
  scale(
    1 + random(-0.45, 0.45) * intensity,
    1 + random(-0.62, 0.52) * intensity
  );
  tint(255, 215 * intensity);
  image(treeFrame, 0, 0, treeZoneW, treeZoneH);
  pop();
  noTint();

  // Aggressive vertical slice tearing over trunk/canopy.
  let sliceCount = floor(12 + 30 * intensity);

  for (let i = 0; i < sliceCount; i++) {
    let sx = width * 0.34 + random(-width * 0.16, width * 0.16);
    let sw = random(4, 22);
    let sy = height * 0.1;
    let sh = height * 0.86;

    copy(
      sx,
      sy,
      sw,
      sh,
      sx + random(-145, 145) * intensity,
      sy + random(-48, 48) * intensity,
      sw,
      sh
    );
  }

  // Black/white jagged bars similar to TV static glitch.
  noStroke();

  let barCount = floor(6 + 22 * intensity);

  for (let i = 0; i < barCount; i++) {
    fill(random() < 0.5 ? color(255, 130 * intensity) : color(0, 145 * intensity));
    rect(
      random(-30, width),
      random(height),
      random(80, 330),
      random(2, 14)
    );
  }

  // Grain noise points.
  strokeWeight(1);

  let grainCount = floor(120 + 380 * intensity);

  for (let i = 0; i < grainCount; i++) {
    stroke(random() < 0.5 ? color(255, 55 * intensity) : color(0, 58 * intensity));
    point(random(width), random(height));
  }

  // Fine scanlines (švelniau – mažiau „CRT“ ant bendros scenos).
  stroke(255, 22 * intensity);

  for (let y = 0; y < height; y += 6) {
    line(0, y, width, y + random(-1, 1) * intensity);
  }

  // Soft blend back to normal near the end.
  if (progress > 0.6) {
    let fade = map(progress, 0.6, 1, 0, 65, true);
    noStroke();
    fill(0, fade);
    rect(0, 0, width, height);
  }
}

function drawInteractiveAura() {
  if (millis() < deepReturnCalmUntilMs) {
    return;
  }
  if (millis() < trunkIntroCalmUntilMs) {
    return;
  }
  if (mouseX < 0 || mouseY < 0 || mouseX > width || mouseY > height) {
    return;
  }

  let st =
    hoveredZoneId >= 1 &&
    hoveredZoneId <= 8 &&
    typeof zoneStage !== "undefined"
      ? zoneStage[hoveredZoneId] | 0
      : 0;
  /* 0 = hover (švelni aura + pulsas); 1 = pasirinkta — aiškesnis „laukia antro paspaudimo“ žiedas. */
  let breathe = 0.5 + 0.5 * sin(millis() * 0.0044 + hoveredZoneId * 0.31);
  let auraR = st === 1 ? 28 + breathe * 5 : 20 + breathe * 5;
  let c = [220, 232, 255];

  if (hoveredZoneId >= 1 && hoveredZoneId <= 8) {
    c = getRuntimeZoneColor(hoveredZoneId);
  }

  noStroke();
  blendMode(ADD);
  if (st === 1) {
    fill(c[0], c[1], c[2], 30 + breathe * 11);
    circle(mouseX, mouseY, auraR * 2.2);
    fill(255, 245, 248, 24 + breathe * 9);
    circle(mouseX, mouseY, auraR * 1.14);
  } else {
    fill(c[0], c[1], c[2], 20 + breathe * 12);
    circle(mouseX, mouseY, auraR * 2.08);
    fill(255, 255, 255, 17 + breathe * 10);
    circle(mouseX, mouseY, auraR * 1.08);
  }
  blendMode(BLEND);
}

function drawEntryPhraseOverlay() {
  _entryAtraskHit = null;
  noStroke();
  fill(11, 9, 8);
  rect(0, 0, width, height);
  let t = millis() - sessionEntryStartMs;
  let smooth01 = function (x) {
    x = constrain(x, 0, 1);
    return x * x * (3 - 2 * x);
  };
  let fadeAll = smooth01(t / 520);
  let fadeTop = smooth01(t / 440);
  let fadeHero = smooth01((t - 110) / 520);
  let fadeBot = smooth01((t - 260) / 520);

  let tm = millis() * 0.00038;
  let mxN = 0;
  let myN = 0;
  if (
    typeof mouseX === "number" &&
    typeof mouseY === "number" &&
    typeof width === "number" &&
    typeof height === "number" &&
    width > 0 &&
    height > 0 &&
    mouseX >= 0 &&
    mouseX <= width &&
    mouseY >= 0 &&
    mouseY <= height
  ) {
    mxN = (mouseX / width - 0.5) * 2;
    myN = (mouseY / height - 0.5) * 2;
  }

  let driftTopX = sin(tm * 0.68) * 5 + mxN * 12;
  let driftTopY = cos(tm * 0.52) * 4 + myN * 9;
  let driftHeroX = sin(tm * 0.41 + 1.2) * 6 - mxN * 20;
  let driftHeroY = cos(tm * 0.58 + 0.35) * 5 - myN * 14;
  let driftBotX = sin(tm * 0.49 + 2.1) * 4 + mxN * 10;
  let driftBotY = cos(tm * 0.44 + 2.8) * 4 + myN * 8;

  let topLeft =
    typeof NARRATIVE_ENTRY_TOP_LEFT !== "undefined" ? NARRATIVE_ENTRY_TOP_LEFT : "Čia";
  let heroLine =
    typeof NARRATIVE_ENTRY_HERO_LINE !== "undefined"
      ? NARRATIVE_ENTRY_HERO_LINE
      : typeof ENTRY_PHRASE_TEXT !== "undefined"
        ? ENTRY_PHRASE_TEXT
        : "viskas prasideda";
  let bottomLine =
    typeof NARRATIVE_ENTRY_SUBTEXT !== "undefined" ? NARRATIVE_ENTRY_SUBTEXT : "";

  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;

  let mouseHeroD = dist(mouseX, mouseY, width * 0.7, height * 0.42);
  let mouseHeroBoost = constrain(map(mouseHeroD, width * 0.52, width * 0.11, 0, 0.26), 0, 0.26);

  textFont(treeCanvasFontFallback("entryPhraseSmall"));
  textStyle(NORMAL);
  let tsTop = min(32, max(24, width * 0.042));
  textSize(tsTop);
  if (ctx) {
    ctx.save();
    ctx.letterSpacing = "0.06em";
    ctx.shadowBlur = 22;
    ctx.shadowColor = "rgba(255, 248, 242, 0.2)";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 1;
  }
  textAlign(LEFT, TOP);
  let padTop = max(8, min(16, width * 0.038));
  let topX = constrain(width * 0.12 + driftTopX, padTop, width * 0.42);
  let topY = height * 0.16 + driftTopY;
  fill(255, 255, 255, 255 * fadeTop * fadeAll * 0.88);
  text(topLeft, topX, topY);
  if (ctx) {
    ctx.restore();
  }

  textFont(treeCanvasFontFallback("entryPhraseHero"));
  textStyle(BOLD);
  let heroTs = min(94, max(68, width * 0.126));
  let displayHero = heroLine;
  let sp = heroLine.indexOf(" ");
  if (width < 680 && sp > 0) {
    displayHero = heroLine.slice(0, sp) + "\n" + heroLine.slice(sp + 1);
  }
  let padHero = max(10, min(18, width * 0.042));
  let maxHeroW = min(width * 0.5, width - 2 * padHero - 8);
  textSize(heroTs);
  textLeading(heroTs * 1.08);
  let minHeroTs = width < 380 ? 30 : width < 420 ? 36 : 44;
  while (heroTs > minHeroTs) {
    textSize(heroTs);
    textLeading(heroTs * 1.08);
    let lines = displayHero.split("\n");
    let ok = true;
    for (let li = 0; li < lines.length; li++) {
      if (textWidth(lines[li]) > maxHeroW) {
        ok = false;
      }
    }
    if (ok) {
      break;
    }
    heroTs -= 1;
  }
  if (ctx) {
    ctx.save();
    ctx.letterSpacing = "0.02em";
    ctx.shadowBlur = 32;
    ctx.shadowColor = "rgba(255, 248, 242, 0.24)";
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
  }
  textAlign(RIGHT, CENTER);
  let linesMeasure = displayHero.split("\n");
  let maxLineW = 0;
  for (let liM = 0; liM < linesMeasure.length; liM++) {
    maxLineW = max(maxLineW, textWidth(linesMeasure[liM]));
  }
  let heroX = width * 0.88 + driftHeroX;
  heroX = constrain(heroX, padHero + maxLineW + heroTs * 0.15, width - padHero);
  let heroY = height * 0.42 + driftHeroY;
  let boardPinTopX = topX + tsTop * 0.58;
  let boardPinTopY = topY + tsTop * 0.5;
  let boardPinHeroX = heroX - min(width * 0.12, 138);
  let boardPinHeroY = heroY + heroTs * 0.08;
  fill(255, 255, 255, 255 * fadeHero * fadeAll * (0.82 + mouseHeroBoost));
  text(displayHero, heroX, heroY);
  fill(248, 232, 216, 255 * fadeHero * fadeAll * 0.24);
  text(displayHero, heroX - heroTs * 0.08, heroY + heroTs * 0.16);
  if (ctx) {
    ctx.restore();
  }

  if (bottomLine) {
    textFont(treeCanvasFontFallback("entryPhraseSmall"));
    textStyle(NORMAL);
    let tsBot = min(18, max(14, width * 0.024));
    textSize(tsBot);
    let maxBotW = width * 0.72;
    while (tsBot > 11 && textWidth(bottomLine) > maxBotW) {
      tsBot -= 1;
      textSize(tsBot);
    }
    if (ctx) {
      ctx.save();
      ctx.letterSpacing = "0.04em";
      ctx.shadowBlur = 16;
      ctx.shadowColor = "rgba(255, 248, 242, 0.12)";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
    }
    textAlign(LEFT, BASELINE);
    let botX = width * 0.12 + driftBotX;
    let botY = height * 0.78 + driftBotY;
    let atraskWord = "Atrask";
    let hasAtraskPrefix = bottomLine.indexOf(atraskWord) === 0;
    let remainder = hasAtraskPrefix
      ? bottomLine.slice(atraskWord.length)
      : ", kaip viskas susiję";
    let mouseBotD = dist(mouseX, mouseY, botX + width * 0.18, botY - tsBot * 0.2);
    let mouseBotBoost = constrain(map(mouseBotD, width * 0.5, width * 0.1, 0, 0.28), 0, 0.28);
    let atraskW = textWidth(atraskWord);
    let remX = botX + atraskW + tsBot * 0.32;
    let overAtrask =
      mouseX >= botX - tsBot * 0.28 &&
      mouseX <= botX + atraskW + tsBot * 0.35 &&
      mouseY >= botY - tsBot * 1.08 &&
      mouseY <= botY + tsBot * 0.4;
    _entryAtraskHit = {
      l: botX - tsBot * 0.32,
      t: botY - tsBot * 1.15,
      r: botX + atraskW + tsBot * 0.42,
      b: botY + tsBot * 0.45
    };
    if (overAtrask) {
      cursor(HAND);
    }

    let boardPinBotX = botX + atraskW * 0.42;
    let boardPinBotY = botY - tsBot * 0.52;
    stroke(214, 62, 62, 58 * fadeAll);
    strokeWeight(1.45);
    line(boardPinTopX, boardPinTopY, boardPinHeroX, boardPinHeroY);
    line(boardPinHeroX, boardPinHeroY, boardPinBotX, boardPinBotY);
    line(boardPinTopX + tsTop * 0.18, boardPinTopY + tsTop * 0.22, boardPinBotX, boardPinBotY);
    noStroke();
    fill(228, 214, 198, 110 * fadeAll);
    circle(boardPinTopX, boardPinTopY, 5.5);
    circle(boardPinHeroX, boardPinHeroY, 6.5);
    circle(boardPinBotX, boardPinBotY, 5.8);

    let atrShine = 0.5 + 0.5 * sin(millis() * 0.0036);
    let atrGlim = 0.5 + 0.5 * sin(millis() * 0.007 + 0.9);
    let atrBaseA = 255 * fadeBot * fadeAll;
    textAlign(LEFT, BASELINE);
    let haloR = tsBot * (0.55 + 0.35 * atrShine);
    let nHalo = 8;
    for (let hk = 0; hk < nHalo; hk++) {
      let ang = (hk / nHalo) * TWO_PI + millis() * 0.00115;
      let dx = cos(ang) * haloR;
      let dy = sin(ang) * haloR * 0.72;
      fill(255, 244, 224, atrBaseA * (0.045 + 0.055 * atrGlim));
      text(atraskWord, botX + dx, botY + dy);
    }
    if (ctx) {
      ctx.save();
      ctx.shadowBlur = 28 + 26 * atrShine + 14 * atrGlim;
      ctx.shadowColor = "rgba(255, 232, 200, " + (0.52 + 0.38 * atrGlim) + ")";
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    fill(
      lerp(232, 255, 0.22 + 0.28 * atrShine),
      lerp(220, 252, 0.2 + 0.26 * atrShine),
      lerp(198, 245, 0.18 + 0.24 * atrShine),
      atrBaseA * (0.82 + 0.16 * atrShine + mouseBotBoost)
    );
    text(atraskWord, botX, botY);
    if (ctx) {
      ctx.restore();
    }
    stroke(255, 238, 214, atrBaseA * (0.28 + 0.42 * atrShine));
    strokeWeight(max(1.05, tsBot * 0.11));
    line(botX - tsBot * 0.12, botY + tsBot * 0.32, botX + atraskW + tsBot * 0.12, botY + tsBot * 0.32);
    noStroke();
    fill(214, 202, 188, 255 * fadeBot * fadeAll * 0.76);
    text(remainder, remX, botY);
    if (ctx) {
      ctx.restore();
    }
  }
}

function isOverEntryAtraskPrompt(px, py) {
  if (!_entryAtraskHit) {
    return false;
  }
  return (
    px >= _entryAtraskHit.l &&
    px <= _entryAtraskHit.r &&
    py >= _entryAtraskHit.t &&
    py <= _entryAtraskHit.b
  );
}

function startEntryFromAtraskClick() {
  if (typeof dismissEntryPhraseFromAtrask === "function") {
    return dismissEntryPhraseFromAtrask();
  }
  if (typeof sceneRevealStartMs === "number" && sceneRevealStartMs < 0) {
    sceneRevealStartMs = millis();
  }
  return true;
}

function applyOneTimeShockGlitch() {
  if (typeof isOneTimeShockActive !== "function" || !isOneTimeShockActive()) {
    return;
  }
  let raw = (millis() - oneTimeShockStartAtMs) / ONE_TIME_SHOCK_MS;
  let p = constrain(raw, 0, 1);
  let shockScale =
    typeof getTreeSceneDigitalGlitchScale === "function" ? getTreeSceneDigitalGlitchScale() : 0.36;
  let snap = get();
  let slices = 18;
  let sliceH = height / slices;
  randomSeed(oneTimeShockStartAtMs);
  for (let i = 0; i < slices; i++) {
    let y = i * sliceH;
    let off = (noise(i * 0.6, millis() * 0.038) - 0.5) * 28 * shockScale * (1 - p * 0.55);
    copy(snap, 0, y, width, sliceH + 1, off, y, width, sliceH + 1);
  }
  blendMode(ADD);
  stroke(255, 32 * (1 - p) * shockScale);
  strokeWeight(0.5);
  randomSeed(oneTimeShockStartAtMs + 7);
  let sparkN = max(4, floor(24 * shockScale));
  for (let i = 0; i < sparkN; i++) {
    line(random(width), random(height), random(width), random(height));
  }
  blendMode(BLEND);
}

function startAsBreakSequence() {
  asBreakSequenceActive = true;
  asBreakStartMs = millis();
  asStopPromptVisible = false;
  if (typeof asBreakExitCalmStartMs !== "undefined") {
    asBreakExitCalmStartMs = -1;
  }

  for (let z = 2; z <= 8; z++) {
    zoneShapeMorphTarget[z] = 1;
    zoneShapeMorphFrom[z] = zoneShapeMorphStrength[z] || 0;
    zoneShapeMorphStartMs[z] = millis();
  }

  currentView = "tree";
  focusedZone = -1;
  treeBaseValid = false;
  cachedBranchSegments = null;
  cachedHoverGrid = null;
  loop();
}

function applyAsBreakSequenceChaos() {
  if (!asBreakSequenceActive || currentView !== "tree") {
    return;
  }

  let elapsed = millis() - asBreakStartMs;
  if (elapsed >= AS_BREAK_WAIT_MS) {
    asStopPromptVisible = true;
  }

  treeBaseValid = false;
  for (let z = 2; z <= 8; z++) {
    zoneShapeMorphStrength[z] = 0.5 + 0.5 * sin(millis() * 0.005 + z * 0.8);
  }
  for (let z = 2; z <= 8; z++) {
    outerZoneLeafGrowth[z] = max(0, (outerZoneLeafGrowth[z] || 0) - 0.01);
  }

  let k = 0.55 + 0.45 * (0.5 + 0.5 * sin(millis() * 0.013));
  let frame = get();

  // Strong tree-region distortion (not only color split).
  let treeX = width * 0.16;
  let treeY = height * 0.06;
  let treeW = width * 0.68;
  let treeH = height * 0.9;
  let treeFrame = get(treeX, treeY, treeW, treeH);

  push();
  imageMode(CENTER);
  translate(
    treeX + treeW * 0.5 + sin(frameCount * 0.41) * 26 * k,
    treeY + treeH * 0.5 + cos(frameCount * 0.33) * 18 * k
  );
  rotate(sin(frameCount * 0.18) * 0.08 * k);
  scale(1 + 0.18 * k, 1 - 0.14 * k);
  tint(255, 170);
  image(treeFrame, 0, 0, treeW, treeH);
  pop();
  noTint();

  let treeSliceCount = floor(24 + 68 * k);
  for (let i = 0; i < treeSliceCount; i++) {
    let sx = treeX + random(treeW);
    let sw = random(3, 20);
    let sy = treeY + random(treeH * 0.1);
    let sh = treeH * random(0.52, 1);
    copy(
      sx,
      sy,
      sw,
      sh,
      sx + random(-280, 280) * k,
      sy + random(-140, 140) * k,
      sw,
      sh
    );
  }

  tint(255, 100 * k);
  image(frame, sin(frameCount * 0.31) * 11 * k, cos(frameCount * 0.23) * 7 * k, width, height);
  tint(255, 0, 130, 56 * k);
  image(frame, sin(frameCount * 0.27) * 17 * k, 0, width, height);
  tint(0, 220, 255, 52 * k);
  image(frame, -sin(frameCount * 0.29) * 15 * k, 0, width, height);
  noTint();

  let stripCount = floor(16 + 34 * k);
  for (let i = 0; i < stripCount; i++) {
    let y = random(height * 0.08, height * 0.95);
    let h = random(1.5, 9);
    let dx = random(-220, 220) * k;
    copy(0, y, width, h, dx, y + random(-6, 6) * k, width, h);
  }

  // Rule-break layer: occasional inversion flashes.
  blendMode(DIFFERENCE);
  noStroke();
  fill(255, random(22, 68) * k);
  rect(0, 0, width, height);
  blendMode(BLEND);
}

function drawAsBreakCrypticOverlay(k) {
  let tokens = [
    "AS", "NULL", "VOID", "RIBA", "MEM", "SIGMA", "DELTA", "WHO",
    "ERROR", "GLITCH", "0101", "X", "?", "#", "//", "KAITA"
  ];
  let t = millis() * 0.001;
  let cols = max(18, floor(width / 90));
  let rows = max(11, floor(height / 58));
  let cw = width / cols;
  let ch = height / rows;

  textAlign(CENTER, CENTER);
  if (typeof setUiSansFont === "function") {
    setUiSansFont();
  } else if (typeof fontUI_clean === "function") {
    fontUI_clean();
  } else if (typeof treeCanvasFontFallback === "function") {
    textFont(treeCanvasFontFallback("uiSans"));
    textStyle(NORMAL);
  }
  noStroke();

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      let wave = abs(sin((gx + 1.4) * 1.7 + (gy + 0.7) * 1.1 + t * (7 + 3 * k)));
      let txt = tokens[floor(wave * tokens.length) % tokens.length];
      let pulse = 0.5 + 0.5 * sin(t * 11 + gx * 0.8 + gy * 0.55);
      let jx = sin(t * 17 + gx * 1.3 + gy * 0.4) * 7 * (0.7 + k);
      let jy = cos(t * 13 + gx * 0.45 + gy * 1.05) * 6 * (0.7 + k);
      let x = gx * cw + cw * 0.5 + jx;
      let y = gy * ch + ch * 0.5 + jy;
      let s = min(26, max(11, cw * (0.2 + 0.2 * pulse)));
      let a = (42 + 130 * pulse) * (0.7 + k * 0.6);

      textSize(s);
      fill(255, 40, 130, a * 0.44);
      text(txt, x - 2.5, y + 1.5);
      fill(0, 220, 255, a * 0.4);
      text(txt, x + 2.5, y - 1.5);
      fill(255, 255, 255, a * 0.56);
      text(txt, x, y);
    }
  }
}

function getRuntimeZoneColor(zoneId) {
  let idx = constrain(zoneId - 1, 0, BRANCH_COLORS.length - 1);
  let base = BRANCH_COLORS[idx];
  let emotion = typeof getEmotionWeight === "function" ? getEmotionWeight(zoneId) : 0;
  let t = millis() * 0.0016 + zoneId * 0.8;
  let warmth = sin(t * 0.91) * (6 + emotion * 1.9);
  let cool = cos(t * 1.13) * (5 + emotion * 1.3);
  return [
    constrain(base[0] + warmth, 0, 255),
    constrain(base[1] + cool * 0.5, 0, 255),
    constrain(base[2] - warmth * 0.32 + cool, 0, 255)
  ];
}

/**
 * „Nepergyvenk…“ — Playfair (`deepPoeticMono`).
 * @param {boolean} [asDeepQuiet] — „Aš“ gylyje: tylesnis, kad nedarytų konkurencijos su EKG.
 */
function drawNepergyvenkCalmPhraseWithFade(fade, centerY, asDeepQuiet) {
  if (fade <= 0) {
    return;
  }
  let soft = 0.5 + 0.5 * sin(millis() * 0.01);
  let cx =
    typeof getAsDeepTreeCenterX === "function" ? getAsDeepTreeCenterX() : width * 0.5;
  let y =
    centerY !== undefined && centerY !== null
      ? centerY
      : height * 0.5 + min(58, height * 0.054);
  let ts = asDeepQuiet
    ? 18
    : typeof getAsDeepNepergyvenkFontSize === "function"
      ? getAsDeepNepergyvenkFontSize()
      : min(22, max(13, width * 0.015));
  let phrase =
    typeof getAsDeepNepergyvenkPhraseText === "function"
      ? getAsDeepNepergyvenkPhraseText()
      : "Nepergyvenk, klaidos \u2013\ngyvenimo dalis";
  if (asDeepQuiet && typeof distortCrypticText === "function" && frameCount % 3 === 0) {
    let cLevel = 0.06 + 0.24 * constrain(fade, 0, 1);
    phrase = distortCrypticText(phrase, cLevel);
  }
  noStroke();
  rectMode(CORNER);
  blendMode(BLEND);
  textAlign(CENTER, CENTER);
  textFont(treeCanvasFontFallback("deepPoeticMono"));
  textSize(ts);
  textLeading(ts * 1.22);
  /* „Aš“ ramioje fazėje — Playfair italic; kitur — stačias. */
  if (asDeepQuiet) {
    textStyle(ITALIC);
  } else {
    textStyle(NORMAL);
  }
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx) {
    ctx.save();
    if ("letterSpacing" in ctx) {
      ctx.letterSpacing = "0px";
    }
    if (asDeepQuiet) {
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(230, 220, 220, 0.12)";
    } else {
      ctx.shadowBlur = 16 + 10 * soft;
      ctx.shadowColor = "rgba(255, 250, 255, 0.35)";
    }
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  if (asDeepQuiet) {
    let g = 0.5 + 0.5 * sin(millis() * 0.022 + frameCount * 0.17);
    let dx = sin(frameCount * 0.31) * (0.35 + 0.55 * g);
    let dy = cos(frameCount * 0.23) * (0.22 + 0.38 * g);
    blendMode(ADD);
    fill(255, 90, 160, (12 + 14 * g) * fade);
    text(phrase, cx - 0.65 - dx, y + 0.35 + dy);
    fill(110, 220, 255, (10 + 12 * g) * fade);
    text(phrase, cx + 0.65 + dx, y - 0.35 - dy);
    blendMode(BLEND);
    fill(244, 236, 230, (172 + 42 * g) * fade);
  } else {
    fill(255, 255, 255, (206 + 40 * soft) * fade);
  }
  text(phrase, cx, y);
  if (ctx) {
    ctx.restore();
  }
  textStyle("normal");
}

/** AS zona 2, 3-ioji gylio fazė — po 404/KLAIDA, prieš „Sulaužyti“. */
function drawAsDeepPhase3CalmPhraseOverlay() {
  if (focusedZone !== 2 || currentView !== "deep") {
    return;
  }
  let phraseDelay =
    typeof AS_BREAK_PHRASE_DELAY_MS !== "undefined"
      ? AS_BREAK_PHRASE_DELAY_MS
      : 2200;
  let phase2End =
    typeof AS_PHASE_2_MS !== "undefined" ? AS_PHASE_2_MS : 6000;
  let loadTotal =
    typeof AS_DEEP_LOAD_MS !== "undefined" ? AS_DEEP_LOAD_MS : 14000;
  let pPhraseOn = (phase2End + phraseDelay) / max(1, loadTotal);
  let prog =
    typeof getAsDeepProgress === "function"
      ? getAsDeepProgress()
      : typeof getAsDeepLoadProgress === "function"
        ? getAsDeepLoadProgress()
        : constrain(
            (typeof asDeepLoadCommittedMs === "number" ? asDeepLoadCommittedMs : 0) /
              max(1, loadTotal),
            0,
            1
          );
  if (prog < pPhraseOn) {
    return;
  }
  let h =
    typeof asDeepLoadCommittedMs !== "undefined" ? asDeepLoadCommittedMs : 0;
  let tPhrase = h - (phase2End + phraseDelay);
  let fadeIn = constrain(tPhrase / 480, 0, 1);
  let phraseY =
    typeof getAsDeepCenterPhraseY === "function"
      ? getAsDeepCenterPhraseY()
      : height * 0.395;
  drawNepergyvenkCalmPhraseWithFade(fadeIn, phraseY, true);
}

/** Atnaujinama `drawAsStopPrompt` — pataikymas į du fragmentus + glow. */
let _asStopPromptHit = null;

function drawAsStopPrompt() {
  if (!asBreakSequenceActive || !asStopPromptVisible || currentView !== "tree") {
    _asStopPromptHit = null;
    return;
  }

  let cx = width * 0.5;
  let cy = height * 0.52;
  let pulse = 0.5 + 0.5 * sin(millis() * 0.012);
  let glitch = 0.5 + 0.5 * sin(millis() * 0.045 + frameCount * 0.11);
  let flick = 0.5 + 0.5 * sin(millis() * 0.087 + frameCount * 0.27);
  let L1 = "Sustab";
  let L2 = "dyti";
  if (typeof distortSystemLabelText === "function") {
    let d = 0.22 + glitch * 0.7;
    if (frameCount % 2 === 0) {
      L1 = distortSystemLabelText(L1, d);
      L2 = distortSystemLabelText(L2, d * 1.02);
    }
  } else if (frameCount % 3 === 0) {
    L1 = L1.replace("a", frameCount % 6 === 0 ? "4" : "A");
    L2 = L2.replace("y", "Y");
  }
  let dx = sin(frameCount * 0.37) * (1.2 + 3.5 * glitch);
  let dy = cos(frameCount * 0.29) * (0.8 + 2.2 * glitch);
  let ts = min(96, max(44, width * 0.065));

  noStroke();
  textAlign(CENTER, CENTER);
  if (typeof setUiSansFontMedium === "function") {
    setUiSansFontMedium();
  } else if (typeof treeCanvasFontFallback === "function") {
    textFont(treeCanvasFontFallback("uiSansMedium"));
    textStyle(BOLD);
  } else {
    textFont(typeof FONT_SANS !== "undefined" ? FONT_SANS : "Inter");
    textStyle(BOLD);
  }
  textSize(ts);

  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx) {
    ctx.save();
    if (typeof ctx.letterSpacing !== "undefined") {
      ctx.letterSpacing = "0.08em";
    }
    if (typeof ctx.wordSpacing !== "undefined") {
      ctx.wordSpacing = "0.025em";
    }
  }

  let w1 = textWidth(L1);
  let w2 = textWidth(L2);
  let x1 = cx - min(102, width * 0.128) - w1 * 0.06;
  let y1 = cy - ts * 0.26;
  let x2 = cx + min(92, width * 0.115) + w2 * 0.05;
  let y2 = cy + ts * 0.3;

  function drawStopChunk(txt) {
    push();
    scale(1.035, 1);
    noStroke();
    blendMode(ADD);
    fill(255, 95, 165, 18 + 26 * glitch);
    text(txt, -4 - dx, 1.5 + dy);
    fill(175, 130, 235, 16 + 24 * glitch);
    text(txt, 4 + dx, -1.5 - dy);
    if (frameCount % 2 === 0) {
      fill(255, 70, 145, (10 + 20 * glitch) * flick);
      text(txt, -9 - dx * 1.25, 2.4 + dy * 1.1);
      fill(90, 220, 255, (10 + 18 * glitch) * flick);
      text(txt, 9 + dx * 1.25, -2.4 - dy * 1.1);
    }
    blendMode(BLEND);
    fill(255, 255, 255, 108 + 56 * pulse);
    text(txt, 0, 0);
    if (frameCount % 4 === 0) {
      fill(255, 255, 255, 14 + 20 * glitch);
      text(txt, sin(frameCount * 0.41) * 1.2, cos(frameCount * 0.37) * 0.9);
    }
    pop();
  }

  push();
  translate(x1, y1);
  drawStopChunk(L1);
  pop();
  push();
  translate(x2, y2);
  drawStopChunk(L2);
  pop();

  if (ctx) {
    ctx.restore();
  }

  textStyle(NORMAL);

  let pad = ts * 0.42;
  let half = ts * 0.52;
  _asStopPromptHit = {
    l: min(x1 - w1 * 0.5, x2 - w2 * 0.5) - pad,
    r: max(x1 + w1 * 0.5, x2 + w2 * 0.5) + pad,
    t: min(y1, y2) - half - pad,
    b: max(y1, y2) + half + pad
  };
}

function isOverAsStopPrompt(px, py) {
  let x = width * 0.5;
  let y = height * 0.52;
  let glowR = min(width * 0.34, 420);
  let inGlow = dist(px, py, x, y) <= glowR * 0.62;
  if (_asStopPromptHit) {
    let h = _asStopPromptHit;
    let inSplit =
      px >= h.l && px <= h.r && py >= h.t && py <= h.b;
    return inSplit || inGlow;
  }
  let w = min(width * 0.84, 880);
  let hh = min(height * 0.28, 230);
  let inRect =
    px >= x - w * 0.5 && px <= x + w * 0.5 && py >= y - hh * 0.5 && py <= y + hh * 0.5;
  return inRect || inGlow;
}

function drawAsBreakExitCalmOverlay() {
  if (typeof asBreakExitCalmStartMs === "undefined" || asBreakExitCalmStartMs < 0) {
    return;
  }
  let dur =
    typeof AS_BREAK_EXIT_CALM_MS !== "undefined" ? AS_BREAK_EXIT_CALM_MS : 1400;
  let age = millis() - asBreakExitCalmStartMs;
  if (age >= dur) {
    asBreakExitCalmStartMs = -1;
    return;
  }
  let fade = 1 - age / dur;
  fade = fade * fade;
  push();
  rectMode(CORNER);
  noStroke();
  if (
    typeof drawingContext !== "undefined" &&
    drawingContext &&
    typeof drawingContext.createRadialGradient === "function"
  ) {
    let cx = width * 0.5;
    let cy = height * 0.4;
    let r = max(width, height) * 0.78;
    let g = drawingContext.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, "rgba(18,22,38," + fade * 0.05 + ")");
    g.addColorStop(0.45, "rgba(10,14,26," + fade * 0.34 + ")");
    g.addColorStop(1, "rgba(4,6,16," + fade * 0.62 + ")");
    drawingContext.fillStyle = g;
    drawingContext.fillRect(0, 0, width, height);
  } else {
    fill(8, 12, 22, fade * 72);
    rect(0, 0, width, height);
  }
  pop();
}

function stopAsBreakSequenceAndReset() {
  /** Emocijų atmintis (emotionWeight, ghostImprint, localStorage) lieka — visa kita kaip nauja sesija: zonos „neuždažytos“, etapai nuo nulio. */
  initZoneFillStates();

  if (typeof deepZoneEntryCount !== "undefined") {
    deepZoneEntryCount.fill(0);
  }
  if (typeof lockedStartPromptFromZone !== "undefined") {
    lockedStartPromptFromZone = -1;
  }

  currentView = "tree";
  focusedZone = -1;
  deepInitialized = false;
  deepZoneSeeds = {};
  deepZoneGrowth = Array(9).fill(0);
  growthProgress = 0;
  deepGrowthProgress = 0;
  if (typeof pyktisAngerCharge !== "undefined") {
    pyktisAngerCharge = 0;
  }
  if (typeof pyktisExplosionFramesLeft !== "undefined") {
    pyktisExplosionFramesLeft = 0;
  }
  if (typeof pyktisPrevCharge !== "undefined") {
    pyktisPrevCharge = 0;
  }
  if (typeof pyktisPostBreakCalm !== "undefined") {
    pyktisPostBreakCalm = false;
  }
  if (typeof pyktisDeepBrokenLatched !== "undefined") {
    pyktisDeepBrokenLatched = false;
  }
  deepHoldFrames = 0;
  treeBaseValid = false;
  treeBaseBuffer = null;
  cachedBranchSegments = null;
  cachedHoverGrid = null;
  pointerDirty = true;

  currentCaptionTitle = "";
  currentCaptionText = "Nurimsta, ką čia atradai, lieka su tavimi";
  if (typeof currentCaptionEpilogue !== "undefined") {
    currentCaptionEpilogue = "";
  }
  currentCaptionUntilMs = millis() + 3800;
  currentCaptionZone = -1;
  currentCaptionStartMs = millis();

  if (typeof asBreakExitCalmStartMs !== "undefined") {
    asBreakExitCalmStartMs = millis();
  }

  redraw();
  loop();
}

// ─── Zone first-click dramatic flash ─────────────────────────────────────────

let _zoneFirstClickFlashZone = -1;
let _zoneFirstClickFlashMs = -1;
const _ZONE_FIRST_FLASH_MS = 680;

function triggerZoneFirstClickFlash(zone) {
  _zoneFirstClickFlashZone = zone;
  _zoneFirstClickFlashMs = millis();
}

// Per-zone emotion palette: [r, g, b] tint for the flash overlay
function _getZoneFirstFlashColor(zone) {
  if (zone === 3) return [160, 230, 255];   // Juokas — ice blue
  if (zone === 4) return [180, 210, 255];   // Jautrumas — soft blue
  if (zone === 5) return [210, 140, 255];   // Drama — violet
  if (zone === 6) return [255, 170, 195];   // Meilė — rose
  if (zone === 7) return [140, 255, 200];   // Empatija — teal
  if (zone === 8) return [255, 80, 80];     // Pyktis — red
  if (zone === 2) return [255, 255, 255];   // Aš — white
  return [255, 255, 255];
}

function drawZoneFirstClickFlash() {
  if (_zoneFirstClickFlashZone < 2 || _zoneFirstClickFlashMs < 0) return;
  let age = millis() - _zoneFirstClickFlashMs;
  if (age > _ZONE_FIRST_FLASH_MS) {
    _zoneFirstClickFlashZone = -1;
    return;
  }
  let t = age / _ZONE_FIRST_FLASH_MS;
  let et = t < 0.18 ? t / 0.18 : 1 - (t - 0.18) / 0.82;
  et = et * et * (3 - 2 * et);
  let zone = _zoneFirstClickFlashZone;
  let col = _getZoneFirstFlashColor(zone);
  let zcFallbackX =
    typeof getDeepMemoryTextColumnCenterX === "function"
      ? getDeepMemoryTextColumnCenterX()
      : width * 0.36;
  let zc = getZoneBranchTop ? getZoneBranchTop(zone) : { x: zcFallbackX, y: height * 0.35 };

  let shockR = lerp(0, width * 0.55, t);
  let flashA = et * (zone === 8 ? 62 : 44);
  noStroke();
  blendMode(ADD);
  fill(col[0], col[1], col[2], flashA);
  ellipse(zc.x, zc.y, shockR * 2, shockR * 1.4);
  fill(col[0], col[1], col[2], flashA * 0.38);
  ellipse(zc.x, zc.y, shockR * 2.8, shockR * 2.0);
  blendMode(BLEND);

  // Shockwave ring
  let ringAlpha = (1 - t) * (zone === 8 ? 90 : 64);
  noFill();
  stroke(col[0], col[1], col[2], ringAlpha);
  strokeWeight(lerp(3.5, 0.5, t));
  ellipse(zc.x, zc.y, shockR * 2.2, shockR * 1.6);
  noStroke();

  // Center spark burst
  if (t < 0.35) {
    let sparkA = (1 - t / 0.35) * (zone === 8 ? 160 : 110);
    fill(min(255, col[0] + 60), min(255, col[1] + 60), min(255, col[2] + 60), sparkA);
    let sparkR = lerp(18, 4, t / 0.35);
    ellipse(zc.x, zc.y, sparkR, sparkR);
    let nSpokes = zone === 8 ? 12 : 8;
    stroke(col[0], col[1], col[2], sparkA * 0.7);
    strokeWeight(0.8);
    for (let i = 0; i < nSpokes; i++) {
      let a = (TWO_PI / nSpokes) * i;
      let r1 = sparkR + 4;
      let r2 = sparkR + lerp(22, 8, t / 0.35);
      line(zc.x + cos(a) * r1, zc.y + sin(a) * r1, zc.x + cos(a) * r2, zc.y + sin(a) * r2);
    }
    noStroke();
    noFill();
  }
}
