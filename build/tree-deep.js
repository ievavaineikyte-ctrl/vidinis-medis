/** Gylio režimas (bendras). „Aš“ zona (focusedZone === 2): tree-deep-as-zone.js. */
function initDeepMode() {
  tmaxLen = height * 0.145;
  tminLen = tmaxLen * 0.1;
  smaxLen = height * 0.055;
  sminLen = tmaxLen * 0.1;
  growthProgress = deepGrowthProgress;
  holdFrames = 0;
  leafDrawCount = 0;
  deepInitialized = true;
}

function isDeepMemoryTreeZone(z) {
  return z === 3 || z === 4 || z === 5 || z === 6 || z === 7;
}

function getDeepZoneMemoryDepth(zone) {
  let n = deepZoneEntryCount[zone] || 1;
  return n <= 1 ? 1 : 2;
}

/**
 * Juoko „gyvas“ vaizdas (fonas + medžio šuoliai): antras įėjimas į zoną (memD 2)
 * arba tas pats seansas — kai medis jau spėriau auga (deepGrowthProgress).
 */
function shouldDrawDeepJuokasPlayfulVisuals(zone, memD) {
  if (zone !== 3) {
    return false;
  }
  if (constrain(memD | 0, 1, 2) >= 2) {
    return true;
  }
  let t = typeof deepGrowthProgress === "number" ? deepGrowthProgress : 0;
  return t >= 0.34;
}

function getDeepJuokasPlayfulIntensityMul(memD) {
  if (constrain(memD | 0, 1, 2) >= 2) {
    return 1;
  }
  let t = typeof deepGrowthProgress === "number" ? deepGrowthProgress : 0;
  return constrain((t - 0.34) / 0.48, 0.28, 1);
}

/** Bendras kampas (rad/s laiko) — Juoko 2 fazėje sinchronizuoja medį ir fono „juoką“. */
function getDeepJuokasLaughPhaseRad(mot) {
  mot =
    typeof mot === "number"
      ? mot
      : typeof getDeepCanvasMotionFactor === "function"
        ? getDeepCanvasMotionFactor()
        : 1;
  return millis() * 0.00255 * mot;
}

function getDeepJuokasLaughBurst01(laughPh) {
  return abs(sin(laughPh * 2.28)) * 0.62 + 0.38;
}

/** Horizontalus „temptis į šonus“ + subtilus bob — fono elementams. */
function getDeepJuokasLaughBgDrift(laughPh, mot, w, h) {
  mot =
    typeof mot === "number"
      ? mot
      : typeof getDeepCanvasMotionFactor === "function"
        ? getDeepCanvasMotionFactor()
        : 1;
  return {
    side:
      sin(laughPh * 1.85) * w * 0.042 * mot +
      sin(laughPh * 4.15) * w * 0.024 * mot,
    bob: sin(laughPh * 2.08) * h * 0.035 * mot,
    sway: cos(laughPh * 1.55) * h * 0.018 * mot
  };
}

/**
 * Jautrumo 2 f.: aštrūs „skausmo“ trūkčiojimai — 0…1 amplitudė fonui ir šakoms.
 */
function getDeepJautrumasPainSpasm01(mot) {
  mot =
    typeof mot === "number"
      ? mot
      : typeof getDeepCanvasMotionFactor === "function"
        ? getDeepCanvasMotionFactor()
        : 1;
  let ds = (typeof deepSeed === "number" ? deepSeed : 1) * 0.017;
  let ph = millis() * 0.0042 * mot + ds;
  let sharp = pow(constrain(abs(sin(ph * 2.12)), 0, 1), 2.85);
  let spike =
    pow(
      constrain(abs(sin(ph * 8.4 + 0.65) * sin(ph * 13.5 + 1.05)), 0, 1),
      1.55
    );
  let micro = pow(constrain(abs(sin(ph * 22.8 + ds)), 0, 1), 3.8) * 0.9;
  return constrain(0.36 * sharp + 0.44 * spike + micro, 0, 1);
}

function getDeepJautrumasPainPhaseRad(mot) {
  mot =
    typeof mot === "number"
      ? mot
      : typeof getDeepCanvasMotionFactor === "function"
        ? getDeepCanvasMotionFactor()
        : 1;
  return millis() * 0.0046 * mot;
}

/**
 * Empatijos 2 f.: bendras fazių kampas plėtimuisi / sinchronui.
 * Laikas NEDaugina iš `mot` — kitaip su reduced-motion (~0.12) ciklas trunka minutes ir atrodo „užšalęs“.
 */
function getDeepEmpatijaPhase2SyncPhase(_mot) {
  return millis() * 0.00072;
}

/** Amplitudėms (pan, wobble): sumažintas judesys vis tiek turi būti matomas. */
function getDeepEmpatijaPhase2BackdropAmpMul(mot) {
  let m =
    typeof mot === "number"
      ? mot
      : typeof getDeepCanvasMotionFactor === "function"
        ? getDeepCanvasMotionFactor()
        : 1;
  return max(m, 0.54);
}

function getDeepEmpatijaPhase2ExpandMul(memD, mot) {
  if (constrain(memD | 0, 1, 2) < 2) {
    return 1;
  }
  let ph = getDeepEmpatijaPhase2SyncPhase(mot);
  return 1 + 0.084 * sin(ph);
}

/** Lėtesnis kampas tik medžiui — fonas gali alsuoti greičiau, struktūra lieka stabili. */
function getDeepEmpatijaPhase2TreePhase() {
  return millis() * 0.00014;
}

function getDeepEmpatijaPhase2TreeScaleMul(memD, mot) {
  if (constrain(memD | 0, 1, 2) < 2) {
    return 1;
  }
  void mot;
  let ph = getDeepEmpatijaPhase2TreePhase();
  return 1 + 0.005 * sin(ph + 0.42) + 0.002 * sin(ph * 0.51 + 1.05);
}

/** Antros fazės fonas: matomas, bet vis tiek lėtas pasvirduliavimas. */
function getDeepEmpatijaPhase2BackdropPanPx(memD, mot) {
  if (constrain(memD | 0, 1, 2) < 2) {
    return { x: 0, y: 0 };
  }
  let ph = getDeepEmpatijaPhase2SyncPhase(mot);
  let amp = getDeepEmpatijaPhase2BackdropAmpMul(mot);
  let m = min(width, height);
  return {
    x:
      sin(ph * 0.74) * m * 0.016 * amp +
      sin(ph * 0.31) * m * 0.0055 * amp,
    y:
      cos(ph * 0.68) * m * 0.012 * amp +
      cos(ph * 0.27) * m * 0.0042 * amp
  };
}

/**
 * Empatija (7): medžio augimas pagal `deepGrowthProgress` (laikyk — užpildo iki ~1).
 * Ties progresu 1 mastelis nebedidėja („sustoja augti“).
 */
function getDeepEmpatijaTreeGrowth01() {
  if (typeof focusedZone === "undefined" || focusedZone !== 7) {
    return 0;
  }
  let t = constrain(typeof deepGrowthProgress === "number" ? deepGrowthProgress : 0, 0, 1);
  return 1 - pow(1 - t, 0.72);
}

/* Empatijos 2 f. vizualinis augimas: per entry startuoja nuo mažo ir artėja prie progreso tikslo. */
let _deepEmpatijaTreeVisualGrowth01 = 0;
let _deepEmpatijaTreeVisualArmed = false;

function syncDeepEmpatijaTreeVisualGrowth(memD, mot) {
  if (
    typeof focusedZone === "undefined" ||
    focusedZone !== 7 ||
    constrain(memD | 0, 1, 2) < 2
  ) {
    _deepEmpatijaTreeVisualGrowth01 = 0;
    _deepEmpatijaTreeVisualArmed = false;
    return 0;
  }
  if (!_deepEmpatijaTreeVisualArmed) {
    _deepEmpatijaTreeVisualGrowth01 = 0;
    _deepEmpatijaTreeVisualArmed = true;
  }
  let target = getDeepEmpatijaTreeGrowth01();
  let m = typeof mot === "number" ? mot : 1;
  let step = (typeof isPointerDown !== "undefined" && isPointerDown ? 0.06 : 0.024) * max(m, 0.6);
  if (_deepEmpatijaTreeVisualGrowth01 < target) {
    _deepEmpatijaTreeVisualGrowth01 = min(
      target,
      _deepEmpatijaTreeVisualGrowth01 + step
    );
  } else {
    _deepEmpatijaTreeVisualGrowth01 = max(
      target,
      _deepEmpatijaTreeVisualGrowth01 - step * 0.28
    );
  }
  return _deepEmpatijaTreeVisualGrowth01;
}

/** Bendras medžio mastelis (šaknis baseX, baseY): nuo ~1.0 iki beveik viso ekrano. */
function getDeepEmpatijaAccumulatedGrowthScale(g) {
  let gg = constrain(typeof g === "number" ? g : getDeepEmpatijaTreeGrowth01(), 0, 1);
  let lo = 1.02;
  let asp = width / max(1, height);
  let hi = asp > 1.2 ? 2.55 : asp < 0.92 ? 2.24 : 2.42;
  hi = constrain(hi, 2.12, 2.72);
  return lerp(lo, hi, gg);
}

/** Tiltų ir juoko žybrų taškai — perskaičiuojami tik pasikeitus sėklai / dydžiui, ne kiekvienam kadrui. */
let _deepStaticBridgeCache = {
  key: "",
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  d5x1: 0,
  d5y1: 0,
  d5x2: 0,
  d5y2: 0
};
let _juokasSparkleCache = { key: "", lines: null };
/** Paskutinio „atgal“ paspaudimo sritis (atnaujina drawDeepBackLink; ne fiksuotas mygtukas). */
var _deepBackLinkHit = null;

function getDeepDwellSeconds() {
  return max(0, millis() - deepModeEnteredMs) / 1000;
}

/** Gylis: juodo overlay nuėmimas po įėjimo (tik šis sluoksnis). */
const DEEP_MODE_FADE_IN_MS = 180;

/**
 * 0 = pirmas kadras (ant viršaus dedamas visas juodas), 1 = be overlay.
 * Ease-out – pabaigoje tolygiai „užsidaro“ tamsa.
 */
function getDeepViewFadeIn01() {
  if (typeof deepModeEnteredMs !== "number" || deepModeEnteredMs <= 0) {
    return 1;
  }
  if (typeof DEEP_MODE_FADE_IN_MS !== "number" || DEEP_MODE_FADE_IN_MS < 1) {
    return 1;
  }
  let u = (millis() - deepModeEnteredMs) / DEEP_MODE_FADE_IN_MS;
  u = constrain(u, 0, 1);
  u = 1 - pow(1 - u, 1.4);
  return u;
}

function drawDeepEntranceFadeOverlay() {
  let vis = getDeepViewFadeIn01();
  if (vis >= 0.998) {
    return;
  }
  push();
  noStroke();
  fill(0, 0, 0, (1 - vis) * 255);
  rectMode(CORNER);
  rect(0, 0, width, height);
  pop();
  if (typeof loop === "function") {
    loop();
  }
}

/**
 * Skaitmeninis RGB „pixelated glitch“ sluoksnis (stambūs blokai + chroma poslinkis).
 * Tik noise — prieš randomSeed.
 */
function drawDeepGlitchRgbPixelatedLayer() {
  let t = millis() * 0.001;
  let ns = getDeepNoiseSeedScaled(0.00011);
  let cell = max(15, min(32, floor(width / 46)));
  let cols = ceil(width / cell);
  let rows = ceil(height / cell);
  noStroke();
  rectMode(CORNER);
  blendMode(BLEND);
  for (let cy = 0; cy < rows; cy++) {
    let rowJitter = (noise(ns * 1.3, cy * 0.07, t * 0.45) - 0.5) * cell * 1.85;
    for (let cx = 0; cx < cols; cx++) {
      let x0 = cx * cell + rowJitter;
      let y0 = cy * cell;
      let w = cell + 1;
      let h = cell + 1;
      if (x0 + w < 0 || x0 > width || y0 > height) {
        continue;
      }
      let x = max(0, x0);
      let wClip = min(w, width - x);
      if (wClip <= 0) {
        continue;
      }
      h = min(h, height - y0);
      let n = noise(ns + cx * 0.12, cy * 0.1, t * 0.24);
      let n2 = noise(ns + cx * 0.14 + 3, cy * 0.11, t * 0.19);
      let n3 = noise(ns + cx * 0.09, cy * 0.13 + 1, t * 0.31);
      let r = 5 + n * 62;
      let g = 4 + n2 * 58;
      let b = 8 + n3 * 64;
      let nMix = n * 0.34 + n2 * 0.33 + n3 * 0.33;
      fill(r * 0.35, g * 0.32, b * 0.38, 255);
      rect(x, y0, wClip, h);
      if (nMix > 0.52) {
        let off =
          (noise(cx * 0.52, cy * 0.41, t * 1.8) - 0.5) * (4 + cell * 0.22);
        blendMode(ADD);
        fill(255, 25, 100, 22 * nMix);
        rect(x - off, y0, wClip, h);
        fill(0, 230, 255, 19 * nMix);
        rect(x + off, y0, wClip, h);
        blendMode(BLEND);
      }
    }
  }
  blendMode(BLEND);
  for (let i = 0; i < 9; i++) {
    let sy = noise(ns + i * 4, t * 0.5) * height;
    let sh = 2 + noise(i, t) * (cell * 0.85);
    let sx = (noise(t * 1.2 + i, ns) - 0.5) * (width * 0.06);
    blendMode(ADD);
    fill(255, 0, 120, 18);
    rect(sx, sy, width, sh);
    fill(0, 200, 255, 16);
    rect(-sx * 0.9, sy + 1, width, sh);
    blendMode(BLEND);
  }
}

/**
 * Gylio fonas: terminalo / sugadintos sistemos estetika (tik noise — prieš randomSeed).
 */
function drawDeepGlitchSystemCorruptedBackground() {
  let t = millis() * 0.001;
  let ns = getDeepNoiseSeedScaled(0.00019);
  noStroke();
  blendMode(BLEND);
  rectMode(CORNER);
  fill(0, 0, 0);
  rect(0, 0, width, height);
  fill(18, 0, 6, 100);
  rect(0, 0, width, height * 0.09);
  fill(0, 22, 14, 55);
  rect(0, height * 0.91, width, height * 0.09);

  drawDeepGlitchRgbPixelatedLayer();

  if (typeof setAsDeepDisplayFont === "function") {
    setAsDeepDisplayFont();
  } else {
    textFont(
      typeof TREE_CANVAS_FONTS !== "undefined"
        ? TREE_CANVAS_FONTS.asDeepDisplay
        : "Inter"
    );
    textStyle(NORMAL);
  }
  textStyle(NORMAL);
  let rowH = max(11, min(14, width * 0.028));
  let colW = rowH * 0.62;
  let cols = ceil(width / colW) + 1;
  let rows = ceil(height / rowH) + 1;
  textAlign(LEFT, TOP);
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      let v = noise(ns + c * 0.31, r * 0.19, t * 0.4);
      if (v < 0.28) {
        continue;
      }
      let ch = v > 0.92 ? "X" : v > 0.5 ? "1" : "0";
      let gx = c * colW + sin(t * 1.7 + r * 0.2) * 1.2;
      let gy = r * rowH;
      let g = 38 + v * 90;
      fill(0, g, floor(g * 0.42), 14 + v * 52);
      textSize(rowH * 0.78);
      text(ch, gx, gy);
    }
  }

  let ticker =
    "SISTEMA_SUGADINTA_KLAIDA_NEVEIKIA_DUOMENYS_PRARASTI_SISTEMA // ";
  textAlign(LEFT, CENTER);
  textSize(max(10, width * 0.022));
  for (let row = 0; row < 7; row++) {
    let y = height * (0.1 + row * 0.11);
    let scroll = (t * 28 + row * 7.3) % ticker.length;
    let piece = ticker.substring(scroll) + ticker.substring(0, scroll);
    piece = piece.substring(0, min(piece.length, floor(width / (width * 0.011))));
    fill(200, 30, 50, 16);
    text(piece, width * 0.02, y);
    fill(0, 200, 220, 10);
    text(piece, width * 0.02 + 2, y + 1);
  }

  textAlign(CENTER, CENTER);
  textSize(min(width * 0.14, 120));
  if (typeof setDeepZoneTitleFontBold === "function") {
    setDeepZoneTitleFontBold();
  } else {
    textFont(
      typeof TREE_CANVAS_FONTS !== "undefined"
        ? TREE_CANVAS_FONTS.deepZoneTitle
        : "Playfair Display"
    );
    textStyle(BOLD);
  }
  fill(255, 40, 60, 7);
  text(AS_DEEP_SYS_HEADLINE, width * 0.5 + 2, height * 0.5 + 1);
  fill(0, 200, 255, 6);
  text(AS_DEEP_SYS_HEADLINE, width * 0.5 - 2, height * 0.5 - 1);
  fill(40, 40, 48, 10);
  text(AS_DEEP_SYS_HEADLINE, width * 0.5, height * 0.5);

  stroke(255, 0, 40, 40);
  strokeWeight(1);
  for (let y = 0; y < height; y += 4) {
    let f = noise(ns, y * 0.02, t);
    stroke(0, 0, 0, 18 + f * 30);
    line(0, y, width, y);
  }
  noStroke();
  blendMode(ADD);
  for (let i = 0; i < 18; i++) {
    let y = noise(ns + i * 2, t * 0.6) * height;
    let h = 2 + noise(i, t) * 10;
    fill(255, 40, 80, 14);
    rect(0, y, width, h);
  }
  blendMode(BLEND);
  fill(0, 0, 0, 70);
  rect(0, 0, width, height * 0.1);
  rect(0, height * 0.9, width, height * 0.1);
}

/**
 * Universali fazė pagal progresą 0…1. „Aš“ (2) naudoja getAsDeepPhase()
 * (viduje – getAsDeepProgress() = asDeepLoadCommittedMs / AS_DEEP_LOAD_MS, „Aš“ zonoje getAsDeepLoadProgress() = tas pats).
 */
function getDeepZonePhaseForProgress(zone, progress01) {
  if (zone === 2 && typeof getAsDeepPhase === "function") {
    return getAsDeepPhase();
  }
  return getDeepUniversalPhase(progress01);
}

function getDeepZonePhase(zone) {
  let p = typeof deepGrowthProgress === "number" ? deepGrowthProgress : 0;
  return getDeepZonePhaseForProgress(zone, p);
}

function getPyktisCoreScreen() {
  let m =
    typeof DEEP_ZONE_PYKTIS !== "undefined"
      ? DEEP_ZONE_PYKTIS
      : { coreX: 0.5, coreY: 0.46, coreRadius: 56 };
  return {
    cx: width * m.coreX,
    cy: height * m.coreY,
    r: m.coreRadius
  };
}

function isPointerOverPyktisCore(px, py) {
  let c = getPyktisCoreScreen();
  let boost = typeof getTouchPickRadiusBoost === "function" ? getTouchPickRadiusBoost() : 1;
  return dist(px, py, c.cx, c.cy) < c.r * boost * 1.05;
}

/** Matomas branduolio spindulys (ekrano proporcijos) — atskirta nuo didelio paspaudimo taikinio. */
function getPyktisVisualDiskRadius() {
  let m = min(width, height);
  return constrain(m * 0.092, 46, m * 0.138);
}

function getPyktisRingRadius(diskR) {
  return diskR * 1.4;
}

/**
 * „PERŽENGTA“ centras (CENTER / CENTER) — po raudonu apskritimu, ne ant jo.
 */
function getPyktisPerzengtaTextCenterY(pzTs) {
  let c = getPyktisCoreScreen();
  let diskR = getPyktisVisualDiskRadius();
  /* Piešinys: didžiausias elipsės spindulys ≈ diskR * 1.01; šviesa/tamsa — dar + margin. */
  let pad = 20 + (typeof width === "number" ? width * 0.026 : 0);
  let rBottom = diskR * 1.18;
  return c.cy + rBottom + pad + pzTs * 0.5;
}

/**
 * Aš: tas pats progreso žiedas kaip atminties gilyje — virš pointerio, be „spausk ir laikyk“.
 * Kviečiama po drawDeepEntranceFadeOverlay, kad nebūtų uždengta įėjimo tamsa.
 */
function getTreeCanvasPointerXy() {
  if (typeof touches !== "undefined" && touches && touches.length > 0) {
    return { x: touches[0].x, y: touches[0].y };
  }
  return { x: mouseX, y: mouseY };
}

function drawAsDeepHoldLaikykNearPointer() {
  if (typeof getAsDeepShowSulauzyk === "function" && getAsDeepShowSulauzyk()) {
    return;
  }
  let p = typeof getAsDeepProgress === "function" ? getAsDeepProgress() : 0;
  if (p >= 0.998) {
    return;
  }
  let ptr = getTreeCanvasPointerXy();
  let hx = constrain(ptr.x, 36, width - 36);
  let hy = constrain(ptr.y - 26, 28, height - 10);
  drawDeepMemoryProgressRing(hx, hy, p, 2);
}

/**
 * Atminties zonos (Juokas–Empatija): mažas progreso žiedas — `deepGrowthProgress` / `deepZoneGrowth[zona]`.
 */
function drawDeepMemoryProgressRing(cx, cy, progress01, zoneId) {
  let p = constrain(progress01, 0, 1);
  let zt = getDeepZoneTextColor(zoneId);
  let ringR = min(11, max(5, width * 0.012));
  let holding = typeof isPointerDown !== "undefined" && isPointerDown;
  let pulse = holding ? 0.92 + 0.08 * sin(millis() * 0.005) : 1;
  push();
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);
  let tr = lerp(zt[0], 42, 0.62);
  let tg = lerp(zt[1], 40, 0.62);
  let tb = lerp(zt[2], 52, 0.62);
  stroke(tr, tg, tb, 44 * pulse);
  strokeWeight(0.95);
  ellipse(cx, cy, ringR * 2, ringR * 2);
  if (p > 0.0015) {
    let rr = lerp(zt[0], 255, 0.38);
    let rg = lerp(zt[1], 255, 0.3);
    let rb = lerp(zt[2], 255, 0.24);
    stroke(rr, rg, rb, (185 + 70 * p) * pulse);
    strokeWeight(1.25);
    let a0 = -HALF_PI;
    arc(cx, cy, ringR * 2, ringR * 2, a0, a0 + TAU * p);
  }
  pop();
}

/**
 * Juokas / Jautrumas / Drama / Meilė / Empatija: mažas progreso žiedas prie pelės —
 * 1 ir 2 fazėje, kol neužpildyta frazė (tas pats elgesys visoms atminties zonoms).
 */
function drawDeepMemoryHoldLaikykNearPointer() {
  if (typeof focusedZone !== "number" || !isDeepMemoryTreeZone(focusedZone)) {
    return;
  }
  let p = constrain(typeof deepGrowthProgress === "number" ? deepGrowthProgress : 0, 0, 1);
  if (p >= 0.998) {
    return;
  }
  let ptr = getTreeCanvasPointerXy();
  let hx = constrain(ptr.x, 36, width - 36);
  let hy = constrain(ptr.y - 26, 28, height - 10);
  drawDeepMemoryProgressRing(hx, hy, p, focusedZone);
}

/**
 * Pyktis (8): „charge → break“ — tik šiai zonai. Kiti gyliai lieka su savo hold progresu.
 * Ramybė → kaupiasi → sprogimas → išsikrovimas.
 */
function updatePyktisDeepProgress() {
  // Use touch coordinates when available so hold works on mobile too.
  let ptx = (typeof touches !== "undefined" && touches.length > 0) ? touches[0].x : mouseX;
  let pty = (typeof touches !== "undefined" && touches.length > 0) ? touches[0].y : mouseY;
  let over = isPointerOverPyktisCore(ptx, pty);
  let explDur =
    typeof PYKTIS_EXPLOSION_FRAMES === "number" ? PYKTIS_EXPLOSION_FRAMES : 52;

  if (typeof pyktisExplosionFramesLeft === "number" && pyktisExplosionFramesLeft > 0) {
    pyktisExplosionFramesLeft--;
    if (typeof pyktisCoreHoldLatched !== "undefined") {
      pyktisCoreHoldLatched = false;
    }
    deepGrowthProgress = 1;
    growthProgress = 1;
    deepHoldFrames = 0;
    deepHoldStartMs = -1;
    if (typeof pyktisPrevCharge === "number") {
      pyktisPrevCharge = 1;
    }
    if (pyktisExplosionFramesLeft === 0) {
      pyktisAngerCharge = 0;
      deepGrowthProgress = 0;
      growthProgress = 0;
      if (typeof pyktisPrevCharge === "number") {
        pyktisPrevCharge = 0;
      }
      if (typeof pyktisPostBreakCalm !== "undefined") {
        pyktisPostBreakCalm = true;
      }
      if (typeof pyktisDeepBrokenLatched !== "undefined") {
        pyktisDeepBrokenLatched = true;
      }
      // Explosion done: forcibly eject user back to tree view with a brief delay
      if (typeof _pyktisAutoEjectScheduledMs === "undefined") {
        window._pyktisAutoEjectScheduledMs = millis() + 420;
      } else {
        _pyktisAutoEjectScheduledMs = millis() + 420;
      }
    }
    deepZoneGrowth[8] = deepGrowthProgress;
    return;
  }

  // Time-based rates: Pyktis kraunasi lėčiau nei kiti gyliai (laikant ant branduolio).
  let dt = constrain(deltaTime / 1000, 0, 0.1);
  let rateUp   = 0.26 * dt;
  let rateDown = 0.20 * dt;  // ~5s to empty
  if (typeof getEmotionGrowthMultiplier === "function") {
    rateUp *= getEmotionGrowthMultiplier();
  }
  if (typeof getEmotionPersistenceSmooth === "function") {
    let persist = getEmotionPersistenceSmooth();
    rateUp   *= lerp(0.88, 1.14, persist);
    rateDown *= lerp(0.90, 1.06, persist);
  }
  if (typeof deepZoneEntryCount !== "undefined" && (deepZoneEntryCount[8] | 0) === 1) {
    rateUp *= 1.18;
  }

  if (typeof isPointerDown !== "undefined" && !isPointerDown) {
    if (typeof pyktisCoreHoldLatched !== "undefined") {
      pyktisCoreHoldLatched = false;
    }
  } else if (over && typeof isPointerDown !== "undefined" && isPointerDown) {
    if (typeof pyktisCoreHoldLatched !== "undefined") {
      pyktisCoreHoldLatched = true;
    }
  }

  let holdPyktisCore =
    typeof isPointerDown !== "undefined" &&
    isPointerDown &&
    typeof pyktisCoreHoldLatched !== "undefined" &&
    pyktisCoreHoldLatched;

  if (holdPyktisCore) {
    if (typeof pyktisPostBreakCalm !== "undefined") {
      pyktisPostBreakCalm = false;
    }
    deepHoldFrames++;
    pyktisAngerCharge = constrain(
      (typeof pyktisAngerCharge === "number" ? pyktisAngerCharge : 0) + rateUp,
      0,
      1
    );
    if (deepHoldStartMs < 0) {
      deepHoldStartMs = millis();
    }
  } else {
    deepHoldFrames = 0;
    pyktisAngerCharge = constrain(
      (typeof pyktisAngerCharge === "number" ? pyktisAngerCharge : 0) - rateDown,
      0,
      1
    );
    deepHoldStartMs = -1;
  }

  let prev =
    typeof pyktisPrevCharge === "number" ? pyktisPrevCharge : pyktisAngerCharge;
  if (
    pyktisAngerCharge >= 1 &&
    typeof pyktisExplosionFramesLeft === "number" &&
    pyktisExplosionFramesLeft === 0 &&
    prev < 0.998
  ) {
    pyktisExplosionFramesLeft = explDur;
  }
  if (typeof pyktisPrevCharge === "number") {
    pyktisPrevCharge = pyktisAngerCharge;
  }

  deepGrowthProgress = pyktisAngerCharge;
  growthProgress = deepGrowthProgress;
  deepZoneGrowth[8] = deepGrowthProgress;
}

/** Įtampa pagal 3 fazes (kaupimasis / riba / peržengta). */
function getPyktisStressFromCharge(p) {
  p = constrain(p, 0, 1);
  if (p < 0.33) {
    return map(p, 0, 0.33, 0, 0.14);
  }
  if (p < 0.66) {
    return map(p, 0.33, 0.66, 0.14, 0.55);
  }
  return map(p, 0.66, 1, 0.55, 1);
}

/** Glitch tik 2–3 fazėse; ne „screensaver“ nuo pradžių. */
function getPyktisGlitchRevealFromCharge(p) {
  p = constrain(p, 0, 1);
  if (p < 0.3) {
    return 0;
  }
  if (p < 0.55) {
    return map(p, 0.3, 0.55, 0.02, 0.22);
  }
  if (p < 0.82) {
    return map(p, 0.55, 0.82, 0.22, 0.62);
  }
  return map(p, 0.82, 1, 0.62, 1);
}

function getPyktisChargePhase(charge, explosionFramesLeft) {
  if (typeof explosionFramesLeft === "number" && explosionFramesLeft > 0) {
    return 4;
  }
  let c = constrain(charge, 0, 1);
  if (c < 0.33) {
    return 1;
  }
  if (c < 0.66) {
    return 2;
  }
  if (c < 1) {
    return 3;
  }
  return 4;
}

function drawDeepHoldRing(cx, cy, progress01, rgb, ringR, chargePhase) {
  let p = constrain(progress01, 0, 1);
  let stress = getPyktisStressFromCharge(p);
  let r = rgb || [200, 200, 200];
  let ph = typeof chargePhase === "number" ? chargePhase : 1;
  let sweepP = p;
  if (ph >= 2) {
    sweepP = min(1, p * 1.14);
  }
  if (ph >= 3) {
    sweepP = min(1, sweepP * 1.12);
  }
  let jitter =
    sin(frameCount * (0.28 + ph * 0.05)) * (1.2 + stress * 5.2) +
    random(-1, 1) * stress * 2.9;
  let jy =
    cos(frameCount * (0.25 + ph * 0.045)) * (0.85 + stress * 3.6) +
    random(-1, 1) * stress * 2.4;
  let acx = cx + jitter;
  let acy = cy + jy;
  noFill();
  if (ph >= 2) {
    stroke(r[0] * 0.35, r[1] * 0.35, r[2] * 0.35, 18 + stress * 28);
    strokeWeight(1.5);
    ellipse(
      acx + random(-0.5, 0.5) * stress,
      acy + random(-0.5, 0.5) * stress,
      ringR * 2,
      ringR * 2
    );
  }
  let rr = constrain(r[0], 40, 255);
  let rg = constrain(max(r[1], r[0] * 0.12), 8, 120);
  let rb = constrain(max(r[2], r[0] * 0.14), 10, 130);
  stroke(rr, rg, rb, 165 + stress * 88);
  strokeWeight(ph >= 3 ? 3.2 : 2.6);
  let a0 = -HALF_PI;
  let sweep = TAU * constrain(sweepP, 0, 1);
  if (p > 0.72 && stress > 0.52) {
    let chunks = floor(lerp(5, 9, map(p, 0.72, 1, 0, 1)));
    let gap = (0.04 + stress * 0.07) / chunks;
    let seg = (sweep - gap * chunks) / chunks;
    let ang = a0;
    for (let k = 0; k < chunks; k++) {
      let ox = random(-2.2, 2.2) * stress;
      let oy = random(-2.2, 2.2) * stress;
      let da = random(-0.05, 0.05) * stress;
      arc(acx + ox, acy + oy, ringR * 2, ringR * 2, ang + da, ang + seg + da);
      ang += seg + gap;
    }
    stroke(min(255, rr * 1.08), rg * 0.82, rb * 0.88, 62 + stress * 62);
    strokeWeight(2);
    arc(
      acx + 2.5 * stress,
      acy - 1.8 * stress,
      ringR * 2 - 6,
      ringR * 2 - 6,
      a0 + random(-0.04, 0.04),
      a0 + sweep * (0.94 + random(-0.03, 0.03))
    );
  } else {
    arc(acx, acy, ringR * 2, ringR * 2, a0, a0 + sweep);
  }
}

/** Žaibo tipo atšakos — daugiausia 3 fazėje. */
function drawPyktisElectricSparks(cx, cy, charge01, chargePhase) {
  let p = constrain(charge01, 0, 1);
  let ph = typeof chargePhase === "number" ? chargePhase : 1;
  if (ph < 3 && p < 0.72) {
    return;
  }
  let gate = ph >= 3 ? map(p, 0.58, 1, 0, 1) : map(p, 0.72, 1, 0, 1);
  gate = constrain(gate, 0, 1);
  if (gate <= 0.02) {
    return;
  }
  let stressP = getPyktisStressFromCharge(p);
  let intensity = ph >= 3 ? max(gate, stressP * 0.92) : gate;
  intensity = constrain(intensity, 0, 1);
  let n = floor(lerp(4, 13, intensity));
  let reach = lerp(62, 128, intensity);
  push();
  let diskR =
    typeof getPyktisVisualDiskRadius === "function" ? getPyktisVisualDiskRadius() : 72;
  strokeCap(SQUARE);
  for (let i = 0; i < n; i++) {
    let r0 = diskR * (0.18 + random() * 0.1);
    stroke(255, 80, 80, random(95, 205) * (0.55 + 0.45 * intensity));
    strokeWeight(constrain(0.22 + random() * 0.38 * intensity, 0.18, 0.48));
    let a0 = random(TAU);
    let x1 = cx + cos(a0) * r0;
    let y1 = cy + sin(a0) * r0;
    let x2 = cx + random(-reach, reach);
    let y2 = cy + random(-reach, reach);
    line(x1, y1, x2, y2);
    if (intensity > 0.45 && random() < 0.42) {
      stroke(255, 120, 100, random(60, 140) * intensity);
      strokeWeight(constrain(0.18 + random() * 0.28 * intensity, 0.14, 0.38));
      line(x2, y2, x2 + random(-28, 28), y2 + random(-28, 28));
    }
  }
  pop();
}

/**
 * Procedūrinis „electric red lines“ laukas (ADD) — panašus į energingą raudoną tinklelį
 * (įkvėpta electric-line stock estetikos; be išorinio video).
 */
