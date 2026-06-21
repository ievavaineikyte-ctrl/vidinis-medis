/** Matomas plotas (mobilus: visualViewport, adresinė juosta, notch). */
function getViewportWidth() {
  if (typeof window === "undefined") {
    return 400;
  }
  if (window.visualViewport && window.visualViewport.width > 0) {
    return Math.max(1, Math.floor(window.visualViewport.width));
  }
  return Math.max(1, Math.floor(window.innerWidth));
}

function getViewportHeight() {
  if (typeof window === "undefined") {
    return 600;
  }
  if (window.visualViewport && window.visualViewport.height > 0) {
    return Math.max(1, Math.floor(window.visualViewport.height));
  }
  return Math.max(1, Math.floor(window.innerHeight));
}

/** iOS / notch — skaitoma iš :root CSS kintamųjų (index.html). */
function getSafeAreaInsetsPx() {
  if (typeof document === "undefined" || !document.documentElement) {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  let st = getComputedStyle(document.documentElement);
  function px(prop) {
    let v = st.getPropertyValue(prop);
    if (!v || v === "") {
      return 0;
    }
    let n = parseFloat(v);
    return isFinite(n) ? n : 0;
  }
  return {
    top: px("--safe-top"),
    right: px("--safe-right"),
    bottom: px("--safe-bottom"),
    left: px("--safe-left")
  };
}

function getLayoutCanvasWidth() {
  let sa = typeof getSafeAreaInsetsPx === "function" ? getSafeAreaInsetsPx() : { left: 0, right: 0 };
  return Math.max(1, Math.floor(getViewportWidth() - sa.left - sa.right));
}

function getLayoutCanvasHeight() {
  let sa = typeof getSafeAreaInsetsPx === "function" ? getSafeAreaInsetsPx() : { top: 0, bottom: 0 };
  return Math.max(1, Math.floor(getViewportHeight() - sa.top - sa.bottom));
}

let _viewportResizeTimer = null;

function applyCanvasAndBuffersResize() {
  resizeCanvas(getLayoutCanvasWidth(), getLayoutCanvasHeight());
  treeBaseValid = false;
  treeBaseBuffer = null;
  cachedBranchSegments = null;
  cachedHoverGrid = null;
  glitchFullFrame = null;
  glitchTreeFrameStartup = null;
  glitchTreeFrameFinale = null;
  deepInitialized = false;
  pointerDirty = true;
  redraw();
  loop();
}

function windowResized() {
  if (_viewportResizeTimer) {
    clearTimeout(_viewportResizeTimer);
  }
  _viewportResizeTimer = setTimeout(function () {
    _viewportResizeTimer = null;
    applyCanvasAndBuffersResize();
  }, 90);
}

/** Po įkėlimo: orientacija, iOS viewport, adresinės juostos rodymas/slėpimas. */
function initViewportListeners() {
  if (typeof window === "undefined") {
    return;
  }
  window.addEventListener("orientationchange", function () {
    setTimeout(function () {
      if (typeof windowResized === "function") {
        windowResized();
      }
    }, 200);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", function () {
      if (typeof windowResized === "function") {
        windowResized();
      }
    });
  }
  /* Mac Safari / desktop: lango dydis keičiasi per `window.resize` (ne visada per visualViewport). */
  window.addEventListener(
    "resize",
    function () {
      if (typeof windowResized === "function") {
        windowResized();
      }
    },
    { passive: true }
  );
}

let _treeHoverRaf = null;

/** Ne kiekvienam pikseliui — mažiau getHoveredZoneId / overlay darbo (išorinis medis). */
const _HOVER_DIRTY_MIN_DIST = 4.5;
let _hoverProbeX = NaN;
let _hoverProbeY = NaN;

function resetOuterTreeHoverProbe() {
  _hoverProbeX = NaN;
  _hoverProbeY = NaN;
}

function markPointerDirtyIfHoverMoved(px, py) {
  if (!isFinite(_hoverProbeX)) {
    pointerDirty = true;
    _hoverProbeX = px;
    _hoverProbeY = py;
    return;
  }
  let dx = px - _hoverProbeX;
  let dy = py - _hoverProbeY;
  if (dx * dx + dy * dy >= _HOVER_DIRTY_MIN_DIST * _HOVER_DIRTY_MIN_DIST) {
    pointerDirty = true;
    _hoverProbeX = px;
    _hoverProbeY = py;
  }
}