function drawPyktisEnergeticRedMesh(p01, chargePhase) {
  let ph = typeof chargePhase === "number" ? chargePhase : 1;
  let p = constrain(p01, 0, 1);
  let stress = getPyktisStressFromCharge(p);
  let energy =
    ph === 1
      ? constrain(p * 0.48, 0, 0.44)
      : ph === 2
        ? constrain(0.32 + stress * 0.72, 0, 0.94)
        : ph === 3
          ? constrain(0.58 + stress * 0.55, 0, 1)
          : 1;
  let calmMul = lerp(0.16, 1, pow(p, 0.78));
  energy *= calmMul;
  if (energy < 0.028) {
    return;
  }

  let dim = min(width, height);
  let t = frameCount * 0.017;
  let c = getPyktisCoreScreen();
  let cx = c.cx;
  let cy = c.cy;
  let diskR = typeof getPyktisVisualDiskRadius === "function" ? getPyktisVisualDiskRadius() : 72;

  push();
  blendMode(ADD);
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);

  let nH = floor(lerp(10, 48, energy));
  for (let i = 0; i < nH; i++) {
    let yBase =
      (i + 0.5) * (height / max(8, nH * 0.82)) +
      sin(t * 1.1 + i * 0.73) * (8 + energy * 18);
    let a = constrain(6 + energy * 72 * noise(i * 0.17, t * 0.4), 4, 105);
    strokeWeight(0.42 + energy * 1.22 * noise(i * 0.31, 2.2));
    stroke(
      200 + 45 * noise(i, t * 0.2),
      12 + stress * 70 * noise(i + 1, t * 0.15),
      22 + stress * 55 * noise(i + 2, t * 0.12),
      a * (0.38 + 0.62 * noise(i * 0.5, t * 0.08))
    );
    beginShape();
    let steps = 32;
    for (let s = 0; s <= steps; s++) {
      let u = s / steps;
      let x = u * width;
      let y =
        yBase +
        sin(u * TAU * 2.2 + t * 1.8 + i * 0.4) * (5 + energy * 32) * noise(u * 6 + i * 0.1, t * 0.5);
      vertex(x, y);
    }
    endShape();
  }

  let nV = floor(lerp(6, 32, energy));
  for (let j = 0; j < nV; j++) {
    let xBase = noise(j * 2.7, t * 0.35) * width;
    let a2 = constrain(8 + energy * 88 * noise(j * 0.4, t * 0.25), 5, 118);
    strokeWeight(0.38 + energy * 1 * noise(j + 3, t * 0.3));
    stroke(255, 28 + stress * 95, 48, a2 * (0.32 + 0.68 * noise(t + j, 0.3)));
    beginShape();
    let stepsV = 22;
    for (let s = 0; s <= stepsV; s++) {
      let u = s / stepsV;
      let y = u * height;
      let x = xBase + (noise(s * 0.35 + j * 0.2, t * 0.6) - 0.5) * (12 + energy * 52);
      vertex(x, y);
    }
    endShape();
  }

  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, diskR * 0.945, 0, Math.PI * 2);
    ctx.clip();
  }
  strokeCap(SQUARE);
  strokeJoin(MITER);

  let ringsIn = floor(lerp(8, 28, energy));
  for (let ri = 0; ri < ringsIn; ri++) {
    let rr = diskR * lerp(0.1, 0.9, (ri + 0.5) / max(1, ringsIn));
    let aR = constrain(10 + energy * 85 * noise(ri * 0.22, t * 0.35), 6, 125);
    strokeWeight(constrain(0.14 + energy * 0.42 * noise(ri + 8, t * 0.28), 0.1, 0.3));
    stroke(
      210 + 40 * noise(ri, t * 0.18),
      14 + stress * 75 * noise(ri + 1, t * 0.12),
      24 + stress * 50 * noise(ri + 2, t * 0.1),
      aR * (0.4 + 0.6 * noise(ri * 0.6, t * 0.07))
    );
    beginShape();
    let nseg = 44;
    for (let g = 0; g <= nseg; g++) {
      let ang = (g / nseg) * TAU + t * 0.25 + ri * 0.08;
      let jitter = (noise(ri * 1.7, g * 0.12, t * 0.55) - 0.5) * diskR * 0.055 * energy;
      let rr2 = rr + jitter;
      vertex(cx + cos(ang) * rr2, cy + sin(ang) * rr2);
    }
    endShape(CLOSE);
  }

  if (ctx) {
    ctx.restore();
  }
  strokeCap(ROUND);
  strokeJoin(ROUND);

  let bolts = floor(lerp(4, 26, energy * (0.45 + stress * 0.55)));
  for (let k = 0; k < bolts; k++) {
    let ang = k * (TAU / max(1, bolts)) + t * 0.55 + sin(k * 1.7) * 0.35;
    let len = lerp(dim * 0.18, dim * 0.58, energy) * (0.55 + noise(k * 0.8, t) * 0.5);
    let stepsB = 14;
    let rStart = diskR * (0.16 + noise(k * 1.7, 1) * 0.08);
    strokeWeight(constrain(0.32 + energy * 0.75 * noise(k + 5, t), 0.24, 0.52));
    stroke(255, 55 + stress * 120, 70, 22 + energy * 95 * noise(k, t * 0.2));
    beginShape();
    let px = cx + cos(ang) * rStart;
    let py = cy + sin(ang) * rStart;
    vertex(px, py);
    for (let s = 1; s <= stepsB; s++) {
      let u = s / stepsB;
      let r = rStart + (len - rStart) * u;
      let wobble =
        (noise(k * 2.1 + s * 0.6, t * 0.9) - 0.5) * (10 + energy * 36) * (1 - u * 0.35);
      let px2 = cx + cos(ang) * r + wobble * cos(ang + HALF_PI);
      let py2 = cy + sin(ang) * r + wobble * sin(ang + HALF_PI);
      ang += (noise(s * 0.5, k + t) - 0.5) * 0.38 * energy;
      vertex(px2, py2);
      px = px2;
      py = py2;
    }
    endShape();
    if (energy > 0.55 && noise(k * 3, t * 0.4) > 0.62) {
      stroke(255, 180, 160, 40 + energy * 70);
      strokeWeight(0.35);
      let fork = len * (0.35 + noise(k, t) * 0.25);
      line(px, py, px + cos(ang + 1.1) * fork, py + sin(ang + 1.1) * fork);
      line(px, py, px + cos(ang - 0.9) * fork * 0.85, py + sin(ang - 0.9) * fork * 0.85);
    }
  }

  blendMode(BLEND);
  pop();
}

/**
 * Pyktis fonas: ne gryna juoda, glitch stiprėja su įkrova, grain + vignette.
 */
function drawDeepPyktisBackground(p01, visits, chargePhase) {
  let p = constrain(p01, 0, 1);
  let ph =
    typeof chargePhase === "number"
      ? chargePhase
      : getPyktisChargePhase(
          p01,
          typeof pyktisExplosionFramesLeft === "number"
            ? pyktisExplosionFramesLeft
            : 0
        );
  let stress = getPyktisStressFromCharge(p);
  if ((visits | 0) === 1) {
    stress = min(1, stress * 1.18);
  }
  let c = getPyktisCoreScreen();
  let cx = c.cx;
  let cy = c.cy;
  let glitchReveal = getPyktisGlitchRevealFromCharge(p);
  if ((visits | 0) === 1) {
    glitchReveal = constrain(glitchReveal * 1.22, 0, 1);
  }
  let glitchRamp = constrain(0.03 + pow(p, 1.32) * 0.97, 0.03, 1) * glitchReveal;
  let over = isPointerOverPyktisCore(mouseX, mouseY);
  let bandHalf = height * 0.2;
  let bandTop = cy - bandHalf;
  let bandH = bandHalf * 2;

  let vR = 10;
  let vG = 4;
  let vB = 12;
  if (ph === 1) {
    background(vR, vG, vB);
  } else if (ph === 2) {
    background(min(44, vR + 10), min(30, vG + 5), min(40, vB + 9));
  } else {
    background(min(52, vR + 20), min(26, vG + 11), min(48, vB + 16));
  }

  noStroke();
  let dim = min(width, height);
  if (ph === 1) {
    fill(18, 6, 14, 8 + p * 14);
    ellipse(cx, cy, dim * 0.22 + stress * 18, dim * 0.19 + stress * 14);
  } else {
    fill(28 + stress * 32, 4 + stress * 8, 14 + stress * 18, 12 + p * 24 + (ph >= 3 ? 12 : 0));
    ellipse(cx, cy, dim * 0.3 + stress * 36, dim * 0.26 + stress * 28);
  }

  if (ph >= 2) {
    fill(42 + stress * 48, 6 + stress * 10, 18 + stress * 22, 10 + stress * 30);
    ellipse(cx, cy, dim * 0.55, dim * 0.48);
  }

  let holdPulse =
    typeof focusedZone !== "undefined" &&
    focusedZone === 8 &&
    typeof isPointerDown !== "undefined" &&
    isPointerDown &&
    p > 0.04;
  if (holdPulse || over) {
    fill(62, 8, 22, (holdPulse ? 14 : 6) + stress * 20);
    ellipse(cx, cy, dim * 0.34 + stress * 42, dim * 0.3 + stress * 34);
  }

  if (ph >= 3 && p > 0.78 && frameCount % 9 < 3) {
    noStroke();
    fill(28, 4, 10, 20 + stress * 38);
    rect(0, 0, width, height);
  }

  let gTick = frameCount * 0.035 + (typeof deepSeed === "number" ? deepSeed * 0.001 : 0);
  if (glitchRamp > 0.042) {
    let n = floor(lerp(1, 26, glitchRamp * stress));
    let clipL = max(0, cx - width * 0.48);
    let clipR = min(width, cx + width * 0.48);
    for (let i = 0; i < n; i++) {
      let yy = bandTop + noise(i * 0.61, gTick) * bandH;
      let span = clipR - clipL;
      let xx = clipL + noise(i * 1.02, gTick + 1) * span;
      let ww = 12 + noise(i * 0.48, gTick + 2) * min(118, width * 0.16);
      xx = constrain(xx, clipL, clipR - ww);
      fill(
        120 + noise(i, gTick) * 55,
        10 + noise(i + 1, gTick) * 28,
        18 + noise(i + 2, gTick) * 32,
        (4 + noise(i * 0.33, gTick + 3) * 18) * glitchRamp * (0.45 + stress * 0.55)
      );
      rect(xx, yy, ww, 1 + floor(noise(i * 0.7, gTick + 4) * 2.2));
    }
    let nSpark = floor(lerp(0, 10, (glitchRamp - 0.12) * stress));
    for (let j = 0; j < nSpark; j++) {
      let yy = bandTop + noise(j * 1.2 + 8, gTick + 5) * bandH;
      let xx = cx + (noise(j * 0.85, gTick + 6) - 0.5) * width * 0.76;
      stroke(255, 70, 95, (8 + noise(j, gTick) * 18) * glitchRamp);
      strokeWeight(1);
      line(
        xx,
        yy,
        xx + (noise(j + 1, gTick) - 0.5) * 28,
        yy + (noise(j + 2, gTick) - 0.5) * 7
      );
    }
  }

  noStroke();
  fill(0, 0, 0, ph === 1 ? 20 + stress * 24 : 14 + stress * 30);
  ellipse(cx, cy, dim * 0.52 + stress * 24, dim * 0.44 + stress * 20);

  drawPyktisFilmGrainAndVignette(cx, cy, stress);
}

function drawPyktisFilmGrainAndVignette(cx, cy, stress) {
  let d = min(width, height);
  let seedJ = typeof deepSeed === "number" ? deepSeed * 0.001 : 0;
  let t = millis() * 0.0011;
  noStroke();
  let nDots = floor(lerp(200, 400, 0.1 + stress * 0.28));
  for (let i = 0; i < nDots; i++) {
    let x = noise(seedJ + i * 0.073, t + i * 0.031) * width;
    let y = noise(seedJ + i * 0.11 + 2.2, t * 0.88 + i * 0.024) * height;
    let a = (5 + noise(i * 0.35, t * 1.2) * 11) * 0.4;
    let g = 108 + noise(i * 0.52, t) * 55;
    fill(g, g * 0.9, min(255, g * 1.02), a);
    rect(x, y, 1.1, 1.1);
  }
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx && typeof ctx.createRadialGradient === "function") {
    ctx.save();
    let grd = ctx.createRadialGradient(cx, cy, d * 0.06, cx, cy, d * 0.72);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(0.42, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(2,0,6," + str(0.58 + stress * 0.22) + ")");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

function drawPyktisBrokenBranch(x1, y1, x2, y2, p, seed) {
  let mx =
    lerp(x1, x2, 0.5) + (noise(seed, p * 3, frameCount * 0.01) - 0.5) * 42 * p;
  let my =
    lerp(y1, y2, 0.5) + (noise(seed + 1, p * 3, frameCount * 0.01) - 0.5) * 38 * p;
  line(x1, y1, mx, my);
  line(mx, my, x2, y2);
  if (p > 0.4) {
    let bx = lerp(mx, x2, 0.55);
    let by = lerp(my, y2, 0.55);
    line(
      mx,
      my,
      bx + (noise(seed + 2, frameCount * 0.02) - 0.5) * 26 * p,
      by + (noise(seed + 3, frameCount * 0.02) - 0.5) * 24 * p
    );
  }
}

function drawPyktisCrackCross(p01, over, reveal) {
  let p = constrain(p01, 0, 1);
  let rv = constrain(typeof reveal === "number" ? reveal : 1, 0, 1);
  if (rv < 0.07) {
    return;
  }
  let sh = sin(frameCount * 0.2) * (2 + p * 5);
  let sh2 = sin(frameCount * 0.14) * (1.4 + p * 3.5);
  let sh3 = cos(frameCount * 0.17) * (1.6 + p * 3);
  if (over) {
    sh += sin(frameCount * 0.31) * 1.1;
    sh2 += cos(frameCount * 0.27) * 0.9;
  }
  let a = (155 + p * 85) * rv;
  noFill();
  stroke(175 + p * 65, 95 + p * 45, 95 + p * 40, a);
  strokeCap(SQUARE);
  strokeJoin(MITER);
  let sw = 0.38 + p * 0.32;
  let fc = frameCount * 0.055;
  let crackJag = (x1, y1, x2, y2, seed) => {
    strokeWeight(sw);
    let n = floor(lerp(7, 14, p));
    beginShape();
    for (let k = 0; k <= n; k++) {
      let t = k / n;
      let x = lerp(x1, x2, t);
      let y = lerp(y1, y2, t);
      let nx = x2 - x1;
      let ny = y2 - y1;
      let len = max(0.001, sqrt(nx * nx + ny * ny));
      let px = -ny / len;
      let py = nx / len;
      let j =
        (noise(seed, k * 0.55, fc) - 0.5) *
        (4.2 + p * 9) *
        (0.35 + abs(t - 0.5) * 1.15);
      vertex(x + px * j, y + py * j);
    }
    endShape();
  };
  crackJag(-34 + sh, -4 + sh3, 32 + sh2, 6 - sh, 11);
  crackJag(-26 + sh2, 7 - sh3, 38 - sh, -3 + sh2, 17);
  crackJag(-3 + sh3, -36 + sh, 5 - sh2, 34 + sh, 23);
  crackJag(4 - sh, -30 + sh2, -4 + sh3, 38 - sh, 29);
  noStroke();
}

/** Pykčio branduolys: pelės trauka, kvėpavimas, dalelės, „akis“; finalas — glitch + magenta. */
function drawDeepPyktisCore(p01, phase, visits, diskR) {
  let p = constrain(p01, 0, 1);
  let stress = getPyktisStressFromCharge(p);
  let c = getPyktisCoreScreen();
  let over = isPointerOverPyktisCore(mouseX, mouseY);
  let ph = typeof phase === "number" ? phase : 1;
  let outerR =
    typeof diskR === "number" && diskR > 0 ? diskR : getPyktisVisualDiskRadius();
  let crackReveal = constrain(map(stress, 0.12, 0.72, 0, 1), 0, 1);
  let tension =
    map(stress, 0, 1, 0, 4.8) * (ph >= 3 ? 1.12 : 1) + (over ? 1.15 : 0);
  let jitterScale = 0.1 + stress * 0.88;
  let sx = (noise(frameCount * 0.065 * jitterScale, 1) - 0.5) * tension * 1.15;
  let sy = (noise(frameCount * 0.072 * jitterScale, 2) - 0.5) * tension * 1.15;

  let ptr =
    typeof getTreeCanvasPointerXy === "function"
      ? getTreeCanvasPointerXy()
      : { x: mouseX, y: mouseY };
  let vnx = (ptr.x - c.cx) / max(120, width * 0.35);
  let vny = (ptr.y - c.cy) / max(120, height * 0.35);
  let pull = 0.12 + stress * 0.14;
  let mxNudge = constrain(vnx, -1, 1) * outerR * pull;
  let myNudge = constrain(vny, -1, 1) * outerR * pull * 0.9;
  let breathe = 1 + sin(millis() * 0.00105) * (0.024 + stress * 0.02);

  let pyFinal =
    (typeof pyktisExplosionFramesLeft === "number" && pyktisExplosionFramesLeft > 0) ||
    (typeof pyktisDeepBrokenLatched !== "undefined" && pyktisDeepBrokenLatched);

  push();
  translate(c.cx + mxNudge * 0.42, c.cy + myNudge * 0.42);
  scale(breathe);
  translate(sx * 0.48, sy * 0.48);

  noStroke();
  fill(
    6 + p * 14,
    0,
    2,
    (140 + stress * 95) * (0.38 + 0.62 * crackReveal)
  );
  ellipse(0, 0, outerR * 2.02, outerR * 2.02);

  fill(
    lerp(38, 168, stress),
    lerp(2, 32, stress),
    lerp(8, 48, stress),
    (118 + stress * 130) * (0.5 + 0.5 * crackReveal)
  );
  ellipse(0, 0, outerR * 1.92, outerR * 1.92);

  if (ph >= 3 && p > 0.86) {
    let flash = sin(frameCount * 0.88 + p * 6) * 0.5 + 0.5;
    if (flash > 0.78) {
      fill(112, 14, 26, 26 + stress * 42);
      ellipse(0, 0, outerR * 1.55, outerR * 1.55);
    }
  }

  let pulseSpd = ph >= 3 ? 0.36 : 0.2;
  let pulse =
    sin(frameCount * pulseSpd) * (2.8 + stress * (ph >= 3 ? 9 : 5.5)) +
    sin(frameCount * (0.11 + p * 0.14)) * (1.2 + stress * 3);
  if (over) {
    pulse += sin(frameCount * 0.27) * 2.1;
  }
  if (over && typeof isPointerDown !== "undefined" && isPointerDown) {
    pulse += sin(frameCount * (ph >= 3 ? 0.52 : 0.42)) * (1.8 + stress * 3);
  }
  fill(
    108 + p * 72 + (ph >= 3 ? 35 * stress : 0),
    10 + stress * 36,
    16 + stress * 42,
    (88 + stress * 120) * (0.48 + 0.52 * crackReveal)
  );
  ellipse(0, 0, outerR * 0.4 + pulse, outerR * 0.4 + pulse);

  if (!pyFinal) {
    let nP = 26;
    let ms = millis() * 0.00028;
    for (let i = 0; i < nP; i++) {
      let ang = (i / nP) * TAU + ms * 1.2 + noise(i * 0.18) * 0.35;
      let t0 = (ms * 1.4 + i * 0.19) % 1;
      let rad = lerp(outerR * 1.08, outerR * 0.2, pow(t0, 0.82));
      let px = cos(ang) * rad;
      let py = sin(ang) * rad;
      let alpha = (22 + 35 * (1 - t0)) * (0.35 + stress * 0.45);
      noStroke();
      fill(255, 95, 118, alpha);
      circle(px, py, 1 + (1 - t0) * 1.8);
    }
    fill(255, 248, 252, 230);
    circle(0, 0, 3.2 + stress * 1.8);
    fill(255, 160, 185, 140);
    circle(0, 0, 1.8);
  }

  if (ph >= 2 && crackReveal > 0.18) {
    push();
    scale(outerR / 44);
    drawPyktisCrackCross(p, over, crackReveal * (ph >= 3 ? 1 : 0.68));
    pop();
  }

  if (pyFinal) {
    let ctxG = typeof drawingContext !== "undefined" ? drawingContext : null;
    if (ctxG) {
      ctxG.save();
      ctxG.beginPath();
      ctxG.arc(0, 0, outerR * 0.96, 0, Math.PI * 2);
      ctxG.clip();
    }
    let shred = 0.55 + 0.45 * sin(frameCount * 0.52);
    noStroke();
    for (let gi = 0; gi < 11; gi++) {
      let yy = -outerR * 0.92 + (gi / 10) * outerR * 1.84;
      let dx = (noise(gi * 0.37, frameCount * 0.11) - 0.5) * outerR * 0.22 * shred;
      fill(255, 25, 120, 28 + gi * 3);
      rect(-outerR * 1.1 + dx, yy, outerR * 2.2, 1.4 + noise(gi + 1, frameCount * 0.08));
      fill(0, 210, 255, 10 + gi * 1.2);
      rect(-outerR * 1.05 - dx * 0.6, yy + 0.6, outerR * 2.1, 0.9);
    }
    if (ctxG) {
      ctxG.restore();
    }
    blendMode(ADD);
    let mg = sin(frameCount * 0.45) * 0.5 + 0.5;
    fill(255, 55, 200, 38 + mg * 32);
    ellipse(0, 0, outerR * 1.12 + pulse * 0.35, outerR * 1.08 + pulse * 0.3);
    fill(255, 140, 220, 24 + mg * 22);
    ellipse(0, 0, outerR * 0.72, outerR * 0.68);
    blendMode(BLEND);
  }

  noStroke();
  pop();
}

/** Skaitmeninės „dulkės“ tik ekrano kraštuose — ne visas plotas. */
function drawPyktisCodeRain(charge01, explFramesLeft) {
  let c = constrain(charge01, 0, 1);
  let expl = typeof explFramesLeft === "number" ? explFramesLeft : 0;
  if (c <= 0.58 && expl <= 0) {
    return;
  }
  let dur =
    typeof PYKTIS_EXPLOSION_FRAMES === "number" ? PYKTIS_EXPLOSION_FRAMES : 52;
  let peak =
    expl > 0
      ? expl / dur
      : map(c, 0.58, 1, 0.2, 1);
  peak = constrain(peak, 0, 1);
  let pc = getPyktisCoreScreen();
  push();
  textAlign(CENTER, CENTER);
  if (typeof setAsGlitchMonoFont === "function") {
    setAsGlitchMonoFont();
  } else {
    textFont(
      typeof TREE_CANVAS_FONTS !== "undefined"
        ? TREE_CANVAS_FONTS.uiMono
        : "Inter"
    );
    textStyle(NORMAL);
  }
  textSize(10);
  let n = floor(lerp(4, 18, peak));
  for (let i = 0; i < n; i++) {
    let x = noise(i * 0.37 + (deepSeed || 1) * 0.001, frameCount * 0.019) * width;
    let y = (frameCount * (4 + peak * 4) + i * 47 + (deepSeed || 0)) % (height + 40);
    y -= 20;
    let edge =
      x < width * 0.1 ||
      x > width * 0.9 ||
      y < height * 0.07 ||
      y > height * 0.93;
    let farFromBand = y < pc.cy - height * 0.26 || y > pc.cy + height * 0.26;
    if (!edge && !farFromBand) {
      continue;
    }
    fill(255, 75, 115, (22 + peak * 48) * (0.45 + noise(i * 0.2) * 0.55));
    text("0 1 0 1", x, y);
  }
  pop();
}

/** Horizontalus copy be dest už drobės ribų (p5 2D kitaip sugadina kadrą). */
function pyktisSafeCopyHStrip(y0, stripH, shiftRaw) {
  if (typeof width !== "number" || typeof height !== "number" || width < 2) {
    return;
  }
  let y = floor(constrain(y0, 0, height - 1));
  let h = max(1, floor(constrain(stripH, 1, height - y)));
  let dx = floor(shiftRaw);
  let srcX = 0;
  let destX = dx;
  if (destX < 0) {
    srcX = -destX;
    destX = 0;
  }
  let copyW = width - srcX;
  if (destX + copyW > width) {
    copyW = width - destX;
  }
  copyW = min(copyW, width - srcX);
  if (copyW < 1 || srcX < 0 || srcX + copyW > width || destX < 0 || destX + copyW > width) {
    return;
  }
  copy(srcX, y, copyW, h, destX, y, copyW, h);
}

/** Nuolatinis „sistema lūžo“ sluoksnis po sprogimo (lieka kol Pyktis gylis atidarytas). */
function drawPyktisDeepBrokenPersistentGlitch() {
  if (
    typeof pyktisDeepBrokenLatched === "undefined" ||
    !pyktisDeepBrokenLatched ||
    (typeof pyktisExplosionFramesLeft === "number" && pyktisExplosionFramesLeft > 0)
  ) {
    return;
  }
  let pc = getPyktisCoreScreen();
  let bandHalf = height * 0.32;
  let yMin = max(0, floor(pc.cy - bandHalf));
  let yMax = min(height - 1, floor(pc.cy + bandHalf));
  let boom = 0.42 + 0.48 * (0.5 + 0.5 * sin(frameCount * 0.13));
  let maxShift = min(156, width * 0.2);
  push();
  let nStrips = floor(lerp(10, 26, boom));
  for (let i = 0; i < nStrips; i++) {
    let y = random(yMin, yMax);
    let h = random(1, 9);
    y = constrain(y, 0, max(0, height - h - 1));
    let shift = random(-maxShift, maxShift) * boom;
    pyktisSafeCopyHStrip(y, h, shift);
  }
  noStroke();
  for (let j = 0; j < 18; j++) {
    let yy = random(0, height - 1);
    let hh = random(1, 4);
    fill(random(0, 40), random(0, 8), random(4, 22), random(10, 55));
    rect(0, yy, width, hh);
  }
  let nSlice = floor(lerp(10, 26, boom));
  for (let k = 0; k < nSlice; k++) {
    let yy = random(height * 0.06, height * 0.94);
    let sh = random(2, 16);
    yy = constrain(yy, 0, max(0, height - sh - 1));
    pyktisSafeCopyHStrip(yy, sh, random(-maxShift, maxShift) * boom);
  }
  pop();
}

/** Sprogimas: blyksnis + persikraipymas tik ribos zonoje (ne visas ekranas). */
function drawPyktisExplosionOverlay() {
  let left =
    typeof pyktisExplosionFramesLeft === "number"
      ? pyktisExplosionFramesLeft
      : 0;
  if (left <= 0) {
    return;
  }
  let dur =
    typeof PYKTIS_EXPLOSION_FRAMES === "number" ? PYKTIS_EXPLOSION_FRAMES : 52;
  let t = left / dur;
  let boom = pow(t, 0.5);
  let maxShift = min(160, width * 0.22);
  let pc = getPyktisCoreScreen();
  let bandHalf = height * 0.24;
  let yMin = max(0, floor(pc.cy - bandHalf));
  let yMax = min(height - 1, floor(pc.cy + bandHalf));
  let framesFromStart = dur - left;

  if (framesFromStart < 10) {
    push();
    noStroke();
    let e = constrain(framesFromStart / 9, 0, 1);
    let ease = 1 - pow(1 - e, 2.2);
    let flashA = 255 * (1 - ease) * 0.78;
    fill(120, 8, 18, flashA * 0.38);
    ellipse(pc.cx, pc.cy, width * 0.62 * (1.15 - ease * 0.35), height * 0.4 * (1.1 - ease * 0.3));
    fill(200, 38, 48, flashA * 0.26);
    ellipse(pc.cx, pc.cy, width * 0.36, height * 0.24);
    pop();
  }

  push();
  let nStrips = floor(lerp(4, 22, boom));
  for (let i = 0; i < nStrips; i++) {
    let y = random(yMin, yMax);
    let h = random(1, 8);
    y = constrain(y, 0, max(0, height - h - 1));
    let shift = random(-maxShift, maxShift) * boom * 0.85;
    pyktisSafeCopyHStrip(y, h, shift);
  }
  pop();

  let cw = min(width, 420);
  let ch = min(height * 0.44, 360);
  let sx0 = floor(constrain(pc.cx - cw * 0.5, 0, max(0, width - cw)));
  let sy0 = floor(constrain(pc.cy - ch * 0.5, 0, max(0, height - ch)));
  push();
  blendMode(SOFT_LIGHT);
  let snap = get(sx0, sy0, cw, ch);
  if (snap && snap.width > 0 && snap.height > 0) {
    tint(175, 32, 48, 72 * boom);
    let ox = sin(framesFromStart * 0.4) * 6 * boom;
    image(snap, sx0 + ox, sy0, cw, ch);
  }
  noTint();
  blendMode(BLEND);
  pop();
}

/** Galutinis žodis — visada „PERŽENGTA“ (raidė E). */
const PYKTIS_PERZENGTA_LABEL = "PERŽENGTA";

function isPyktisPerzengtaPrefix(s) {
  return typeof s === "string" && s.length > 0 && PYKTIS_PERZENGTA_LABEL.startsWith(s);
}

/** Pykties gylis: „Pyktis“, „mano…“ — Inter bold; „riba“, „PERŽENGTA“ — Playfair stačias. */
function applyDeepPyktisChargeLineFont(line) {
  if (!line || line.length === 0) {
    if (typeof setDeepZoneTitleFontBold === "function") {
      setDeepZoneTitleFontBold();
    } else {
      textFont(treeCanvasFontFallback("deepZoneTitle"));
      textStyle(BOLD);
    }
    return;
  }
  let low = line.toLowerCase();
  let serifPhrase =
    line === PYKTIS_PERZENGTA_LABEL ||
    low.indexOf("riba") >= 0 ||
    line === "mano riba";
  if (serifPhrase) {
    if (typeof setDeepEmotionFont === "function") {
      setDeepEmotionFont();
    } else {
      textFont(treeCanvasFontFallback("deepPoeticMono"));
    }
    textStyle(NORMAL);
    return;
  }
  if (typeof setDeepZoneTitleFontBold === "function") {
    setDeepZoneTitleFontBold();
  } else {
    textFont(treeCanvasFontFallback("deepZoneTitle"));
    textStyle(BOLD);
  }
}

/** 100 % finalas: magenta neonas + echo (kaip reference); tekstas nekinta. */
function drawPyktisPerzengtaFinalHero(cx, cy, fontPx, alphaMul) {
  let am = constrain(typeof alphaMul === "number" ? alphaMul : 1, 0.08, 1);
  applyDeepPyktisChargeLineFont(PYKTIS_PERZENGTA_LABEL);
  textAlign(CENTER, CENTER);
  let echoY = cy + fontPx * 0.66;
  let echoSz = fontPx * 0.86;
  let fc = frameCount * 0.11;
  textSize(echoSz);
  let slide = sin(fc * 1.7) * 3.2;
  noStroke();
  fill(198, 204, 222, 52 * am);
  text(PYKTIS_PERZENGTA_LABEL, cx + slide * 0.35, echoY);
  fill(255, 255, 255, 34 * am);
  text(PYKTIS_PERZENGTA_LABEL, cx - slide * 0.28, echoY + 1.2);
  fill(175, 182, 198, 22 * am);
  text(PYKTIS_PERZENGTA_LABEL, cx + sin(fc * 2.1) * 2, echoY - 0.6);

  textSize(fontPx);
  let pulse = 0.5 + 0.5 * sin(millis() * 0.0092);
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 26 + pulse * 14;
    ctx.shadowColor = "rgba(255,55,140," + 0.55 * am + ")";
  }
  blendMode(ADD);
  fill(255, 0, 120, (22 + pulse * 18) * am);
  text(PYKTIS_PERZENGTA_LABEL, cx - 2.4, cy - 0.6);
  fill(0, 220, 255, (14 + pulse * 10) * am);
  text(PYKTIS_PERZENGTA_LABEL, cx + 2.2, cy + 0.5);
  blendMode(BLEND);
  fill(255, 45, 130, (235 + pulse * 18) * am);
  text(PYKTIS_PERZENGTA_LABEL, cx, cy);
  fill(255, 160, 210, (85 + pulse * 40) * am);
  text(PYKTIS_PERZENGTA_LABEL, cx, cy - fontPx * 0.04);
  if (ctx) {
    ctx.restore();
  }
  textStyle(NORMAL);
}

/** Fazinis tekstas: mano… → mano riba → peržengta; sprogime — PERŽENGTA. */
function getDeepPyktisChargeTextFragments(charge01) {
  let expl =
    typeof pyktisExplosionFramesLeft === "number" ? pyktisExplosionFramesLeft : 0;
  if (expl > 0) {
    return {
      fragments: [PYKTIS_PERZENGTA_LABEL],
      localT: 1,
      explosion: true
    };
  }
  if (typeof pyktisDeepBrokenLatched !== "undefined" && pyktisDeepBrokenLatched) {
    return {
      fragments: [PYKTIS_PERZENGTA_LABEL],
      localT: 1,
      explosion: true
    };
  }
  let c = constrain(charge01, 0, 0.999);
  let firstPyktisDeep =
    typeof deepZoneEntryCount !== "undefined" && (deepZoneEntryCount[8] | 0) === 1;
  if (firstPyktisDeep && c < 0.42) {
    return {
      fragments: ["riba."],
      localT: map(c, 0, 0.42, 0, 1),
      explosion: false
    };
  }
  if (firstPyktisDeep && c < 0.88) {
    return {
      fragments: [PYKTIS_PERZENGTA_LABEL],
      localT: map(c, 0.42, 0.88, 0, 1),
      explosion: false
    };
  }
  if (firstPyktisDeep) {
    return {
      fragments: [PYKTIS_PERZENGTA_LABEL],
      localT: 1,
      explosion: false
    };
  }
  if (c < 0.33) {
    return {
      fragments: ["mano..."],
      localT: map(c, 0, 0.33, 0, 1),
      explosion: false
    };
  }
  if (c < 0.66) {
    return {
      fragments: ["mano riba"],
      localT: map(c, 0.33, 0.66, 0, 1),
      explosion: false
    };
  }
  return {
    fragments: [PYKTIS_PERZENGTA_LABEL],
    localT: map(c, 0.66, 1, 0, 1),
    explosion: false
  };
}

function revealDeepPyktisByT(full, t) {
  if (!full || full.length === 0) {
    return "";
  }
  let u = constrain(t, 0, 1);
  if (u <= 0.02) {
    return "";
  }
  let n = ceil(full.length * u);
  n = constrain(n, u >= 0.08 ? 1 : 0, full.length);
  return full.substring(0, n);
}

/** Kelios eilutės — kiekviena atskleidžiama savo fazo segmente (lūžęs tekstas). */
function revealDeepPyktisFragmentStack(fragments, t) {
  let n = fragments.length;
  if (n === 0) {
    return [];
  }
  if (n === 1) {
    return [revealDeepPyktisByT(fragments[0], t)];
  }
  let out = [];
  for (let i = 0; i < n; i++) {
    let lo = i / n;
    let hi = (i + 1) / n;
    let local = constrain(map(t, lo, hi, 0, 1), 0, 1);
    out.push(revealDeepPyktisByT(fragments[i], local));
  }
  return out;
}

/**
 * Tas pats vizualinis kalbos žodynas kaip „Aš“ gylyje „SISTEMA SUGADINTA“ (ADD chroma + kremas).
 * Naudoti „mano…“, „mano riba“, „PERŽENGTA“ Pykčio teksto kūgeliui.
 */
function drawPyktisStackLineSistemaStyle(cx, cy, line, fontPx, alphaMul, charge01, glitchExtra) {
  if (!line || line.length === 0) {
    return;
  }
  let ge = constrain(typeof glitchExtra === "number" ? glitchExtra : 0, 0, 2);
  let chg = constrain(typeof charge01 === "number" ? charge01 : 0, 0, 1);
  if (
    line === PYKTIS_PERZENGTA_LABEL &&
    (ge > 1.18 || chg >= 0.992)
  ) {
    drawPyktisPerzengtaFinalHero(cx, cy, fontPx, alphaMul);
    return;
  }
  applyDeepPyktisChargeLineFont(line);
  noStroke();
  let depthMadness =
    typeof getDeepChaosLevel === "function" ? getDeepChaosLevel(8) : 0.45;
  let stress =
    typeof getPyktisStressFromCharge === "function"
      ? getPyktisStressFromCharge(chg)
      : 0;
  let pulse = 0.5 + 0.5 * sin(millis() * 0.011);
  let chroma = 8 + 10 * pulse + depthMadness * 7 + stress * 16 + ge * 14;
  chroma = constrain(chroma, 6, 46);
  let tShow = line;
  let heavyFin = ge > 1.38;
  let skipDistort = isPyktisPerzengtaPrefix(line);
  if (
    !skipDistort &&
    typeof distortSystemLabelText === "function" &&
    depthMadness > 0.06 &&
    !heavyFin &&
    frameCount % max(2, floor(8 - depthMadness * 2.2)) === 0
  ) {
    let lv =
      depthMadness * (0.26 + stress * 0.42) + ge * (0.18 + stress * 0.22);
    tShow = distortSystemLabelText(line, constrain(lv, 0.02, 0.72));
  } else if (
    !skipDistort &&
    heavyFin &&
    typeof distortSystemLabelText === "function" &&
    frameCount % 7 === 0 &&
    random() < 0.12
  ) {
    tShow = distortSystemLabelText(line, 0.06);
  }
  let glitch = 0.5 + 0.5 * sin(millis() * 0.048 + frameCount * 0.14);
  let am = constrain(alphaMul, 0.06, 1);
  let jScale = heavyFin ? 0.38 : 1;
  let jN = frameCount * 0.037 + cy * 0.01;
  let jx = (noise(cx * 0.02, jN) - 0.5) * 4.2 * ge * jScale;
  let jy = (noise(cx * 0.02 + 3, jN + 1) - 0.5) * 3.2 * ge * jScale;
  push();
  translate(cx + jx, cy + jy);
  textAlign(CENTER, CENTER);
  textSize(fontPx);
  blendMode(ADD);
  fill(130 + stress * 55, 6, 18, (26 + 34 * glitch) * am);
  text(tShow, -chroma * 0.94, 0);
  fill(255, 44 + stress * 40, 58, (24 + 36 * glitch) * am);
  text(tShow, chroma * 0.96, 0);
  blendMode(BLEND);
  let mr = lerp(255, 175, 0.14 + stress * 0.1);
  let mg = lerp(215, 95, 0.18 + stress * 0.12);
  let mb = lerp(218, 108, 0.16 + stress * 0.1);
  fill(mr, mg, mb, (208 + 42 * pulse) * am);
  text(tShow, 0, 0);
  pop();
  textStyle(NORMAL);
}

function drawDeepPyktisTextStack(progress01) {
  let meta = typeof DEEP_ZONE_PYKTIS !== "undefined" ? DEEP_ZONE_PYKTIS : null;
  if (!meta) {
    return;
  }
  let charge = typeof progress01 === "number" ? constrain(progress01, 0, 1) : 0;
  let brokenLatch =
    typeof pyktisDeepBrokenLatched !== "undefined" && pyktisDeepBrokenLatched;
  let { fragments: rawFrags, localT, explosion } =
    getDeepPyktisChargeTextFragments(charge);
  let lines = revealDeepPyktisFragmentStack(rawFrags, localT);
  let anyChar = false;
  for (let li = 0; li < lines.length; li++) {
    if (lines[li] && lines[li].length > 0) {
      anyChar = true;
      break;
    }
  }
  let emerge = constrain(pow(localT, 0.62), 0, 1);
  let hintA = constrain(pow(charge, 0.45), 0, 1);

  textAlign(CENTER, TOP);
  let z8t = getDeepZoneTextColor(8);
  let pyTit = ZONE_DATA[8].title;
  let _pyBreath = 0.52 + 0.18 * sin(millis() * 0.00072);
  let crtFlick =
    0.62 +
    0.22 * sin(millis() * 0.031) +
    (frameCount % 113 < 4 ? -0.28 : 0) +
    (frameCount % 211 < 2 ? 0.18 : 0);
  crtFlick = constrain(crtFlick, 0.32, 1.12);
  setDeepZoneTitleFont();
  textStyle(NORMAL);
  let pyTitleSz = min(24, max(15, width * 0.032));
  textSize(pyTitleSz);
  textAlign(CENTER, BASELINE);
  noStroke();
  let pyTitleX = width * 0.5;
  let pyTitleY = height * 0.2;
  let ctx8 = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx8) {
    ctx8.save();
    ctx8.shadowBlur = 10 * _pyBreath;
    ctx8.shadowColor = "rgba(180,35,55," + (0.28 * _pyBreath * crtFlick) + ")";
  }
  fill(
    lerp(z8t[0], 255, 0.08),
    lerp(z8t[1], 255, 0.06),
    lerp(z8t[2], 255, 0.05),
    72 * _pyBreath * crtFlick
  );
  text(pyTit, pyTitleX, pyTitleY);
  if (ctx8) {
    ctx8.restore();
  }
  textAlign(CENTER, TOP);

  textAlign(CENTER, CENTER);
  let baseX = width * 0.5;
  let lineSize = max(17, min(24, width * 0.046));
  let perzengPhase = rawFrags.length === 1 && rawFrags[0] === PYKTIS_PERZENGTA_LABEL;
  if (perzengPhase && !explosion && !brokenLatch) {
    let uP = constrain(map(charge, 0.66, 0.998, 0, 1), 0, 1);
    let capTs = getTreeZoneCaptionTitleTextSize();
    lineSize = lerp(
      lineSize * 0.88,
      min(capTs * 2.45, width * 0.12),
      pow(uP, 0.9)
    );
  }
  if (explosion || brokenLatch) {
    let capTs = getTreeZoneCaptionTitleTextSize();
    lineSize = min(capTs * 3.2, width * 0.16, 240);
  }
  let lineGap = lineSize * 1.38;
  let capEst = getTreeZoneCaptionTitleTextSize();
  let estPz =
    perzengPhase && !explosion && !brokenLatch
      ? lerp(
          lineSize * 0.88,
          min(capEst * 2.65, width * 0.13, 200),
          pow(constrain(map(charge, 0.66, 0.998, 0, 1), 0, 1), 0.9)
        )
      : explosion || brokenLatch
        ? min(capEst * 3.35, width * 0.175, 280)
        : lineSize;
  let baseY = perzengPhase || explosion || brokenLatch
    ? getPyktisPerzengtaTextCenterY(estPz)
    : height * 0.8;
  if (explosion || brokenLatch) {
    baseY = getPyktisPerzengtaTextCenterY(estPz);
  }

  let fillA = anyChar ? lerp(168, 242, emerge) : 0;
  if (explosion || brokenLatch) {
    fillA = 245;
  }
  noStroke();

  let glitchAmt =
    explosion || brokenLatch
      ? 1.2
      : min(
          1,
          constrain(map(charge, 0.14, 0.98, 0, 1), 0, 1) * 1.55
        );

  if (fillA > 14) {
    for (let i = 0; i < lines.length; i++) {
      let row = lines[i];
      if (!row || row.length === 0) {
        continue;
      }
      let perzengRow = perzengPhase || explosion || brokenLatch;
      let cap0 = getTreeZoneCaptionTitleTextSize();
      let pzTs = explosion || brokenLatch
        ? min(cap0 * 3.4, width * 0.175, 280)
        : lerp(
            lineSize * 0.9,
            min(cap0 * 2.75, width * 0.135, 215),
            pow(constrain(map(charge, 0.66, 0.998, 0, 1), 0, 1), 0.9)
          );
      let staggerX = 0;
      let rowFade = 1;
      let yRow = baseY + i * lineGap;
      let fontPx = lineSize;
      if (perzengRow) {
        fontPx = pzTs;
        yRow = getPyktisPerzengtaTextCenterY(pzTs) + i * lineGap;
      } else {
        let fx = i % 2 === 0 ? -1 : 1;
        let arc = 1 - constrain(abs(i - (lines.length - 1) * 0.5) / max(1, lines.length - 1), 0, 1);
        /* „Prikabinam“ eilutes arčiau šakų: švelnus horizontalus išskaidymas + vertikalus ritmas. */
        staggerX = fx * lerp(width * 0.02, width * 0.062, pow(charge, 0.72)) * (0.6 + arc * 0.7);
        yRow += sin(frameCount * 0.018 + i * 0.9) * (2 + 4 * charge) + (i - 1) * lineGap * 0.08;
        let localFade = constrain(map(charge, 0.08 + i * 0.08, 0.5 + i * 0.11, 0, 1), 0, 1);
        let mouseBoost = 0;
        if (typeof mouseX === "number" && typeof mouseY === "number") {
          let md = dist(mouseX, mouseY, baseX + staggerX, yRow);
          mouseBoost = constrain(map(md, width * 0.34, width * 0.08, 0, 0.35), 0, 0.35);
        }
        rowFade = constrain(0.38 + 0.5 * localFade + mouseBoost, 0.32, 1);
      }
      let gEx =
        (explosion || brokenLatch ? 1.55 : 0.22) +
        glitchAmt * (perzengRow ? 1.15 : 1.05);
      if (explosion || brokenLatch) {
        gEx +=
          0.35 * sin(frameCount * 0.29 + i) +
          0.22 * cos(frameCount * 0.21 + i * 0.7);
      }
      let gDraw = gEx;
      if (!perzengRow && !explosion && !brokenLatch) {
        gDraw = lerp(0.1, gEx, pow(charge, 0.52));
      }
      drawPyktisStackLineSistemaStyle(
        baseX + staggerX,
        yRow,
        row,
        fontPx,
        (fillA / 255) * rowFade,
        charge,
        gDraw
      );
    }
  }

  textStyle(NORMAL);
  setDeepCaptionFont();
  let holdHint =
    meta && meta.holdHint && String(meta.holdHint).trim().length > 0
      ? String(meta.holdHint).trim()
      : "laikyk";
  let postBreak =
    typeof pyktisPostBreakCalm !== "undefined" && pyktisPostBreakCalm;
  let showReturn = postBreak && charge < 0.04 && !explosion && !brokenLatch;
  if (showReturn) {
    let retStr =
      meta && meta.returnHint && String(meta.returnHint).trim().length > 0
        ? String(meta.returnHint).trim()
        : "sugrįžk";
    if (typeof setUiSansFont === "function") {
      setUiSansFont();
    } else if (typeof fontUI_clean === "function") {
      fontUI_clean();
    } else {
      setDeepCaptionFont();
    }
    textStyle(NORMAL);
    textSize(12);
    textAlign(CENTER, CENTER);
    let baseR = lerp(z8t[0], 255, 0.1);
    let baseG = lerp(z8t[1], 255, 0.1);
    let baseB = lerp(z8t[2], 255, 0.08);
    let retOver = false;
    let retLabel = buildDeepPyktisCtaDrawLabel(retStr, retOver);
    let ctxR = typeof drawingContext !== "undefined" ? drawingContext : null;
    if (ctxR) {
      ctxR.save();
      applyDeepPyktisCtaCanvasSpacing(ctxR, retOver);
    }
    let ry = height * 0.9;
    let gR = 0.5 + 0.5 * sin(millis() * 0.07 + frameCount * 0.13);
    blendMode(ADD);
    fill(255, 96, 128, (8 + 11 * gR) * (retOver ? 1.1 : 1));
    text(retLabel, baseX - 1.4, ry + 0.5);
    fill(96, 214, 255, (7 + 10 * gR) * (retOver ? 1.05 : 0.9));
    text(retLabel, baseX + 1.4, ry - 0.5);
    blendMode(BLEND);
    fill(baseR, baseG, baseB, 215);
    text(retLabel, baseX, ry);
    if (ctxR) {
      ctxR.restore();
    }
  } else if (!explosion && !brokenLatch) {
    /* „laikyk“: virš pointerio, rodoma tik ant branduolio; tylu laikant. */
    let holding = typeof isPointerDown !== "undefined" && isPointerDown;
    let atMaxBeforeBoom = charge >= 0.99;
    if (!holding && !atMaxBeforeBoom && isPointerOverPyktisCore(mouseX, mouseY)) {
      let hA = min(235, 118 + hintA * 115);
      let hx = constrain(mouseX, 32, width - 32);
      let hy = constrain(mouseY - 24, 22, height - 6);
      textAlign(CENTER, BOTTOM);
      if (typeof setUiSansFont === "function") {
        setUiSansFont();
      } else if (typeof fontUI_clean === "function") {
        fontUI_clean();
      } else {
        setDeepCaptionFont();
      }
      let holdTs = min(19, max(14.5, width * 0.036));
      textSize(holdTs);
      textStyle(NORMAL);
      let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
      if (ctx) {
        ctx.save();
        ctx.shadowBlur = 22;
        ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
      }
      let cr = lerp(z8t[0], 255, 0.28);
      let cg = lerp(z8t[1], 252, 0.2);
      let cb = lerp(z8t[2], 250, 0.18);
      applyDeepPyktisCtaCanvasSpacing(ctx, false);
      let holdDraw = buildDeepPyktisCtaDrawLabel(holdHint, false);
      let gH = 0.5 + 0.5 * sin(millis() * 0.07 + frameCount * 0.13);
      blendMode(ADD);
      fill(255, 88, 120, 10 + 12 * gH);
      text(holdDraw, hx - 1.2, hy + 0.45);
      fill(88, 208, 255, 9 + 11 * gH);
      text(holdDraw, hx + 1.2, hy - 0.45);
      blendMode(BLEND);
      stroke(12, 6, 10, hA * 0.55);
      strokeWeight(max(2.4, holdTs * 0.16));
      fill(cr, cg, cb, hA);
      text(holdDraw, hx, hy);
      noStroke();
      if (ctx) {
        ctx.restore();
      }
    }
  }
}


/** Pyktis piešimui: po sprogimo „lūžusi“ vizualinė būsena (p/ph pririšti prie max). */
function getPyktisDeepDrawParams() {
  let broken =
    typeof pyktisDeepBrokenLatched !== "undefined" && pyktisDeepBrokenLatched;
  let exploding =
    typeof pyktisExplosionFramesLeft === "number" && pyktisExplosionFramesLeft > 0;
  let pRaw = typeof deepGrowthProgress === "number" ? deepGrowthProgress : 0;
  let pVis = broken || exploding ? 1 : constrain(pRaw, 0, 1);
  let phVis = getPyktisChargePhase(
    pRaw,
    typeof pyktisExplosionFramesLeft === "number" ? pyktisExplosionFramesLeft : 0
  );
  if (broken && !exploding) {
    phVis = 4;
  }
  return { pVis, phVis };
}

function drawDeepMode() {
  if (!deepInitialized) {
    initDeepMode();
  }
  if (focusedZone === 8) {
    updatePyktisDeepProgress();
    // Auto-eject after explosion ends
    if (
      typeof _pyktisAutoEjectScheduledMs !== "undefined" &&
      _pyktisAutoEjectScheduledMs > 0 &&
      millis() >= _pyktisAutoEjectScheduledMs
    ) {
      _pyktisAutoEjectScheduledMs = -1;
      if (typeof exitDeepMode === "function") {
        exitDeepMode();
      }
      return;
    }
  }

  if (focusedZone === 2) {
    drawDeepGlitchSystemCorruptedBackground();
  } else if (focusedZone === 8) {
    let visits = deepZoneEntryCount[8] || 1;
    let pr = getPyktisDeepDrawParams();
    drawDeepPyktisBackground(pr.pVis, visits, pr.phVis);
    drawPyktisEnergeticRedMesh(pr.pVis, pr.phVis);
    drawPyktisCodeRain(pr.pVis, pyktisExplosionFramesLeft);
  } else if (typeof isDeepMemoryTreeZone === "function" && isDeepMemoryTreeZone(focusedZone)) {
    let memBg =
      typeof getDeepZoneMemoryDepth === "function" ? getDeepZoneMemoryDepth(focusedZone) : 1;
    drawDeepMemorySceneBackdrop(focusedZone, memBg);
  } else {
    let _bg =
      typeof TREE_SCENE_BG_RGB !== "undefined" && TREE_SCENE_BG_RGB && TREE_SCENE_BG_RGB.length >= 3
        ? TREE_SCENE_BG_RGB
        : [7, 6, 5];
    background(_bg[0], _bg[1], _bg[2]);
  }
  if (focusedZone === 2 && getAsDeepPhase() === 4) {
    drawAsDeepPhase4IndustrialGlitchBackground();
  }
  if (typeof deepTreeMemoryDepth !== "undefined") {
    deepTreeMemoryDepth = isDeepMemoryTreeZone(focusedZone)
      ? getDeepZoneMemoryDepth(focusedZone)
      : 1;
  }
  if (isDeepMemoryTreeZone(focusedZone) && typeof zoneDepth !== "undefined") {
    let zd =
      focusedZone === 3
        ? zoneDepth.juokas
        : focusedZone === 4
          ? zoneDepth.jautrumas
          : focusedZone === 5
            ? zoneDepth.drama
            : focusedZone === 6
              ? zoneDepth.meile
              : zoneDepth.empatija;
    randomSeed(deepSeed + (zd | 0) * 100);
  } else {
    randomSeed(deepSeed);
  }
  leafDrawCount = 0;

  if (focusedZone === 2) {
    applyAsDeepMutedTreePalette();
    drawAsDeepCrypticBackground();
  }

  // Leaves grow while pointer is held — Pyktis (8): charge jau atnaujinta piešinio pradžioje.
  if (focusedZone !== 8 && isPointerDown) {
    deepHoldFrames++;
    let holdBoost = min(deepHoldFrames / 130, 1);
    let growSpeed = lerp(0.011, 0.088, holdBoost);
    growSpeed *= getEmotionGrowthMultiplier();
    let persist =
      typeof getEmotionPersistenceSmooth === "function"
        ? getEmotionPersistenceSmooth()
        : 0.5;
    growSpeed *= lerp(0.35, 1.48, persist);
    if (focusedZone >= 3 && focusedZone <= 7) {
      growSpeed *= 1.68;
    }
    let targetProgress = min(1, deepGrowthProgress + growSpeed);
    if (
      focusedZone === 6 &&
      typeof getDeepZoneMemoryDepth === "function" &&
      getDeepZoneMemoryDepth(6) === 2
    ) {
      let p = constrain(typeof deepGrowthProgress === "number" ? deepGrowthProgress : 0, 0, 1);
      let tailEase = constrain(map(p, 0.68, 1, 1, 0.22), 0.22, 1);
      let smoothStep = lerp(0.42, 0.72, tailEase);
      targetProgress = min(1, deepGrowthProgress + growSpeed * 0.78 * tailEase);
      growthProgress = lerp(deepGrowthProgress, targetProgress, smoothStep);
    } else {
      growthProgress = targetProgress;
    }
    deepGrowthProgress = growthProgress;
    if (deepHoldStartMs < 0) {
      deepHoldStartMs = millis();
    }
  } else if (focusedZone !== 8) {
    deepHoldFrames = 0;
    growthProgress = deepGrowthProgress;
    deepHoldStartMs = -1;
  }

  updateAsDeepPointerHoldLoad();

  updateDeepHoldCinematicTrigger();

  if (focusedZone >= 1 && focusedZone <= 8) {
    // Persist continuously so re-enter always restores exact leaf state.
    deepZoneGrowth[focusedZone] = deepGrowthProgress;
  }

  let dwell = getDeepDwellSeconds();

  let savedGlobalAlpha = 1;
  if (typeof drawingContext !== "undefined" && drawingContext) {
    savedGlobalAlpha = drawingContext.globalAlpha;
  }
  if (focusedZone === 2 && typeof drawingContext !== "undefined" && drawingContext) {
    drawingContext.globalAlpha = savedGlobalAlpha * getAsDeepTreeAlpha();
  }

  if (focusedZone === 2) {
    push();
    translate(
      width * 0.5,
      typeof getAsDeepEkgCenterY === "function" ? getAsDeepEkgCenterY() : height * 0.52
    );
    drawAsDeepNeonHeartbeatLine();
    pop();
  } else if (focusedZone === 8) {
    let visits = deepZoneEntryCount[8] || 1;
    let pr = getPyktisDeepDrawParams();
    let c = getPyktisCoreScreen();
    let diskR = getPyktisVisualDiskRadius();
    let ringR = getPyktisRingRadius(diskR);
    drawDeepHoldRing(c.cx, c.cy, pr.pVis, [172, 28, 48], ringR, pr.phVis);
    drawDeepPyktisCore(pr.pVis, pr.phVis, visits, diskR);
    drawPyktisElectricSparks(c.cx, c.cy, pr.pVis, pr.phVis);
    drawPyktisExplosionOverlay();
    drawPyktisDeepBrokenPersistentGlitch();
  } else if (isDeepMemoryTreeZone(focusedZone)) {
    drawDeepMemoryEmotionTree(focusedZone, deepTreeMemoryDepth);
  } else {
    push();
    translate(width * 0.5, height * 0.99);
    if (typeof treeMaker === "function") {
      for (let nn = 0; nn < 2; nn++) {
        treeMaker(tmaxLen);
      }
    }
    pop();
  }

  if (focusedZone === 2 && typeof drawingContext !== "undefined" && drawingContext) {
    drawingContext.globalAlpha = savedGlobalAlpha;
  }

  if (
    dwell > 10 &&
    focusedZone !== 2 &&
    focusedZone !== 8 &&
    !isDeepMemoryTreeZone(focusedZone)
  ) {
    let layerAlpha = constrain((dwell - 10) / 8, 0, 0.35);
    let savedBark = deepBarkAccent.slice();
    let savedLeafA = deepLeafA.slice();
    let savedLeafB = deepLeafB.slice();
    deepBarkAccent = [savedBark[0] * layerAlpha, savedBark[1] * layerAlpha, savedBark[2] * layerAlpha];
    deepLeafA = [savedLeafA[0] * layerAlpha, savedLeafA[1] * layerAlpha, savedLeafA[2] * layerAlpha];
    deepLeafB = [savedLeafB[0] * layerAlpha, savedLeafB[1] * layerAlpha, savedLeafB[2] * layerAlpha];
    push();
    blendMode(ADD);
    translate(width * 0.5, height * 0.99);
    if (typeof treeMaker === "function") {
      randomSeed(deepSeed + 777);
      treeMaker(tmaxLen * 0.92);
    }
    blendMode(BLEND);
    pop();
    deepBarkAccent = savedBark;
    deepLeafA = savedLeafA;
    deepLeafB = savedLeafB;
  }

  let data = ZONE_DATA[focusedZone];
  let zoneTint = getDeepZoneTextColor(focusedZone);

  let imperfectSeed = (deepSeed + focusedZone * 31) % 9973;
  let titleOffX = (((imperfectSeed * 7 + 13) % 11) - 5) * 0.6;
  let titleOffY = (((imperfectSeed * 3 + 7) % 9) - 4) * 0.4;

  if (focusedZone === 8) {
    drawDeepPyktisTextStack(deepGrowthProgress);
  } else if (isDeepMemoryTreeZone(focusedZone)) {
    drawDeepMemoryZoneTitle(focusedZone);
  } else if (focusedZone !== 2) {
    noStroke();
    let titleText = data ? data.title : "Zona " + focusedZone;
    let titleEntries = max(1, deepZoneEntryCount[focusedZone] || 1);
    let visitWear = constrain((titleEntries - 1) * 0.1, 0, 0.4);
    let dwellWear = dwell > 5 ? constrain((dwell - 5) / 20, 0, 0.35) : 0;
    let totalWear = min(visitWear + dwellWear, 0.55);
    if (totalWear > 0.02 && typeof distortCrypticText === "function") {
      if (frameCount % max(3, floor(14 - totalWear * 24)) === 0) {
        titleText = distortCrypticText(titleText, totalWear);
      }
    }
    textAlign(CENTER, TOP);
    setDeepZoneTitleFont();
    textSize(16);
    let topY = height * 0.05;
    fill(255, 120);
    text(titleText, width * 0.5 + titleOffX, topY + titleOffY);
  }
  drawDeepReturnStatusText();

  // Safe fallback until deep tree functions are integrated (ne „Aš“ — ten EKG linija).
  if (typeof treeMaker !== "function" && focusedZone !== 2 && focusedZone !== 8) {
    fill(zoneTint[0], zoneTint[1], zoneTint[2], 235);
    setDeepCaptionFont();
    textSize(14);
    text(
      "Gylio režimas paruoštas. Pridėk treeMaker/stickMaker/leafMaker.",
      width * 0.5,
      52
    );
  }

  if (focusedZone === 2) {
    drawAsDeepAtmosphereVignette();
    drawAsDeepDatastreamGlitchOverlay();
    drawAsDeepChaosCenterText();
    applyAsDeepChaosGlitch();
  }
  drawDeepHoldCinematicText();
  if (isDeepMemoryTreeZone(focusedZone)) {
    drawDeepMemoryPhraseText();
  }
  drawDeepEntranceFadeOverlay();
  if (focusedZone === 2) {
    drawAsDeepHoldLaikykNearPointer();
  } else if (isDeepMemoryTreeZone(focusedZone)) {
    drawDeepMemoryHoldLaikykNearPointer();
  }
  drawBackButton();
  if (isOverBackButton(mouseX, mouseY)) {
    cursor(HAND);
  } else if (focusedZone === 8 && isPointerOverPyktisCore(mouseX, mouseY)) {
    cursor(HAND);
  } else {
    cursor(ARROW);
  }
}

function drawDeepReturnStatusText() {
  if (focusedZone === 2) {
    return;
  }
  if (focusedZone === 8) {
    return;
  }
  if (isDeepMemoryTreeZone(focusedZone)) {
    return;
  }
  let now = millis();
  if (!deepReturnStatusText || now > deepReturnStatusUntilMs || now < deepReturnStatusStartMs) {
    return;
  }
  let inMs = now - deepReturnStatusStartMs;
  let outMs = deepReturnStatusUntilMs - now;
  let fadeInMs =
    typeof DEEP_CAPTION_FADE_IN_MS !== "undefined" ? DEEP_CAPTION_FADE_IN_MS : 620;
  let fadeIn = constrain(inMs / fadeInMs, 0, 1);
  let fadeOut = constrain(outMs / 600, 0, 1);
  let vis = min(fadeIn, fadeOut);
  let isFirst = deepReturnStatusVariant === "first";
  let alpha = (isFirst ? 200 : 155) * vis;

  let posSeed = (deepReturnStatusStartMs * 0.001) | 0;
  let px = width * (0.25 + ((posSeed * 7 + 13) % 50) * 0.01);
  let py = height * (0.88 + ((posSeed * 3 + 7) % 10) * 0.008);

  let zoneTint = getDeepZoneTextColor(focusedZone);
  let r = lerp(zoneTint[0], 255, 0.4);
  let g = lerp(zoneTint[1], 255, 0.4);
  let b = lerp(zoneTint[2], 255, 0.4);

  noStroke();
  setDeepCaptionFont();
  textAlign(LEFT, BOTTOM);
  textSize(isFirst ? 15 : 14);
  textLeading((isFirst ? 15 : 14) * 1.38);
  if (typeof deepUiApplyLetterSpacing === "function") {
    deepUiApplyLetterSpacing();
  }
  fill(r, g, b, alpha);
  text(deepReturnStatusText, px, py);
  if (typeof deepUiResetLetterSpacing === "function") {
    deepUiResetLetterSpacing();
  }
}

/** Kai nėra getRuntimeZoneColor — tie patys BRANCH_COLORS kaip tree-config (ne grynas baltas). */
const _DEEP_ZONE_TEXT_RGB_FALLBACK = {
  3: [111, 163, 184],
  4: [217, 168, 170],
  5: [191, 115, 82],
  6: [125, 114, 165],
  7: [212, 187, 114],
  8: [163, 75, 77]
};

function getDeepZoneTextColor(zone) {
  if (typeof getRuntimeZoneColor === "function") {
    let c = getRuntimeZoneColor(zone);
    return [constrain(c[0], 0, 255), constrain(c[1], 0, 255), constrain(c[2], 0, 255)];
  }
  let fb = _DEEP_ZONE_TEXT_RGB_FALLBACK[zone];
  if (fb) {
    return [fb[0], fb[1], fb[2]];
  }
  return [255, 255, 255];
}

/**
 * Fazinė „temperatūros kreivė“ atminties zonoms:
 * - 1 fazė: švelniau, blankiau (mažiau chromos, truputį minkštesnis tonas)
 * - 2 fazė: sodriau, bet ne ryškiau (daugiau chromos, šviesumas ribotas)
 */
function deepMemoryPhaseToneRgb(rgb, memD) {
  let r = constrain(rgb[0], 0, 255);
  let g = constrain(rgb[1], 0, 255);
  let b = constrain(rgb[2], 0, 255);
  let y = r * 0.299 + g * 0.587 + b * 0.114;
  if (constrain(memD | 0, 1, 2) < 2) {
    return [
      constrain(lerp(lerp(r, y, 0.38), 238, 0.08), 0, 255),
      constrain(lerp(lerp(g, y, 0.38), 236, 0.08), 0, 255),
      constrain(lerp(lerp(b, y, 0.38), 234, 0.08), 0, 255)
    ];
  }
  return [
    constrain(lerp(r, y, -0.22) * 0.93, 0, 255),
    constrain(lerp(g, y, -0.22) * 0.93, 0, 255),
    constrain(lerp(b, y, -0.22) * 0.93, 0, 255)
  ];
}

/**
 * Poetinės frazės tekstas: šviesus, bet iš zonos chromos (ne vien baltas).
 */
function deepMemoryPhraseReadableRgb(zone, memD) {
  let z = deepMemoryPhaseToneRgb(getDeepZoneTextColor(zone), memD);
  let w = memD >= 2 ? 0.44 : 0.34;
  return [
    lerp(z[0], 255, w),
    lerp(z[1], 255, w * 0.93),
    lerp(z[2], 255, w * 0.86)
  ];
}

/**
 * Atminties gylis: tas pats radialinis fonas kaip medžio scenoje + plona zonos spalvos danga.
 */
function drawDeepMemorySceneBackdrop(zone, memD) {
  memD = constrain(memD | 0, 1, 2);
  if (typeof treeSceneBackgroundBackdrop === "function") {
    treeSceneBackgroundBackdrop();
  } else if (typeof treeSceneBackgroundFlat === "function") {
    treeSceneBackgroundFlat();
  } else {
    let zc = getDeepZoneTextColor(zone);
    background(
      constrain(zc[0] * 0.09, 2, 48),
      constrain(zc[1] * 0.08, 2, 44),
      constrain(zc[2] * 0.11, 4, 52)
    );
    return;
  }
  let zt = deepMemoryPhaseToneRgb(getDeepZoneTextColor(zone), memD);
  let base =
    typeof treeSceneBackgroundRgbArray === "function"
      ? treeSceneBackgroundRgbArray()
      : [7, 6, 5];
  push();
  noStroke();
  blendMode(BLEND);
  fill(
    lerp(base[0], zt[0], memD >= 2 ? 0.112 : 0.094),
    lerp(base[1], zt[1], memD >= 2 ? 0.096 : 0.082),
    lerp(base[2], zt[2], memD >= 2 ? 0.122 : 0.104),
    memD >= 2 ? 18 : 18
  );
  rect(0, 0, width, height);
  pop();
  if (zone === 5 && memD === 1) {
    drawDeepDramaPhase1AmbientLayers();
  }
  if (zone === 5 && memD === 2) {
    drawDeepDramaPhase2EdgeVignette();
    drawDeepDramaPhase2BackdropBreathPulse();
  }
  if (zone === 7) {
    drawDeepEmpatijaViewportBreath(memD);
    drawDeepEmpatijaSepiaVignette(memD);
    drawDeepEmpatijaFilmGrain(memD);
  }
}

/**
 * Drama fazė 1: sunkus rusvas fonas, vos gyva šviesa kairėje, chaotiškas „triukšmas“.
 */
function drawDeepDramaPhase1AmbientLayers() {
  push();
  blendMode(MULTIPLY);
  noStroke();
  fill(32, 22, 19, 118);
  rect(0, 0, width, height);
  blendMode(BLEND);
  pop();

  let t = millis() * 0.0009;
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let gx = width * 0.34;
  let gy = height * 0.43;
  push();
  blendMode(SCREEN);
  noStroke();
  for (let i = 0; i < 4; i++) {
    let pulse = 0.82 + 0.18 * sin(t * 1.1 + i * 0.55) * mot;
    fill(88 + i * 14, 52 + i * 9, 42 + i * 8, (6 + i * 2.6) * pulse);
    ellipse(
      gx + sin(t * 0.7 + i * 0.45) * 14 * mot,
      gy + cos(t * 0.55 + i * 0.38) * 9 * mot,
      (280 + i * 128) * pulse,
      (92 + i * 36) * pulse
    );
  }
  blendMode(BLEND);
  pop();

  push();
  noStroke();
  let ds = (typeof deepSeed === "number" ? deepSeed : 1) + 331;
  let msh = millis() * 0.000018;
  let nGrain = min(112, floor((width * height) / 12000));
  for (let i = 0; i < nGrain; i++) {
    let n1 = noise(i * 0.072 + ds * 0.002, msh + i * 0.011);
    let n2 = noise(i * 0.069 + 3.8, ds * 0.003 + i * 0.017);
    let x = n1 * width;
    let y = n2 * height;
    let nv = noise(i * 0.44, msh);
    let a = (6 + nv * 14) * 0.085;
    fill(72 + nv * 48, 48 + nv * 22, 40, a);
    rect(x, y, 1.65, 1.65);
  }
  pop();
}

/**
 * Drama fazė 2 — lėtas, „cinematic“ širdies plakimas fone (ne pilno ekrano blykis).
 */
function drawDeepDramaPhase2BackdropBreathPulse() {
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let t = millis() * 0.00038 * mot;
  let rootX =
    typeof getDeepMemoryTreeRootXForZone === "function"
      ? getDeepMemoryTreeRootXForZone(5, 2)
      : width * 0.55;
  let cx = rootX - width * 0.02 + sin(t * 0.62) * width * 0.018 * mot;
  let cy = height * 0.46 + cos(t * 0.51) * height * 0.022 * mot;
  let e1 = 0.5 + 0.5 * sin(t * 1.05);
  let e2 = 0.5 + 0.5 * sin(t * 0.71 + 1.2);
  let breath = constrain(0.42 + 0.58 * (e1 * 0.55 + e2 * 0.45), 0.35, 1);
  let wob = 0.92 + 0.08 * sin(t * 1.88);
  let baseW = min(width, height) * (0.52 + 0.06 * breath) * wob;
  let baseH = min(width, height) * (0.38 + 0.05 * breath) * wob;
  push();
  blendMode(SCREEN);
  noStroke();
  for (let k = 0; k < 4; k++) {
    let kf = (4 - k) / 4;
    let a = (2.2 + k * 1.15) * breath * kf * mot;
    fill(255, 198 - k * 12, 152 - k * 14, a);
    ellipse(cx, cy, baseW * (1 + k * 0.22), baseH * (1 + k * 0.18));
  }
  blendMode(BLEND);
  pop();
}

/** Drama fazė 2: kraštai lieka slėgiantys — centras ne „išbalina“ viso kadro. */
function drawDeepDramaPhase2EdgeVignette() {
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (!ctx || typeof ctx.createRadialGradient !== "function") {
    return;
  }
  push();
  ctx.save();
  let cx = width * 0.48;
  let cy = height * 0.5;
  let r = max(width, height) * 0.88;
  let g = ctx.createRadialGradient(cx, cy, r * 0.06, cx, cy, r);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(0.42, "rgba(16,10,8,0.16)");
  g.addColorStop(1, "rgba(6,4,3,0.48)");
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
  pop();
}

/**
 * Drama fazė 2 — šviesa iš vidaus prie šakų + sukimosi bangos (po fonu, prieš medį).
 */
function drawDeepDramaPhase2BloomCore(memD) {
  if (memD < 2) {
    return;
  }
  let rootX =
    typeof getDeepMemoryTreeRootXForZone === "function"
      ? getDeepMemoryTreeRootXForZone(5, memD)
      : width * 0.75;
  let hx = rootX - width * 0.055;
  let hy = height * 0.57;
  let t = millis() * 0.00072;
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let slow = 0.5 + 0.5 * sin(t * 0.88);
  let slow2 = 0.5 + 0.5 * sin(t * 0.55 + 0.9);
  let envelope = constrain(0.55 + 0.45 * (slow * 0.62 + slow2 * 0.38), 0.4, 1);

  push();
  blendMode(SCREEN);
  noStroke();
  for (let k = 0; k < 4; k++) {
    let pulse =
      envelope *
      mot *
      (0.78 + 0.22 * sin(t * 0.42 + k * 1.05) * (0.85 + 0.15 * sin(t * 0.19 + k * 0.3)));
    fill(255, 232 + k * 5, 202 - k * 9, (7.5 + k * 2.1) * pulse);
    ellipse(
      hx + sin(t * 0.26 + k * 0.95) * 14 * mot,
      hy + cos(t * 0.22 + k * 0.82) * 11 * mot,
      (96 + k * 132) * pulse,
      (82 + k * 108) * pulse
    );
  }
  blendMode(BLEND);
  pop();

  push();
  blendMode(ADD);
  noStroke();
  for (let k = 0; k < 3; k++) {
    let pulse =
      envelope *
      mot *
      (0.8 + 0.2 * sin(t * 0.48 + k * 1.4));
    fill(255, 188 + k * 22, 118 + k * 8, (9 + k * 2.4) * pulse);
    ellipse(hx, hy, (168 + k * 168) * pulse, (138 + k * 142) * pulse);
  }
  blendMode(BLEND);
  pop();
}

/** Drama fazė 2 — švelnūs žaibo segmentai + halos (ne „kibirksčių lietus“). */
function drawDeepDramaPhase2SparkOverlay(memD) {
  if (memD < 2) {
    return;
  }
  let hx =
    (typeof getDeepMemoryTreeRootXForZone === "function"
      ? getDeepMemoryTreeRootXForZone(5, memD)
      : width * 0.75) -
    width * 0.05;
  let hy = height * 0.56;
  let t = millis() * 0.00085;
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let ds = typeof deepSeed === "number" ? deepSeed : 3;
  let strike = pow(constrain(0.5 + 0.5 * sin(t * 2.6 + ds * 0.07), 0, 1), 5);
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;

  push();
  blendMode(ADD);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  let nBolt = 11;
  for (let b = 0; b < nBolt; b++) {
    let seed = ds * 1.7 + b * 97.3;
    let baseAng = (b / nBolt) * TWO_PI + sin(seed * 0.02) * 0.35 + t * (0.12 + (b % 4) * 0.02) * mot;
    let reach = height * (0.1 + ((b * 23) % 47) * 0.0065) * (0.88 + 0.12 * strike) * mot;
    let wx = cos(baseAng);
    let wy = sin(baseAng);
    let jx = sin(t * 1.1 + b * 0.73) * 6 * mot;
    let jy = cos(t * 0.95 + b * 0.61) * 5 * mot;
    let x0 = hx + jx;
    let y0 = hy + jy;
    let segs = 4 + (b % 3);
    let x1 = x0;
    let y1 = y0;
    for (let s = 1; s <= segs; s++) {
      let f = s / segs;
      let jig = (noise(b * 0.4 + s * 0.31, t * 0.4) - 0.5) * reach * 0.22;
      let perp = baseAng + HALF_PI;
      let x2 = x0 + wx * reach * f + cos(perp) * jig;
      let y2 = y0 + wy * reach * f + sin(perp) * jig;
      let br = 255;
      let bg = lerp(228, 255, f) + strike * 18;
      let bb = lerp(175, 255, f * 0.55) - strike * 12;
      let sw = (2.05 - f * 1.35) * (0.75 + strike * 0.85) * (0.85 + 0.15 * mot);
      let al = (10 + strike * 38) * (1 - f * 0.35) * (0.55 + 0.45 * mot);
      if (ctx) {
        ctx.save();
        ctx.shadowBlur = (8 + strike * 22) * (1 - f * 0.4);
        ctx.shadowColor = "rgba(255,248,235," + (0.22 + strike * 0.5) + ")";
      }
      stroke(br, bg, bb, al);
      strokeWeight(sw);
      line(x1, y1, x2, y2);
      if (ctx) {
        ctx.restore();
      }
      x1 = x2;
      y1 = y2;
    }
    if (strike > 0.35) {
      noStroke();
      fill(255, 252, 245, (6 + strike * 22) * (0.4 + 0.6 * mot));
      ellipse(x1, y1, 3.5 + strike * 5, 3.2 + strike * 4.5);
    }
  }
  noStroke();
  blendMode(BLEND);
  pop();
}