/**
 * Vietoje loop() ant kiekvieno judesio: vienas kadras per rAF, jei ciklas jau nejuda.
 * Kitaip p5 vėl paleistų pilną ciklą ir medis + užrašai trūkčioja.
 */
function scheduleTreeHoverRedraw() {
  if (typeof currentView === "undefined" || currentView !== "tree") {
    if (typeof loop === "function") {
      loop();
    }
    return;
  }
  if (typeof isLooping === "function" && isLooping()) {
    return;
  }
  if (typeof requestAnimationFrame === "undefined") {
    if (typeof redraw === "function") {
      redraw();
    }
    return;
  }
  if (_treeHoverRaf !== null) {
    return;
  }
  _treeHoverRaf = requestAnimationFrame(function () {
    _treeHoverRaf = null;
    if (typeof currentView === "undefined" || currentView !== "tree" || typeof redraw !== "function") {
      return;
    }
    redraw();
  });
}

function mouseMoved() {
  if (typeof treeCanvasPointerInside !== "undefined") {
    let inside = isPointerOverTreeCanvas(mouseX, mouseY);
    if (treeCanvasPointerInside && !inside) {
      resetOuterTreeHoverProbe();
    }
    treeCanvasPointerInside = inside;
    if (inside) {
      markPointerDirtyIfHoverMoved(mouseX, mouseY);
    }
  }
  scheduleTreeHoverRedraw();
}

function mousePressed() {
  isPointerDown = true;
  pointerDirty = true;
  _hoverProbeX = mouseX;
  _hoverProbeY = mouseY;
  handlePrimaryPress(mouseX, mouseY);
}

function mouseReleased() {
  isPointerDown = false;
}

function touchStarted() {
  isPointerDown = true;
  let tx = touches.length ? touches[0].x : mouseX;
  let ty = touches.length ? touches[0].y : mouseY;
  if (typeof treeCanvasPointerInside !== "undefined") {
    treeCanvasPointerInside = isPointerOverTreeCanvas(tx, ty);
  }
  pointerDirty = true;
  _hoverProbeX = tx;
  _hoverProbeY = ty;
  handlePrimaryPress(tx, ty);
  return false;
}

function touchEnded() {
  isPointerDown = false;
  if (typeof treeCanvasPointerInside !== "undefined") {
    let inside = false;
    for (let i = 0; i < touches.length; i++) {
      if (isPointerOverTreeCanvas(touches[i].x, touches[i].y)) {
        inside = true;
        break;
      }
    }
    treeCanvasPointerInside = inside;
  }
  return false;
}

function isPointerOverTreeCanvas(px, py) {
  if (typeof width !== "number" || typeof height !== "number" || width < 1 || height < 1) {
    return true;
  }
  return px >= 0 && px <= width && py >= 0 && py <= height;
}

function touchMoved() {
  if (typeof treeCanvasPointerInside !== "undefined") {
    if (touches.length) {
      let tx = touches[0].x;
      let ty = touches[0].y;
      let inside = isPointerOverTreeCanvas(tx, ty);
      if (treeCanvasPointerInside && !inside) {
        resetOuterTreeHoverProbe();
      }
      treeCanvasPointerInside = inside;
      if (inside) {
        markPointerDirtyIfHoverMoved(tx, ty);
      }
    }
  }
  scheduleTreeHoverRedraw();
  return false;
}

function keyPressed() {
  if (key === "h" || key === "H") {
    showConflictDebug = !showConflictDebug;
    loop();
    return false;
  }

  if (keyCode === ESCAPE || keyCode === BACKSPACE) {
    if (typeof asBreakSequenceActive !== "undefined" && asBreakSequenceActive && currentView === "tree") {
      return false;
    }
    if (currentView === "deep" && typeof focusedZone === "number" && focusedZone === 2) {
      return false;
    }
    // Pyktis ejects you on its own terms — no manual escape
    if (currentView === "deep" && typeof focusedZone === "number" && focusedZone === 8) {
      return false;
    }
    if (currentView === "deep") {
      exitDeepMode();
      return false;
    }
  }
}