/** Drama fazė 2 — lengvas blyksnis be copy() (buvo sunkus lagas). */
function drawDeepDramaPhase2ChaosStorm(memD) {
  if (memD < 2) {
    return;
  }
  if (typeof prefersReducedMotionCanvas === "function" && prefersReducedMotionCanvas()) {
    return;
  }
  let zt = getDeepZoneTextColor(5);
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let t = millis() * 0.00135 * mot;
  push();
  blendMode(ADD);
  noStroke();
  let haze = pow(0.5 + 0.5 * sin(t * 0.55), 3) * 0.55 + 0.2;
  fill(255, 150, 112, 2.2 * haze);
  rect(0, 0, width, height);
  for (let i = 0; i < 5; i++) {
    let y =
      height * (0.12 + (i / 4.2) * 0.76) +
      sin(t * (1.15 + (i % 3) * 0.12) + i * 0.82) * (12 + (i % 2) * 6);
    fill(
      lerp(88, zt[0], 0.52),
      lerp(26, zt[1], 0.36),
      lerp(20, zt[2], 0.22),
      (1.4 + (i % 3) * 0.9) * haze
    );
    rect(0, y, width, 2.2);
  }
  for (let i = 0; i < 9; i++) {
    let ph = t * (0.85 + (i % 5) * 0.09) + i * 1.58;
    let tx =
      noise(i * 0.21, t * 0.12) * width +
      sin(ph * 1.6 + i * 0.31) * width * 0.028;
    let ty =
      noise(i * 0.18 + 8.1, t * 0.11) * height +
      sin(ph * 1.35) * (18 + (i % 4) * 7) +
      cos(ph * 1.9 + i * 0.17) * 12;
    let sz = 7 + (i % 6) * 5 + abs(sin(ph * 1.65)) * 9;
    let a = 3.2 + abs(sin(ph * 1.9)) * 7;
    fill(
      lerp(zt[0], 255, 0.35),
      lerp(zt[1], 132, 0.3),
      lerp(zt[2], 92, 0.26),
      a * haze
    );
    push();
    translate(tx, ty);
    rotate(ph * 0.55);
    triangle(-sz * 0.5, sz * 0.44, 0, -sz * 0.56, sz * 0.52, sz * 0.48);
    pop();
  }
  blendMode(BLEND);
  pop();
}

/** Empatija: centrinė auksinė šviesa + „lens“ erdvė (kaip reference). */
function drawDeepEmpatijaViewportBreath(memD) {
  push();
  noStroke();
  blendMode(SCREEN);
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let amp = memD >= 2 ? getDeepEmpatijaPhase2BackdropAmpMul(mot) : mot;
  let t =
    memD >= 2 ? millis() * 0.00105 : millis() * 0.00072 * mot;
  let pan =
    memD >= 2 ? getDeepEmpatijaPhase2BackdropPanPx(memD, mot) : { x: 0, y: 0 };
  let cx =
    width * 0.5 +
    sin(t * 0.38) * (memD >= 2 ? 26 : 18) * amp +
    pan.x;
  let cy =
    height * 0.48 +
    cos(t * 0.31) * (memD >= 2 ? 20 : 14) * amp +
    pan.y;
  let s = min(width, height) / 560;
  let exp2 = getDeepEmpatijaPhase2ExpandMul(memD, mot);
  let breathLayers = memD >= 2 ? 4 : 6;
  for (let i = 0; i < breathLayers; i++) {
    let pulse =
      1 +
      (memD >= 2 ? 0.078 : 0.042) * sin(t * 0.95 + i * 0.48);
    let layExp = memD >= 2 ? exp2 * (1 + 0.028 * sin(t * 0.55 + i * 0.35)) : 1;
    fill(
      255,
      218,
      155,
      ((7 + memD * 1.25) / (i + 1)) * pulse * 0.88 * (memD >= 2 ? 1.15 : 1)
    );
    ellipse(
      cx,
      cy,
      (340 + i * 152) * s * pulse * layExp,
      (318 + i * 138) * s * pulse * layExp
    );
  }
  blendMode(BLEND);
  pop();
}