function handlePrimaryPress(px, py) {
  if (
    currentView === "tree" &&
    typeof isEntryPhraseActive === "function" &&
    isEntryPhraseActive()
  ) {
    if (
      typeof isOverEntryAtraskPrompt === "function" &&
      typeof startEntryFromAtraskClick === "function" &&
      isOverEntryAtraskPrompt(px, py)
    ) {
      startEntryFromAtraskClick();
    }
    return;
  }

  if (
    currentView === "tree" &&
    typeof isTreeSceneRevealComplete === "function" &&
    !isTreeSceneRevealComplete()
  ) {
    return;
  }

  triggerFirstScreenGlitch();

  // Ignore all clicks while the deep-enter transition animation is playing —
  // otherwise a second click resets the whole fade from the beginning.
  if (typeof deepEnterFadePhase !== "undefined" && deepEnterFadePhase === 1) {
    return;
  }

  // During break sequence only "SUSTABDYTI" is clickable.
  if (asBreakSequenceActive && currentView === "tree") {
    if (asStopPromptVisible && isOverAsStopPrompt(px, py)) {
      stopAsBreakSequenceAndReset();
    }
    return;
  }

  if (currentView === "deep") {
    // Pyktis deep: no back button, no manual exit — ignore all clicks
    if (typeof focusedZone === "number" && focusedZone === 8) {
      return;
    }
    if (handleBackButtonClick(px, py)) {
      return;
    }
    return;
  }

  // Direct zone activation without first click glitch
  activateHoveredZone(px, py);
}

function activateHoveredZone(px, py) {
  // Resolve zone at the actual click/touch point — not cached hover from a prior frame,
  // so e.g. trunk ("Kamienas") never inherits another branch's zone by mistake.
  let zone = getHoveredZoneIdAt(px, py);
  // Click/touch should be easier than hover: allow a wider pick radius fallback.
  if (zone < 1 && typeof getPressZoneIdAt === "function") {
    zone = getPressZoneIdAt(px, py, 2.2);
  }
  hoveredZoneId = zone;
  pointerDirty = false;

  if (zone < 1) {
    return;
  }

  if (zone !== 1 && !areOuterZonesUnlocked()) {
    if (typeof lockedStartPromptFromZone !== "undefined") {
      lockedStartPromptFromZone = zone;
    }
    currentCaptionTitle = "";
    currentCaptionText =
      typeof TREE_UX !== "undefined" && TREE_UX.lockedStartPrompt
        ? TREE_UX.lockedStartPrompt
        : "Pradėk nuo pagrindo";
    currentCaptionUntilMs = millis() + 1600;
    if (typeof currentCaptionEpilogue !== "undefined") {
      currentCaptionEpilogue = "";
    }
    currentCaptionZone = 1;
    loop();
    return;
  }

  // Trunk is the entry/anchor only; it never opens deep mode.
  // Po atrakintos — pakartotiniai paspaudimai be „Kamienas“ caption blyksnio.
  if (zone === 1 && zoneStage[1] > 0) {
    return;
  }

  if (zone === 2 && !isAsZoneUnlocked()) {
    currentCaptionTitle = "";
    currentCaptionText =
      typeof TREE_UX !== "undefined" && TREE_UX.asZoneLockedPoetic
        ? TREE_UX.asZoneLockedPoetic
        : "Dar ne laikas grįžti.";
    currentCaptionUntilMs = millis() + 2600;
    if (typeof currentCaptionEpilogue !== "undefined") {
      currentCaptionEpilogue = "";
    }
    currentCaptionZone = -1;
    if (typeof _captionFadeStartMs !== "undefined") {
      _captionFadeStartMs = millis();
    }
    loop();
    return;
  }

  commitZoneActivation(zone);
}