/** Šiltas sepijos vinjetė — ne plokščia juoda. */
function drawDeepEmpatijaSepiaVignette(memD) {
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (!ctx || typeof ctx.createRadialGradient !== "function") {
    return;
  }
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let pan =
    memD >= 2 ? getDeepEmpatijaPhase2BackdropPanPx(memD, mot) : { x: 0, y: 0 };
  let amp = memD >= 2 ? getDeepEmpatijaPhase2BackdropAmpMul(mot) : mot;
  let ph2 = memD >= 2 ? getDeepEmpatijaPhase2SyncPhase(mot) : 0;
  let tv = memD >= 2 ? millis() * 0.00026 : millis() * 0.00018 * mot;
  let cx =
    width * 0.5 +
    sin(tv) * (memD >= 2 ? 14 : 8) * amp +
    pan.x * (memD >= 2 ? 0.42 : 0.28);
  let cy =
    height * 0.46 +
    cos(tv * 0.86) * (memD >= 2 ? 11 : 7) * amp +
    pan.y * (memD >= 2 ? 0.42 : 0.28);
  let r =
    Math.hypot(width, height) *
    0.62 *
    (memD >= 2 ? 1 + 0.032 * sin(ph2) : 1);
  let g = ctx.createRadialGradient(cx, cy, r * 0.08, cx, cy, r);
  g.addColorStop(0, "rgba(42, 32, 22, 0)");
  g.addColorStop(0.42, "rgba(28, 20, 14, 0.12)");
  g.addColorStop(0.78, "rgba(14, 10, 8, 0.42)");
  g.addColorStop(1, "rgba(6, 4, 3, 0.62)");
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/** Filmo grūdas — subtilus; mažiau taškų gylio 2 (našumas). */
function drawDeepEmpatijaFilmGrain(memD) {
  push();
  noStroke();
  let ds = (typeof deepSeed === "number" ? deepSeed : 1) + memD * 17;
  let msh = millis() * (memD >= 2 ? 0.000052 : 0.000015);
  let grainN = memD >= 2 ? 260 : 620;
  for (let i = 0; i < grainN; i++) {
    let x = noise(i * 0.071 + ds * 0.002, msh + i * 0.013) * width;
    let y = noise(i * 0.069 + 3.1, ds * 0.003 + i * 0.019) * height;
    let a = (5 + noise(i * 0.41, msh) * 11) * 0.055;
    fill(255, 238, 215, a);
    rect(x, y, 1.15, 1.15);
  }
  pop();
}

/** Didieji auksiniai bokeh rutuliai — už medžio. */
function drawDeepEmpatijaGoldenBokeh(memD) {
  push();
  blendMode(SCREEN);
  noStroke();
  let ds = typeof deepSeed === "number" ? deepSeed : 1;
  let t = millis() * (memD >= 2 ? 0.00034 : 0.00022);
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let amp = memD >= 2 ? getDeepEmpatijaPhase2BackdropAmpMul(mot) : mot;
  let exp2 = getDeepEmpatijaPhase2ExpandMul(memD, mot);
  let pan =
    memD >= 2 ? getDeepEmpatijaPhase2BackdropPanPx(memD, mot) : { x: 0, y: 0 };
  let ox = width * 0.5 + pan.x;
  let oy = height * 0.48 + pan.y;
  let bokehN = memD >= 2 ? 4 : 8;
  for (let k = 0; k < bokehN; k++) {
    let bx = width * (0.08 + noise(ds * 0.011 + k * 2.2, 7.3) * 0.84);
    let by = height * (0.06 + noise(ds * 0.013 + k, 9.1) * 0.88);
    if (memD >= 2) {
      bx = ox + (bx - ox) * exp2;
      by = oy + (by - oy) * exp2;
    }
    let r =
      (min(width, height) * (0.14 + noise(k * 0.51, ds * 0.01) * 0.42) +
        sin(t * 0.9 + k * 0.7) * 16 * amp) *
      (memD >= 2 ? exp2 : 1);
    fill(255, 185, 95, (5.5 + memD * 1.2) / (k * 0.28 + 1));
    let driftM = memD >= 2 ? 1.02 : 1;
    ellipse(
      bx + sin(t * 0.55 + k) * 24 * amp * driftM,
      by + cos(t * 0.48 + k * 0.8) * 18 * amp * driftM,
      r * 2,
      r * 2 * 0.9
    );
  }
  blendMode(BLEND);
  pop();
}

/** Plonos auksinės „plaukų“ šviesos juostos — orbitos aplink židinį. */
function drawDeepEmpatijaHairTrails(memD) {
  let ds = typeof deepSeed === "number" ? deepSeed : 1;
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let amp = memD >= 2 ? getDeepEmpatijaPhase2BackdropAmpMul(mot) : mot;
  let t = memD >= 2 ? millis() * 0.00052 : millis() * 0.00038 * mot;
  let exp2 = getDeepEmpatijaPhase2ExpandMul(memD, mot);
  let pan =
    memD >= 2 ? getDeepEmpatijaPhase2BackdropPanPx(memD, mot) : { x: 0, y: 0 };
  let hx = width * 0.5 + pan.x;
  let hy = height * 0.46 + pan.y;
  push();
  blendMode(SCREEN);
  strokeCap(ROUND);
  noFill();
  let n = memD >= 2 ? 9 : 11 + memD * 4;
  for (let i = 0; i < n; i++) {
    let seed = ds + i * 101;
    let cx = width * (0.28 + noise(seed * 0.0082, 2.1) * 0.46);
    let cy = height * (0.22 + noise(seed * 0.0085, 5.4) * 0.52);
    if (memD >= 2) {
      cx = hx + (cx - hx) * exp2;
      cy = hy + (cy - hy) * exp2;
    }
    let ox = sin(t * 1.1 + i * 0.65) * 36 * (memD >= 2 ? amp * 0.88 : mot);
    let oy = cos(t * 0.92 + i * 0.48) * 28 * (memD >= 2 ? amp * 0.88 : mot);
    stroke(255, 200, 125, 16 + noise(i * 0.31, t * 0.5) * 26);
    strokeWeight(0.28 + noise(seed * 0.02) * 0.65);
    bezier(
      cx - 100 + ox * 0.6,
      cy - 40 + oy,
      cx + noise(i, 1) * 90 - width * 0.02,
      cy - min(height, width) * 0.14 + noise(i, 2) * 40,
      cx + width * 0.06 + sin(t + i) * 20,
      cy + height * 0.08,
      cx + 130 + ox,
      cy + min(height * 0.22, 160) + oy * 0.45
    );
  }
  noStroke();
  blendMode(BLEND);
  pop();
}

/** Auksinės dulkės šviesoje — labai smulku. */
function drawDeepEmpatijaDustMotes(memD) {
  let ds = typeof deepSeed === "number" ? deepSeed : 1;
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let amp = memD >= 2 ? getDeepEmpatijaPhase2BackdropAmpMul(mot) : mot;
  let t = memD >= 2 ? millis() * 0.00078 : millis() * 0.00052 * mot;
  let exp2 = getDeepEmpatijaPhase2ExpandMul(memD, mot);
  let pan =
    memD >= 2 ? getDeepEmpatijaPhase2BackdropPanPx(memD, mot) : { x: 0, y: 0 };
  let ox = width * 0.5 + pan.x;
  let oy = height * 0.48 + pan.y;
  push();
  blendMode(ADD);
  noStroke();
  let n = memD >= 2 ? 38 : 72 + memD * 38;
  for (let i = 0; i < n; i++) {
    let bx = noise(i * 0.43 + ds * 0.0015, t * 0.018 + 2) * width;
    let by = noise(i * 0.39 + 6.2, t * 0.016 + ds * 0.002) * height;
    if (memD >= 2) {
      bx = ox + (bx - ox) * exp2;
      by = oy + (by - oy) * exp2;
    }
    let s = (0.65 + noise(i * 0.51, ds) * 3.2) * (memD >= 2 ? 0.92 + 0.08 * exp2 : 1);
    let a = (14 + noise(i * 0.23, t * 0.08) * 38) * 0.085;
    fill(255, 225, 175, a);
    let drift = memD >= 2 ? 0.92 : 1;
    ellipse(
      bx + sin(t * 1.2 + i) * 9 * amp * drift,
      by + cos(t + i * 0.7) * 8 * amp * drift,
      s,
      s * 0.85
    );
  }
  blendMode(BLEND);
  pop();
}

function updateDeepHoldCinematicTrigger() {
  if (focusedZone === 8) {
    return;
  }
  if (isDeepMemoryTreeZone(focusedZone)) {
    return;
  }
  if (focusedZone < 1 || focusedZone > 8 || !isPointerDown || deepHoldStartMs < 0) {
    return;
  }
  let state = ensureDeepZoneCinematicState(focusedZone);
  if (state.shown) {
    return;
  }
  if (millis() - deepHoldStartMs < DEEP_HOLD_TRIGGER_MS) {
    return;
  }

  state.text = getDeepHoldCinematicText(focusedZone);
  state.shown = true;
}

/**
 * Frazės vertikalė (be mikro pasislinkimo) — turi likti „no-text“ plote.
 * Truputį žemiau nei anksčiau, kad ne atrodytų UI grid centras.
 */
function getDeepMemoryPhraseBaselineY() {
  return height * 0.715 + 12;
}

/**
 * Atminties gylio kompozicija: 1 fazė — šaknis dažniausiai dešinėje (Drama / Jautrumas — arčiau centro);
 * 2 fazė — šaknis arčiau vizualinio centro, kad medis užpildytų erdvę.
 * Meilė (6) fazė 1 — centras / šiek tiek kairėn (ne tuščias dešinys kampe).
 */
function getDeepMemoryTreeRootXForZone(zone, memD) {
  let z = constrain(typeof zone === "number" ? zone : 6, 3, 7);
  let m = constrain(typeof memD === "number" ? memD : 1, 1, 2);
  let micro = { 3: 0, 4: -0.012, 5: 0.009, 6: 0.005, 7: -0.007 };
  let add = micro[z] || 0;
  let rightNorm = constrain(0.738 + add, 0.62, 0.9);
  if (z === 6 && m < 2) {
    let meileP1 = constrain(0.485 + add * 0.4, 0.43, 0.56);
    return width * meileP1;
  }
  /* Drama fazė 1 — viena šaka, bet ne prie pat krašto: arčiau centro nei anksčiau. */
  if (z === 5 && m < 2) {
    return width * constrain(0.585 + add * 0.45, 0.52, 0.66);
  }
  /* Jautrumas fazė 1 — arčiau centro nei anksčiau, vis dar viena aiški šaka. */
  if (z === 4 && m < 2) {
    return width * constrain(0.575 + add * 0.45, 0.5, 0.64);
  }
  /* Juoko fazė 1 — dešinėje pusėje, bet arčiau centro; ne prie krašto. */
  if (z === 3 && m < 2) {
    return width * constrain(0.698 + add * 0.08, 0.62, 0.76);
  }
  /* Juoko fazė 2 — kristalinis laukas dešinėje kaip sensory reference. */
  if (z === 3 && m >= 2) {
    return width * constrain(0.812 + add * 0.07, 0.76, 0.9);
  }
  if (m < 2) {
    return width * rightNorm;
  }
  let centerNormByZone = {
    3: 0.52,
    4: 0.47,
    5: 0.55,
    6: 0.51,
    7: 0.518
  };
  let cn = centerNormByZone[z] !== undefined ? centerNormByZone[z] : 0.52;
  cn = constrain(cn + add * 0.4, 0.44, 0.62);
  let blended = lerp(rightNorm, cn, 0.58);
  return width * constrain(blended, 0.44, 0.82);
}

function getDeepMemoryTextColumnCenterX() {
  return width * 0.36;
}

/**
 * Stabilus mikro poslinkis (~5–10 px) — ne idealus centras, o gyvybė.
 */
function getDeepMemoryPhraseMicroNudge(zone, memD) {
  let s = (typeof deepSeed === "number" ? deepSeed : 0) + zone * 19 + (memD | 0) * 11;
  let x = ((s * 7) % 21) - 10;
  let y = 4 + (s % 5);
  return { x: constrain(x, -10, 10), y };
}

/** Ilgesnė frazė — platesnis horizontalus išdėstymas. */
function isDeepMemoryHeroPhraseHorizontal() {
  let z = typeof focusedZone === "number" ? focusedZone : 0;
  if (!isDeepMemoryTreeZone(z)) {
    return false;
  }
  let full = getDeepMemoryPhraseForZone(z, getDeepZoneMemoryDepth(z));
  return full.length >= 17;
}

/**
 * Pasisukimas: ilgesnė frazė (žr. isDeepMemoryHeroPhraseHorizontal) lieka horizontaliai.
 */
function getDeepMemoryPhraseTiltForDraw(zone, memD) {
  if (isDeepMemoryHeroPhraseHorizontal()) {
    return 0;
  }
  return getDeepMemoryPhraseTiltRad(zone, memD);
}

/** Zonos, kuriose medis / lapai nepiešiami (tekstas „švarus“). */
function getDeepMemoryNoTextRects() {
  let cx =
    typeof getDeepMemoryTextColumnCenterX === "function"
      ? getDeepMemoryTextColumnCenterX()
      : width * 0.36;
  let mainY = getDeepMemoryPhraseBaselineY() + 6;
  let mainPadY = max(56, height * 0.065);
  let mainPadX = min(width * 0.46, 310) * 0.5;
  return {
    mainTop: mainY - mainPadY,
    mainBot: mainY + mainPadY,
    mainLeft: cx - mainPadX,
    mainRight: cx + mainPadX
  };
}

/**
 * Atskaitos taškai šakoms slėpti — Empatijai + frazė + antraštė + „grįžti“.
 */
function getDeepMemoryNoTextHitRects() {
  let r = getDeepMemoryNoTextRects();
  let list = [
    { left: r.mainLeft, right: r.mainRight, top: r.mainTop, bottom: r.mainBot }
  ];
  if (typeof focusedZone === "number" && focusedZone === 7) {
    let memD =
      typeof getDeepZoneMemoryDepth === "function" ? getDeepZoneMemoryDepth(7) : 1;
    let A = getDeepMemoryTreeTitleAnchor(7, memD);
    list.push({
      left: A.x - width * 0.05,
      right: A.x + width * 0.36,
      top: A.y - height * 0.034,
      bottom: A.y + height * 0.072
    });
    list.push({
      left: width * 0.028,
      right: width * 0.26,
      top: height * 0.898,
      bottom: height * 0.998
    });
  }
  return list;
}

function deepMemoryPointHitsNoTextZone(px, py) {
  let rects = getDeepMemoryNoTextHitRects();
  for (let i = 0; i < rects.length; i++) {
    let h = rects[i];
    if (px >= h.left && px <= h.right && py >= h.top && py <= h.bottom) {
      return true;
    }
  }
  return false;
}

function deepMemoryScreenAtOrigin() {
  if (typeof drawingContext === "undefined" || !drawingContext.getTransform) {
    let tx =
      typeof getDeepMemoryTextColumnCenterX === "function"
        ? getDeepMemoryTextColumnCenterX()
        : width * 0.36;
    return { x: tx, y: height * 0.9 };
  }
  let t = drawingContext.getTransform();
  return { x: t.e, y: t.f };
}

function deepMemorySkipBranchJointForNoText(maxSpanX) {
  if (
    typeof focusedZone === "undefined" ||
    !isDeepMemoryTreeZone(focusedZone) ||
    typeof currentView === "undefined" ||
    currentView !== "deep"
  ) {
    return false;
  }
  let p = deepMemoryScreenAtOrigin();
  let pad = maxSpanX + 10;
  return (
    deepMemoryPointHitsNoTextZone(p.x, p.y) ||
    deepMemoryPointHitsNoTextZone(p.x - pad, p.y) ||
    deepMemoryPointHitsNoTextZone(p.x + pad, p.y)
  );
}

/** Vienas atsitiktinis variantas zonai+fazei per puslapio sesiją (perkrovus — naujas). */
let _deepMemoryPhrasePick = {};

/**
 * Atminties gylio frazės: Juokas, Jautrumas, Drama, Meilė, Empatija — 1 ir 2 fazė atskirai.
 * Pasirinkimas `random()` tik pirmą kartą kreipiantis į `getDeepMemoryPhraseForZone` (ne kiekviename kadre).
 */
const DEEP_MEMORY_PHRASE_POOLS = {
  3: {
    1: ["lengviau...", "kvėpuoju iš naujo", "atsitraukiu", "mažiau rimtai", "išsileidžiu"],
    2: ["paleidžiu", "jau geriau", "nebeverda", "lieka erdvė", "tyliai juokiuosi"]
  },
  4: {
    1: ["per arti...", "odoje", "viskas garsiau", "neužsidengiu", "liečiu iki galo"],
    2: ["jaučiu viską", "į mane ateina", "be filtro", "širdis pilna", "nebegaliu slėpti"]
  },
  5: {
    1: ["per daug...", "scena dega", "viduje audra", "visi žiūri", "nebeįmanoma tylėti"],
    2: ["sprogstu tyliai", "vis tiek groju", "lūžis scenoje", "ugnis po oda", "pabaiga be uždangos"]
  },
  6: {
    1: ["tylu...", "šilta", "čia saugu", "arčiau", "lėtai artėju"],
    2: ["pilna", "telpa abu", "širdis plačiau", "nebenoriu mažiau", "lieku"]
  },
  7: {
    1: ["įsileidžiu...", "atidarau duris", "imsiu ant savęs", "klausau kūnu", "riba tirpsta"],
    2: ["ne tik save", "ir tave jaučiu", "kartu skauda", "dalinuosi oru", "be atstumo"]
  }
};

function getDeepMemoryPhraseForZone(zone, depth) {
  let d = constrain(typeof depth === "number" ? depth : 1, 1, 2);
  let z = typeof zone === "number" ? zone : 0;
  if (z < 3 || z > 7) {
    return "";
  }
  let key = z + ":" + d;
  if (_deepMemoryPhrasePick[key] !== undefined) {
    return _deepMemoryPhrasePick[key];
  }
  let pool = DEEP_MEMORY_PHRASE_POOLS[z] && DEEP_MEMORY_PHRASE_POOLS[z][d];
  if (!pool || pool.length === 0) {
    _deepMemoryPhrasePick[key] = "";
    return "";
  }
  _deepMemoryPhrasePick[key] = pool[floor(random(pool.length))];
  return _deepMemoryPhrasePick[key];
}

/**
 * Viršutinės / šoninės šakos anga — pagal tą patį lankstymą kaip drawDeepMemoryEmotionTree
 * (žiedas / laja arti antraštės, ne fiksuotas ekrano „headeris“).
 */
function getDeepMemoryTreeBend(zone, memD) {
  memD = constrain(typeof memD === "number" ? memD : 1, 1, 2);
  if (zone === 3) {
    return sin(frameCount * 0.023) * (0.0055 * memD);
  }
  if (zone === 4) {
    return sin(frameCount * 0.019) * (0.0035 * memD);
  }
  if (zone === 5) {
    let amp = 0.0028 * memD * (memD >= 2 ? 1.75 : 1);
    return sin(frameCount * 0.024) * amp + sin(frameCount * 0.041 + 1.1) * amp * 0.35;
  }
  if (zone === 6) {
    return sin(frameCount * 0.017) * (0.0042 * memD);
  }
  if (zone === 7) {
    return sin(frameCount * 0.02) * (0.0048 * memD);
  }
  return 0;
}

/**
 * Rule-of-thirds: kiekviena zona savo ašyje — ne centre.
 * Returnuoja { x, y, r:0 } (be pasukimo).
 */
function getDeepMemoryTreeTitleAnchor(zone, memD) {
  let w = width;
  let h = height;
  memD = constrain(typeof memD === "number" ? memD : 1, 1, 2);
  let seed = (deepSeed || 1) % 100;
  let nudgeX = (seed * 0.007 - 0.35) * w * 0.03;
  let nudgeY = ((seed * 3) % 100) * 0.0003 * h;
  if (zone === 3) {
    return { x: w * 0.18 + nudgeX, y: h * 0.084 + nudgeY, r: 0 };
  }
  if (zone === 4) {
    return { x: w * 0.14 + nudgeX, y: h * 0.092 + nudgeY, r: 0 };
  }
  if (zone === 5) {
    return { x: w * 0.22 + nudgeX, y: h * 0.076 + nudgeY, r: 0 };
  }
  if (zone === 6) {
    return { x: w * 0.16 + nudgeX, y: h * 0.1 + nudgeY, r: 0 };
  }
  if (zone === 7) {
    return { x: w * 0.19 + nudgeX, y: h * 0.088 + nudgeY, r: 0 };
  }
  return { x: w * 0.18, y: h * 0.08, r: 0 };
}

/** Frazė — „laužyta“ vs medį (palyginimui: hero frazė lieka 0 su getDeepMemoryPhraseTiltForDraw). */
function getDeepMemoryPhraseTiltRad(zone, memD) {
  memD = constrain(typeof memD === "number" ? memD : 1, 1, 2);
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let wob = sin(millis() * 0.00027) * 0.012 * mot;
  if (zone === 3) {
    return 0.034 * (memD * 0.2 + 0.4) + wob;
  }
  if (zone === 4) {
    return 0.04 * (0.3 + memD * 0.2) + wob;
  }
  if (zone === 5) {
    return sin(millis() * 0.0002) * 0.048 * mot;
  }
  if (zone === 6) {
    return 0.026 * (0.3 + memD * 0.2) + wob;
  }
  if (zone === 7) {
    return 0.03 * (0.35 + memD * 0.2) + wob;
  }
  return 0;
}

/** Atminties zonų pavadinimas — Inter (`deepZoneTitle`). */
function setDeepMemoryVoiceTitleFont() {
  setDeepZoneTitleFont();
  textStyle(NORMAL);
}

/**
 * Atminties zonos (3–7): tas pats kompaktiškas ženkliukas kaip Empatijoje —
 * mažesnis UI šriftas, plonas bruksnys apačioje; abiem gyliams (memD 1 ir 2).
 * Spalva — švelnus mix su zonos tonu (ne visa „sepija“ ant visų).
 */
function drawDeepMemoryZoneTitle(zone) {
  let data = ZONE_DATA[zone];
  if (!data || !isDeepMemoryTreeZone(zone)) {
    return;
  }
  let memD = getDeepZoneMemoryDepth(zone);
  let zoneTint = deepMemoryPhaseToneRgb(getDeepZoneTextColor(zone), memD);
  let A = getDeepMemoryTreeTitleAnchor(zone, memD);
  let ax = constrain(A.x, width * 0.06, width * 0.58);
  let ay = constrain(A.y, height * 0.04, height * 0.2);
  let dwell = getDeepDwellSeconds();
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let breath = 0.5 + 0.5 * sin(millis() * 0.00042 + zone * 0.8) * mot;

  /* Juoko fazės 1–2 — „Juokas“ pilkai ant tamsaus lopo (ta pati kompozicija kaip reference). */
  if (zone === 3 && memD >= 1 && memD <= 2) {
    setDeepZoneTitleFont();
    textStyle(NORMAL);
    let dTs = min(14.2, max(11.8, width * 0.031));
    textSize(dTs);
    textLeading(dTs * 1.32);
    let seed = (deepSeed || 1) % 100;
    let tx =
      ax +
      sin(millis() * 0.00026 + seed * 0.02) * 0.35 +
      sin(frameCount * 0.012 + seed * 0.01) * 0.18;
    let ty = ay + cos(millis() * 0.00022 + seed * 0.04) * 0.28;
    let dA = constrain(72 + breath * 14 - dwell * 1.4 + (1 - mot) * 18, 58, 102);
    let tr = lerp(zoneTint[0], 132, 0.46);
    let tg = lerp(zoneTint[1], 142, 0.46);
    let tb = lerp(zoneTint[2], 158, 0.46);
    push();
    textAlign(LEFT, TOP);
    if (typeof deepUiApplyLetterSpacing === "function") {
      deepUiApplyLetterSpacing();
    }
    noStroke();
    fill(tr, tg, tb, dA);
    text(data.title, tx, ty);
    let twD = textWidth(data.title);
    let underY = ty + textAscent() + 2;
    stroke(tr, tg, tb, dA * 0.35);
    strokeWeight(max(0.35, min(0.75, width * 0.0009)));
    line(tx, underY, tx + twD, underY);
    noStroke();
    pop();
    if (typeof deepUiResetLetterSpacing === "function") {
      deepUiResetLetterSpacing();
    }
    noStroke();
    return;
  }

  /* Drama fazė 1 — vos matomas antraštės žymuo (kaip vandens ženklas). */
  if (zone === 5 && memD === 1) {
    setDeepZoneTitleFont();
    textStyle(NORMAL);
    let dTs = min(14.2, max(11.8, width * 0.031));
    textSize(dTs);
    textLeading(dTs * 1.32);
    let seed = (deepSeed || 1) % 100;
    let tx =
      ax +
      sin(millis() * 0.00028 + seed * 0.02) * 0.45 +
      sin(frameCount * 0.014 + seed * 0.01) * 0.22;
    let ty = ay + cos(millis() * 0.00024 + seed * 0.04) * 0.35;
    let dA = constrain(58 + breath * 12 - dwell * 1.8 + (1 - mot) * 14, 52, 82);
    let tr = lerp(zoneTint[0], 118, 0.48);
    let tg = lerp(zoneTint[1], 94, 0.48);
    let tb = lerp(zoneTint[2], 82, 0.48);
    push();
    textAlign(LEFT, TOP);
    if (typeof deepUiApplyLetterSpacing === "function") {
      deepUiApplyLetterSpacing();
    }
    noStroke();
    fill(tr, tg, tb, dA);
    text(data.title, tx, ty);
    let twD = textWidth(data.title);
    let underY = ty + textAscent() + 2;
    stroke(tr, tg, tb, dA * 0.38);
    strokeWeight(max(0.4, min(0.85, width * 0.001)));
    line(tx, underY, tx + twD, underY);
    noStroke();
    pop();
    if (typeof deepUiResetLetterSpacing === "function") {
      deepUiResetLetterSpacing();
    }
    noStroke();
    return;
  }

  if (zone === 8) {
    setDeepZoneTitleFont();
    textStyle(NORMAL);
    let seed8 = (deepSeed || 1) % 100;
    let uiTs8 = min(18, max(14.5, width * 0.039));
    textSize(uiTs8);
    textLeading(uiTs8 * 1.32);
    let tx8 =
      ax +
      sin(millis() * 0.0003 + seed8 * 0.02) * 0.55 +
      sin(frameCount * 0.016 + seed8 * 0.01) * 0.28;
    let ty8 = ay + cos(millis() * 0.00026 + seed8 * 0.04) * 0.4;
    let emA8 = constrain(
      138 + breath * 16 - dwell * 1.4 + (1 - mot) * 16,
      118,
      210
    );
    let tr8 = lerp(zoneTint[0], 255, 0.2);
    let tg8 = lerp(zoneTint[1], 236, 0.16);
    let tb8 = lerp(zoneTint[2], 238, 0.14);
    push();
    textAlign(LEFT, TOP);
    if (typeof deepUiApplyLetterSpacing === "function") {
      deepUiApplyLetterSpacing();
    }
    let ctx8 = typeof drawingContext !== "undefined" ? drawingContext : null;
    if (ctx8) {
      ctx8.save();
      ctx8.shadowBlur = 14;
      ctx8.shadowColor = "rgba(0,0,0,0.45)";
    }
    stroke(10, 4, 8, emA8 * 0.35);
    strokeWeight(max(0.55, min(1.05, width * 0.00115)));
    fill(tr8, tg8, tb8, emA8);
    text(data.title, tx8, ty8);
    noStroke();
    if (ctx8) {
      ctx8.restore();
    }
    let twU8 = textWidth(data.title);
    let underY8 = ty8 + textAscent() + 3;
    stroke(tr8, tg8, tb8, emA8 * 0.5);
    strokeWeight(max(0.5, min(1, width * 0.00105)));
    line(tx8, underY8, tx8 + twU8, underY8);
    noStroke();
    pop();
    if (typeof deepUiResetLetterSpacing === "function") {
      deepUiResetLetterSpacing();
    }
    noStroke();
    return;
  }

  setDeepZoneTitleFont();
  textStyle(NORMAL);
  let uiTs = min(16.5, max(13.5, width * 0.036));
  textSize(uiTs);
  textLeading(uiTs * 1.35);
  let seed = (deepSeed || 1) % 100;
  let tx =
    ax +
    sin(millis() * 0.00034 + seed * 0.02 + zone * 0.31) * 0.85 +
    sin(frameCount * 0.019 + seed * 0.01 + zone * 0.17) * 0.38;
  let ty = ay + cos(millis() * 0.0003 + seed * 0.05 + zone * 0.22) * 0.55;
  let emA = constrain(
    118 + breath * 18 - dwell * 2.2 - (memD - 1) * 12 + (1 - mot) * 22,
    76,
    165
  );
  let tr = lerp(zoneTint[0], 132, 0.42);
  let tg = lerp(zoneTint[1], 118, 0.42);
  let tb = lerp(zoneTint[2], 106, 0.42);
  push();
  textAlign(LEFT, TOP);
  if (typeof deepUiApplyLetterSpacing === "function") {
    deepUiApplyLetterSpacing();
  }
  noStroke();
  fill(tr, tg, tb, emA);
  text(data.title, tx, ty);
  let twU = textWidth(data.title);
  let underY = ty + textAscent() + 3;
  stroke(tr, tg, tb, emA * 0.42);
  strokeWeight(max(0.45, min(1, width * 0.0011)));
  line(tx, underY, tx + twU, underY);
  noStroke();
  pop();
  if (typeof deepUiResetLetterSpacing === "function") {
    deepUiResetLetterSpacing();
  }
  noStroke();
}

/** Lėtos „kvėpavimo“ linijos — tonas pagal zoną; daugiau eilučių kai gylis didėja. */
function drawDeepMemoryBreathingRidges(zone, memD) {
  if (zone === 7) {
    drawDeepEmpatijaBreathPulse(memD);
    return;
  }
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let hold =
    typeof isPointerDown !== "undefined" && isPointerDown ? 1 : 0;
  let breath = sin(millis() * 0.00032) * mot;
  let baseA = 7 + memD * 2.2 + hold * 9 + breath * 3;
  let zt = getDeepZoneTextColor(zone);
  strokeCap(ROUND);
  stroke(
    lerp(42, zt[0], 0.42),
    lerp(42, zt[1], 0.42),
    lerp(48, zt[2], 0.42),
    constrain(baseA, 5, 46)
  );
  strokeWeight(0.55 + hold * 0.35 + memD * 0.04);
  let xStep = max(14, min(22, width * 0.0165));
  let nRows = 3 + memD;
  if (zone === 5 && memD >= 2) {
    nRows = 5 + hold * 2;
    xStep = max(10, min(16, width * 0.0135));
  } else if (zone === 5 && memD === 1) {
    nRows = 2;
    xStep = max(28, min(40, width * 0.024));
  } else if (zone === 3 && memD >= 2) {
    nRows = 2;
    xStep = max(26, min(38, width * 0.023));
  }
  let ds = deepSeed || 1;
  for (let k = 0; k < nRows; k++) {
    let ridgeSeed = (ds * 17 + zone * 5 + k * 3) % 100;
    let xStart = width * (0.04 + ridgeSeed * 0.0012);
    let xEnd = width * (0.96 - ((ridgeSeed * 7) % 30) * 0.0011);
    let yBaseNorm = 0.14 + k * 0.052 + noise(k * 0.6, ds * 0.01, zone * 0.08) * 0.06;
    let yBase = height * yBaseNorm + breath * (7 + k * 3.5);
    let rowAlpha = baseA * (0.55 + noise(k * 0.38, ds * 0.004) * 0.8);
    stroke(
      lerp(42, zt[0], 0.38),
      lerp(42, zt[1], 0.38),
      lerp(48, zt[2], 0.40),
      constrain(rowAlpha, 3, 42)
    );
    let x0 = xStart;
    let wob = (10 + hold * 8) * mot;
    let tRidge = millis() * 0.0002 * mot;
    let tRidgeN = millis() * 0.00008 * mot;
    let y0 = yBase + sin(x0 * 0.0065 + tRidge) * wob;
    for (let x = x0 + xStep; x <= xEnd; x += xStep) {
      let noiseShift =
        zone === 5
          ? (memD >= 2
              ? sin(x * 0.011 + ds * 0.19 + tRidgeN * 48) * 3.55 * mot +
                (noise(x * 0.014, yBase * 0.004, tRidgeN * 22) - 0.5) * 5.2 * mot
              : sin(x * 0.009 + ds * 0.17 + tRidgeN * 40) * 2.15 * mot)
          : zone === 3 && memD >= 2
            ? sin(x * 0.0088 + ds * 0.11 + tRidgeN * 36 + k * 0.4) * 2.05 * mot
            : (noise(x * 0.006, yBase * 0.003, tRidgeN) - 0.5) * 4.5 * mot;
      let y1 = yBase + sin(x * 0.0065 + tRidge) * wob + noiseShift;
      line(x0, y0, x, y1);
      x0 = x;
      y0 = y1;
    }
  }
  noStroke();
}

/**
 * Tamsus fono „dūmas“ + silpni spalviniai dėmės — užpildo tuščią canvas,
 * tankiau fazėje 2 (lūžis).
 */
/**
 * Atmosferos sluoksnis — noise dūmai + subtilūs taškiukai.
 * Nė vieno "glow" efekto — tik gradientas per noise tekstūrą.
 */
function drawDeepMemoryAtmosphereFill(zone, memD) {
  let zt = getDeepZoneTextColor(zone);
  let ds = deepSeed || 1;
  let ms = millis();
  let t = ms * 0.000085;
  let fogBase = [8, 7, 10];
  let fogZ = 0.34;
  let dotZ = 0.46;
  let lineZ = 0.26;
  let fogExtra = 0;
  let dotExtra = 0;
  if (zone === 3) {
    fogBase = [2, 22, 42];
    fogZ = 0.55;
    dotZ = 0.62;
    lineZ = 0.4;
    fogExtra = 6;
    dotExtra = 5;
  } else if (zone === 4) {
    fogBase = [22, 18, 38];
    fogZ = 0.56;
    dotZ = 0.58;
    lineZ = 0.34;
    fogExtra = memD >= 2 ? 6 : 4;
    dotExtra = memD >= 2 ? 8 : 5;
  } else if (zone === 5) {
    if (memD === 1) {
      fogBase = [24, 14, 10];
      fogZ = 0.62;
      dotZ = 0.58;
      lineZ = 0.32;
      fogExtra = 10;
      dotExtra = 6;
    } else {
      fogBase = [36, 12, 4];
      fogZ = 0.58;
      dotZ = 0.54;
      lineZ = 0.36;
      fogExtra = 8;
      dotExtra = 3;
    }
  } else if (zone === 6) {
    fogBase = [22, 8, 36];
    fogZ = 0.54;
    dotZ = 0.58;
    lineZ = 0.34;
    fogExtra = 5;
    dotExtra = 5;
  } else if (zone === 7) {
    fogBase = [58, 38, 14];
    fogZ = 0.5;
    dotZ = 0.62;
    lineZ = 0.38;
    fogExtra = 6;
    dotExtra = 14;
  }
  let atmMot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let em7Exp = zone === 7 && memD >= 2 ? getDeepEmpatijaPhase2ExpandMul(memD, atmMot) : 1;
  let em7Pan =
    zone === 7 && memD >= 2
      ? getDeepEmpatijaPhase2BackdropPanPx(memD, atmMot)
      : { x: 0, y: 0 };
  let em7Ox = width * 0.48 + em7Pan.x;
  let em7Oy = height * 0.45 + em7Pan.y;
  push();
  noStroke();
  let lightU = 0.48 + (zone - 3) * 0.024;
  let lightV = 0.34 + (zone - 3) * 0.016;
  lightU = constrain(lightU, 0.42, 0.58);
  lightV = constrain(lightV, 0.28, 0.45);
  if (zone === 5 && memD === 1) {
    lightU = 0.5;
    lightV = 0.4;
  }
  if (zone === 5 && memD >= 2) {
    let bt = ms * 0.000056 * atmMot;
    lightU += sin(bt * 0.44) * 0.014;
    lightV += cos(bt * 0.38) * 0.011;
    lightU = constrain(lightU, 0.42, 0.58);
    lightV = constrain(lightV, 0.28, 0.48);
  }
  if (zone === 4 && memD === 1) {
    lightU = 0.49;
    lightV = 0.38;
  }
  blendMode(SCREEN);
  let baseEllAlpha =
    (zone === 5 && memD === 1) || (zone === 4 && memD === 1)
      ? 1.9 + memD * 0.85
      : 2.8 + memD * 1.05;
  if (zone === 5 && memD >= 2) {
    let bt = ms * 0.000056 * atmMot;
    let ap = 0.92 + 0.08 * (0.5 + 0.5 * sin(bt * 0.88)) * (0.5 + 0.5 * sin(bt * 0.59 + 1.05));
    baseEllAlpha *= ap;
  }
  fill(
    lerp(22, zt[0], 0.2),
    lerp(20, zt[1], 0.18),
    lerp(28, zt[2], 0.16),
    baseEllAlpha
  );
  let ellW =
    width *
    (zone === 5 && memD === 1 ? 0.44 : zone === 4 && memD === 1 ? 0.42 : 0.48);
  let ellH =
    height *
    (zone === 5 && memD === 1 ? 0.31 : zone === 4 && memD === 1 ? 0.3 : 0.36);
  if (zone === 7 && memD >= 2) {
    ellW *= em7Exp;
    ellH *= em7Exp;
  }
  if (zone === 5 && memD >= 2) {
    let bt = ms * 0.000056 * atmMot;
    let br =
      0.94 +
      0.08 *
        (0.5 + 0.5 * sin(bt * 0.92)) *
        (0.5 + 0.5 * sin(bt * 0.63 + 1.12));
    ellW *= br * 1.03;
    ellH *= br * 1.05;
  }
  ellipse(width * lightU, height * lightV, ellW, ellH);
  blendMode(BLEND);
  let textureScale = 0.9 + (zone - 3) * 0.032 + memD * 0.022;
  let fogCount = floor((16 + memD * 10 + fogExtra) * textureScale);
  if (zone === 7 && memD >= 2) {
    fogCount = min(fogCount, 34);
  }
  if (zone === 5 && memD >= 2) {
    fogCount = min(fogCount, 24);
  }
  if (zone === 5 && memD === 1) {
    fogCount = min(fogCount, 14);
  }
  if (zone === 4) {
    fogCount = min(fogCount, memD >= 2 ? 22 : 16);
  }
  if (zone === 3 && memD === 1) {
    fogCount = min(fogCount, 13);
  }
  if (zone === 3 && memD >= 2) {
    fogCount = min(fogCount, 22);
  }
  for (let i = 0; i < fogCount; i++) {
    let nx = noise(i * 0.15 + zone * 0.31, ds * 0.0008);
    let ny = noise(i * 0.12 + 5.3, ds * 0.0009 + zone * 0.06);
    let fx = width * (0.03 + nx * 0.94);
    let fy = height * (0.04 + ny * 0.92);
    let nr = noise(i * 0.24, zone * 0.19);
    let rw = width * (0.08 + nr * 0.38);
    let rh = height * (0.045 + noise(i * 0.18, 9.2 + zone) * 0.13);
    if (zone === 7 && memD >= 2) {
      fx = em7Ox + (fx - em7Ox) * em7Exp;
      fy = em7Oy + (fy - em7Oy) * em7Exp;
      rw *= em7Exp * 0.98 + 0.02;
      rh *= em7Exp * 0.98 + 0.02;
    }
    let na = noise(i * 0.10);
    let va = (4.5 + na * 6.0 + memD * 2.2) * (0.55 + 0.45 * sin(t * 0.6 + i * 0.44));
    if (zone === 5 && memD >= 2) {
      let slow = 0.5 + 0.5 * sin(ms * 0.0001 + i * 0.11);
      va *= 0.78 + 0.26 * slow * slow;
    }
    fill(
      lerp(fogBase[0], zt[0], fogZ),
      lerp(fogBase[1], zt[1], fogZ),
      lerp(fogBase[2], zt[2], fogZ),
      va
    );
    ellipse(fx, fy, rw, rh);
  }
  let dotCount = floor((10 + memD * 7 + dotExtra) * textureScale);
  if (zone === 7 && memD >= 2) {
    dotCount = min(dotCount, 28);
  }
  if (zone === 5 && memD >= 2) {
    dotCount = min(dotCount, 14);
  }
  if (zone === 5 && memD === 1) {
    dotCount = min(dotCount, 8);
  }
  if (zone === 4) {
    dotCount = min(dotCount, memD >= 2 ? 14 : 9);
  }
  if (zone === 3 && memD === 1) {
    dotCount = min(dotCount, 9);
  }
  if (zone === 3 && memD >= 2) {
    dotCount = min(dotCount, 14);
  }
  for (let i = 0; i < dotCount; i++) {
    let px = width * noise(i * 0.46 + zone * 0.72, ds * 0.002);
    let py = height * noise(i * 0.40 + 11.5, ds * 0.002);
    if (zone === 7 && memD >= 2) {
      px = em7Ox + (px - em7Ox) * em7Exp;
      py = em7Oy + (py - em7Oy) * em7Exp;
    }
    let pa = (1.5 + noise(i * 0.32) * 4.5) * (0.45 + memD * 0.22);
    if (zone === 5 && memD >= 2) {
      let dp = 0.5 + 0.5 * sin(ms * 0.00013 + i * 0.37);
      pa *= 0.72 + 0.35 * dp;
    }
    fill(
      lerp(42, zt[0], dotZ),
      lerp(38, zt[1], dotZ),
      lerp(50, zt[2], dotZ),
      pa
    );
    let dw = 1.4 + noise(i * 0.52) * 3.8;
    if (zone === 7 && memD >= 2) {
      dw *= em7Exp * 0.96 + 0.04;
    }
    ellipse(px, py, dw, dw * 0.68);
  }
  strokeCap(ROUND);
  let lineCount =
    zone === 7 ? 0 : 2 + memD + (zone === 5 ? 2 : 0);
  if (zone === 5 && memD >= 2) {
    lineCount = 1;
  } else if (zone === 5 && memD === 1) {
    lineCount = min(lineCount, 2);
  }
  for (let r = 0; r < lineCount; r++) {
    let yn = noise(r * 0.46 + zone * 0.11, ds * 0.003);
    let ly = height * (0.13 + yn * 0.62);
    let motA =
      typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
    let xWobble = sin(t * 0.85 + r * 2.2) * width * 0.02 * motA;
    let aFade = noise(r * 0.52) * (1.6 + memD * 0.8);
    stroke(
      lerp(24, zt[0], lineZ),
      lerp(22, zt[1], lineZ),
      lerp(28, zt[2], lineZ),
      aFade
    );
    strokeWeight(0.24);
    line(width * 0.02, ly + xWobble, width * 0.98, ly - xWobble * 0.6);
  }
  noStroke();
  pop();
}

/** Juoko fazė 1 — ramu, žema kontrastas: pilkai mėlynas „baseinas“, dulkės, siauros vertikalės (reference). */
let _juokasP1QuietCache = { key: "", dots: null, lines: null };
function drawDeepJuokasPhase1QuietLayers(memD) {
  let szKey = (width | 0) + "x" + (height | 0) + "|" + (deepSeed | 0) + "|perf";
  if (_juokasP1QuietCache.key !== szKey || !_juokasP1QuietCache.dots) {
    randomSeed((deepSeed || 1) + 44123);
    let dots = [];
    let lines = [];
    let i = 0;
    for (i = 0; i < 28; i++) {
      dots.push({
        x: random(width * 0.04, width * 0.96),
        y: random(height * 0.06, height * 0.94),
        r: random(0.9, 2.5),
        a: random(8, 23)
      });
    }
    for (i = 0; i < 42; i++) {
      let cx = width * (0.28 + random() * 0.44);
      lines.push({
        x: cx + random(-16, 16),
        y0: height * random(0.08, 0.42),
        y1: height * random(0.52, 0.94),
        a: random(9, 28),
        sw: random(0.28, 0.62)
      });
    }
    _juokasP1QuietCache = { key: szKey, dots, lines };
  }
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let t = millis() * 0.000055 * mot;

  push();
  blendMode(BLEND);
  noStroke();
  fill(20, 22, 30, 118);
  ellipse(width * 0.175, height * 0.088, width * 0.22, height * 0.07);
  fill(28, 32, 44, 72);
  ellipse(width * 0.175, height * 0.09, width * 0.19, height * 0.056);

  blendMode(SCREEN);
  fill(52, 62, 82, 15);
  ellipse(width * 0.48, height * 0.41, width * 0.7, height * 0.38);
  fill(68, 78, 98, 11);
  ellipse(width * 0.5, height * 0.43, width * 0.56, height * 0.26);
  fill(82, 92, 112, 8);
  ellipse(width * 0.47, height * 0.4, width * 0.76, height * 0.21);

  let dots = _juokasP1QuietCache.dots;
  for (let i = 0; i < dots.length; i++) {
    let d = dots[i];
    let tw = sin(t * 1.4 + i * 0.17) * 2.2 * mot;
    fill(218, 228, 240, d.a * (0.78 + 0.22 * sin(t * 2.1 + i * 0.37)));
    ellipse(d.x + tw, d.y, d.r * 2, d.r * 2);
  }

  blendMode(BLEND);
  strokeCap(ROUND);
  let lines = _juokasP1QuietCache.lines;
  for (let i = 0; i < lines.length; i++) {
    let L = lines[i];
    let shake = sin(t * 2.2 + i * 0.4) * 0.8 * mot;
    stroke(238, 244, 255, L.a * (0.82 + 0.18 * sin(t + i * 0.09)));
    strokeWeight(L.sw);
    line(L.x + shake, L.y0, L.x + shake * 0.6, L.y1);
  }
  noStroke();
  blendMode(BLEND);
  pop();
}

/**
 * Juoko gyvas fonas — piešiamas PO drawDeepMemoryAtmosphereFill, kad migla neužgožtų.
 * intensity01 — silpniau pirmoje fazėje kol tik pradeda augti (memD 1 + žemas progresas).
 */
function drawDeepJuokasPhase2PlayfulBackdrop(intensity01, memD) {
  memD = constrain(typeof memD === "number" ? memD : 1, 1, 2);
  let inten = constrain(typeof intensity01 === "number" ? intensity01 : 1, 0, 1);
  if (inten < 0.04) {
    return;
  }
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let t = millis() * 0.00055 * mot;
  let tFast = millis() * 0.00115 * mot;
  let zt = getDeepZoneTextColor(3);
  let w = width;
  let h = height;
  let second = memD >= 2;
  let laughBg = second ? getDeepJuokasLaughPhaseRad(mot) : 0;
  let bstBg = second ? getDeepJuokasLaughBurst01(laughBg) : 1;
  let driftBg = second ? getDeepJuokasLaughBgDrift(laughBg, mot, w, h) : { side: 0, bob: 0, sway: 0 };
  let sx0 = second ? 1 + 0.09 * bstBg * sin(laughBg * 2.2) : 1;
  let sy0 = second ? 1 - 0.06 * bstBg * cos(laughBg * 1.85) : 1;
  let sx1 = second ? 1 - 0.07 * bstBg * cos(laughBg * 2.45) : 1;
  let sy1 = second ? 1 + 0.08 * bstBg * sin(laughBg * 2.05) : 1;
  push();
  blendMode(SCREEN);
  noStroke();
  let cx0 =
    w * 0.35 +
    sin(t * 1.1) * w * 0.11 * mot +
    driftBg.side * 0.75 +
    sin(laughBg * 2.9) * w * (second ? 0.028 : 0) * bstBg;
  let cy0 = h * 0.32 + cos(t * 0.95) * h * 0.085 * mot + driftBg.bob * 0.9;
  fill(
    lerp(40, zt[0], 0.35),
    lerp(85, zt[1], 0.32),
    lerp(155, zt[2], 0.38),
    (second ? 32 : 26) * inten
  );
  ellipse(cx0, cy0, w * 0.62 * sx0, h * 0.5 * sy0);
  let cx1 =
    w * 0.63 +
    cos(t * 1.25 + 2) * w * 0.1 * mot -
    driftBg.side * 0.55 +
    cos(laughBg * 3.1) * w * (second ? 0.032 : 0) * bstBg;
  let cy1 = h * 0.54 + sin(t * 1.05 + 1.1) * h * 0.09 * mot - driftBg.sway;
  fill(
    lerp(55, zt[0], 0.28),
    lerp(120, zt[1], 0.26),
    lerp(210, zt[2], 0.34),
    (second ? 28 : 22) * inten
  );
  ellipse(cx1, cy1, w * 0.55 * sx1, h * 0.58 * sy1);
  let cx2 =
    w * 0.48 +
    sin(t * 1.4 + 0.6) * w * 0.07 * mot +
    driftBg.side * 0.35;
  let cy2 = h * 0.76 + cos(t * 1.15) * h * 0.065 * mot + driftBg.bob * 0.65;
  fill(236, 246, 255, (second ? 24 : 18) * inten);
  ellipse(cx2, cy2, w * 0.78 * sy1, h * 0.3 * sx0);
  blendMode(BLEND);
  pop();

  push();
  blendMode(ADD);
  noStroke();
  let ds = deepSeed || 1;
  let nSpark = min(second ? 48 : 32, floor((w * h) / (second ? 26000 : 32000)));
  for (let i = 0; i < nSpark; i++) {
    let bx = ((i * 73 + ds * 3) % 1000) / 1000;
    let by = ((i * 61 + ds * 5) % 1000) / 1000;
    let px =
      w * (0.08 + bx * 0.84) +
      sin((second ? tFast : t) * 2.35 + i * 0.61) * (second ? 30 : 22) * mot +
      (second ? sin(laughBg * 2.4 + i * 0.31) * w * 0.038 * bstBg : 0);
    let py =
      h * (0.1 + by * 0.8) +
      cos((second ? tFast : t) * 1.88 + i * 0.53) * (second ? 26 : 18) * mot +
      (second ? cos(laughBg * 2.1 + i * 0.27) * h * 0.03 * bstBg : 0);
    let sz = (second ? 2.8 : 2.4) + (i % 6) * 1.35;
    fill(
      lerp(198, zt[0], 0.26),
      lerp(228, zt[1], 0.22),
      255,
      (11 + (i % 7)) * (0.62 + 0.38 * sin(t * 3.1 + i * 0.4)) * inten
    );
    ellipse(px, py, sz, sz);
  }
  blendMode(BLEND);
  pop();

  if (second && inten > 0.15) {
    let m = min(w, h);
    push();
    blendMode(SCREEN);
    noStroke();
    for (let k = 0; k < 6; k++) {
      let fk = tFast * 1.1 + k * 0.9;
      let px =
        w * (0.12 + (k % 3) * 0.26) +
        sin(fk * 1.7 + k) * w * 0.08 * mot +
        sin(laughBg * 2.65 + k * 0.7) * w * 0.045 * bstBg;
      let py =
        h * (0.18 + ((k * 17 + ds) % 100) / 100 * 0.55) +
        cos(fk * 1.4) * h * 0.06 * mot +
        cos(laughBg * 2.2 + k * 0.5) * h * 0.04 * bstBg;
      let rx = m * (0.07 + (k % 4) * 0.028) * (1 + 0.12 * bstBg * sin(laughBg * 2.5 + k));
      fill(
        lerp(90, zt[0], 0.4),
        lerp(140, zt[1], 0.35),
        lerp(240, zt[2], 0.3),
        (10 + k * 1.8) * inten * (0.65 + 0.35 * sin(fk + k))
      );
      ellipse(px, py, rx * 2.2, rx * 1.45);
    }
    blendMode(BLEND);
    pop();

    push();
    blendMode(ADD);
    strokeCap(ROUND);
    noFill();
    for (let s = 0; s < 14; s++) {
      let ang = (TWO_PI * s) / 14 + tFast * 0.8 + ds * 0.01;
      let cx =
        w * 0.5 +
        cos(ang * 1.3) * w * 0.38 +
        sin(laughBg * 2.35 + s * 0.44) * w * 0.06 * bstBg;
      let cy =
        h * 0.48 +
        sin(ang * 1.1) * h * 0.32 +
        cos(laughBg * 2.05 + s * 0.38) * h * 0.05 * bstBg;
      stroke(
        lerp(200, zt[0], 0.25),
        lerp(230, zt[1], 0.22),
        255,
        (7 + (s % 4)) * inten * (0.5 + 0.5 * sin(tFast * 2.4 + s))
      );
      strokeWeight(0.35 + (s % 3) * 0.12);
      let arcR = m * (0.04 + (s % 5) * 0.018);
      arc(cx, cy, arcR * 2, arcR * 2, ang + tFast, ang + tFast + HALF_PI * 0.62);
    }
    noStroke();
    blendMode(BLEND);
    pop();

    push();
    blendMode(SCREEN);
    noStroke();
    let nRip = min(22, floor((w * h) / 38000));
    for (let r = 0; r < nRip; r++) {
      let u = ((r * 59 + ds) % 1000) / 1000;
      let v = ((r * 41 + ds * 2) % 1000) / 1000;
      let rx = w * (0.06 + (r % 4) * 0.04);
      let ox =
        sin(tFast * 2.2 + r * 0.73) * w * 0.04 * mot +
        sin(laughBg * 3.2 + r * 0.55) * w * 0.035 * bstBg;
      let oy =
        cos(tFast * 1.9 + r * 0.61) * h * 0.035 * mot +
        cos(laughBg * 2.8 + r * 0.48) * h * 0.03 * bstBg;
      fill(
        255,
        250,
        255,
        (4 + (r % 5)) * inten * (0.45 + 0.55 * sin(tFast * 3.1 + r * 0.2))
      );
      let ex = w * (0.1 + u * 0.8) + ox;
      let ey = h * (0.08 + v * 0.84) + oy;
      let rw = rx * (1 + 0.14 * bstBg * sin(laughBg * 2.4 + r * 0.3));
      let rh = rx * 0.72 * (1 - 0.1 * bstBg * cos(laughBg * 2.1 + r * 0.25));
      ellipse(ex, ey, rw, rh);
    }
    blendMode(BLEND);
    pop();
  }
}

/** Juokas: šaltas „prožektoriaus“ lankas kairėje (ne dūmas) — aiškus zonos ženklas. */

function drawDeepJuokasCoolArc(memD) {
  let zt = getDeepZoneTextColor(3);
  push();
  blendMode(SCREEN);
  noFill();
  stroke(
    lerp(70, zt[0], 0.48),
    lerp(130, zt[1], 0.42),
    lerp(210, zt[2], 0.38),
    (9 + memD * 3.5) * 0.78
  );
  strokeWeight(max(36, min(width * 0.14, height * 0.2)));
  arc(width * 0.06, height * 0.02, width * 0.52, height * 0.44, 0.15, HALF_PI * 0.88);
  noStroke();
  blendMode(BLEND);
  pop();
}

/** Jautrumas fazė 1 — šalta pilkai violetinė migla, dideli „arti“ burbulai, difuzinis rūkas (ne dramos sprogimas). */
let _jautrumasP1Cache = { key: "", bubbles: null };
function drawDeepJautrumasPhase1CloseAtmosphere(memD) {
  let szKey = (width | 0) + "x" + (height | 0) + "|" + (deepSeed | 0) + "|perf";
  if (_jautrumasP1Cache.key !== szKey || !_jautrumasP1Cache.bubbles) {
    randomSeed((deepSeed || 1) * 91 + 88421);
    let bubbles = [];
    let n = 22;
    let W = width;
    let H = height;
    let m = min(W, H);
    for (let i = 0; i < n; i++) {
      bubbles.push({
        x: random(W * 0.06, W * 0.94),
        y: random(H * 0.06, H * 0.94),
        rx: random(m * 0.11, m * 0.38),
        ry: random(m * 0.07, m * 0.26),
        a: random(14, 22),
        rot: random(TWO_PI)
      });
    }
    _jautrumasP1Cache = { key: szKey, bubbles };
  }
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let t = millis() * 0.00055 * mot;
  push();
  blendMode(SCREEN);
  noStroke();
  fill(95, 85, 115, 18);
  ellipse(width * 0.42, height * 0.46, width * 0.48, height * 0.22);

  blendMode(BLEND);
  blendMode(SCREEN);
  noStroke();
  let bub = _jautrumasP1Cache.bubbles;
  for (let i = 0; i < bub.length; i++) {
    let b = bub[i];
    let ox = sin(t + i * 0.41) * 6 * mot;
    let oy = cos(t * 0.85 + i * 0.33) * 5 * mot;
    push();
    translate(b.x + ox, b.y + oy);
    rotate(b.rot + t * 0.02 * (i % 3 - 1));
    fill(180, 165, 190, b.a);
    ellipse(0, 0, b.rx, b.ry);
    pop();
  }
  blendMode(BLEND);

  push();
  blendMode(SCREEN);
  strokeWeight(0.55);
  strokeCap(ROUND);
  let ds = deepSeed || 1;
  for (let s = 0; s < 4; s++) {
    let lx = width * (0.02 + noise(ds * 0.01, s * 1.7) * 0.045);
    stroke(130, 118, 158, 6 + noise(s * 0.8, ds) * 6);
    line(lx, height * 0.08, lx + sin(t + s) * 3, height * 0.93);
  }
  noStroke();
  blendMode(BLEND);
  pop();
}

/**
 * Sensorinis „perpildymas“ 2 fazėje — Juokas (3) ir Jautrumas (4) naudoja tą patį karkasą;
 * skiriasi zonos spalva, šaknies X ir (Juokui) viršutinis kairysis lopas antraštėi.
 */
let _sensoryP2CacheByZone = {};
function _sensoryP2GetCache(z) {
  if (!_sensoryP2CacheByZone[z]) {
    _sensoryP2CacheByZone[z] = {
      key: "",
      pts: null,
      trails: null,
      bokeh: null,
      rain: null
    };
  }
  return _sensoryP2CacheByZone[z];
}

function drawDeepSensoryPhase2BloomShared(zoneId, memD) {
  if (memD < 2) {
    return;
  }
  let juokLite = zoneId === 3;
  let jautrLite = zoneId === 4;
  let zt = getDeepZoneTextColor(zoneId);
  let C = _sensoryP2GetCache(zoneId);
    let szKey =
    (width | 0) +
    "x" +
    (height | 0) +
    "|" +
    (deepSeed | 0) +
    "|z" +
    zoneId +
    "|p2v11" +
    (juokLite ? "j" : "s");
  if (C.key !== szKey || !C.pts) {
    randomSeed((deepSeed || 2) * 59 + 62017 + zoneId * 977);
    let area = width * height;
    let n = juokLite
      ? min(76, max(40, floor(area / 17500)))
      : min(88, max(38, floor(area / 17000)));
    let pts = [];
    for (let i = 0; i < n; i++) {
      pts.push({
        x: random(width * 0.02, width * 0.98),
        y: random(height * 0.04, height * 0.96),
        r: random(0.7, 4.8),
        a: random(18, 88),
        ph: random(TWO_PI),
        cold: random() < 0.72
      });
    }
    let trails = [];
    let nt = juokLite ? 12 : 10;
    for (let j = 0; j < nt; j++) {
      trails.push({
        x1: random(width * 0.04, width * 0.52),
        y1: random(height * 0.28, height * 0.94),
        x2: random(width * 0.32, width * 0.88),
        y2: random(height * 0.1, height * 0.58),
        x3: random(width * 0.22, width * 0.78),
        y3: random(height * 0.14, height * 0.52),
        x4: random(width * 0.38, width * 0.96),
        y4: random(height * 0.18, height * 0.72),
        a: random(12, 34)
      });
    }
    let bokeh = [];
    let nBokeh = juokLite ? 15 : 13;
    for (let b = 0; b < nBokeh; b++) {
      bokeh.push({
        x: random(width * 0.05, width * 0.95),
        y: random(height * 0.06, height * 0.72),
        rx: random(min(width, height) * 0.06, min(width, height) * 0.22),
        ry: random(min(width, height) * 0.05, min(width, height) * 0.18),
        a: random(9, 24),
        rot: random(TWO_PI)
      });
    }
    let rain = [];
    let nRain = juokLite ? 48 : 46;
    for (let r = 0; r < nRain; r++) {
      rain.push({
        x: random(width * 0.08, width * 0.92),
        y0: random(height * 0.08, height * 0.55),
        len: random(height * 0.06, height * 0.42),
        a: random(6, 22),
        sw: random(0.22, 0.58)
      });
    }
    C.key = szKey;
    C.pts = pts;
    C.trails = trails;
    C.bokeh = bokeh;
    C.rain = rain;
  }
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let t = millis() * 0.001 * mot;
  let laughJ = juokLite ? getDeepJuokasLaughPhaseRad(mot) : 0;
  let bstJ = juokLite ? getDeepJuokasLaughBurst01(laughJ) : 1;
  let dJ = juokLite ? getDeepJuokasLaughBgDrift(laughJ, mot, width, height) : { side: 0, bob: 0, sway: 0 };
  let sp4 = jautrLite ? getDeepJautrumasPainSpasm01(mot) : 0;
  let pp4 = jautrLite ? getDeepJautrumasPainPhaseRad(mot) : 0;
  let rootX =
    typeof getDeepMemoryTreeRootXForZone === "function"
      ? getDeepMemoryTreeRootXForZone(zoneId, memD)
      : width * 0.75;

  if (zoneId === 3) {
    push();
    blendMode(BLEND);
    noStroke();
    fill(18, 20, 34, 118);
    ellipse(
      width * 0.175 + sin(laughJ * 2.18) * width * 0.028 * bstJ,
      height * 0.088 + cos(laughJ * 1.95) * height * 0.018 * bstJ,
      width * 0.22 * (1 + 0.06 * bstJ * sin(laughJ * 2.4)),
      height * 0.07 * (1 - 0.04 * bstJ * cos(laughJ * 2.1))
    );
    fill(26, 30, 46, 76);
    ellipse(
      width * 0.175 - sin(laughJ * 2.5) * width * 0.022 * bstJ,
      height * 0.09 + sin(laughJ * 2.2) * height * 0.014 * bstJ,
      width * 0.19,
      height * 0.056
    );
    pop();
  }

  push();
  blendMode(MULTIPLY);
  noStroke();
  if (zoneId === 3) {
    fill(26, 28, 52, 34);
  } else {
    fill(38, 22, 52, 34);
  }
  rect(0, 0, width, height);
  blendMode(BLEND);
  pop();

  push();
  blendMode(SCREEN);
  noStroke();
  fill(108, 118, 188, juokLite ? 21 : 19);
  ellipse(
    width * 0.44 +
      dJ.side * 0.45 +
      (jautrLite ? sin(pp4 * 3.1) * width * 0.038 * sp4 : 0),
    height * 0.42 +
      dJ.bob * 0.85 +
      (jautrLite ? cos(pp4 * 2.75) * height * 0.032 * sp4 : 0),
    width * 0.74 * (juokLite ? 1 + 0.07 * bstJ * sin(laughJ * 2.15) : jautrLite ? 1 + 0.07 * sp4 * sin(pp4 * 3.4) : 1),
    height * 0.44 * (juokLite ? 1 - 0.05 * bstJ * cos(laughJ * 1.9) : jautrLite ? 1 - 0.06 * sp4 * cos(pp4 * 3.05) : 1)
  );
  if (!juokLite) {
    fill(165, 175, 238, 12);
    ellipse(
      width * 0.46 + (jautrLite ? sin(pp4 * 4.2) * width * 0.028 * sp4 : 0),
      height * 0.4 + (jautrLite ? cos(pp4 * 3.6) * height * 0.024 * sp4 : 0),
      width * 0.42 * (jautrLite ? 1 + 0.06 * sp4 * sin(pp4 * 3.8) : 1),
      height * 0.3 * (jautrLite ? 1 - 0.05 * sp4 * cos(pp4 * 3.5) : 1)
    );
  }
  fill(210, 218, 255, juokLite ? 12 : 7);
  ellipse(
    width * 0.45 -
      dJ.side * 0.35 +
      (jautrLite ? sin(pp4 * 2.85 + 1) * width * 0.032 * sp4 : 0),
    height * 0.39 -
      dJ.sway +
      (jautrLite ? cos(pp4 * 3.1 + 0.7) * height * 0.026 * sp4 : 0),
    width * 0.26 * (juokLite ? 1 + 0.1 * bstJ * sin(laughJ * 2.6) : jautrLite ? 1 + 0.09 * sp4 * sin(pp4 * 4.1) : 1),
    height * 0.18 * (juokLite ? 1 - 0.06 * bstJ * cos(laughJ * 2.2) : jautrLite ? 1 - 0.07 * sp4 * cos(pp4 * 3.7) : 1)
  );
  let nNeb = juokLite ? 7 : 5;
  for (let k = 0; k < nNeb; k++) {
    let pulse = 0.68 + 0.32 * sin(t * 0.52 + k * 0.34) * mot;
    let nebPulse = juokLite
      ? 1 + 0.1 * bstJ * sin(laughJ * 2.35 + k * 0.55)
      : jautrLite
        ? 1 + 0.12 * sp4 * sin(pp4 * 3.25 + k * 0.62)
        : 1;
    fill(
      lerp(62, zt[0], 0.46),
      lerp(52, zt[1], 0.42),
      lerp(132, zt[2], 0.52),
      ((juokLite ? 5.4 : 4.6) + k * (juokLite ? 1.05 : 0.85)) * pulse
    );
    ellipse(
      rootX -
        width * (0.015 + k * (juokLite ? 0.062 : 0.048)) +
        sin(laughJ * 2.5 + k * 0.7) * width * (juokLite ? 0.042 : 0) * bstJ +
        (jautrLite ? sin(pp4 * 3.5 + k * 0.88) * width * 0.048 * sp4 : 0),
      height * (0.44 + k * 0.016) +
        cos(laughJ * 2.05 + k * 0.5) * height * (juokLite ? 0.028 : 0) * bstJ +
        (jautrLite ? cos(pp4 * 3.05 + k * 0.72) * height * 0.038 * sp4 : 0),
      width * (1.05 - k * (juokLite ? 0.12 : 0.095)) * pulse * nebPulse,
      height *
        (0.38 + k * 0.026) *
        pulse *
        (juokLite ? 2 - nebPulse : jautrLite ? 1 + 0.08 * sp4 * sin(pp4 * 2.9 + k) : 1)
    );
  }
  blendMode(BLEND);
  pop();

  push();
  blendMode(SCREEN);
  strokeCap(ROUND);
  let rain = C.rain;
  for (let r = 0; r < rain.length; r++) {
    let R = rain[r];
    let drift =
      sin((juokLite ? t * 2.05 : jautrLite ? t * 2.35 : t * 1.8) + r * 0.31) *
        (juokLite ? 3.6 : jautrLite ? 4.2 : 2.2) *
        mot +
      (juokLite ? sin(laughJ * 2.75 + r * 0.42) * width * 0.026 * bstJ : 0) +
      (jautrLite ? sin(pp4 * 4.1 + r * 0.68) * width * 0.042 * sp4 : 0);
    let rBob =
      (juokLite ? cos(laughJ * 2.2 + r * 0.35) * height * 0.018 * bstJ : 0) +
      (jautrLite ? cos(pp4 * 3.55 + r * 0.58) * height * 0.032 * sp4 : 0);
    stroke(218, 224, 255, R.a * (0.75 + 0.25 * sin(t * 2.4 + r * 0.07)));
    strokeWeight(R.sw);
    line(R.x + drift, R.y0 + rBob, R.x + drift * 0.6, R.y0 + R.len + rBob * 0.7);
  }
  noStroke();
  blendMode(BLEND);
  pop();

  push();
  blendMode(SCREEN);
  noStroke();
  let bokeh = C.bokeh;
  for (let b = 0; b < bokeh.length; b++) {
    let B = bokeh[b];
    push();
    translate(
      B.x +
        (juokLite ? sin(laughJ * 2.18 + b * 0.52) * width * 0.032 * bstJ : 0) +
        (jautrLite ? sin(pp4 * 3.8 + b * 0.71) * width * 0.045 * sp4 : 0),
      B.y +
        (juokLite ? cos(laughJ * 1.92 + b * 0.44) * height * 0.028 * bstJ : 0) +
        (jautrLite ? cos(pp4 * 3.45 + b * 0.64) * height * 0.04 * sp4 : 0)
    );
    rotate(
      B.rot +
        t * 0.015 * (b % 5 - 2) +
        (juokLite ? sin(laughJ * 2.4 + b) * 0.18 * bstJ : 0) +
        (jautrLite ? sin(pp4 * 4.5 + b * 0.55) * 0.26 * sp4 : 0)
    );
    fill(
      lerp(150, zt[0], 0.35),
      lerp(140, zt[1], 0.32),
      lerp(230, zt[2], 0.45),
      B.a * (0.85 + 0.15 * sin(t * 0.6 + b))
    );
    let brx =
      B.rx *
      (juokLite
        ? 1 + 0.14 * bstJ * sin(laughJ * 2.5 + b * 0.3)
        : jautrLite
          ? 1 + 0.18 * sp4 * sin(pp4 * 3.9 + b * 0.4)
          : 1);
    let bry =
      B.ry *
      (juokLite
        ? 1 - 0.1 * bstJ * cos(laughJ * 2.1 + b * 0.28)
        : jautrLite
          ? 1 - 0.14 * sp4 * cos(pp4 * 3.6 + b * 0.38)
          : 1);
    ellipse(0, 0, brx, bry);
    pop();
  }
  blendMode(BLEND);
  pop();

  push();
  blendMode(ADD);
  noFill();
  strokeCap(ROUND);
  let tr = C.trails;
  for (let j = 0; j < tr.length; j++) {
    let T = tr[j];
    stroke(
      lerp(205, zt[0], 0.32),
      lerp(215, zt[1], 0.32),
      lerp(255, zt[2], 0.22),
      T.a * (0.72 + 0.28 * sin(t * 0.85 + j))
    );
    strokeWeight(0.32 + (j % 5) * 0.07);
    let tjx =
      (juokLite ? sin(laughJ * 2.25 + j * 0.73) * width * 0.03 * bstJ : 0) +
      (jautrLite ? sin(pp4 * 4.25 + j * 0.86) * width * 0.042 * sp4 : 0);
    let tjy =
      (juokLite ? cos(laughJ * 1.95 + j * 0.61) * height * 0.024 * bstJ : 0) +
      (jautrLite ? cos(pp4 * 3.75 + j * 0.74) * height * 0.036 * sp4 : 0);
    bezier(
      T.x1 + tjx,
      T.y1 + tjy,
      T.x2 + tjx * 0.85,
      T.y2 + tjy * 0.85,
      T.x3 + tjx * 0.55,
      T.y3 + tjy * 0.55,
      T.x4 + tjx * 0.35,
      T.y4 + tjy * 0.35
    );
  }
  noStroke();
  blendMode(BLEND);
  pop();

  push();
  blendMode(ADD);
  noStroke();
  let pts = C.pts;
  let wAmp = juokLite ? 1.48 : jautrLite ? 1.55 : 1;
  for (let i = 0; i < pts.length; i++) {
    let p = pts[i];
    let wobx =
      sin((juokLite ? t * 1.38 : jautrLite ? t * 1.32 : t * 1.15) + p.ph) * 16 * mot * wAmp +
      (juokLite ? sin(laughJ * 2.95 + p.ph + i * 0.15) * width * 0.03 * bstJ : 0) +
      (jautrLite ? sin(pp4 * 4.35 + p.ph + i * 0.24) * width * 0.038 * sp4 : 0);
    let woby =
      cos((juokLite ? t * 1.12 : jautrLite ? t * 1.22 : t * 0.92) + p.ph * 1.28) * 12 * mot * wAmp +
      (juokLite ? cos(laughJ * 2.55 + p.ph + i * 0.12) * height * 0.025 * bstJ : 0) +
      (jautrLite ? cos(pp4 * 3.85 + p.ph + i * 0.21) * height * 0.032 * sp4 : 0);
    if (p.cold) {
      fill(
        lerp(235, zt[0], 0.22),
        lerp(238, zt[1], 0.24),
        lerp(255, zt[2], 0.18),
        p.a * (0.62 + 0.38 * sin(t * 2.4 + i * 0.13))
      );
    } else {
      fill(255, 252, 255, p.a * 0.55 * (0.7 + 0.3 * sin(t * 3.1 + i * 0.11)));
    }
    let prx =
      p.r *
      2 *
      (juokLite
        ? 1 + 0.18 * bstJ * sin(laughJ * 2.7 + i * 0.11 + p.ph)
        : jautrLite
          ? 1 + 0.22 * sp4 * sin(pp4 * 4.05 + i * 0.16 + p.ph)
          : 1);
    let pry =
      p.r *
      2 *
      (juokLite
        ? 1 - 0.12 * bstJ * cos(laughJ * 2.35 + i * 0.09 + p.ph)
        : jautrLite
          ? 1 - 0.16 * sp4 * cos(pp4 * 3.65 + i * 0.14 + p.ph)
          : 1);
    ellipse(p.x + wobx, p.y + woby, prx, pry);
  }
  blendMode(BLEND);
  pop();
}

function drawDeepJautrumasPhase2SensoryBloom(memD) {
  drawDeepSensoryPhase2BloomShared(4, memD);
}

function drawDeepJuokasPhase2SensoryBloom(memD) {
  drawDeepSensoryPhase2BloomShared(3, memD);
}

function drawDeepSensoryPhase2GroundRingsShared(zoneId, memD) {
  if (memD < 2) {
    return;
  }
  let zt = getDeepZoneTextColor(zoneId);
  let rootX =
    typeof getDeepMemoryTreeRootXForZone === "function"
      ? getDeepMemoryTreeRootXForZone(zoneId, memD)
      : width * 0.75;
  let baseY = height * 0.965;
  let t = millis() * 0.00035;
  let motR =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let laughR = zoneId === 3 ? getDeepJuokasLaughPhaseRad(motR) : 0;
  let bstR = zoneId === 3 ? getDeepJuokasLaughBurst01(laughR) : 1;
  let sp4r = zoneId === 4 ? getDeepJautrumasPainSpasm01(motR) : 0;
  let pp4r = zoneId === 4 ? getDeepJautrumasPainPhaseRad(motR) : 0;
  push();
  noFill();
  strokeCap(ROUND);
  blendMode(SCREEN);
  let nRing = zoneId === 3 ? 5 : 4;
  for (let i = 0; i < nRing; i++) {
    let wx =
      width *
      (0.44 + i * (zoneId === 3 ? 0.11 : 0.1)) *
      (zoneId === 3 ? 1 + 0.08 * bstR * sin(laughR * 2.3 + i * 0.45) : 1) *
      (zoneId === 4 ? 1 + 0.11 * sp4r * sin(pp4r * 3.15 + i * 0.58) : 1);
    let hy =
      height *
      (0.048 + i * (zoneId === 3 ? 0.026 : 0.024)) *
      (zoneId === 3 ? 1 - 0.06 * bstR * cos(laughR * 2.05 + i * 0.38) : 1) *
      (zoneId === 4 ? 1 - 0.09 * sp4r * cos(pp4r * 2.85 + i * 0.52) : 1);
    stroke(
      lerp(120, zt[0], 0.42),
      lerp(108, zt[1], 0.38),
      lerp(205, zt[2], 0.46),
      12 - i * 1.2 + 4 * sin(t + i * 0.7)
    );
    strokeWeight(max(0.34, 0.68 - i * 0.09));
    let wobX =
      zoneId === 3
        ? sin(t * 1.35 + i * 0.55) * 16 + sin(laughR * 2.65 + i * 0.62) * 22 * bstR
        : zoneId === 4
          ? sin(t * 1.22 + i * 0.5) * 9 +
            sin(pp4r * 3.55 + i * 0.82) * 26 * sp4r
          : sin(t * 0.8 + i) * 6;
    let wobY =
      zoneId === 3
        ? cos(t * 1.1 + i * 0.4) * 5 + cos(laughR * 2.2 + i * 0.5) * 14 * bstR
        : zoneId === 4
          ? cos(t * 1.05 + i * 0.44) * 7 + cos(pp4r * 3.2 + i * 0.74) * 18 * sp4r
          : 0;
    ellipse(rootX + wobX, baseY - i * 5 + wobY, wx, hy);
  }
  noStroke();
  blendMode(BLEND);
  pop();
}

function drawDeepJautrumasPhase2GroundRings(memD) {
  drawDeepSensoryPhase2GroundRingsShared(4, memD);
}

function drawDeepJuokasPhase2GroundRings(memD) {
  drawDeepSensoryPhase2GroundRingsShared(3, memD);
}

/** Meilė: šilta „karūna“ viršuje prieš medį. */
function drawDeepMeileCoronaBeforeTree(memD) {
  let zt = getDeepZoneTextColor(6);
  push();
  blendMode(SCREEN);
  noStroke();
  let cx =
    typeof getDeepMemoryTreeRootXForZone === "function"
      ? getDeepMemoryTreeRootXForZone(6, memD)
      : width * 0.75;
  let cy = height * 0.1;
  let corMul = memD >= 2 ? 1.28 : 1;
  let nCor = memD >= 2 ? 6 : 4;
  let brMul = memD >= 2 ? 1.22 : 0.85;
  for (let k = 0; k < nCor; k++) {
    fill(
      lerp(255, zt[0], 0.32),
      lerp(205, zt[1], 0.28),
      lerp(215, zt[2], 0.24),
      ((2.8 + memD * 1.1) / (k + 1)) * brMul
    );
    ellipse(
      cx,
      cy,
      width * (0.4 + k * 0.055) * corMul,
      height * (0.13 + k * 0.028) * corMul
    );
  }
  blendMode(BLEND);
  pop();
}

/**
 * Meilė fazė 2 — WOW: auksinis šviesos centras, erdvė, bangos, sklaida (optimizuota kilpomis).
 */
function drawDeepMeilePhase2BloomAndRipples(memD) {
  if (memD < 2) {
    return;
  }
  let rootX =
    typeof getDeepMemoryTreeRootXForZone === "function"
      ? getDeepMemoryTreeRootXForZone(6, memD)
      : width * 0.52;
  let rootY = height * 0.94;
  let heartX = rootX + width * 0.052;
  let heartY = height * 0.34;
  let t = millis() * 0.001;
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;

  /* Auksinis–kreminis šerdis (stiprus šviesos centras + sklaida į išorę) */
  push();
  blendMode(SCREEN);
  noStroke();
  for (let k = 0; k < 11; k++) {
    let pulse = 0.7 + 0.3 * sin(t * 0.46 + k * 0.38) * mot;
    let warm = k % 4;
    let rr = warm <= 1 ? 255 : 248;
    let gg = warm <= 1 ? 228 + k * 2 : 218;
    let bb = warm <= 1 ? 185 + k * 3 : 235;
    fill(rr, gg, bb, (4.2 + k * 0.65) * pulse * 0.9);
    ellipse(
      heartX + sin(t * 0.29 + k * 0.31) * 18 * mot,
      heartY + cos(t * 0.24 + k * 0.27) * 12 * mot,
      (95 + k * 62) * (1.02 + (k % 3) * 0.04),
      (82 + k * 48) * (1.02 + (k % 3) * 0.04)
    );
  }
  blendMode(BLEND);
  pop();

  push();
  blendMode(ADD);
  noStroke();
  for (let k = 0; k < 7; k++) {
    let pulse = 0.75 + 0.25 * sin(t * 0.51 + k * 0.62) * mot;
    fill(255, 185 + k * 8, 215, (3 + k * 0.45) * pulse);
    ellipse(
      heartX,
      heartY,
      (200 + k * 95) * pulse,
      (165 + k * 72) * pulse
    );
  }
  blendMode(BLEND);
  pop();

  /* Šviesos spinduliai iš šerdies (erdvinis „spindėjimas“) */
  push();
  blendMode(ADD);
  strokeCap(ROUND);
  for (let i = 0; i < 18; i++) {
    let ang = (i / 18) * TWO_PI + t * 0.12 * mot + (deepSeed || 1) * 0.002;
    let len = (130 + (i % 5) * 42 + sin(t * 0.55 + i * 0.7) * 28) * mot;
    stroke(255, 215 + (i % 4) * 8, 195, 7 + (i % 3) * 2);
    strokeWeight(0.85 + (i % 4) * 0.15);
    line(heartX, heartY, heartX + cos(ang) * len, heartY + sin(ang) * len);
  }
  noStroke();
  blendMode(BLEND);
  pop();

  /* Žiedai ir banga prie šaknies */
  push();
  blendMode(SCREEN);
  noStroke();
  for (let k = 0; k < 8; k++) {
    let pulse = 0.76 + 0.24 * sin(t * 0.5 + k * 0.52) * mot;
    fill(255, 155 + k * 6, 188, (3.2 + k * 0.5) * pulse);
    ellipse(
      rootX + sin(t * 0.33 + k * 0.37) * 12 * mot,
      rootY + cos(t * 0.27 + k * 0.32) * 6,
      (140 + k * 78) * pulse,
      (42 + k * 15) * pulse
    );
  }
  blendMode(BLEND);
  pop();

  push();
  blendMode(ADD);
  noFill();
  strokeCap(ROUND);
  for (let r = 0; r < 9; r++) {
    let breathe = 1 + 0.062 * sin(t * 0.4 + r * 0.72) * mot;
    let rad = (58 + r * 52) * breathe;
    stroke(255, 125 + r * 10, 175, 17 - r * 1.35);
    strokeWeight(max(0.45, 1.45 - r * 0.11));
    ellipse(rootX, rootY + 5, rad * 2, rad * 0.5);
  }
  noStroke();
  blendMode(BLEND);
  pop();
}

/** Empatija: šiltas žiedas apačioje (papildomai prie saulės halo). */
function drawDeepEmpatijaGroundWarmth(memD) {
  let zt = getDeepZoneTextColor(7);
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let exp2 = getDeepEmpatijaPhase2ExpandMul(memD, mot);
  let pan =
    memD >= 2 ? getDeepEmpatijaPhase2BackdropPanPx(memD, mot) : { x: 0, y: 0 };
  push();
  blendMode(ADD);
  noStroke();
  let gx =
    (typeof getDeepMemoryTreeRootXForZone === "function"
      ? getDeepMemoryTreeRootXForZone(7, memD)
      : width * 0.75) +
    pan.x * 0.18;
  for (let k = 0; k < 3; k++) {
    fill(
      lerp(55, zt[0], 0.48),
      lerp(48, zt[1], 0.45),
      lerp(18, zt[2], 0.4),
      ((3.5 + memD * 1.6) / (k + 1)) * 0.88
    );
    ellipse(
      gx,
      height * 0.97 + pan.y * 0.12,
      width * (1.08 - k * 0.07) * (memD >= 2 ? exp2 : 1),
      height * (0.26 - k * 0.045) * (memD >= 2 ? exp2 : 1)
    );
  }
  blendMode(BLEND);
  pop();
}

/** Drama: šoniniai violetiniai spinduliai (scenos rėmas, ne glitch loop). */
function drawDeepDramaSideBeams(memD) {
  if (memD < 2) {
    return;
  }
  let zt = getDeepZoneTextColor(5);
  push();
  blendMode(SCREEN);
  noStroke();
  let a = 3.8 + memD * 2;
  fill(lerp(20, zt[0], 0.55), lerp(8, zt[1], 0.4), lerp(40, zt[2], 0.5), a);
  rect(0, 0, width * 0.055, height);
  fill(lerp(25, zt[0], 0.5), lerp(10, zt[1], 0.38), lerp(45, zt[2], 0.48), a * 0.9);
  rect(width * 0.945, 0, width * 0.055, height);
  blendMode(BLEND);
  pop();
}

/** Drama: silpnas apatinis „ugnies“ lėkštė — atskiria nuo kitų zonų. */
function drawDeepDramaEmberVignette(memD) {
  let zt = getDeepZoneTextColor(5);
  push();
  noStroke();
  let m = 1 + memD * 0.22;
  let nLay = 2;
  let aMul = memD >= 2 ? 1 : 0.38;
  for (let k = 0; k < nLay; k++) {
    let u = (k + 1) / 5;
    fill(
      lerp(18, zt[0], 0.45 + u * 0.25),
      lerp(6, zt[1], 0.35 + u * 0.2),
      lerp(4, zt[2], 0.12 + u * 0.1),
      (4 + k * 2.9) * m * 0.88 * aMul
    );
    ellipse(
      typeof getDeepMemoryTreeRootXForZone === "function"
        ? getDeepMemoryTreeRootXForZone(5, memD)
        : width * 0.75,
      height * 1.02,
      width * (1.15 - k * 0.12),
      height * (0.52 - k * 0.08)
    );
  }
  pop();
}

/** Empatija: švelnus „saulės“ lėkštė viršuje — šiltesnis, lėtesnis kvėpavimas. */
function drawDeepEmpatijaSunHalo(memD) {
  let zt = getDeepZoneTextColor(7);
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let pan =
    memD >= 2 ? getDeepEmpatijaPhase2BackdropPanPx(memD, mot) : { x: 0, y: 0 };
  push();
  blendMode(ADD);
  noStroke();
  let cx =
    (typeof getDeepMemoryTreeRootXForZone === "function"
      ? getDeepMemoryTreeRootXForZone(7, memD)
      : width * 0.75) +
    pan.x * 0.12;
  let cy = height * 0.14 + pan.y * 0.1;
  let pulse = 0.76 + 0.24 * sin(millis() * 0.00052 * mot) * mot;
  let rBoost = memD >= 2 ? 1.22 : 1;
  let exp2 = getDeepEmpatijaPhase2ExpandMul(memD, mot);
  for (let k = 0; k < 5; k++) {
    let r =
      (min(width, height) * 0.14 + k * 0.07 * min(width, height)) *
      pulse *
      rBoost *
      (memD >= 2 ? exp2 : 1);
    fill(
      lerp(120, zt[0], 0.62),
      lerp(105, zt[1], 0.58),
      lerp(55, zt[2], 0.42),
      (2.0 + memD * 0.95) / (k + 1)
    );
    ellipse(cx, cy, r * 2, r * 1.35);
  }
  blendMode(BLEND);
  pop();
}

/** Empatija 2 f.: beveik nematomas auksinis halas aplink frazę. */
function drawDeepEmpatijaPhase2PhraseCrown(memD) {
  if (constrain(memD | 0, 1, 2) < 2) {
    return;
  }
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let ph = getDeepEmpatijaPhase2TreePhase();
  let e = getDeepEmpatijaPhase2ExpandMul(memD, mot);
  let box = getDeepMemoryNoTextRects();
  let cx = (box.mainLeft + box.mainRight) * 0.5;
  let cy = (box.mainTop + box.mainBot) * 0.5;
  let rw = (box.mainRight - box.mainLeft) * 0.48 * e + min(width, height) * 0.036;
  let rh = (box.mainBot - box.mainTop) * 0.48 * e + min(width, height) * 0.032;
  push();
  translate(cx, cy);
  rotate(sin(ph * 0.42) * 0.012);
  blendMode(SCREEN);
  noFill();
  stroke(255, 215, 165, 5.5 + 3.5 * sin(ph));
  strokeWeight(0.65);
  ellipse(0, 0, rw * 2.08, rh * 2.12);
  blendMode(BLEND);
  pop();
}

/** Empatija medis (vienas transformacijos sluoksnis): šaka + ghost — naudoti su translate/rotate ir tint. */
function drawDeepEmpatijaTreeInterior(memD) {
  if (typeof deepTreeWing !== "undefined") {
    deepTreeWing = "single";
  }
  if (memD === 1) {
    if (typeof deepTreeWing !== "undefined") {
      deepTreeWing = "single";
    }
    push();
    translate(-width * 0.01, 0);
    rotate(0.028);
    treeMaker(tmaxLen * 1.02);
    pop();
  } else {
    let ph = getDeepEmpatijaPhase2TreePhase();
    let g = constrain(
      typeof _deepEmpatijaTreeVisualGrowth01 === "number" ? _deepEmpatijaTreeVisualGrowth01 : 0,
      0,
      1
    );
    /* Ilgis fiksuotas — kintantis reachL kiekvienam kadrui išderindavo random() ir medis „šokinėdavo“. */
    let scInt = 1.03 + 0.002 * sin(ph + 0.35);
    scale(scInt);
    if (typeof deepTreeWing !== "undefined") {
      deepTreeWing = "left";
    }
    push();
    translate(-width * (0.04 + 0.2 * g), -height * (0.009 + 0.055 * g));
    rotate(0.041 + 0.115 * g + 0.00075 * sin(ph * 1.05));
    treeMaker(tmaxLen * (0.93 + 0.62 * g));
    pop();
    if (typeof deepTreeWing !== "undefined") {
      deepTreeWing = "right";
    }
    push();
    translate(width * (0.018 + 0.2 * g), height * (0.004 - 0.05 * g));
    rotate(-0.03 - 0.11 * g + 0.00055 * sin(ph * 0.88));
    treeMaker(tmaxLen * (0.84 + 0.58 * g));
    pop();
    if (g < 0.7) {
      _treeGhostAlphaDraw(0.26, function () {
        if (typeof deepTreeWing !== "undefined") {
          deepTreeWing = "right";
        }
        push();
        translate(width * 0.02 * g, -height * 0.012 * g);
        rotate(-0.018 - 0.03 * g);
        treeMaker(tmaxLen * (0.58 + 0.24 * g));
        pop();
      });
    }
  }
  if (typeof deepTreeWing !== "undefined") {
    deepTreeWing = "single";
  }
}

/** Vietoj „tech“ ridges — vienas lėtas šiltas pulsas (Empatija). */
function drawDeepEmpatijaBreathPulse(memD) {
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let amp = memD >= 2 ? getDeepEmpatijaPhase2BackdropAmpMul(mot) : mot;
  push();
  noStroke();
  blendMode(SCREEN);
  let t = memD >= 2 ? millis() * 0.00082 : millis() * 0.001 * mot;
  let exp2 = getDeepEmpatijaPhase2ExpandMul(memD, mot);
  let pan =
    memD >= 2 ? getDeepEmpatijaPhase2BackdropPanPx(memD, mot) : { x: 0, y: 0 };
  let cx =
    width * 0.52 +
    sin(t * 0.48) * (memD >= 2 ? 30 : 22) * amp +
    pan.x * (memD >= 2 ? 0.48 : 0.35);
  let cy =
    height * 0.44 +
    cos(t * 0.39) * (memD >= 2 ? 22 : 16) * amp +
    pan.y * (memD >= 2 ? 0.48 : 0.35);
  let baseR =
    (min(width, height) * (0.18 + 0.045 * sin(t * 0.73)) + memD * 10) *
    (memD >= 2 ? exp2 : 1);
  for (let k = 0; k < 4; k++) {
    let rk = baseR + k * min(width, height) * 0.048 * (memD >= 2 ? exp2 : 1);
    fill(255, 218, 175, (6.2 - k * 1.15) * (0.82 + memD * 0.1));
    ellipse(cx, cy, rk * 2, rk * 2 * 0.94);
  }
  blendMode(BLEND);
  pop();
}

function _treeGhostAlphaDraw(alpha, fn) {
  let c = typeof drawingContext !== "undefined" ? drawingContext : null;
  let prev = c ? c.globalAlpha : 1;
  if (c) {
    c.globalAlpha = alpha;
  }
  fn();
  if (c) {
    c.globalAlpha = prev;
  }
}

/** Viena aiški jungtis tarp šakų (2+ fazė), fiksuota nuo sėklos. */
function drawDeepMemoryStaticBridge(zone, memD) {
  if (memD < 2) {
    return;
  }
  if (zone === 4 || zone === 6) {
    return;
  }
  let zt = getDeepZoneTextColor(zone);
  let szKey = (width | 0) + "x" + (height | 0);
  let brKey = (deepSeed | 0) + "|" + zone + "|" + memD + "|" + szKey;
  if (_deepStaticBridgeCache.key !== brKey) {
    randomSeed((deepSeed || 1) + 5011 + zone * 19);
    let tcx =
      typeof getDeepMemoryTextColumnCenterX === "function"
        ? getDeepMemoryTextColumnCenterX()
        : width * 0.36;
    let trx =
      typeof getDeepMemoryTreeRootXForZone === "function"
        ? getDeepMemoryTreeRootXForZone(zone, memD)
        : width * 0.75;
    _deepStaticBridgeCache.key = brKey;
    _deepStaticBridgeCache.x1 = tcx - width * 0.04 + random(-4, 4);
    _deepStaticBridgeCache.y1 = height * 0.38 + random(-5, 5);
    _deepStaticBridgeCache.x2 = trx - width * 0.1 + random(-4, 4);
    _deepStaticBridgeCache.y2 = height * 0.37 + random(-5, 5);
    _deepStaticBridgeCache.d5x1 = tcx - width * 0.1 + random(-6, 6);
    _deepStaticBridgeCache.d5y1 = height * 0.5;
    _deepStaticBridgeCache.d5x2 = trx - width * 0.06 + random(-6, 6);
    _deepStaticBridgeCache.d5y2 = height * 0.48;
  }
  let c = _deepStaticBridgeCache;
  noFill();
  stroke(
    lerp(188, zt[0], 0.55),
    lerp(172, zt[1], 0.55),
    lerp(128, zt[2], 0.55),
    28
  );
  strokeWeight(zone === 5 ? 0.95 : 0.85);
  strokeCap(ROUND);
  bezier(
    c.x1,
    c.y1,
    lerp(c.x1, c.x2, 0.38),
    height * 0.26,
    lerp(c.x1, c.x2, 0.62),
    height * 0.27,
    c.x2,
    c.y2
  );
  if (zone === 5 && memD === 2) {
    stroke(
      lerp(120, zt[0], 0.62),
      lerp(90, zt[1], 0.62),
      lerp(150, zt[2], 0.62),
      22
    );
    bezier(
      c.d5x1,
      c.d5y1,
      lerp(c.d5x1, c.d5x2, 0.35),
      height * 0.22,
      lerp(c.d5x1, c.d5x2, 0.65),
      height * 0.24,
      c.d5x2,
      c.d5y2
    );
  }
  noStroke();
}

/** Laikant pelę — papildoma plona jungtis. */
function drawDeepMemoryHoldBridge(zone, memD) {
  if (memD < 2 || typeof isPointerDown === "undefined" || !isPointerDown) {
    return;
  }
  let zt = getDeepZoneTextColor(zone);
  let p = constrain(typeof deepGrowthProgress === "number" ? deepGrowthProgress : 0, 0, 1);
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let t = millis() * 0.00045 * mot;
  noFill();
  stroke(
    lerp(220, zt[0], 0.45),
    lerp(202, zt[1], 0.45),
    lerp(158, zt[2], 0.45),
    32 + p * 72
  );
  strokeWeight(0.62);
  strokeCap(ROUND);
  let tcxH =
    typeof getDeepMemoryTextColumnCenterX === "function"
      ? getDeepMemoryTextColumnCenterX()
      : width * 0.36;
  let trxH =
    typeof getDeepMemoryTreeRootXForZone === "function"
      ? getDeepMemoryTreeRootXForZone(zone, memD)
      : width * 0.75;
  let x0h = tcxH - width * 0.04;
  let x3h = trxH - width * 0.08;
  bezier(
    x0h,
    height * (0.44 + sin(t) * 0.018 * mot),
    lerp(x0h, x3h, 0.42),
    height * (0.32 + sin(t * 1.05) * 0.025 * mot),
    lerp(x0h, x3h, 0.58),
    height * (0.32 + cos(t * 0.95) * 0.025 * mot),
    x3h,
    height * (0.43 + sin(t * 0.88) * 0.018 * mot)
  );
  noStroke();
}

/** Papildomas šaltas rūkas po medžiu — fazėje 2 (fazėje 1 jau užpildyta CloseAtmosphere). */
function drawDeepJautrumasFog(memD) {
  if (memD < 2) {
    return;
  }
  let zt = getDeepZoneTextColor(4);
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  push();
  blendMode(ADD);
  noStroke();
  let sp = getDeepJautrumasPainSpasm01(mot);
  let pp = getDeepJautrumasPainPhaseRad(mot);
  let n = 6 + memD * 3;
  for (let i = 0; i < n; i++) {
    let t = millis() * 0.00014 * mot + i * 0.63;
    let cx =
      width * (0.18 + ((i * 47) % 65) * 0.01) +
      sin(t + i) * (22 + memD * 8) * mot +
      sin(pp * 3.8 + i * 0.76) * width * 0.036 * sp * mot;
    let cy =
      height * (0.22 + ((i * 31) % 55) * 0.008) +
      cos(t * 0.85) * (18 + memD * 6) * mot +
      cos(pp * 3.35 + i * 0.68) * height * 0.03 * sp * mot;
    let r = (32 + memD * 18 + (i % 4) * 12) * 1.08;
    fill(
      lerp(92, zt[0], 0.58) + i * 0.65,
      lerp(88, zt[1], 0.54) + i * 0.5,
      lerp(168, zt[2], 0.48),
      (5 + memD * 1.6) * 0.82
    );
    ellipse(cx, cy, r, r * (0.88 + (i % 3) * 0.05));
  }
  blendMode(BLEND);
  pop();
}

function drawDeepJuokasRisingSparkles(memD) {
  let count = 8 + memD * 15;
  let szKey = (width | 0) + "x" + (height | 0);
  let sparkKey = (deepSeed | 0) + "|" + memD + "|" + szKey + "|" + count;
  if (_juokasSparkleCache.key !== sparkKey || !_juokasSparkleCache.lines) {
    randomSeed((deepSeed || 1) + 9029 + memD * 41);
    let lines = [];
    for (let i = 0; i < count; i++) {
      lines.push({
        x: width * (0.22 + random() * 0.56),
        y0: height * (0.2 + random() * 0.42),
        len: random(16, 48 + memD * 18),
        dx: random(-10, 10),
        a: random(18, 48 + memD * 16),
        sw: random(0.35, 1.1)
      });
    }
    _juokasSparkleCache = { key: sparkKey, lines: lines };
  }
  let zt = getDeepZoneTextColor(3);
  push();
  blendMode(ADD);
  strokeCap(ROUND);
  for (let i = 0; i < _juokasSparkleCache.lines.length; i++) {
    let L = _juokasSparkleCache.lines[i];
    stroke(zt[0], zt[1], zt[2], L.a);
    strokeWeight(L.sw);
    line(L.x, L.y0, L.x + L.dx, L.y0 - L.len);
  }
  blendMode(BLEND);
  noStroke();
  pop();
}

// Meilė (zone 6) — floating warm particles + soft radial glow
let _meileParticleCache = { key: "", pts: null };
function drawDeepMeileAtmosphere(memD) {
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let t = millis() * 0.001 * mot;
  let szKey = (width | 0) + "x" + (height | 0) + "|" + memD + "|" + (deepSeed | 0);
  if (_meileParticleCache.key !== szKey || !_meileParticleCache.pts) {
    randomSeed((deepSeed || 3) * 77 + memD * 19 + 60037);
    let pts = [];
    let n = memD >= 2 ? 74 : 18 + memD * 14;
    for (let i = 0; i < n; i++) {
      pts.push({
        x:    random(width * 0.08, width * 0.92),
        y0:   random(height * 0.15, height * 0.82),
        rise: random(0.012, 0.035),
        drift: random(-0.008, 0.008),
        r:    random(3.5, 9 + memD * 3),
        a:    random(18, 40 + memD * 10),
        phase: random(TWO_PI)
      });
    }
    _meileParticleCache = { key: szKey, pts: pts };
  }

  let hbCx =
    typeof getDeepMemoryTreeRootXForZone === "function"
      ? getDeepMemoryTreeRootXForZone(6, memD)
      : width * 0.75;

  push();
  noStroke();
  blendMode(ADD);
  for (let i = 0; i < _meileParticleCache.pts.length; i++) {
    let p = _meileParticleCache.pts[i];
    let riseMul = memD >= 2 ? 15 : 22;
    let cy =
      ((p.y0 - p.rise * ((t * riseMul) % height) * mot) % height + height) % height;
    let driftMul = memD >= 2 ? 9 : 14;
    let cx = p.x + sin(t * 0.42 + p.phase) * driftMul * mot;
    if (memD >= 2) {
      let pull = 0.14 + 0.1 * sin(t * 0.11 + p.phase * 1.7);
      cx = lerp(cx, hbCx, pull);
      cy = lerp(cy, height * 0.5, pull * 0.38);
    }
    let pulse = 0.78 + 0.22 * sin(t * (memD >= 2 ? 0.85 : 1.1) + p.phase);
    let al = p.a * pulse * (memD >= 2 ? 1.22 : 1);
    if (memD >= 2) {
      let gold = i % 5;
      if (gold === 0 || gold === 3) {
        fill(255, 210 + (i % 3) * 12, 155 + (i % 4) * 10, al * 1.05);
      } else if (gold === 2) {
        fill(255, 235, 205, al * 0.95);
      } else {
        fill(255, 148 + i % 4 * 12, 168 + i % 3 * 8, al);
      }
    } else {
      fill(255, 148 + i % 4 * 12, 168 + i % 3 * 8, al);
    }
    ellipse(cx, cy, p.r * pulse, p.r * pulse * 0.9);
  }

  // Soft radial heartbeat glow from centre-bottom
  let hbPhase = (t * 0.7) % TWO_PI;
  let hbPulse = 0.7 + 0.3 * sin(hbPhase) * mot;
  let gR = min(width, height) * (0.38 + 0.08 * hbPulse) * min(memD, 2);
  let hbBoost = memD >= 2 ? 1.85 : 1;
  fill(255, 130, 155, 6.8 * hbPulse * memD * hbBoost);
  ellipse(hbCx, height * 0.62, gR * 2, gR * 1.32);
  fill(255, 175, 195, 5.2 * hbPulse * memD * hbBoost);
  ellipse(hbCx, height * 0.62, gR * 2.85, gR * 2.05);
  if (memD >= 2) {
    fill(255, 225, 205, 4 * hbPulse * hbBoost);
    ellipse(hbCx, height * 0.58, gR * 2.45, gR * 1.85);
  }

  blendMode(BLEND);
  pop();

  // Fine shimmer lines (warm, short, drifting)
  if (memD >= 2) {
    push();
    blendMode(ADD);
    strokeCap(ROUND);
    randomSeed((deepSeed || 3) + 44441 + memD);
    let lc = memD >= 2 ? 26 : 10 + memD * 8;
    for (let i = 0; i < lc; i++) {
      let lx = random(width * 0.12, width * 0.88);
      let ly = random(height * 0.12, height * 0.78);
      let la = random(14, 32);
      let ll = random(10, 34);
      stroke(255, 165 + i % 5 * 8, 175, la);
      strokeWeight(random(0.3, 0.85));
      let ang = random(PI);
      line(lx - cos(ang)*ll*0.5, ly - sin(ang)*ll*0.5, lx + cos(ang)*ll*0.5, ly + sin(ang)*ll*0.5);
    }
    noStroke();
    blendMode(BLEND);
    pop();
  }
}

/**
 * Atminties gylis 1–2: 1 — atpažįstamas medis; 2 — lūžis (ankstesnė „trečia“ vizualika).
 */
function drawDeepMemoryEmotionTree(zone, memD) {
  if (typeof treeMaker !== "function") {
    return;
  }
  drawDeepMemoryAtmosphereFill(zone, memD);
  if (shouldDrawDeepJuokasPlayfulVisuals(zone, memD)) {
    drawDeepJuokasPhase2PlayfulBackdrop(getDeepJuokasPlayfulIntensityMul(memD), memD);
  }
  if (zone === 5 && memD >= 2) {
    drawDeepDramaPhase2BloomCore(memD);
  }
  if (zone === 7) {
    drawDeepEmpatijaGoldenBokeh(memD);
  }
  let _motDeep = typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let baseX =
    typeof getDeepMemoryTreeRootXForZone === "function"
      ? getDeepMemoryTreeRootXForZone(zone, memD)
      : width * 0.75;
  let baseY = height * (memD >= 2 ? 0.985 : 0.992);

  if (zone === 5) {
    let layers = memD >= 2 ? 5 : 2;
    let lenMul = memD === 1 ? 0.93 : 1.04;
    push();
    translate(baseX, baseY);
    let ds = deepSeed || 1;
    let fc = frameCount * _motDeep;
    if (memD === 1) {
      let swayP1 = sin(frameCount * 0.033) * 0.014 * _motDeep;
      rotate(swayP1);
    }
    if (memD >= 2) {
      let stutter =
        sin(fc * 0.41 + ds * 0.11) * 15 * _motDeep *
        (0.55 + 0.45 * abs(sin(fc * 0.097)));
      let jx =
        sin(fc * 0.33 + ds * 0.05) * 13 * _motDeep +
        sin(fc * 0.57) * 8 * _motDeep +
        sin(fc * 0.94 + ds * 0.13) * 9 * _motDeep +
        sin(fc * 1.31 + ds * 0.07) * 6 * _motDeep +
        stutter;
      let jy =
        cos(fc * 0.29 + ds * 0.04) * 11 * _motDeep +
        sin(fc * 0.44) * 6.5 * _motDeep +
        cos(fc * 0.82 + ds * 0.1) * 8 * _motDeep +
        sin(ds * 0.31 + fc * 0.21) * 12 * _motDeep;
      translate(jx, jy);
      let twitch =
        sin(fc * 0.31 + ds * 0.025) * 0.092 * _motDeep +
        sin(fc * 1.52 + ds * 0.33) * 0.052 * _motDeep *
          (abs(sin(fc * 0.21)) > 0.78 ? 1.85 : 1);
      let sway =
        sin(fc * 0.082) * 0.178 * _motDeep +
        sin(fc * 0.053) * 0.088 * _motDeep +
        sin(fc * 0.171 + ds * 0.045) * 0.072 * _motDeep +
        sin(fc * 0.267 + ds * 0.08) * 0.048 * _motDeep +
        twitch;
      rotate(sway);
      shearX(sin(fc * 0.16 + 0.7) * 0.152 * _motDeep);
      shearY(cos(fc * 0.125 + 1.3) * 0.118 * _motDeep);
    }
    if (typeof deepTreeWing !== "undefined") {
      deepTreeWing = "single";
    }
    for (let layer = 0; layer < layers; layer++) {
      push();
      let off =
        (layer - (layers - 1) * 0.5) *
        width *
        (memD >= 2 ? 0.068 : memD === 1 ? 0.04 : 0.034);
      translate(
        off + (memD >= 2 ? sin(fc * 0.19 + layer * 1.7 + ds * 0.02) * 14 * _motDeep : 0),
        memD >= 2
          ? -height * (0.009 * layer + 0.004 * sin(fc * 0.11 + layer))
          : -height * 0.005 * layer
      );
      let angMax = memD >= 2 ? 0.95 : 0.15;
      let angWob = memD >= 2 ? 0.34 : 0.03;
      let fcSp = memD >= 2 ? 0.188 : 0.045;
      let ang =
        (((deepSeed + layer * 17) % 100) / 100 - 0.5) * angMax +
        sin(frameCount * fcSp + layer * 0.7) * angWob * _motDeep;
      rotate(ang);
      if (typeof deepTreeWing !== "undefined") {
        deepTreeWing = memD === 1 ? "single" : layer % 2 === 0 ? "left" : "right";
      }
      if (memD === 1) {
        tint(172, 148, 132, 178);
      } else {
        let dt = frameCount * 0.066 + layer * 1.37;
        let tr = 226 + 29 * sin(dt * 1.8);
        let tg = 112 + 56 * abs(sin(dt * 1.25 + 0.8));
        let tb = 76 + 42 * abs(cos(dt * 1.62 + 0.45));
        let ta = 222 + 30 * abs(sin(dt * 2.2));
        tint(tr, tg, tb, ta);
      }
      treeMaker(
        tmaxLen *
          (lenMul +
            layer * (memD >= 2 ? 0.036 : 0.018) +
            (memD >= 2 ? sin(ds * 0.07 + layer * 2.1) * 0.028 : 0))
      );
      noTint();
      pop();
    }
    if (typeof deepTreeWing !== "undefined") {
      deepTreeWing = "single";
    }
    pop();
    drawDeepDramaEmberVignette(memD);
    drawDeepDramaSideBeams(memD);
    if (memD >= 2) {
      drawDeepDramaPhase2ChaosStorm(memD);
      drawDeepDramaPhase2SparkOverlay(memD);
    }
    drawDeepMemoryBreathingRidges(zone, memD);
    if (memD >= 2) {
      drawDeepMemoryStaticBridge(zone, memD);
      drawDeepMemoryHoldBridge(zone, memD);
    }
    return;
  }

  if (zone === 4) {
    if (memD === 1) {
      drawDeepJautrumasPhase1CloseAtmosphere(memD);
    } else {
      drawDeepJautrumasPhase2SensoryBloom(memD);
    }
    let bend =
      sin(frameCount * 0.019) *
      (0.0035 * memD) *
      _motDeep *
      (memD >= 2 ? 1.28 : 1);
    push();
    translate(baseX, baseY);
    rotate(bend);
    if (memD === 1) {
      rotate(sin(frameCount * 0.031) * 0.013 * _motDeep);
    }
    if (memD >= 2) {
      let sp = getDeepJautrumasPainSpasm01(_motDeep);
      let pp = getDeepJautrumasPainPhaseRad(_motDeep);
      let m = min(width, height) * 0.0088 * _motDeep;
      translate(
        (sin(pp * 2.85) * 0.52 + sin(pp * 7.35) * 0.48) * m * (0.55 + sp * 2.6),
        (cos(pp * 2.55) * 0.5 + sin(pp * 6.9) * 0.5) * m * (0.5 + sp * 2.45)
      );
      rotate(
        (sin(pp * 3.45) * 0.072 +
          sin(pp * 9.2 + (deepSeed || 1) * 0.02) * 0.055 * sp +
          sin(pp * 15.8) * 0.032 * sp) *
          _motDeep
      );
      scale(
        1 + 0.055 * sp * sin(pp * 4.2),
        1 - 0.042 * sp * cos(pp * 3.65)
      );
      shearX(sin(pp * 5.1) * 0.085 * sp * _motDeep);
      shearY(cos(pp * 4.4) * 0.048 * sp * _motDeep);
    }
    if (typeof deepTreeWing !== "undefined") {
      deepTreeWing = "single";
    }
    if (memD === 1) {
      let jLayers = 2;
      for (let jl = 0; jl < jLayers; jl++) {
        push();
        let jOff =
          (jl - (jLayers - 1) * 0.5) * width * 0.04;
        translate(jOff + width * 0.008, -height * 0.008 - jl * height * 0.004);
        rotate(0.05 + (jl - 0.5) * 0.028);
        tint(218, 212, 236, 118);
        if (typeof deepTreeWing !== "undefined") {
          deepTreeWing = "single";
        }
        treeMaker(tmaxLen * (0.91 + jl * 0.02));
        noTint();
        pop();
      }
    } else {
      let sp = getDeepJautrumasPainSpasm01(_motDeep);
      let pp = getDeepJautrumasPainPhaseRad(_motDeep);
      let fc = frameCount;
      let nk = min(width, height) * 0.0058 * _motDeep;
      scale(
        1.07 +
          sin(fc * 0.94) * 0.02 * _motDeep +
          sp * 0.048 * sin(pp * 5.2)
      );
      if (typeof deepTreeWing !== "undefined") {
        deepTreeWing = "single";
      }
      push();
      translate(
        -width * 0.014 +
          sin(pp * 2.55 + fc * 0.11) * nk * (2.8 + sp * 5.5),
        -height * 0.014 +
          cos(pp * 2.25 + fc * 0.1) * nk * (2.4 + sp * 4.8)
      );
      rotate(
        0.056 +
          sin(pp * 3.95 + fc * 0.09) * 0.078 * _motDeep * (0.45 + sp * 0.55) +
          sin(pp * 11.2) * 0.042 * sp * _motDeep
      );
      tint(232, 226, 252, 122);
      treeMaker(
        tmaxLen *
          (1.08 +
            sin(pp * 4.5 + fc * 0.08) * 0.1 * _motDeep * (0.4 + sp * 0.6))
      );
      noTint();
      pop();
      _treeGhostAlphaDraw(0.44, function () {
        push();
        translate(
          width * 0.028 +
            sin(pp * 2.9 + fc * 0.13 + 1.7) * nk * (3.2 + sp * 5.8),
          height * 0.006 +
            cos(pp * 2.65 + fc * 0.12) * nk * (2.6 + sp * 5)
        );
        rotate(
          -0.038 +
            sin(pp * 4.35 + (deepSeed || 1) * 0.03) * 0.082 * _motDeep * (0.5 + sp * 0.5)
        );
        if (typeof deepTreeWing !== "undefined") {
          deepTreeWing = "right";
        }
        tint(238, 232, 255, 96);
        treeMaker(
          tmaxLen *
            (0.84 +
              sin(pp * 5.1 + fc * 0.11) * 0.12 * _motDeep * (0.35 + sp * 0.65))
        );
        noTint();
        pop();
      });
    }
    if (typeof deepTreeWing !== "undefined") {
      deepTreeWing = "single";
    }
    pop();
    if (memD >= 2) {
      drawDeepJautrumasPhase2GroundRings(memD);
    }
    drawDeepJautrumasFog(memD);
    drawDeepMemoryBreathingRidges(zone, memD);
    if (memD >= 2) {
      drawDeepMemoryHoldBridge(zone, memD);
    }
    return;
  }

  if (zone === 3) {
    if (memD === 1) {
      drawDeepJuokasPhase1QuietLayers(memD);
    } else {
      drawDeepJuokasPhase2SensoryBloom(memD);
    }
    let bend =
      sin(frameCount * (memD >= 2 ? 0.028 : 0.023)) *
      (memD >= 2 ? 0.0055 * memD : 0.0032) *
      _motDeep;
    push();
    translate(baseX, baseY);
    rotate(bend);
    if (shouldDrawDeepJuokasPlayfulVisuals(3, memD)) {
      let pm = getDeepJuokasPlayfulIntensityMul(memD);
      let second = memD >= 2;
      let lt = millis() * (second ? 0.00215 : 0.00135) * _motDeep;
      let ax = min(width, height) * (second ? 0.038 : 0.02) * _motDeep;
      let burst = second ? abs(sin(lt * 2.28)) * 0.62 + 0.38 : 1;
      let jx =
        (sin(lt * 4.15) * ax +
          sin(lt * 6.65 + 0.9) * ax * 0.72 +
          cos(lt * 5.05 + 0.3) * ax * 0.55 +
          (second ? sin(lt * 11.4) * sin(lt * 2.85 + 0.35) * ax * 0.72 : 0)) *
        burst *
        pm;
      let jy =
        (cos(lt * 3.85) * ax * 0.98 +
          sin(lt * 5.95 + 1.35) * ax * 0.8 +
          sin(lt * 8.25) * ax * 0.45 +
          (second ? cos(lt * 10.1) * cos(lt * 3.05 + 0.2) * ax * 0.65 : 0)) *
        burst *
        pm;
      let jr =
        (sin(lt * 4.75) * (second ? 0.078 : 0.055) +
          cos(lt * 6.05 + 1.05) * (second ? 0.052 : 0.038) +
          sin(lt * 8.55) * (second ? 0.038 : 0.026)) *
        _motDeep *
        burst *
        pm;
      translate(jx, jy);
      rotate(jr);
      let sc0 =
        1 +
        (second ? 0.072 : 0.05) * sin(lt * 3.35) * _motDeep * burst * pm +
        (second ? 0.048 : 0.036) * cos(lt * 5.25) * _motDeep * burst * pm;
      if (second) {
        let e = abs(sin(lt * 1.12)) * 0.72 + 0.28;
        let wide = 1 + e * 0.18 * sin(lt * 2.22) * pm * burst;
        let tall = 1 - e * 0.12 * cos(lt * 1.92) * pm * burst;
        scale(sc0 * wide, sc0 * tall);
        shearX(sin(lt * 3.02) * 0.14 * burst * pm * _motDeep);
        shearY(cos(lt * 2.62) * 0.078 * burst * pm * _motDeep);
      } else {
        scale(sc0);
      }
    }
    if (typeof deepTreeWing !== "undefined") {
      deepTreeWing = "single";
    }
    if (memD === 1) {
      if (typeof deepTreeWing !== "undefined") {
        deepTreeWing = "single";
      }
      push();
      translate(width * 0.002, -height * 0.004);
      rotate(0.014);
      tint(186, 194, 208, 118);
      treeMaker(tmaxLen * 0.94);
      noTint();
      pop();
    } else {
      let laughPh = getDeepJuokasLaughPhaseRad(_motDeep);
      let bstTree = getDeepJuokasLaughBurst01(laughPh);
      scale(1.07 * (1 + 0.058 * sin(laughPh * 2.42) * bstTree));
      if (typeof deepTreeWing !== "undefined") {
        deepTreeWing = "single";
      }
      push();
      translate(
        -width * 0.012 + sin(laughPh * 2.75) * width * 0.034 * bstTree,
        -height * 0.014 + cos(laughPh * 2.15) * height * 0.026 * bstTree
      );
      rotate(0.052 + sin(laughPh * 3.38) * 0.058 * bstTree);
      tint(228, 232, 255, 120);
      treeMaker(tmaxLen * (1.08 + 0.08 * sin(laughPh * 2.26) * bstTree));
      noTint();
      pop();
      _treeGhostAlphaDraw(0.36, function () {
        push();
        translate(
          width * 0.026 + sin(laughPh * 2.05 + 1.1) * width * 0.04 * bstTree,
          height * 0.005 + cos(laughPh * 2.78) * height * 0.024 * bstTree
        );
        rotate(-0.036 + sin(laughPh * 4.08) * 0.068 * bstTree);
        if (typeof deepTreeWing !== "undefined") {
          deepTreeWing = "right";
        }
        tint(238, 242, 255, 82);
        treeMaker(tmaxLen * (0.62 + 0.15 * sin(laughPh * 3.08) * bstTree));
        noTint();
        pop();
      });
    }
    if (typeof deepTreeWing !== "undefined") {
      deepTreeWing = "single";
    }
    pop();
    if (memD >= 2) {
      drawDeepJuokasPhase2GroundRings(memD);
    }
    drawDeepMemoryBreathingRidges(zone, memD);
    if (memD >= 2) {
      drawDeepMemoryStaticBridge(zone, memD);
      drawDeepMemoryHoldBridge(zone, memD);
    }
    return;
  }

  // ── Meilė (zone 6) — warm, open, embracing ──────────────────────────────
  if (zone === 6) {
    drawDeepMeileCoronaBeforeTree(memD);
    if (memD >= 2) {
      drawDeepMeilePhase2BloomAndRipples(memD);
    }
    let bend6 =
      sin(frameCount * (memD >= 2 ? 0.013 : 0.016)) *
      (0.006 * memD) *
      _motDeep *
      (memD === 1 ? 0.42 : 1);
    push();
    translate(baseX, baseY);
    rotate(bend6);
    if (typeof deepTreeWing !== "undefined") deepTreeWing = "single";
    if (memD === 1) {
      if (typeof deepTreeWing !== "undefined") deepTreeWing = "single";
      push();
      translate(width * 0.004, 0);
      rotate(0.017);
      treeMaker(tmaxLen * 1.02);
      pop();
    } else {
      push();
      translate(-width * 0.026, -height * 0.018);
      rotate(0.031);
      tint(255, 208, 228, 92);
      treeMaker(tmaxLen * 1.06);
      pop();
      noTint();
      scale(1.07 + 0.02 * sin(frameCount * 0.019));
      if (typeof deepTreeWing !== "undefined") deepTreeWing = "single";
      push();
      translate(-width * 0.02, -height * 0.014);
      rotate(0.034);
      tint(255, 235, 248, 210);
      treeMaker(tmaxLen * 1.05);
      pop();
      noTint();
      _treeGhostAlphaDraw(0.42, function () {
        push();
        translate(width * 0.024, height * 0.01);
        rotate(-0.03);
        if (typeof deepTreeWing !== "undefined") {
          deepTreeWing = "right";
        }
        tint(255, 220, 235, 140);
        treeMaker(tmaxLen * 0.78);
        pop();
        noTint();
      });
    }
    if (typeof deepTreeWing !== "undefined") deepTreeWing = "single";
    pop();
    drawDeepMeileAtmosphere(memD);
    drawDeepMemoryBreathingRidges(zone, memD);
    if (memD >= 2) {
      drawDeepMemoryStaticBridge(zone, memD);
      drawDeepMemoryHoldBridge(zone, memD);
    }
    return;
  }

  // ── Empatija (7): medis stovi vietoje; 2 fazėje auga tik šakų išsiskleidimas/ilgis.
  let emGrow01 = zone === 7 && memD >= 2 ? syncDeepEmpatijaTreeVisualGrowth(memD, _motDeep) : 0;
  void emGrow01;
  if (memD >= 2) {
    let emPh = getDeepEmpatijaPhase2TreePhase();
    let emS = getDeepEmpatijaPhase2TreeScaleMul(memD, _motDeep);
    push();
    translate(baseX, baseY);
    rotate(0.0006 * sin(emPh * 0.35));
    scale(emS);
    tint(255, 84);
    drawDeepEmpatijaTreeInterior(memD);
    pop();
    noTint();
  } else {
    let bend =
      sin(frameCount * 0.02) * (0.0048 * memD) * _motDeep;
    push();
    translate(baseX + 1.35, baseY + 1.08);
    rotate(bend);
    tint(255, 36);
    drawDeepEmpatijaTreeInterior(memD);
    pop();
    noTint();
    push();
    translate(baseX, baseY);
    rotate(bend);
    tint(255, 108);
    drawDeepEmpatijaTreeInterior(memD);
    pop();
    noTint();
  }
  if (zone === 7 && memD >= 2) {
    drawDeepEmpatijaPhase2PhraseCrown(memD);
  }
  if (zone === 7) {
    drawDeepEmpatijaSunHalo(memD);
    drawDeepEmpatijaGroundWarmth(memD);
    if (memD >= 2) {
      drawDeepEmpatijaHairTrails(memD);
    }
    drawDeepEmpatijaDustMotes(memD);
  }
  drawDeepMemoryBreathingRidges(zone, memD);
  if (memD >= 2) {
    drawDeepMemoryStaticBridge(zone, memD);
    drawDeepMemoryHoldBridge(zone, memD);
  }
}

function drawDeepMemoryLinkedPhrase(shown, opts) {
  if (!shown || shown.length === 0) {
    return;
  }
  let x = typeof opts.x === "number" ? opts.x : width * 0.3;
  let y = typeof opts.y === "number" ? opts.y : height * 0.7;
  let ts = typeof opts.ts === "number" ? opts.ts : min(38, max(28, width * 0.052));
  let alphaBase = typeof opts.alpha === "number" ? opts.alpha : 172;
  let ink = Array.isArray(opts.ink) ? opts.ink : [220, 215, 208];
  let lineGapMul = typeof opts.lineGapMul === "number" ? opts.lineGapMul : 1.18;
  let split = shown.indexOf(" ");
  let line1 = shown;
  let line2 = "";
  if (split > 0 && shown.length > 10) {
    line1 = shown.slice(0, split);
    line2 = shown.slice(split + 1);
  }
  textSize(ts);
  let lh = ts * lineGapMul;
  let pulse = 0.5 + 0.5 * sin(millis() * 0.0029 + focusedZone * 0.6);
  let mouseMul = 1;
  if (typeof mouseX === "number" && typeof mouseY === "number") {
    let d = dist(mouseX, mouseY, x, y);
    mouseMul = 0.86 + constrain(map(d, width * 0.52, width * 0.09, 0, 0.42), 0, 0.42);
  }
  let fadeIn = constrain(pow(typeof deepGrowthProgress === "number" ? deepGrowthProgress : 0, 0.62), 0, 1);
  noStroke();
  fill(ink[0], ink[1], ink[2], alphaBase * (0.75 + pulse * 0.25) * mouseMul * fadeIn);
  text(line1, x, y);
  if (line2) {
    fill(ink[0], ink[1], ink[2], alphaBase * 0.68 * mouseMul * fadeIn);
    text(line2, x + ts * 0.1, y + lh);
  }
}

/**
 * Atminties frazė: matoma dalis = tik `deepGrowthProgress` (t) — tas pats šaltinis kaip Meilės žiedas ir medžio augimas.
 * Nepriklauso nuo paspaudimų / delsos — nekrenta į 0 kiekvieną kartą vėl paspaudus (deepZoneGrowth saugo t).
 */
function drawDeepMemoryPhraseText() {
  if (!isDeepMemoryTreeZone(focusedZone)) {
    return;
  }
  let memD = getDeepZoneMemoryDepth(focusedZone);
  let full = getDeepMemoryPhraseForZone(focusedZone, memD);
  let t = constrain(typeof deepGrowthProgress === "number" ? deepGrowthProgress : 0, 0, 1);
  let u = 0;
  if (memD === 1) {
    u = pow(constrain(t, 0, 1), 0.58);
  } else {
    let tEff = constrain((t - 0.04) / 0.96, 0, 1);
    u = pow(tEff, 0.46);
  }
  let nChars = constrain(ceil(full.length * u), 0, full.length);
  if (nChars <= 0) return;

  let nu = getDeepMemoryPhraseMicroNudge(focusedZone, memD);

  if (typeof setDeepEmotionFont === "function") {
    setDeepEmotionFont();
  } else {
    setDeepCaptionFont();
  }
  textStyle(NORMAL);
  let sizeCore = min(37, max(23, width * 0.057)) * (memD === 2 ? 1.1 : 1);
  textSize(sizeCore);
  textLeading(sizeCore * (typeof DEEP_POETIC_LEADING_MULT === "number" ? DEEP_POETIC_LEADING_MULT : 1.5));
  /* letterSpacing čia nenaudojam — raidės piešiamos atskirai (curX += textWidth). */
  textAlign(LEFT, BASELINE);

  let dwell = getDeepDwellSeconds();
  let chaos = getDeepChaosLevel(focusedZone);
  let ms = millis();
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let shown = full.substring(0, nChars);

  /* Juoko fazė 1 — šviesiai melsvas (zonos chroma), ne pilkas baltas. */
  if (focusedZone === 3 && memD === 1) {
    if (typeof setDeepEmotionFont === "function") {
      setDeepEmotionFont();
    } else {
      setDeepCaptionFont();
    }
    textStyle(NORMAL);
    textAlign(LEFT, BASELINE);
    textSize(min(36, max(26, width * 0.049)));
    let ink = deepMemoryPhraseReadableRgb(3, 1);
    let joyArcX = width * 0.41 + sin(millis() * 0.00062 + 0.8) * width * 0.016;
    let joyArcY = height * 0.665 + cos(millis() * 0.00048 + 0.2) * height * 0.014;
    drawDeepMemoryLinkedPhrase(shown, {
      x: joyArcX,
      y: joyArcY,
      ts: min(36, max(26, width * 0.049)),
      alpha: 158,
      ink: ink,
      lineGapMul: 1.22
    });
    textStyle(NORMAL);
    return;
  }

  /* Juoko fazė 2 — kristalinis, bet vis tiek ledinis mėlynis iš Juoko. */
  if (focusedZone === 3 && memD === 2) {
    if (typeof setDeepEmotionFont === "function") {
      setDeepEmotionFont();
    } else {
      setDeepCaptionFont();
    }
    textStyle(NORMAL);
    textAlign(LEFT, BASELINE);
    textSize(min(42, max(30, width * 0.056)));
    let ink = deepMemoryPhraseReadableRgb(3, 2);
    let joyCoreX = width * 0.46 + sin(millis() * 0.0008 + 1.7) * width * 0.02;
    let joyCoreY = height * 0.615 + cos(millis() * 0.00056 + 0.9) * height * 0.015;
    drawDeepMemoryLinkedPhrase(shown, {
      x: joyCoreX,
      y: joyCoreY,
      ts: min(42, max(30, width * 0.056)),
      alpha: 244,
      ink: ink,
      lineGapMul: 1.2
    });
    textStyle(NORMAL);
    return;
  }

  /* Jautrumas fazė 1 — švelnus rožinis / drėgnas pilkas iš zonos. */
  if (focusedZone === 4 && memD === 1) {
    if (typeof setDeepEmotionFont === "function") {
      setDeepEmotionFont();
    } else {
      setDeepCaptionFont();
    }
    textStyle(NORMAL);
    textAlign(LEFT, BASELINE);
    textSize(min(38, max(28, width * 0.052)));
    let ink = deepMemoryPhraseReadableRgb(4, 1);
    drawDeepMemoryLinkedPhrase(shown, {
      x: width * 0.32,
      y: height * 0.675,
      ts: min(38, max(28, width * 0.052)),
      alpha: 148,
      ink: ink
    });
    textStyle(NORMAL);
    return;
  }

  /* Jautrumas fazė 2 — šviesus, bet vis dar rožinis atspalvis, ne baltas. */
  if (focusedZone === 4 && memD === 2) {
    if (typeof setDeepEmotionFont === "function") {
      setDeepEmotionFont();
    } else {
      setDeepCaptionFont();
    }
    textStyle(NORMAL);
    textAlign(LEFT, BASELINE);
    textSize(min(42, max(30, width * 0.056)));
    let ink = deepMemoryPhraseReadableRgb(4, 2);
    drawDeepMemoryLinkedPhrase(shown, {
      x: width * 0.24,
      y: height * 0.695,
      ts: min(42, max(30, width * 0.056)),
      alpha: 244,
      ink: ink
    });
    textStyle(NORMAL);
    return;
  }

  /* Drama fazė 1 — rusvas / terrakota iš zonos 5. */
  if (focusedZone === 5 && memD === 1) {
    if (typeof setDeepEmotionFont === "function") {
      setDeepEmotionFont();
    } else {
      setDeepCaptionFont();
    }
    textStyle(NORMAL);
    textAlign(LEFT, BASELINE);
    textSize(min(34, max(26, width * 0.049)));
    let ink = deepMemoryPhraseReadableRgb(5, 1);
    drawDeepMemoryLinkedPhrase(shown, {
      x: width * 0.3,
      y: height * 0.65,
      ts: min(34, max(26, width * 0.049)),
      alpha: 180,
      ink: ink
    });
    textStyle(NORMAL);
    return;
  }

  /* Drama fazė 2 — šiltesnis kremas, vis tiek Dramos oranžinis branduolys. */
  if (focusedZone === 5 && memD === 2) {
    if (typeof setDeepEmotionFont === "function") {
      setDeepEmotionFont();
    } else {
      setDeepCaptionFont();
    }
    textStyle(NORMAL);
    textAlign(LEFT, BASELINE);
    textSize(min(38, max(28, width * 0.051)));
    let ink = deepMemoryPhraseReadableRgb(5, 2);
    drawDeepMemoryLinkedPhrase(shown, {
      x: width * 0.285,
      y: height * 0.645,
      ts: min(38, max(28, width * 0.051)),
      alpha: 210,
      ink: ink
    });
    textStyle(NORMAL);
    return;
  }

  /* Meilė fazė 1 — tekstas arčiau kamieno centro, minkštai įkomponuotas į šakų masę. */
  if (focusedZone === 6 && memD === 1) {
    if (typeof setDeepEmotionFont === "function") {
      setDeepEmotionFont();
    } else {
      setDeepCaptionFont();
    }
    textStyle(NORMAL);
    textAlign(LEFT, BASELINE);
    textSize(min(36, max(27, width * 0.05)));
    let ink = deepMemoryPhraseReadableRgb(6, 1);
    let loveX = width * 0.405 + sin(millis() * 0.00058 + 0.6) * width * 0.014;
    let loveY = height * 0.642 + cos(millis() * 0.00046 + 1.1) * height * 0.012;
    drawDeepMemoryLinkedPhrase(shown, {
      x: loveX,
      y: loveY,
      ts: min(36, max(27, width * 0.05)),
      alpha: 186,
      ink: ink,
      lineGapMul: 1.2
    });
    textStyle(NORMAL);
    return;
  }

  /* Meilė fazė 2 — arčiau šviesos branduolio, šiek tiek ryškiau, bet vis dar organiškai. */
  if (focusedZone === 6 && memD === 2) {
    if (typeof setDeepEmotionFont === "function") {
      setDeepEmotionFont();
    } else {
      setDeepCaptionFont();
    }
    textStyle(NORMAL);
    textAlign(LEFT, BASELINE);
    textSize(min(41, max(30, width * 0.055)));
    let ink = deepMemoryPhraseReadableRgb(6, 2);
    let loveCoreX = width * 0.46 + sin(millis() * 0.00074 + 1.4) * width * 0.017;
    let loveCoreY = height * 0.598 + cos(millis() * 0.00052 + 0.3) * height * 0.013;
    drawDeepMemoryLinkedPhrase(shown, {
      x: loveCoreX,
      y: loveCoreY,
      ts: min(41, max(30, width * 0.055)),
      alpha: 232,
      ink: ink,
      lineGapMul: 1.18
    });
    textStyle(NORMAL);
    return;
  }

  let totalW = textWidth(shown);
  let colCx =
    typeof getDeepMemoryTextColumnCenterX === "function"
      ? getDeepMemoryTextColumnCenterX()
      : width * 0.36;
  let frac = isDeepMemoryHeroPhraseHorizontal() ? 0.48 : 0.38;
  let baseX = constrain(colCx - totalW * frac + nu.x, width * 0.055, width * 0.52);
  let baseY = getDeepMemoryPhraseBaselineY() + nu.y;

  noStroke();

  let ink = deepMemoryPhraseReadableRgb(focusedZone, memD);
  let fr = ink[0];
  let fg = ink[1];
  let fb = ink[2];
  let curX = baseX;
  let phaseDriftMul = memD === 1 ? 0.28 : 0.72;
  if (focusedZone === 6 && memD === 2) {
    fr = lerp(fr, 255, 0.14);
    fg = lerp(fg, 238, 0.16);
    fb = lerp(fb, 228, 0.12);
    phaseDriftMul *= 0.38;
  }
  for (let i = 0; i < nChars; i++) {
    let ch = shown[i];
    let cw = textWidth(ch);
    let age01 = (nChars - i) / max(1, nChars);
    let driftPhase = (focusedZone * 31 + i * 7 + memD * 13) * 0.00628;
    let driftScale = (chaos * 3.0 + dwell * 0.14 + age01 * 1.4) * mot * phaseDriftMul;
    let nv = noise(i * 0.38, ms * 0.000088 * mot);
    let dx = sin(ms * 0.00038 * mot + driftPhase) * driftScale * (0.42 + nv * 0.9);
    let dy =
      cos(ms * 0.00031 * mot + driftPhase * 1.3) * driftScale * 0.5 + nv * driftScale * 0.32;
    let enterT = constrain((u * full.length - i) / 0.85, 0, 1);
    let fadeA = pow(enterT, 0.88);
    let oldFade = constrain(1.0 - age01 * age01 * (0.26 + dwell * 0.010), 0.04, 1.0);
    let alphaCore = memD === 2 ? 0.88 - chaos * 0.04 : 0.5 - chaos * 0.06;
    if (focusedZone === 6 && memD === 2) {
      alphaCore = constrain(alphaCore + 0.09, 0.55, 0.96);
    }
    let mouseBoost = 0;
    if (typeof mouseX === "number" && typeof mouseY === "number") {
      let md = dist(mouseX, mouseY, curX + dx, baseY + dy);
      mouseBoost = constrain(map(md, width * 0.3, width * 0.085, 0, 0.22), 0, 0.22);
    }
    let alphaMain = constrain(
      fadeA * oldFade * alphaCore,
      mot < 0.35 ? 0.09 : 0.02,
      0.78
    );
    alphaMain = constrain(alphaMain + mouseBoost, 0.02, 0.9);
    fill(fr, fg, fb, alphaMain * 255);
    text(ch, curX + dx, baseY + dy);
    curX += cw;
  }

  textStyle(NORMAL);
}

function getDeepHoldCinematicText(zone) {
  if (zone === 2) {
    return "kas \u010dia";
  }
  if (zone === 3) {
    return "Lengviau. Paleid\u017eiu.";
  }
  if (zone === 4) {
    return "Per arti. Jau\u010diu visk\u0105.";
  }
  if (zone === 5) {
    return "Sprogstu tyliai.";
  }
  if (zone === 6) {
    return "Pilna.";
  }
  if (zone === 7) {
    return getDeepMemoryPhraseForZone(7, getDeepZoneMemoryDepth(7));
  }
  if (zone === 8) {
    return "Mano riba.";
  }
  return "";
}

function drawDeepHoldCinematicText() {
  if (focusedZone < 1 || focusedZone > 8) {
    return;
  }
  if (focusedZone === 8) {
    return;
  }
  if (isDeepMemoryTreeZone(focusedZone)) {
    return;
  }
  if (focusedZone === 2) {
    return;
  }
  let state = ensureDeepZoneCinematicState(focusedZone);
  if (!state.shown || !state.text) {
    return;
  }
  let depthMadness = getDeepChaosLevel(focusedZone);
  let entries = max(1, deepZoneEntryCount[focusedZone] || 1);
  let reentryBoost = (entries - 1) * 0.22;
  let textGlitch = depthMadness + reentryBoost;
  let dwell = getDeepDwellSeconds();
  let dwellDistort = constrain((dwell - 5) / 12, 0, 0.6);
  let zoneTint = getDeepZoneTextColor(focusedZone);
  let a = 200;
  let yShift = 0;
  let mot =
    typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
  let jitterBase = 1.2 + (textGlitch * 12 + dwellDistort * 6) * mot;
  let align = state.align || "center";
  let boxMargin = min(44, max(18, width * 0.035));
  let tw = min(width * state.wNorm, width - boxMargin * 2);
  let impSeed = (focusedZone * 71 + 37) % 97;
  let organicDriftX = sin(millis() * 0.0003 * mot + impSeed) * (1.5 + dwellDistort * 3) * mot;
  let organicDriftY = cos(millis() * 0.00025 * mot + impSeed * 1.3) * (1.0 + dwellDistort * 2) * mot;
  let cx =
    width * state.xNorm +
    sin(frameCount * (0.013 + textGlitch * 0.05 * mot) + focusedZone) * jitterBase +
    organicDriftX;
  let cy =
    height * state.yNorm +
    cos(frameCount * (0.011 + textGlitch * 0.045 * mot) + focusedZone) * jitterBase +
    organicDriftY;
  cy = constrain(cy, height * 0.2, height * 0.76);
  cx = constrain(cx, boxMargin + tw * 0.5, width - boxMargin - tw * 0.5);
  let xLeft = cx - tw * 0.5;
  if (align === "left") {
    xLeft = constrain(cx - tw * 0.36, boxMargin, width - boxMargin - tw);
  } else if (align === "right") {
    xLeft = constrain(cx - tw * 0.64, boxMargin, width - boxMargin - tw);
  } else {
    xLeft = constrain(xLeft, boxMargin, width - boxMargin - tw);
  }
  let tsBase = min(40, max(28, width * 0.028)) * state.scale;
  let ts = tsBase + sin(millis() * 0.0015 * mot + focusedZone) * 1.2 * mot;
  let drawText = state.text;
  let totalGlitch = textGlitch + dwellDistort * 0.8;
  let allowTextGlitch = mot > 0.32;
  if (
    allowTextGlitch &&
    totalGlitch > 0.16 &&
    frameCount % max(2, floor(7 - totalGlitch * 5)) === 0
  ) {
    drawText = distortCrypticText(drawText, totalGlitch * 0.95);
  }
  if (
    allowTextGlitch &&
    entries > 1 &&
    frameCount % max(2, floor(6 - totalGlitch * 4)) === 0
  ) {
    drawText = distortCrypticText(drawText, totalGlitch * 1.12);
  }

  textAlign(LEFT, CENTER);
  setDeepCaptionFont();
  textStyle(NORMAL);
  textSize(ts);
  textLeading(ts * (typeof DEEP_POETIC_LEADING_MULT === "number" ? DEEP_POETIC_LEADING_MULT : 1.2));

  noStroke();
  fill(zoneTint[0], zoneTint[1], zoneTint[2], a * 0.2);
  text(
    drawText,
    xLeft + 2,
    cy + yShift + 2,
    tw,
    height * 0.5
  );

  fill(
    lerp(zoneTint[0], 255, 0.35),
    lerp(zoneTint[1], 255, 0.35),
    lerp(zoneTint[2], 255, 0.35),
    min(a, 220)
  );
  text(
    drawText,
    xLeft,
    cy + yShift,
    tw,
    height * 0.5
  );
  textStyle(NORMAL);
}

function ensureDeepZoneCinematicState(zone) {
  if (zone < 1 || zone > 8) {
    return { shown: false, text: "", xNorm: 0.5, yNorm: 0.56, wNorm: 0.64, align: "center", style: 0, scale: 1 };
  }
  if (!deepZoneCinematicState[zone]) {
    let seed = (deepZoneSeeds[zone] || zone * 997) + 2047;
    randomSeed(seed);
    let anchor = getDeepZoneTextAnchor(zone);
    let jitterX = random(-0.03, 0.03);
    let jitterY = random(-0.03, 0.03);
    deepZoneCinematicState[zone] = {
      shown: false,
      text: "",
      xNorm: constrain(anchor.xNorm + jitterX, 0.18, 0.82),
      yNorm: constrain(anchor.yNorm + jitterY, 0.24, 0.78),
      wNorm: anchor.wNorm,
      align: anchor.align,
      style: floor(random(0, 3)),
      scale: random(0.93, 1.08)
    };
  }
  return deepZoneCinematicState[zone];
}

function getDeepZoneTextAnchor(zone) {
  // Zone-specific composition anchors so text sits near local branch character.
  if (zone === 2) {
    return { xNorm: 0.5, yNorm: 0.36, wNorm: 0.56, align: "center" };
  }
  if (zone === 3) {
    return { xNorm: 0.29, yNorm: 0.59, wNorm: 0.34, align: "left" };
  }
  if (zone === 4) {
    return { xNorm: 0.74, yNorm: 0.5, wNorm: 0.32, align: "right" };
  }
  if (zone === 5) {
    return { xNorm: 0.78, yNorm: 0.66, wNorm: 0.32, align: "right" };
  }
  if (zone === 6) {
    return { xNorm: 0.72, yNorm: 0.44, wNorm: 0.34, align: "right" };
  }
  if (zone === 7) {
    return { xNorm: 0.27, yNorm: 0.47, wNorm: 0.34, align: "left" };
  }
  if (zone === 8) {
    return { xNorm: 0.3, yNorm: 0.66, wNorm: 0.34, align: "left" };
  }
  return { xNorm: 0.5, yNorm: 0.56, wNorm: 0.56, align: "center" };
}

function getDeepChaosLevel(zone) {
  if (zone < 1 || zone > 8) {
    return 0;
  }
  let entries = max(1, deepZoneEntryCount[zone] || 1);
  let baseChaos = 0.34;
  let growth = (entries - 1) * 0.16;
  let c = baseChaos + growth;
  if (typeof getZonePersonality === "function") {
    c *= getZonePersonality(zone).deepChaosMul;
  }
  return constrain(c, 0, 1.4);
}

function distortCrypticText(txt, level) {
  let arr = txt.split("");
  let glyphs = ["#", "/", "?", "_", "=", ":", "0", "1", "X"];
  let chance = 0.04 + level * 0.12;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === "\n" || arr[i] === " ") {
      continue;
    }
    if (random() < chance) {
      arr[i] = glyphs[floor(random(glyphs.length))];
    }
  }
  return arr.join("");
}