function commitZoneActivation(zone) {
  if (zone === 1 && zoneStage[1] === 0) {
    if (typeof nudgeEmotionWeight === "function") {
      let amt = 0.22;
      if (typeof getEmotionWeight === "function") {
        let w0 = getEmotionWeight(1);
        amt += min(0.14, w0 * 0.015);
      }
      nudgeEmotionWeight(1, amt);
    }
    zoneStage[1] = 2;
    zoneActivated[1] = 1;
    zoneFillTarget[1] = 1;
    trunkIntroCalmUntilMs = millis() + TRUNK_ENTRY_CALM_MS;
    trunkZoneUnlockAtMs = millis() + TRUNK_ENTRY_CALM_MS;
    triggerRevealPulse();
    // One-time first trunk hint.
    currentCaptionTitle = "";
    currentCaptionText = "Čia viskas stovi";
    currentCaptionUntilMs = millis() + 1500;
    if (typeof currentCaptionEpilogue !== "undefined") {
      currentCaptionEpilogue = "";
    }
    currentCaptionZone = -1;
    loop();
    return;
  }

  let visits = (typeof deepZoneEntryCount !== "undefined" ? deepZoneEntryCount[zone] : 0) | 0;

  // ── Pyktis (8): tik vienas gylis. Po pirmo įėjimo — neįleidžiame, atmetimas + tekstas. ──
  let pyktisDeepAlreadyUsed =
    zone === 8 &&
    typeof deepZoneEntryCount !== "undefined" &&
    (deepZoneEntryCount[8] | 0) >= 1;
  if (zone === 8 && zoneStage[zone] >= 2 && pyktisDeepAlreadyUsed) {
    let didTrigger = triggerPyktisRejection(visits);
    if (didTrigger) {
      if (typeof redraw === "function") {
        redraw();
      }
      if (typeof isLooping === "function" && !isLooping()) {
        loop();
      }
    }
    return;
  }

  if (typeof nudgeEmotionWeight === "function") {
    let amt = 0.22;
    if (typeof getEmotionWeight === "function") {
      let w0 = getEmotionWeight(zone);
      amt += min(0.14, w0 * 0.015);
    }
    /* Pyktis: mažiau „suspaudžia“ svorį per paspaudimus — kitaip bloom + geometrija per greitai apkrauna kadrą. */
    if (zone === 8) {
      amt *= 0.68;
    }
    nudgeEmotionWeight(zone, amt);
  }

  if (zoneStage[zone] === 0) {
    zoneStage[zone] = 1;
    zoneActivated[zone] = 1;
    zoneFillTarget[zone] = 1;
    if (zone >= 2 && zone <= 8 && typeof zoneFillProgress !== "undefined") {
      zoneFillProgress[zone] = max(zoneFillProgress[zone] || 0, 0.16);
    }
    if (zone !== 1) {
      triggerZoneShapeMorph(zone, visits);
      triggerZoneBloomWarp(zone, visits);
    }
    triggerRevealPulse();
    setZoneCaptionFromClick(zone);
  } else if (zoneStage[zone] === 1) {
    zoneStage[zone] = 2;
    zoneActivated[zone] = 1;
    zoneFillTarget[zone] = 1;
    if (zone >= 2 && zone <= 8 && typeof zoneFillProgress !== "undefined") {
      zoneFillProgress[zone] = max(zoneFillProgress[zone] || 0, 0.22);
    }
    triggerRevealPulse();
    setZoneCaptionFromClick(zone);

    if (areAllZonesOpened()) {
      triggerFinaleGlitch();
    }
    startDeepEnterTransition(zone);
  } else {
    // Re-entry: retrigger bloom scaled by how many times they've been here.
    if (zone !== 1) {
      triggerZoneBloomWarp(zone, visits);
      triggerZoneShapeMorph(zone, visits);
    }
    startDeepEnterTransition(zone);
  }

  loop();
}

let _pyktisRejectionCount = 0;
let _pyktisRejectionLastMs = -9999;
const _PYKTIS_REJECTION_COOLDOWN_MS = 1400;

let _pyktisLastRejectionCaption = "";

function triggerPyktisRejection(visits) {
  let now = millis();
  if (now - _pyktisRejectionLastMs < _PYKTIS_REJECTION_COOLDOWN_MS) {
    return false;
  }
  _pyktisRejectionLastMs = now;
  _pyktisRejectionCount++;

  let caps =
    typeof PYKTIS_REJECTION_CAPTIONS !== "undefined" && PYKTIS_REJECTION_CAPTIONS.length
      ? PYKTIS_REJECTION_CAPTIONS
      : ["Čia nebegrįši."];
  let capPick = caps[floor(random(caps.length))];
  if (caps.length > 1 && capPick === _pyktisLastRejectionCaption) {
    capPick = caps[floor(random(caps.length))];
  }
  _pyktisLastRejectionCaption = capPick;
  /* Tuščias title — ta pati vieta ir tipografija kaip vienintelė „Grįžti į vidų?..“ eilutė. */
  currentCaptionTitle = "";
  currentCaptionText = capPick;
  currentCaptionUntilMs = millis() + 1200;
  if (typeof currentCaptionEpilogue !== "undefined") {
    currentCaptionEpilogue = "";
  }
  currentCaptionZone = -1;
  if (typeof pyktisRejectionFlashUntilMs !== "undefined") {
    let flashMs = _pyktisRejectionCount > 7 ? 220 : 300;
    if (typeof pyktisRejectionFlashDurationMs !== "undefined") {
      pyktisRejectionFlashDurationMs = flashMs;
    }
    pyktisRejectionFlashUntilMs = millis() + flashMs;
  }

  if (typeof zoneBloomUntilMs !== "undefined") {
    zoneBloomUntilMs[8] = 0;
  }
  return true;
}