function getDeepPyktisCtaTypography() {
  let m = typeof DEEP_ZONE_PYKTIS !== "undefined" ? DEEP_ZONE_PYKTIS : null;
  let tp = m && m.ctaTypography ? m.ctaTypography : {};
  return {
    letterSpacingEmIdle:
      typeof tp.letterSpacingEmIdle === "number" ? tp.letterSpacingEmIdle : 0.1,
    letterSpacingEmOver:
      typeof tp.letterSpacingEmOver === "number" ? tp.letterSpacingEmOver : 0.032,
    wordSpacingEmIdle:
      typeof tp.wordSpacingEmIdle === "number" ? tp.wordSpacingEmIdle : 0.045
  };
}

function getDeepPyktisLabelGlitchConfig() {
  let m = typeof DEEP_ZONE_PYKTIS !== "undefined" ? DEEP_ZONE_PYKTIS : null;
  let lg = m && m.labelGlitch ? m.labelGlitch : {};
  return {
    distortEvery: max(
      3,
      (typeof lg.distortEvery === "number" ? lg.distortEvery : 11) | 0
    ),
    distortLevel: typeof lg.distortLevel === "number" ? lg.distortLevel : 0.18
  };
}

function measureDeepPyktisCtaTextWidth(str) {
  let ctxM = typeof drawingContext !== "undefined" ? drawingContext : null;
  let tp = getDeepPyktisCtaTypography();
  if (ctxM) {
    if (typeof ctxM.letterSpacing !== "undefined") {
      ctxM.letterSpacing = tp.letterSpacingEmIdle + "em";
    }
    if (typeof ctxM.wordSpacing !== "undefined") {
      ctxM.wordSpacing = tp.wordSpacingEmIdle + "em";
    }
  }
  let w = textWidth(str);
  if (ctxM) {
    if (typeof ctxM.letterSpacing !== "undefined") {
      ctxM.letterSpacing = "0px";
    }
    if (typeof ctxM.wordSpacing !== "undefined") {
      ctxM.wordSpacing = "0px";
    }
  }
  return w;
}

function buildDeepPyktisCtaDrawLabel(baseStr, over) {
  let lg = getDeepPyktisLabelGlitchConfig();
  let every = lg.distortEvery;
  let baseD = lg.distortLevel;
  let g = 0.5 + 0.5 * sin(millis() * 0.07 + frameCount * 0.13);
  let label = baseStr;
  if (typeof distortCrypticText === "function") {
    let d = baseD + g * (over ? 0.22 : 0.38);
    if (frameCount % every === 0) {
      label = distortCrypticText(label, d);
    }
  }
  return label;
}

function applyDeepPyktisCtaCanvasSpacing(ctx, over) {
  if (!ctx) {
    return;
  }
  let tp = getDeepPyktisCtaTypography();
  if (typeof ctx.letterSpacing !== "undefined") {
    ctx.letterSpacing = (over ? tp.letterSpacingEmOver : tp.letterSpacingEmIdle) + "em";
  }
  if (typeof ctx.wordSpacing !== "undefined") {
    ctx.wordSpacing = (over ? "0.015em" : tp.wordSpacingEmIdle) + "em";
  }
}

/** Švelnesnė „terminalo“ iškraipymo logika (SISTEMA / SUGADINTA) — mažiau „0/4“ artefaktų. */
function distortSystemLabelText(txt, level) {
  let arr = txt.split("");
  let glyphs = ["#", "/", "?", "_", "=", "\\", "|", ":", "*", "^", "X"];
  let chance = 0.02 + level * 0.055;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === "\n" || arr[i] === " ") {
      continue;
    }
    if (random() < chance) {
      arr[i] = glyphs[floor(random(glyphs.length))];
    }
  }
  return arr.join("");
}