function enterDeepMode(zone) {
  if (typeof _deepBackLinkHit !== "undefined") {
    _deepBackLinkHit = null;
  }
  currentView = "deep";
  focusedZone = zone;
  deepModeEnteredMs = millis();
  deepZoneVisited[zone] = 1;
  deepZoneEntryCount[zone] = (deepZoneEntryCount[zone] || 0) + 1;
  if (typeof syncZoneDepthFromEntries === "function") {
    syncZoneDepthFromEntries();
  }

  if (zone >= 3 && zone <= 7) {
    let ec = deepZoneEntryCount[zone] | 0;
    deepZoneSeeds[zone] = floor(
      10000 +
        zone * 1000 +
        ec * 100 +
        7919 * ec +
        (millis() & 0xffff) +
        frameCount * 17
    );
  } else if (!deepZoneSeeds[focusedZone]) {
    let generatedSeed = floor(millis() + frameCount * 37 + focusedZone * 997);
    deepZoneSeeds[focusedZone] = floor(max(1, generatedSeed));
  }

  deepSeed = deepZoneSeeds[focusedZone];
  updateDeepPaletteForZone(focusedZone);
  deepHoldFrames = 0;
  deepGrowthProgress = deepZoneGrowth[focusedZone] || 0;
  growthProgress = deepGrowthProgress;
  if (zone === 8 && typeof pyktisAngerCharge === "number") {
    pyktisAngerCharge = deepGrowthProgress;
    pyktisExplosionFramesLeft = 0;
    if (typeof pyktisPrevCharge === "number") {
      pyktisPrevCharge = pyktisAngerCharge;
    }
    if (typeof pyktisCoreHoldLatched !== "undefined") {
      pyktisCoreHoldLatched = false;
    }
  }
  deepHoldStartMs = -1;
  let entryCount = deepZoneEntryCount[zone] || 1;
  if (zone >= 3 && zone <= 7) {
    deepReturnStatusText = "";
    deepReturnStatusStartMs = 0;
    deepReturnStatusUntilMs = 0;
    deepReturnStatusVariant = "none";
  } else if (entryCount === 1 && zone >= 2 && zone <= 8 && zone !== 8) {
    deepReturnStatusText = "Sugr\u012f\u017ek";
    deepReturnStatusVariant = "first";
    deepReturnStatusStartMs = millis() + 1800;
    deepReturnStatusUntilMs = deepReturnStatusStartMs + 5000;
  } else if (entryCount > 1 && zone >= 2 && zone <= 8 && zone !== 8) {
    deepReturnStatusText = "Sugr\u012f\u017ek";
    deepReturnStatusVariant = "repeat";
    deepReturnStatusStartMs = millis() + 1200;
    deepReturnStatusUntilMs = deepReturnStatusStartMs + 4500;
  } else {
    deepReturnStatusText = "";
    deepReturnStatusStartMs = 0;
    deepReturnStatusUntilMs = 0;
    deepReturnStatusVariant = "none";
  }
  let cinematicState = ensureDeepZoneCinematicState(zone);
  // Zonos 3–7: frazę valdo drawDeepMemory* pagal atmintį.
  let memoryTreeZone = zone >= 3 && zone <= 7;
  cinematicState.shown = entryCount > 1 && !memoryTreeZone;
  cinematicState.text =
    entryCount > 1 && !memoryTreeZone && typeof getDeepHoldCinematicText === "function"
      ? getDeepHoldCinematicText(zone)
      : "";
  if (typeof getDeepZoneTextAnchor === "function") {
    let anchor = getDeepZoneTextAnchor(zone);
    cinematicState.xNorm = anchor.xNorm;
    cinematicState.yNorm = anchor.yNorm;
    cinematicState.wNorm = anchor.wNorm;
    cinematicState.align = anchor.align;
  }
  cinematicState.style = floor(random(0, 4));
  cinematicState.scale = random(0.9, 1.16);
  deepInitialized = false;
  if (zone === 2) {
    asDeepLoadCommittedMs = 0;
    asDeepLoadLastTickMs = -1;
    asDeepLatch404 = false;
    asDeepLatchSubtitle = false;
  }
  if (typeof nudgeEmotionWeight === "function") {
    let persist =
      typeof getEmotionPersistenceSmooth === "function"
        ? getEmotionPersistenceSmooth()
        : 0.5;
    let amount = 0.85 * lerp(0.38, 1.28, persist);
    if (zone === 8) {
      amount *= 0.78;
    }
    nudgeEmotionWeight(zone, amount);
  }
  if (typeof generativeRegenArmedAtMs !== "undefined") {
    generativeRegenArmedAtMs = 0;
  }
  loop();
}