function drawDeepBackLink() {
  let z = typeof focusedZone === "number" ? focusedZone : 1;
  z = constrain(z, 1, 8);
  let zt = getDeepZoneTextColor(z);
  let over = isOverDeepBackLink(mouseX, mouseY);

  let label = "gr\u012f\u017eti";
  let pyktisIntegrated = z === 8 && typeof DEEP_ZONE_PYKTIS !== "undefined";
  let memoryIntegrated = isDeepMemoryTreeZone(z);

  if (pyktisIntegrated || memoryIntegrated) {
    let accent = pyktisIntegrated
      ? DEEP_ZONE_PYKTIS.accent || [178, 72, 88]
      : [zt[0], zt[1], zt[2]];
    let cx = width * 0.062;
    let cy = height * 0.938;

    /* Drama fazė 1 — „grįžti“ be šaukimo. */
    if (
      memoryIntegrated &&
      z === 5 &&
      typeof getDeepZoneMemoryDepth === "function" &&
      getDeepZoneMemoryDepth(5) === 1
    ) {
      setDeepCaptionFont();
      textStyle(NORMAL);
      textSize(13);
      textAlign(LEFT, BASELINE);
      noStroke();
      let ctxDr = typeof drawingContext !== "undefined" ? drawingContext : null;
      if (ctxDr) {
        ctxDr.save();
        ctxDr.shadowBlur = over ? 10 : 6;
        ctxDr.shadowColor = "rgba(245, 225, 220," + (over ? "0.34" : "0.22") + ")";
      }
      fill(186, 168, 162, over ? 132 : 112);
      text(label, cx, cy);
      if (ctxDr) {
        ctxDr.restore();
      }
      let twDr = textWidth(label);
      let lhDr = textAscent() + textDescent();
      _deepBackLinkHit = {
        l: cx - 10,
        t: cy - lhDr - 8,
        r: cx + twDr + 16,
        b: cy + 8
      };
      return;
    }

    /* Inter — „Sugrįžti“ ir kt. UI ant gylio. */
    setDeepCaptionFont();
    textStyle(NORMAL);
    let _ts = min(14.5, max(11.2, width * 0.027));
    if (z === 8) {
      _ts = min(17.2, max(13.8, width * 0.034));
    }
    textSize(_ts);
    textAlign(LEFT, BASELINE);
    let mot =
      typeof getDeepCanvasMotionFactor === "function" ? getDeepCanvasMotionFactor() : 1;
    let _breathA = over
      ? 0.62
      : max(0.26, 0.2 + 0.09 * sin(millis() * 0.00038 * mot) * mot);
    if (z === 5) {
      _breathA = over
        ? 0.74
        : max(0.46, 0.4 + 0.11 * sin(millis() * 0.00038 * mot) * mot);
    }
    if (z === 8) {
      _breathA = over
        ? 0.9
        : max(0.62, 0.54 + 0.1 * sin(millis() * 0.00038 * mot) * mot);
    }
    noStroke();
    let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
    if (ctx) {
      ctx.save();
      if (z === 8) {
        applyDeepPyktisCtaCanvasSpacing(ctx, over);
      } else {
        /* letterSpacing iš kito sluoksnio palieka tarpą po kiekvienos raidės — tarp į ir ž atrodo kaip „skylė“. */
        ctx.letterSpacing = "0px";
        if (typeof ctx.wordSpacing !== "undefined") {
          ctx.wordSpacing = "0px";
        }
      }
      ctx.shadowBlur = over
        ? z === 8
          ? 22
          : z === 5
            ? 16
            : 12
        : z === 8
          ? 14 + (1 - mot) * 5
          : z === 5
            ? 9
            : 5 + (1 - mot) * 4;
      ctx.shadowColor =
        z === 8
          ? over
            ? "rgba(0,0,0,0.5)"
            : "rgba(0,0,0," + (0.28 + (1 - mot) * 0.12) + ")"
          : "rgba(" +
            floor(lerp(accent[0], 22, 0.52)) +
            "," +
            floor(lerp(accent[1], 20, 0.52)) +
            "," +
            floor(lerp(accent[2], 30, 0.52)) +
            "," +
            (over ? (z === 5 ? 0.46 : 0.36) : (z === 5 ? 0.22 : 0.12) + (1 - mot) * 0.1) +
            ")";
    }
    noStroke();
    if (z === 5) {
      fill(
        lerp(accent[0], 238, 0.48),
        lerp(accent[1], 228, 0.48),
        lerp(accent[2], 224, 0.46),
        255 * _breathA
      );
    } else if (z === 8) {
      fill(
        lerp(accent[0], 255, 0.42),
        lerp(accent[1], 244, 0.38),
        lerp(accent[2], 246, 0.36),
        255 * _breathA
      );
    } else {
      fill(
        lerp(accent[0], 218, 0.36),
        lerp(accent[1], 214, 0.36),
        lerp(accent[2], 222, 0.34),
        255 * _breathA
      );
    }
    let labelDraw = z === 8 ? buildDeepPyktisCtaDrawLabel(label, over) : label;
    let txL = cx;
    let tyL = cy;
    if (z === 8) {
      let g = 0.5 + 0.5 * sin(millis() * 0.07 + frameCount * 0.13);
      let jx = (noise(frameCount * 0.11) - 0.5) * 3.2;
      let jy = (noise(frameCount * 0.15 + 50) - 0.5) * 1.8;
      txL = cx + jx;
      tyL = cy + jy;
      blendMode(ADD);
      fill(255, 88, 118, (10 + 14 * g) * (over ? 1.15 : 1));
      text(labelDraw, txL - 2 - jx * 0.3, tyL + 0.6);
      fill(90, 210, 255, (9 + 12 * g) * (over ? 1.08 : 0.92));
      text(labelDraw, txL + 2 + jx * 0.3, tyL - 0.6);
      blendMode(BLEND);
    }
    text(labelDraw, txL, tyL);
    if (ctx) {
      ctx.restore();
    }
    let tw = z === 8 ? measureDeepPyktisCtaTextWidth(label) : textWidth(label);
    let lh = textAscent() + textDescent();
    _deepBackLinkHit = {
      l: cx - 10,
      t: cy - lh - 8,
      r: cx + tw + 16,
      b: cy + 8
    };
    return;
  }

  setDeepCaptionFont();
  textSize(
    typeof treeSansUiTextSizePx === "function"
      ? treeSansUiTextSizePx()
      : max(9.5, min(11, width * 0.028))
  );
  let baseA = over ? 0.26 : 0.09;
  let tMix = over ? 0.38 : 0.16;
  let r = lerp(zt[0], 88, tMix);
  let g = lerp(zt[1], 88, tMix);
  let b = lerp(zt[2], 90, tMix);
  if (over) {
    r = lerp(r, 180, 0.18);
    g = lerp(g, 180, 0.18);
    b = lerp(b, 185, 0.16);
  }

  let x = max(20, min(36, width * 0.055));
  let cy = max(30, min(40, height * 0.052));
  textAlign(LEFT, CENTER);
  noStroke();
  let ctxDef = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctxDef) {
    ctxDef.save();
    ctxDef.letterSpacing = "0px";
    if (typeof ctxDef.wordSpacing !== "undefined") {
      ctxDef.wordSpacing = "0px";
    }
  }
  fill(r, g, b, 255 * baseA);
  text(label, x, cy);
  if (ctxDef) {
    ctxDef.restore();
  }

  let tw = textWidth(label);
  let h = textAscent() + textDescent();
  _deepBackLinkHit = {
    l: x - 8,
    t: cy - h * 0.5 - 8,
    r: x + tw + 8,
    b: cy + h * 0.5 + 8
  };
}

function isOverDeepBackLink(px, py) {
  if (_deepBackLinkHit) {
    return (
      px >= _deepBackLinkHit.l &&
      px <= _deepBackLinkHit.r &&
      py >= _deepBackLinkHit.t &&
      py <= _deepBackLinkHit.b
    );
  }
  if (
    typeof focusedZone === "number" &&
    (focusedZone === 8 || isDeepMemoryTreeZone(focusedZone))
  ) {
    let bx = typeof width === "number" ? width * 0.062 : 0;
    let by = typeof height === "number" ? height * 0.938 : 0;
    return (
      px >= bx - 10 &&
      px <= bx + 110 &&
      py >= by - 30 &&
      py <= by + 12
    );
  }
  return px >= 8 && px <= 140 && py >= 14 && py <= 52;
}

function drawBackButton() {
  if (typeof focusedZone === "number" && focusedZone === 2) {
    if (typeof getAsDeepShowSulauzyk === "function" && getAsDeepShowSulauzyk()) {
      let over = isOverBackButton(mouseX, mouseY);
      let L = getAsDeepSulauzykLayout();
      drawAsDeepSulauzykInteractiveText(L, over);
    }
    return;
  }
  // Pyktis: no grįžti button — the zone ejects you when it's ready.
  if (typeof focusedZone === "number" && focusedZone === 8) {
    return;
  }
  if (typeof drawDeepBackLink === "function") {
    drawDeepBackLink();
  }
}

function isOverBackButton(px, py) {
  if (typeof focusedZone === "number" && focusedZone === 2) {
    if (typeof getAsDeepShowSulauzyk === "function" && getAsDeepShowSulauzyk()) {
      let b = getAsDeepSulauzykPlateBounds();
      return px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h;
    }
    return false;
  }
  if (typeof isOverDeepBackLink === "function") {
    return isOverDeepBackLink(px, py);
  }
  return false;
}

function handleBackButtonClick(mx, my) {
  if (!isOverBackButton(mx, my)) {
    return false;
  }
  if (typeof focusedZone === "number" && focusedZone === 2) {
    if (typeof getAsDeepShowSulauzyk === "function" && getAsDeepShowSulauzyk()) {
      if (typeof startAsBreakSequence === "function") {
        startAsBreakSequence();
      }
      return true;
    }
    return false;
  }
  if (typeof exitDeepMode === "function") {
    exitDeepMode();
  }
  return true;
}

// --- Deep tree renderer (ported from BAKIO DARBAS/js/*.js) ---
function treeMaker(len) {
  push();
  let em =
    typeof focusedZone !== "undefined" &&
    isDeepMemoryTreeZone(focusedZone) &&
    typeof currentView !== "undefined" &&
    currentView === "deep"
      ? constrain(typeof deepTreeMemoryDepth === "number" ? deepTreeMemoryDepth : 1, 1, 2)
      : 0;
  let em7g =
    em && focusedZone === 7 && em === 2
      ? constrain(
          typeof _deepEmpatijaTreeVisualGrowth01 === "number" ? _deepEmpatijaTreeVisualGrowth01 : 0,
          0,
          1
        )
      : 0;
  let emJX = em === 1 ? 0.32 : 0.78;
  let forkProb = em === 1 ? 0.0018 : 0.0036;
  let stickBurstProb = em === 1 ? 0.002 : 0.0038;
  let stickSproutProb = em === 1 ? 0.007 : 0.012;
  let nextLenMul = em === 1 ? 0.88 : 0.79;

  if (em && focusedZone === 5) {
    if (em === 1) {
      /* Fazė 1: šiek tiek švelniau nei anksčiau — mažiau šakų / „sprogimų“ per kadrą. */
      forkProb *= 2.35;
      stickBurstProb *= 1.72;
      stickSproutProb *= 1.62;
      nextLenMul = min(nextLenMul * 0.97, 0.79);
    } else {
      forkProb *= 1.22;
      stickBurstProb *= 1.08;
      stickSproutProb *= 1.06;
      nextLenMul = min(nextLenMul * 1.04, 0.84);
      emJX = min(emJX * 1.22, 1.18);
    }
  } else if (em && focusedZone === 4) {
    if (em === 2) {
      forkProb *= 1.04;
      stickBurstProb *= 1.02;
      stickSproutProb *= 1.06;
      nextLenMul = min(nextLenMul * 1.02, 0.81);
    } else {
      forkProb *= 2.75;
      stickBurstProb *= 2.05;
      stickSproutProb *= 1.92;
      nextLenMul = min(nextLenMul * 0.97, 0.81);
    }
  } else if (em && focusedZone === 6) {
    forkProb *= em === 2 ? 0.82 : 0.88;
    stickBurstProb *= em === 2 ? 0.84 : 0.9;
    stickSproutProb *= em === 2 ? 1.06 : 1;
    if (em === 2) {
      nextLenMul = min(nextLenMul * 1.04, 0.86);
      emJX *= 0.82;
    }
  } else if (em && focusedZone === 3) {
    forkProb *= 1.12;
    stickSproutProb *= 1.22;
  } else if (em && focusedZone === 7) {
    forkProb *= 0.78;
    stickBurstProb *= 0.88;
    nextLenMul = min(nextLenMul * 1.06, 0.86);
    if (em === 2) {
      forkProb *= lerp(1.02, 0.78, em7g);
      stickSproutProb *= lerp(1.02, 0.84, em7g);
      nextLenMul = min(nextLenMul * lerp(1.01, 1.03, em7g), 0.88);
      emJX *= lerp(1.04, 1.28, em7g);
    }
  }

  let wing =
    em && typeof deepTreeWing === "string" ? deepTreeWing : "single";
  if (em && wing === "right") {
    if (focusedZone === 7 && em === 2) {
      forkProb *= lerp(0.84, 0.72, em7g);
      stickBurstProb *= lerp(0.8, 0.68, em7g);
      stickSproutProb *= lerp(0.82, 0.7, em7g);
      nextLenMul = min(nextLenMul, lerp(0.88, 0.84, em7g));
      emJX *= lerp(0.88, 0.96, em7g);
    } else {
      forkProb *= 0.52;
      stickBurstProb *= 0.42;
      stickSproutProb *= 0.45;
      nextLenMul = min(nextLenMul, 0.83);
      emJX *= 0.68;
    }
  } else if (em && wing === "left") {
    emJX *= 0.9;
    if (focusedZone === 7 && em === 2) {
      emJX *= lerp(1.03, 1.16, em7g);
    }
  }

  let theta = random(-PI * 0.2, PI * 0.2);
  if (em === 1) {
    if (focusedZone === 4 || focusedZone === 5) {
      theta = random(-PI * 0.11, PI * 0.17);
    } else {
      theta = random(-PI * 0.05, PI * 0.12);
    }
  } else {
    theta = random(-PI * 0.11, PI * 0.11);
    if (focusedZone === 5 && em === 2) {
      theta = random(-PI * 0.26, PI * 0.26);
    }
    if (focusedZone === 7 && em === 2) {
      let tSide = lerp(0.11, 0.2, em7g);
      theta = random(-PI * tSide, PI * tSide);
    }
  }
  /* Atminties zonos (3–7) gilyje: truputį daugiau į šonus (visoms vienodai). */
  if (em) {
    let jxCap = focusedZone === 5 && em === 2 ? 1.38 : 1.12;
    emJX = min(emJX * 1.1, jxCap);
    if (em === 1 && (focusedZone === 4 || focusedZone === 5)) {
      emJX = min(emJX * 1.28, jxCap);
    }
    if (focusedZone === 5 && em === 2) {
      theta += random(-PI * 0.055, PI * 0.055);
      theta = constrain(theta, -PI * 0.52, PI * 0.52);
    } else {
      theta += random(-PI * 0.02, PI * 0.02);
      theta = constrain(theta, -PI * 0.42, PI * 0.42);
    }
  }
  if (em && focusedZone === 7 && em === 2 && wing === "left") {
    theta -= PI * lerp(0.04, 0.14, em7g);
    theta = constrain(theta, -PI * 0.5, PI * 0.44);
  }
  if (em && focusedZone === 7 && em === 2 && wing === "right") {
    theta += PI * lerp(0.046, 0.14, em7g);
    theta = constrain(theta, -PI * 0.44, PI * 0.5);
  }

  if (len < tmaxLen) {
    if (em && focusedZone === 6 && em === 2) {
      let loveWave =
        sin(frameCount * 0.022 + len * 0.055) * 0.038 +
        cos(frameCount * 0.016 + len * 0.031) * 0.02;
      theta += loveWave;
      theta = constrain(theta, -PI * 0.36, PI * 0.36);
    }
    if (em && focusedZone === 7 && em === 2) {
      let tw = constrain(em7g, 0, 1);
      let tornadoRot =
        sin(frameCount * (0.052 + tw * 0.03) + len * 0.07) *
        lerp(0.05, 0.18, tw);
      let tornadoKick = frameCount % 7 < 2 ? random(-0.08, 0.08) * (0.3 + tw) : 0;
      theta += tornadoRot + tornadoKick;
      theta = constrain(theta, -PI * 0.64, PI * 0.64);
    }
    rotate(theta);
  } else if (em === 1) {
    rotate(PI * 0.075 + random(-0.07, 0.07));
  } else {
    rotate(random(-PI * 0.12, PI * 0.12));
  }

  let sw = em
    ? map(len, tminLen, tmaxLen, 2.1, 8.2)
    : map(len, tminLen, tmaxLen, 3, 12);
  let trunkStroke = em ? 1.05 : 2;

  let dramaSegJ =
    em && focusedZone === 5 && em === 2 ? 0.22 : 0.12;
  let dramaTornado = em && focusedZone === 7 && em === 2;
  let loveSoftFlow = em && focusedZone === 6 && em === 2;
  let tornadoU = dramaTornado ? constrain(em7g, 0, 1) : 0;
  if (dramaTornado) {
    dramaSegJ = lerp(dramaSegJ * 1.4, dramaSegJ * 2.5, tornadoU);
  } else if (loveSoftFlow) {
    dramaSegJ *= 0.64;
  }

  for (let y = 0; y < len * 1.05; y++) {
    let x = map(y, 0, len, sw, sw * 0.8);
    let col = map(x, 12, 3, 255, 75);
    colKeep = col;

    push();
    let baseJx = random(-x * dramaSegJ, x * dramaSegJ) * emJX;
    let tJx = 0;
    let tJy = 0;
    if (dramaTornado) {
      /* Drama 2 fazė: „tornado“ trūkčiojimas ir šuoliai aplink kamieną. */
      let ty = y * 0.09 + frameCount * (0.082 + 0.038 * tornadoU);
      let swirl = sin(ty) * x * lerp(0.4, 1.15, tornadoU);
      let chop = (noise(y * 0.05 + frameCount * 0.16, x * 0.07) - 0.5) * x * lerp(0.9, 2.4, tornadoU);
      let kick = frameCount % 5 < 2 ? random(-x * 0.95, x * 0.95) * (0.2 + 0.6 * tornadoU) : 0;
      tJx = (swirl + chop + kick) * emJX;
      tJy = (noise(y * 0.04 + frameCount * 0.2, 13.7) - 0.5) * lerp(1.4, 6.6, tornadoU);
    } else if (loveSoftFlow) {
      let flowT = y * 0.082 + frameCount * 0.032;
      let sway = sin(flowT) * x * 0.36 + cos(flowT * 0.62) * x * 0.14;
      let hush = (noise(y * 0.042, frameCount * 0.028) - 0.5) * x * 0.22;
      tJx = (sway + hush) * emJX;
      tJy = sin(flowT * 0.58 + 1.2) * 1.4;
    }
    translate(baseJx + tJx, -y + tJy);

    if (deepMemorySkipBranchJointForNoText(x)) {
      pop();
      continue;
    }

    strokeWeight(trunkStroke);

    stroke(
      lerp(col, deepBarkAccent[0], 0.25),
      lerp(col, deepBarkAccent[1], 0.25),
      lerp(col, deepBarkAccent[2], 0.25),
      255
    );

    if (random() < 0.05) {
      stroke(
        deepBarkAccent[0],
        deepBarkAccent[1],
        deepBarkAccent[2],
        random(120, 210)
      );
    }

    line(-x, 0, -x * 0.1, 0);

    stroke(
      lerp(col * 0.75, deepBarkAccent[0], 0.22),
      lerp(col * 0.75, deepBarkAccent[1], 0.22),
      lerp(col * 0.75, deepBarkAccent[2], 0.22),
      255
    );

    if (random() < 0.1) {
      stroke(
        deepBarkAccent[0] * 0.85,
        deepBarkAccent[1] * 0.85,
        deepBarkAccent[2] * 0.85,
        random(95, 185)
      );
    }

    line(-x * 0.1, 0, x * 0.32, 0);

    stroke(
      lerp(col * 0.5, deepBarkAccent[0], 0.18),
      lerp(col * 0.5, deepBarkAccent[1], 0.18),
      lerp(col * 0.5, deepBarkAccent[2], 0.18),
      255
    );

    if (random() < 0.2) {
      stroke(
        deepBarkAccent[0] * 0.7,
        deepBarkAccent[1] * 0.7,
        deepBarkAccent[2] * 0.7,
        random(75, 160)
      );
    }

    line(x * 0.32, 0, x, 0);

    if (random() < forkProb) {
      push();
      translate(0, 0);
      let thetaB = random(-PI * 0.14, PI * 0.14);
      if (em) {
        thetaB += random(-PI * 0.028, PI * 0.028);
        thetaB = constrain(thetaB, -PI * 0.24, PI * 0.24);
      }
      rotate(thetaB);
      let swB = sw;
      strokeWeight(trunkStroke);

      for (let yB = 0; yB < len * 1.05; yB++) {
        let xB = map(yB, 0, len, swB, swB * 0.8);
        let colB = map(xB, 12, 3, 255, 75);
        colKeep = colB;

        push();
        let baseJxB = random(-xB * dramaSegJ, xB * dramaSegJ) * emJX;
        let tJxB = 0;
        let tJyB = 0;
        if (dramaTornado) {
          let tyB = yB * 0.11 + frameCount * (0.088 + 0.04 * tornadoU);
          let swirlB = sin(tyB) * xB * lerp(0.42, 1.2, tornadoU);
          let chopB =
            (noise(yB * 0.06 + frameCount * 0.18, xB * 0.08 + 5.2) - 0.5) *
            xB *
            lerp(0.95, 2.55, tornadoU);
          let kickB =
            frameCount % 6 < 2
              ? random(-xB, xB) * (0.2 + 0.62 * tornadoU)
              : 0;
          tJxB = (swirlB + chopB + kickB) * emJX;
          tJyB =
            (noise(yB * 0.05 + frameCount * 0.22, 17.1) - 0.5) *
            lerp(1.5, 7.2, tornadoU);
        } else if (loveSoftFlow) {
          let flowTB = yB * 0.09 + frameCount * 0.034;
          let swayB = sin(flowTB) * xB * 0.38 + cos(flowTB * 0.6 + 0.9) * xB * 0.16;
          let hushB = (noise(yB * 0.046, frameCount * 0.03 + 3.2) - 0.5) * xB * 0.24;
          tJxB = (swayB + hushB) * emJX;
          tJyB = sin(flowTB * 0.62 + 0.8) * 1.55;
        }
        translate(baseJxB + tJxB, -yB + tJyB);

        if (deepMemorySkipBranchJointForNoText(xB)) {
          pop();
          continue;
        }

        stroke(
          lerp(colB, deepBarkAccent[0], 0.25),
          lerp(colB, deepBarkAccent[1], 0.25),
          lerp(colB, deepBarkAccent[2], 0.25),
          255
        );

        if (random() < 0.05) {
          stroke(
            deepBarkAccent[0],
            deepBarkAccent[1],
            deepBarkAccent[2],
            random(120, 210)
          );
        }

        line(-xB, 0, -xB * 0.1, 0);

        stroke(
          lerp(colB * 0.75, deepBarkAccent[0], 0.22),
          lerp(colB * 0.75, deepBarkAccent[1], 0.22),
          lerp(colB * 0.75, deepBarkAccent[2], 0.22),
          255
        );

        if (random() < 0.1) {
          stroke(
            deepBarkAccent[0] * 0.85,
            deepBarkAccent[1] * 0.85,
            deepBarkAccent[2] * 0.85,
            random(95, 185)
          );
        }

        line(-xB * 0.1, 0, xB * 0.32, 0);

        stroke(
          lerp(colB * 0.5, deepBarkAccent[0], 0.18),
          lerp(colB * 0.5, deepBarkAccent[1], 0.18),
          lerp(colB * 0.5, deepBarkAccent[2], 0.18),
          255
        );

        if (random() < 0.2) {
          stroke(
            deepBarkAccent[0] * 0.7,
            deepBarkAccent[1] * 0.7,
            deepBarkAccent[2] * 0.7,
            random(75, 160)
          );
        }

        line(xB * 0.32, 0, xB, 0);
        pop();
      }

      translate(0, -len);

      if (len > tminLen) {
        treeMaker(len * nextLenMul);
      }

      pop();
    }

    pop();

    if (random() < stickBurstProb && len < tmaxLen * 0.8) {
      for (let sn = 0; sn < 4; sn++) {
        push();
        translate(0, 0);
        rotate(random(TAU));
        stickMaker(smaxLen);
        pop();
      }
    }
  }

  translate(0, -len);

  if (len > tminLen) {
    treeMaker(len * nextLenMul);
  }

  if (random() < stickSproutProb && len < tmaxLen * 0.4) {
    for (let sn = 0; sn < 4; sn++) {
      push();
      translate(0, 0);
      rotate(random(TAU));
      stickMaker(smaxLen);
      pop();
    }
  }

  pop();
}

function stickMaker(len) {
  push();
  rotate(random(TAU));
  leafMaker(len);
  pop();

  push();
  translate(0, 0);
  let theta = random(-PI * 0.3, PI * 0.3);
  rotate(theta);
  let emStick =
    typeof focusedZone !== "undefined" &&
    isDeepMemoryTreeZone(focusedZone) &&
    typeof currentView !== "undefined" &&
    currentView === "deep";
  let sw = emStick
    ? map(len, sminLen, smaxLen, 0.7, 2.4)
    : map(len, sminLen, smaxLen, 1, 4);
  strokeWeight(sw);

  stroke(
    lerp(100, deepBarkAccent[0], 0.45),
    lerp(100, deepBarkAccent[1], 0.45),
    lerp(100, deepBarkAccent[2], 0.45),
    255
  );
  line(0, 0, 0, -len);

  stroke(
    lerp(25, deepBarkAccent[0], 0.25),
    lerp(25, deepBarkAccent[1], 0.25),
    lerp(25, deepBarkAccent[2], 0.25),
    255
  );
  line(sw * 0.75, sw * 0.75, sw * 0.75, sw * 0.75 - len);

  translate(0, -len);

  if (len > sminLen) {
    stickMaker(len * 0.7);
  }

  pop();
}

function leafMaker(len) {
  let leafDense = floor(random(1, 4));
  if (
    typeof focusedZone !== "undefined" &&
    isDeepMemoryTreeZone(focusedZone) &&
    typeof currentView !== "undefined" &&
    currentView === "deep"
  ) {
    let d = constrain(typeof deepTreeMemoryDepth === "number" ? deepTreeMemoryDepth : 1, 1, 2);
    let w = typeof deepTreeWing === "string" ? deepTreeWing : "single";
    if (w === "right") {
      if (d === 1) {
        leafDense = 0;
      } else {
        leafDense = floor(random(1, 2));
      }
    } else if (w === "left") {
      if (d === 1) {
        leafDense = floor(random(1, 2));
      } else {
        leafDense = floor(random(2, 4));
      }
    } else {
      if (d === 1) {
        leafDense = floor(random(1, 2));
      } else {
        leafDense = floor(random(2, 4));
      }
    }
  }

  for (let n = 0; n < leafDense; n++) {
    if (
      leafDrawCount >=
      (typeof getMaxLeavesPerFrame === "function"
        ? getMaxLeavesPerFrame()
        : typeof MAX_LEAVES_PER_FRAME === "number"
          ? MAX_LEAVES_PER_FRAME
          : 1300)
    ) {
      return;
    }

    let z = createVector(random(0.5, 1), random(0.25, 0.5));
    let pos = createVector(random(-1, 1), random(-1, 1));
    let m = random(len);
    pos.mult(m);

    let col = map(pos.y, -m, m, 1, 0);
    z.mult(sminLen * 1.5);

    let appearGate = random();
    let light = map(pos.x, -m, m, 1.16, 0.84);
    let depth = map(pos.y, -m, m, 1.12, 0.66);
    let tone = constrain(light * depth, 0.58, 1.2);

    let mixA = random();

    let cA = lerpColor(
      color(deepLeafA[0], deepLeafA[1], deepLeafA[2]),
      color(deepLeafB[0], deepLeafB[1], deepLeafB[2]),
      mixA
    );

    let cB = lerpColor(
      color(deepLeafB[0], deepLeafB[1], deepLeafB[2]),
      color(deepLeafA[0], deepLeafA[1], deepLeafA[2]),
      1 - mixA
    );

    let petalAlpha = 160 + 78 * tone;
    let emLeafVeinA = 150 + 58 * tone;
    if (
      typeof focusedZone !== "undefined" &&
      isDeepMemoryTreeZone(focusedZone) &&
      typeof currentView !== "undefined" &&
      currentView === "deep"
    ) {
      let w = typeof deepTreeWing === "string" ? deepTreeWing : "single";
      tone = constrain(tone * 0.76, 0.4, 0.95);
      petalAlpha *= w === "right" ? 0.34 : w === "left" ? 0.56 : 0.5;
      emLeafVeinA = (95 + 32 * tone) * (w === "right" ? 0.45 : w === "left" ? 0.62 : 0.52);
    }

    // Gate after consuming randomness, keeps branch structure stable.
    if (appearGate > growthProgress) {
      continue;
    }

    push();
    translate(pos.x, pos.y);
    if (
      typeof focusedZone !== "undefined" &&
      isDeepMemoryTreeZone(focusedZone) &&
      typeof currentView !== "undefined" &&
      currentView === "deep"
    ) {
      let o = deepMemoryScreenAtOrigin();
      if (deepMemoryPointHitsNoTextZone(o.x, o.y)) {
        pop();
        continue;
      }
    }

    beginShape();
    vertex(0, 0);
    bezierVertex(z.x, z.y, z.x, -z.y, -z.x, -z.y);
    fill(red(cA) * tone, green(cA) * tone, blue(cA) * tone, petalAlpha);
    stroke(deepVein[0], deepVein[1], deepVein[2], emLeafVeinA);
    strokeWeight(1);
    endShape();

    beginShape();
    vertex(0, 0);
    bezierVertex(z.x, z.y, -z.x, z.y, -z.x, -z.y);
    fill(
      red(cB) * tone * 0.95,
      green(cB) * tone * 0.95,
      blue(cB) * tone * 0.95,
      petalAlpha * 0.92
    );
    stroke(
      deepLeafA[0] * 0.95,
      deepLeafA[1] * 0.95,
      deepLeafA[2] * 0.95,
      isDeepMemoryTreeZone(focusedZone) && currentView === "deep"
        ? emLeafVeinA * 0.88
        : 145 + 52 * tone
    );
    strokeWeight(1);
    endShape();

    strokeWeight(1);
    stroke(
      deepVein[0],
      deepVein[1],
      deepVein[2],
      isDeepMemoryTreeZone(focusedZone) && currentView === "deep"
        ? emLeafVeinA * 0.75
        : 160
    );
    line(-z.x * 0.55, -z.y * 0.55, z.x * 0.25, z.y * 0.25);

    noStroke();
    fill(
      deepCore[0],
      deepCore[1],
      deepCore[2],
      (isDeepMemoryTreeZone(focusedZone) && currentView === "deep" ? 38 : 75) * tone
    );
    ellipse(0, 0, z.x * 0.42, z.y * 0.42);

    pop();
    leafDrawCount++;
  }
}