function isAsZoneUnlocked() {
  if (typeof deepZoneEntryCount === "undefined") {
    return false;
  }
  /* Pakanka vieno įėjimo į kiekvienos emocijos zonos (3–8) gylį. */
  for (let z = 3; z <= 8; z++) {
    if ((deepZoneEntryCount[z] | 0) < 1) {
      return false;
    }
  }
  return true;
}

function updateDeepPaletteForZone(zone) {
  let base = getRuntimeZoneColor(zone);
  let barkPull = 0.55;
  let leafA = 0.34;
  let leafB = 0.42;
  let veinPull = 0.16;
  let corePull = 0.12;
  if (zone === 3) {
    barkPull = 0.48;
    leafA = 0.52;
    leafB = 0.58;
    veinPull = 0.28;
    corePull = 0.22;
  } else if (zone === 4) {
    barkPull = 0.5;
    leafA = 0.56;
    leafB = 0.54;
    veinPull = 0.34;
    corePull = 0.26;
  } else if (zone === 5) {
    barkPull = 0.64;
    leafA = 0.5;
    leafB = 0.38;
    veinPull = 0.22;
    corePull = 0.2;
  } else if (zone === 6) {
    barkPull = 0.52;
    leafA = 0.5;
    leafB = 0.52;
    veinPull = 0.3;
    corePull = 0.28;
  } else if (zone === 7) {
    barkPull = 0.5;
    leafA = 0.54;
    leafB = 0.6;
    veinPull = 0.26;
    corePull = 0.24;
  }

  deepBarkAccent = [
    lerp(92, base[0], barkPull),
    lerp(92, base[1], barkPull),
    lerp(92, base[2], barkPull)
  ];

  deepLeafA = [
    lerp(236, base[0], leafA),
    lerp(206, base[1], leafA),
    lerp(226, base[2], leafA)
  ];

  deepLeafB = [
    lerp(214, base[0], leafB),
    lerp(222, base[1], leafB),
    lerp(240, base[2], leafB)
  ];

  deepVein = [
    lerp(252, base[0], veinPull),
    lerp(238, base[1], veinPull),
    lerp(222, base[2], veinPull)
  ];

  deepCore = [
    lerp(255, base[0], corePull),
    lerp(248, base[1], corePull),
    lerp(232, base[2], corePull)
  ];
}

function exitDeepMode() {
  let exitingZone = focusedZone;
  if (focusedZone >= 1 && focusedZone <= 8) {
    deepZoneGrowth[focusedZone] = deepGrowthProgress;
    if (focusedZone !== 1) {
      let persist =
        typeof getEmotionPersistenceSmooth === "function"
          ? getEmotionPersistenceSmooth()
          : 0.5;
      let entries =
        typeof deepZoneEntryCount !== "undefined"
          ? deepZoneEntryCount[focusedZone] || 1
          : 1;
      // First and second deep exits should visibly "bloom" outer petals.
      let earlyBloomBoost = entries <= 1 ? 1.9 : entries === 2 ? 1.45 : 1;
      /* Po daug įėjimų — mažiau „+max“ vienam išėjimui, kitaip lapų sluoksnis greitai apkrauna kadrą. */
      let entryBloomAtten =
        entries >= 9 ? 0.38 : entries >= 7 ? 0.5 : entries >= 5 ? 0.65 : entries >= 4 ? 0.78 : 1;
      let leafBump = lerp(0.08, 0.42, persist) * earlyBloomBoost * entryBloomAtten;
      outerZoneLeafGrowth[focusedZone] = min(
        1,
        (outerZoneLeafGrowth[focusedZone] || 0) + leafBump
      );
    }
  }

  currentView = "tree";
  focusedZone = -1;
  if (typeof _deepBackLinkHit !== "undefined") {
    _deepBackLinkHit = null;
  }
  deepHoldStartMs = -1;
  currentCaptionTitle = "";
  currentCaptionText = "";
  if (typeof currentCaptionEpilogue !== "undefined") {
    currentCaptionEpilogue = "";
  }
  currentCaptionUntilMs = 0;
  if (
    typeof isAsZoneUnlocked === "function" &&
    isAsZoneUnlocked() &&
    typeof asHeartUnlockFanfareDone !== "undefined" &&
    !asHeartUnlockFanfareDone
  ) {
    asHeartUnlockFanfareDone = true;
    currentCaptionTitle = "";
    currentCaptionText =
      typeof TREE_UX !== "undefined" && TREE_UX.asHeartUnlockedPoetic
        ? TREE_UX.asHeartUnlockedPoetic
        : "Durys atsivėrė iš vidaus.";
    currentCaptionUntilMs = millis() + 5600;
    currentCaptionZone = -1;
    if (typeof triggerRevealPulse === "function") {
      triggerRevealPulse();
    }
    if (typeof zoneBloomUntilMs !== "undefined") {
      zoneBloomUntilMs[2] = millis() + 5200;
    }
    if (typeof heartUnlockBranchPulseUntilMs !== "undefined") {
      let dur =
        typeof HEART_UNLOCK_BRANCH_PULSE_MS === "number"
          ? HEART_UNLOCK_BRANCH_PULSE_MS
          : 5600;
      heartUnlockBranchPulseUntilMs = millis() + dur;
    }
    if (typeof _captionFadeStartMs !== "undefined") {
      _captionFadeStartMs = millis();
    }
  } else if (
    typeof deepFirstReturnHintShownByZone !== "undefined" &&
    exitingZone >= 3 &&
    exitingZone <= 7 &&
    !deepFirstReturnHintShownByZone[exitingZone]
  ) {
    let pool =
      typeof DEEP_FIRST_RETURN_HINT_LINES !== "undefined" && DEEP_FIRST_RETURN_HINT_LINES.length
        ? DEEP_FIRST_RETURN_HINT_LINES
        : ["Grįžti į vidų?.."];
    let pick = pool[floor(random(pool.length))];
    if (pool.length > 1) {
      let tries = 0;
      while (tries < 6 && pick === _lastDeepFirstReturnHintLine) {
        pick = pool[floor(random(pool.length))];
        tries++;
      }
    }
    _lastDeepFirstReturnHintLine = pick;
    currentCaptionTitle = "";
    currentCaptionText = pick;
    currentCaptionUntilMs = millis() + 2800;
    currentCaptionZone = -1;
    if (typeof _captionFadeStartMs !== "undefined") {
      _captionFadeStartMs = millis();
    }
    deepFirstReturnHintShownByZone[exitingZone] = 1;
  }
  deepReturnCalmUntilMs =
    typeof DEEP_RETURN_CALM_MS === "number" && DEEP_RETURN_CALM_MS > 0
      ? millis() + DEEP_RETURN_CALM_MS
      : 0;
  if (typeof onDeepExitForShock === "function") {
    onDeepExitForShock();
  }
  if (
    exitingZone >= 2 &&
    exitingZone <= 8 &&
    typeof triggerZoneShapeMorph === "function" &&
    typeof deepZoneEntryCount !== "undefined"
  ) {
    triggerZoneShapeMorph(exitingZone, deepZoneEntryCount[exitingZone] | 0, true);
  }
  pointerDirty = true;
  redraw();
  loop();
}

window.addEventListener("pageshow", function () {
  // Replay intro glitch when page is restored from browser cache.
  scheduleStartupGlitch();
  if (typeof millis === "function" && typeof sessionEntryStartMs !== "undefined") {
    sessionEntryStartMs = millis();
  }
  if (typeof entryPhraseAwaitingClick !== "undefined") {
    entryPhraseAwaitingClick = true;
  }
  if (typeof sceneRevealStartMs !== "undefined") {
    sceneRevealStartMs = -1;
  }
});
