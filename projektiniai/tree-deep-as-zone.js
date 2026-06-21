/**
 * tree-deep-as-zone.js — „Aš“ gylio zona (self-contained). Kraunama prieš tree-deep.js.
 * Visas elgesys ir estetika: objektas AS_DEEP. Runtime: tree-deep, sketch-core.
 */

// =============================================================================
//  „Aš“ zona — centrinis config (logika + estetika). Keisk čia, ne išmėtytus skaičius.
// =============================================================================
const AS_DEEP = { ZONE_ID: 2 };

/** Laiko ašis: fazių trukmės, įkrova iki 4 + CTA, normalizuotos ribos 0…1. */
AS_DEEP.time = (function () {
  let p1 = 3200;
  let p2 = 6000;
  let after2 = 2200 + 2800;
  let load = p2 + after2;
  return {
    PHASE_1_MS: p1,
    PHASE_2_MS: p2,
    /** Po 2 fazės iki pilnos: sutampa su AS_BREAK_PHRASE_DELAY + DURATION (tree-effects-ui). */
    AFTER_PHASE_2_MS: after2,
    LOAD_MS: load,
    PHASE_1_END: p1 / load,
    PHASE_2_END: p2 / load
  };
})();

/** Centrinis tekstas + EKG: daugiau vertikalios „oro“ tarp antraštės, Nepergyvenk ir EKG. */
AS_DEEP.layout = {
  TREE_CENTER_X_FRAC: 0.5,
  TREE_CENTER_Y_FRAC: 0.5,
  HEADLINE_Y_FRAC: 0.31,
  PHRASE_Y_FRAC: 0.395,
  ECG_CENTER_Y_FRAC: 0.52
};

/** Raktiniai stringai. */
AS_DEEP.text = {
  SYS_HEADLINE: "SISTEMA SUGADINTA",
  NEPER_GYVENK: "Nepergyvenk, klaidos \u2013\ngyvenimo dalis"
};

/** Šriftų dydžiai (responsive). */
AS_DEEP.typography = {
  sysHeadline: { minPx: 28, maxPx: 86, widthFrac: 0.045 },
  nepergyvenk: { minPx: 13, maxPx: 22, widthFrac: 0.015 }
};

/**
 * EKG: neon signalas. HOLD_ESC hold’ui „escape“ skaičiuotuvui; STeps — segmentų tankis.
 * CHAOS hold — bendras su chaos multiplikatoriumi (ms normalizavimas).
 */
AS_DEEP.ekg = {
  wLineWidthFrac: 0.68,
  wLineMaxPx: 780,
  steps: 220,
  holdEscDiv: 260,
  holdChaosDiv: 220,
  glitchStartU: 0.72,
  oldBumpMixBase: 0.55
};

/**
 * Chaosas pagal fazę + laikymą: grindys pagal 1…4, spread, pelės amplifikacija.
 * Naudoja getAsDeepProgress() (ne tik discret phase).
 */
AS_DEEP.chaos = {
  phaseFloor: [0.4, 0.58, 0.76, 1],
  withinSpread: 0.28,
  holdBoost: 0.42,
  outMin: 0.32,
  outMax: 1.72
};

/** Medžio (EKG) linijos alfa 0…1 per fazių juostas — lerp getAsDeepTreeAlpha(). */
AS_DEEP.visual = {
  treeLineAlpha: [140 / 255, 118 / 255, 158 / 255, 200 / 255]
};

/** Vingiuotas rėmelis — tamsa kampuose / šonuose. */
AS_DEEP.atmosphere = {
  topHFrac: 0.12,
  topAlpha: 38,
  bottomYFrac: 0.86,
  bottomHFrac: 0.15,
  bottomAlpha: 52,
  sideWFrac: 0.045,
  sideAlpha: 22
};

/**
 * Chroma RGB glitch (3–4 fazė): stiprumas ir poslinkis priklauso nuo progress (tIn34),
 * o ne tik nuo discret ph.
 */
AS_DEEP.chromaGlitch = {
  phaseBoostMin: 1.35,
  phaseBoostMax: 1.95,
  pointerExtraMin: 0.25,
  pointerExtraMax: 0.45,
  shiftLerp: [4, 8, 3, 6]
};

/**
 * Datastream: stiprumas 3–4 fazių plote — minkštas s3 / s4 blend pagal tą patį p3.
 */
AS_DEEP.datastream = {
  s3PointerAdd: 0.22,
  s4PointerMul: 1,
  s4PointerMulSoft: 0.75
};

/** 1–2 fazė: kriptiniai žodžiai. */
AS_DEEP.cryptic = {
  words: ["VIDUS", "RIBA", "N\u0116RA", "KAITA"]
};

/**
 * CTA „sulaužyti“: klaidos fragmentas — fiksuotas kairysis apačios kampas, be „mygtuko“ rėmelio.
 */
AS_DEEP.cta = {
  label: "sulau\u017eyti",
  fontPx: 18,
  anchorXFrac: 0.16,
  anchorYFrac: 0.68,
  hitPad: 12,
  glitch: { rx: 1.1, amp: 0.22 },
  /** Retesnis, silpnesnis distort + platesnis tarp raidžių — „sugadinto“ juostos jausmas. */
  labelGlitch: { distortEvery: 11, distortLevel: 0.2, scanlineCount: 3 },
  typography: {
    letterSpacingEmIdle: 0.12,
    letterSpacingEmOver: 0.034,
    wordSpacingEmIdle: 0.05
  }
};

// --- Globalūs pavadinimai (kiti failai: tree-deep.js, tree-effects-ui) ---
const AS_PHASE_1_MS = AS_DEEP.time.PHASE_1_MS;
const AS_PHASE_2_MS = AS_DEEP.time.PHASE_2_MS;
const AS_PHASE_3_MS = AS_DEEP.time.PHASE_2_MS + AS_DEEP.time.AFTER_PHASE_2_MS;
const AS_DEEP_LOAD_MS = AS_DEEP.time.LOAD_MS;
const AS_PHASE_1_END = AS_DEEP.time.PHASE_1_END;
const AS_PHASE_2_END = AS_DEEP.time.PHASE_2_END;
const AS_DEEP_SYS_HEADLINE = AS_DEEP.text.SYS_HEADLINE;

function getAsDeepTreeCenterX() {
  return width * AS_DEEP.layout.TREE_CENTER_X_FRAC;
}

function getAsDeepTreeCenterY() {
  return height * AS_DEEP.layout.TREE_CENTER_Y_FRAC;
}

/**
 * 0…1 grynas įkrovos progresas (gylio trukmė) — fazių kietiems perėjimams nebūtinas;
 * naudok intensyvumui / ramp’ams, kai pakanka sklandaus kintamojo.
 */
function getAsDeepProgress() {
  let h = typeof asDeepLoadCommittedMs === "number" ? asDeepLoadCommittedMs : 0;
  return constrain(h / max(1, AS_DEEP_LOAD_MS), 0, 1);
}

/**
 * 0…1 minkšta gylio progresija tik „Aš“ zonoje; kitur 0.
 */
function getAsDeepLoadProgress() {
  if (focusedZone !== 2) {
    return 0;
  }
  return getAsDeepProgress();
}

function getAsDeepPhase() {
  if (focusedZone !== 2) {
    return 0;
  }
  let p = getAsDeepProgress();
  if (p < AS_PHASE_1_END) {
    return 1;
  }
  if (p < AS_PHASE_2_END) {
    return 2;
  }
  if (p < 1) {
    return 3;
  }
  return 4;
}

function getAsDeepShowSulauzyk() {
  return focusedZone === 2 && getAsDeepProgress() >= 1;
}

/**
 * Pilna įkrova — EKG ir glitch lieka „kulminacijoje“ be pelės; kol nepaspausta „Sulaužyti“.
 */
function getAsDeepVisualHoldLatch() {
  if (focusedZone !== 2 || typeof getAsDeepProgress !== "function") {
    return false;
  }
  return getAsDeepProgress() >= 0.998;
}

/**
 * Chaosas auga kiekvienoje fazėje ir su laikymu / progresu viduje fazės.
 * Naudojama EKG ir kitiems AS gylio efektams.
 */
function getAsDeepPhaseChaosMultiplier() {
  if (focusedZone !== 2) {
    return 1;
  }
  let p = getAsDeepProgress();
  let ph = getAsDeepPhase();
  let holdP_raw =
    typeof isPointerDown !== "undefined" && isPointerDown && typeof deepHoldFrames !== "undefined"
      ? min(deepHoldFrames / AS_DEEP.ekg.holdChaosDiv, 1)
      : 0;
  let holdP = getAsDeepVisualHoldLatch() ? 1 : holdP_raw;
  let within = 0;
  if (ph === 1) {
    within = p / max(1e-6, AS_PHASE_1_END);
  } else if (ph === 2) {
    within = (p - AS_PHASE_1_END) / max(1e-6, AS_PHASE_2_END - AS_PHASE_1_END);
  } else if (ph === 3) {
    within = (p - AS_PHASE_2_END) / max(1e-6, 1 - AS_PHASE_2_END);
  } else {
    within = 1;
  }
  let phaseFloor = AS_DEEP.chaos.phaseFloor[ph - 1];
  let ramp = phaseFloor + within * AS_DEEP.chaos.withinSpread;
  return constrain(
    ramp + holdP * AS_DEEP.chaos.holdBoost,
    AS_DEEP.chaos.outMin,
    AS_DEEP.chaos.outMax
  );
}

/** „Aš“ gylio EKG / neon linijos permatomumas — fazių gairės, perėjimai per progress. */
function getAsDeepTreeAlpha() {
  if (focusedZone !== 2) {
    return 140 / 255;
  }
  let p = getAsDeepProgress();
  let A = AS_DEEP.visual.treeLineAlpha;
  let a1 = A[0];
  let a2 = A[1];
  let a3 = A[2];
  let a4 = A[3];
  if (p < AS_PHASE_1_END) {
    return lerp(a1, a2, p / max(1e-6, AS_PHASE_1_END));
  }
  if (p < AS_PHASE_2_END) {
    return lerp(
      a2,
      a3,
      (p - AS_PHASE_1_END) / max(1e-6, AS_PHASE_2_END - AS_PHASE_1_END)
    );
  }
  return lerp(a3, a4, (p - AS_PHASE_2_END) / max(1e-6, 1 - AS_PHASE_2_END));
}

function applyAsDeepMutedTreePalette() {
  deepBarkAccent = [76, 78, 84];
  deepLeafA = [98, 100, 106];
  deepLeafB = [86, 88, 94];
  deepVein = [102, 104, 110];
  deepCore = [108, 110, 116];
}

/**
 * Vieno dūžio kampuota EKG forma (P–QRS–T), fazė 0…1 — tiesūs tarpai tarp taškų.
 */
function sampleAsDeepAngularEcgPhase(phase) {
  let p = constrain(phase, 0, 1);
  const keys = [
    [0.0, 0],
    [0.05, 0],
    [0.1, 0.12],
    [0.13, 0],
    [0.16, 0],
    [0.185, -0.1],
    [0.208, 1.0],
    [0.232, -0.42],
    [0.28, 0.22],
    [0.36, 0],
    [0.45, 0],
    [1.0, 0]
  ];
  for (let k = 0; k < keys.length - 1; k++) {
    let a = keys[k][0];
    let b = keys[k + 1][0];
    if (p >= a && p <= b) {
      let f = b > a ? (p - a) / (b - a) : 0;
      return lerp(keys[k][1], keys[k + 1][1], f);
    }
  }
  return 0;
}

/**
 * Neoninė EKG: kampuota P–QRS–T + judanti animacija per visą liniją (t+u ritmas, sinusai, dūžiai);
 * laikant pelę — didėja ir chaotėja; dešinėje papildomas glitch ant to paties judančio signalo.
 */
function drawAsDeepNeonHeartbeatLine() {
  let ek = AS_DEEP.ekg;
  let t = millis() * 0.001;
  let wLine = min(width * ek.wLineWidthFrac, ek.wLineMaxPx);
  let left = -wLine * 0.5;
  let steps = ek.steps;
  let seg = wLine / steps;

  let holdP_raw =
    typeof isPointerDown !== "undefined" && isPointerDown && typeof deepHoldFrames !== "undefined"
      ? min(deepHoldFrames / ek.holdEscDiv, 1)
      : 0;
  let holdP = getAsDeepVisualHoldLatch() ? 1 : holdP_raw;
  let loadP = typeof getAsDeepProgress === "function" ? getAsDeepProgress() : 0;
  let loadEsc = loadP * (getAsDeepVisualHoldLatch() ? 1 : 0.88);
  let esc = constrain(max(holdP * 0.95, loadEsc), 0, 1);
  /** Daugiau bazinio chaoso net be laikymo; esc dar labiau amplifikuoja. */
  let chaos = constrain(esc * esc * 1.35 + esc * 0.22, 0, 1);
  let phaseM = getAsDeepPhaseChaosMultiplier();
  esc = constrain(esc * phaseM, 0, 1.55);
  chaos = constrain(chaos * phaseM, 0, 1.55);
  let ampBase =
    min(height * 0.055, 42) * (1 + 1.55 * holdP + 0.35 * loadP) * lerp(1, 1.14, min(phaseM - 0.4, 1) * 0.5);
  let drift = t * 0.85;

  /** Dešinėje tik papildomas glitch — visas signalas juda per visą u. */
  let glitchStart = ek.glitchStartU;
  /** Senieji sin „dūžiai“ — silpnėja kai chaosas didėja. */
  let oldBumpMix = constrain(ek.oldBumpMixBase - chaos * 0.45, 0.12, 0.55);
  let ds = typeof deepSeed === "number" ? deepSeed : 1;
  let nsEcg001 = ds * 0.001;
  let nsEcg0007 = ds * 0.0007;
  let nsEcg0009 = ds * 0.0009;
  let nsEcg002 = ds * 0.002;

  function sampleLineY(u, iStep) {
    /** Judanti animacija 0…1: tas pats t*1.15 + u*0.85 ritmas visur. */
    let phase = (t * 1.15 + u * 0.85) % 1;
    let beatJ =
      sin(drift * 3.1 + u * TWO_PI * 1.8) * (0.05 + 0.14 * chaos) +
      sin(drift * 5.2 + u * 9.4) * (0.03 + 0.08 * esc);
    let y =
      sampleAsDeepAngularEcgPhase(constrain(phase + beatJ, 0, 1)) * ampBase;

    y += sin(t * 2.2 + u * 11) * (3.2 + 11 * chaos);
    y += sin(t * 1.65 + u * 18.5) * (2 + 7 * chaos);
    y += sin(t * 3.1 + u * 7.2 + iStep * 0.02) * (1.4 + 5.5 * chaos);
    y += (noise(nsEcg001 + iStep * 0.08, t * 0.5) - 0.5) * (4 + 32 * chaos);

    let beat = (t * 1.15 + u * 0.85) % 1;
    let bump = 0;
    if (beat > 0.08 && beat < 0.11) {
      bump -= seg * 2.8 * sin(((beat - 0.08) / 0.03) * PI);
    }
    if (beat > 0.11 && beat < 0.16) {
      bump += seg * 7.2 * sin(((beat - 0.11) / 0.05) * PI);
    }
    if (beat > 0.16 && beat < 0.22) {
      bump -= seg * 2.2 * sin(((beat - 0.16) / 0.06) * PI);
    }
    y += bump * oldBumpMix;

    let j =
      (noise(nsEcg0007 + iStep * 0.19, drift * 0.6) - 0.5) * (4 + 34 * chaos);
    let j2 =
      (noise(nsEcg0009 + iStep * 0.31 + 50, drift) - 0.5) * (2.5 + 22 * chaos * chaos);
    y += j + j2;
    y += sin(drift * 14 + u * 28) * (2.5 + 14 * chaos);
    y += sin(drift * 21 + u * 14 + u * u * 8) * (1.2 + 6 * chaos) * (0.55 + 0.45 * u);

    if (u >= glitchStart) {
      let g = (u - glitchStart) / (1 - glitchStart);
      let tail = g * g;
      let bust = esc * (0.45 + 0.55 * tail);
      y +=
        (noise(nsEcg002 + iStep * 0.07, drift * 1.2) - 0.5) * ampBase * 0.2 * bust;
      y += sin(drift * 22 + iStep * 0.9 + g * 50) * (10 + 48 * bust) * esc;
      y += (noise(ds + iStep * 0.21, t * 3) - 0.5) * (14 + 62 * tail) * esc;
      y += sin(iStep * 0.35 + t * 18) * (8 + 34 * chaos) * tail * esc;
    }
    return y;
  }

  function glitchRnd(i, salt) {
    return noise(nsEcg002 + i * 0.17 + salt * 3.1, frameCount * 0.08, t * 1.7);
  }

  function drawEcgStroke(weight, r, g, b, a, glowBlur, glowRgb) {
    blendMode(BLEND);
    noFill();
    let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
    if (ctx) {
      ctx.save();
      ctx.shadowBlur = glowBlur;
      ctx.shadowColor = glowRgb;
    }
    strokeWeight(weight);
    stroke(r, g, b, a);
    for (let i = 0; i < steps; i++) {
      let u0 = i / steps;
      let u1 = (i + 1) / steps;
      let gapAll = 0.018 + 0.12 * esc * chaos * (0.25 + u0 * u0);
      let gapTail =
        u0 >= glitchStart
          ? 0.05 + 0.42 * esc * pow((u0 - glitchStart) / (1 - glitchStart), 2)
          : 0;
      if (glitchRnd(i, 0) < gapAll + gapTail) {
        continue;
      }
      let x0 = left + i * seg;
      let x1 = left + (i + 1) * seg;
      let y0 = sampleLineY(u0, i);
      let y1 = sampleLineY(u1, i + 1);
      let shAll = (glitchRnd(i, 1) - 0.5) * 2 * (1.8 + 9 * esc * chaos) * (0.35 + 0.65 * u0);
      let shY = (glitchRnd(i, 2) - 0.5) * 2 * (2 + 10 * esc * chaos) * (0.3 + 0.7 * u0);
      x0 += shAll;
      x1 += shAll * 0.85;
      y0 += shY;
      y1 += (glitchRnd(i + 1, 2) - 0.5) * 2 * (2 + 10 * esc * chaos) * (0.3 + 0.7 * u1);
      if (u0 >= glitchStart - 0.02) {
        let gx = constrain((u0 - glitchStart) / (1 - glitchStart), 0, 1);
        let shake = (glitchRnd(i, 3) - 0.5) * 2 * (4 + 26 * esc * gx);
        x0 += shake;
        x1 += shake * 0.72;
        y0 += (glitchRnd(i, 4) - 0.5) * 2 * (5 + 22 * esc * gx);
        y1 += (glitchRnd(i + 1, 4) - 0.5) * 2 * (5 + 22 * esc * gx);
      }
      line(x0, y0, x1, y1);
    }
    if (ctx) {
      ctx.restore();
    }
  }

  drawEcgStroke(2.6, 210, 255, 255, 238, 16, "rgba(0, 240, 255, 0.55)");
  blendMode(ADD);
  drawEcgStroke(1.15, 255, 75, 165, 175, 11, "rgba(255, 50, 150, 0.42)");
  blendMode(BLEND);
  noStroke();

  if (esc > 0.2) {
    blendMode(ADD);
    strokeWeight(1);
    let gx0 = left + wLine * 0.08;
    let nSparks = floor(10 + esc * 18);
    for (let k = 0; k < nSparks; k++) {
      let rx = lerp(gx0, left + wLine, glitchRnd(k, 7));
      let ry = (glitchRnd(k, 8) - 0.5) * (18 + 40 * esc);
      stroke(0, 255, 240, (20 + 70 * glitchRnd(k, 9)) * esc);
      line(rx, ry - (4 + glitchRnd(k, 10) * 10), rx + (glitchRnd(k, 11) - 0.5) * 16, ry + 4 + glitchRnd(k, 12) * 14);
      stroke(255, 40, 120, (15 + 55 * glitchRnd(k, 13)) * esc);
      line(
        rx + (glitchRnd(k, 14) - 0.5) * 8,
        ry,
        rx + 10 + glitchRnd(k, 15) * 32,
        ry + (glitchRnd(k, 16) - 0.5) * 12
      );
    }
    blendMode(BLEND);
    noStroke();
  }
}

function drawAsDeepAtmosphereVignette() {
  let a = AS_DEEP.atmosphere;
  noStroke();
  blendMode(BLEND);
  fill(0, 0, 0, a.topAlpha);
  rect(0, 0, width, height * a.topHFrac);
  fill(0, 0, 0, a.bottomAlpha);
  rect(0, height * a.bottomYFrac, width, height * a.bottomHFrac);
  fill(0, 0, 0, a.sideAlpha);
  rect(0, 0, width * a.sideWFrac, height);
  rect(width * (1 - a.sideWFrac), 0, width * a.sideWFrac, height);
}

// --- 4 fazės industrial fonas ---
/**
 * 4 fazė — „gritty industrial“ glitch loop: rūdžių tamsa, skanlines, signalų juostos, triukšmas.
 */
function drawAsDeepPhase4IndustrialGlitchBackground() {
  if (focusedZone !== 2 || getAsDeepPhase() !== 4) {
    return;
  }
  let t = millis() * 0.001;
  let ns = getDeepNoiseSeedScaled(0.00029);
  let holdP_raw =
    typeof isPointerDown !== "undefined" && isPointerDown && typeof deepHoldFrames !== "undefined"
      ? min(deepHoldFrames / AS_DEEP.ekg.holdChaosDiv, 1)
      : 0;
  let holdP = getAsDeepVisualHoldLatch() ? 1 : holdP_raw;
  let w = getAsDeepVisualHoldLatch() ? 1 : 0.5 + 0.5 * holdP;

  blendMode(MULTIPLY);
  fill(48, 30, 18, 88 + 72 * w);
  rect(0, 0, width, height);
  blendMode(BLEND);

  blendMode(SOFT_LIGHT);
  fill(22, 18, 14, 70 + 50 * w);
  ellipse(width * 0.5, height * 0.48, width * 1.05, height * 1.12);
  blendMode(BLEND);

  noStroke();
  for (let i = 0; i < floor(160 * w); i++) {
    let x = noise(ns + i * 0.33, t * 1.5) * width;
    let y = noise(ns + i * 0.21 + 50, t * 1.1) * height;
    let rw = 1 + noise(i, t) * (10 + 48 * w);
    let rh = 1 + noise(i + 1, t) * (3 + 14 * w);
    fill(8 + noise(i) * 35, 6 + noise(i + 2) * 22, 5, 22 + 45 * noise(i * 0.1, t));
    rect(x, y, rw, rh);
  }

  blendMode(ADD);
  strokeWeight(1);
  for (let y = 0; y < height; y += 2) {
    let jx = (noise(ns * 1.2, y * 0.06, t * 3.2) - 0.5) * width * 0.14;
    let a = (2 + 22 * noise(ns, y * 0.04, t * 4.5)) * w;
    stroke(255, 95, 35, a * 0.42);
    line(jx, y, width + jx, y);
    stroke(30, 140, 210, a * 0.32);
    line(-jx * 0.6, y + 1, width - jx * 0.6, y + 1);
  }

  for (let b = 0; b < floor(42 * w); b++) {
    let vy = noise(ns + b * 0.41, t * 0.65) * height;
    let sh = 2 + noise(b, t * 2) * (8 + 36 * w);
    fill(255, 110, 40, 7 + 24 * noise(b, t));
    rect(0, vy, width, sh);
    fill(0, 210, 255, 4 + 14 * noise(b + 3, t));
    rect(noise(b) * 40 - 20, vy + sh * 0.35, width, sh * 0.45);
  }

  for (let v = 0; v < floor(28 * w); v++) {
    let vx = noise(ns + v * 0.51, t) * width;
    let vh = 20 + noise(v, t * 1.8) * height * 0.35;
    let vy = noise(ns + v * 0.37 + 12, t * 0.9) * (height - vh);
    stroke(180, 175, 160, 12 + 28 * noise(v, t));
    strokeWeight(1 + noise(v + 1) * 2);
    line(vx, vy, vx, vy + vh);
  }
  noStroke();

  for (let q = 0; q < floor(55 * w); q++) {
    let bx = noise(ns + q * 0.47, t * 2.2) * width;
    let by = noise(ns + q * 0.39 + 80, t * 1.7) * height;
    let bw = 4 + noise(q, t) * (width * 0.08 + 60 * w);
    let bh = 3 + noise(q + 1, t) * 14;
    fill(255, 255, 255, 4 + 16 * noise(q, t) * w);
    rect(bx, by, bw, bh);
  }
  blendMode(BLEND);

  strokeWeight(1);
  for (let y = 0; y < height; y += 5) {
    stroke(0, 0, 0, 14 + 40 * noise(ns + 2, y * 0.025, t * 1.2));
    line(0, y, width, y);
  }
  noStroke();
}

// --- Chaoso chroma + datastream ---
function applyAsDeepChaosGlitch() {
  let ph = getAsDeepPhase();
  if (ph < 3 || ph > 4) {
    return;
  }
  let depthMadness = getDeepChaosLevel(focusedZone);
  let w = millis() * 0.001;
  let cg = AS_DEEP.chromaGlitch;
  let pr = getAsDeepProgress();
  let tIn34 = constrain((pr - AS_PHASE_2_END) / max(1e-6, 1 - AS_PHASE_2_END), 0, 1);
  let amp = 0.55 + constrain(depthMadness, 0, 1.25) * 0.25;
  let latchHold = typeof getAsDeepVisualHoldLatch === "function" && getAsDeepVisualHoldLatch();
  let phaseBoost =
    lerp(cg.phaseBoostMin, cg.phaseBoostMax, tIn34) +
    (isPointerDown || latchHold ? lerp(cg.pointerExtraMin, cg.pointerExtraMax, tIn34) : 0);
  let k = (0.28 + 0.2 * (0.5 + 0.5 * sin(w * 0.019))) * amp * phaseBoost * getAsDeepPhaseChaosMultiplier() * 0.42 + 0.58;
  k = constrain(k, 0.12, 1.25);
  let frame = get();
  let shiftE = tIn34;
  let sL = cg.shiftLerp;
  let ox = (7 + depthMadness * 5 + lerp(sL[0], sL[1], shiftE)) * sin(frameCount * 0.087) * 0.38;
  let oy = (5 + depthMadness * 4 + lerp(sL[2], sL[3], shiftE)) * cos(frameCount * 0.074) * 0.38;

  tint(255, 0, 110, 32 * k);
  image(frame, ox - 5, oy, width, height);
  tint(0, 210, 255, 28 * k);
  image(frame, ox + 5, oy, width, height);
  tint(255, 95 * k);
  image(frame, ox * 0.22 + sin(w * 21) * 2, oy * 0.2, width, height);
  noTint();
}

/**
 * Abstraktus „datastream“ / skaitmeninis triukšmas (3–4 fazė, stiprėja su „Sulaužyti“).
 */
function drawAsDeepDatastreamGlitchOverlay() {
  if (focusedZone !== 2) {
    return;
  }
  if (getAsDeepProgress() < AS_PHASE_2_END) {
    return;
  }
  let t = millis() * 0.001;
  let dsC = AS_DEEP.datastream;
  let pr = getAsDeepProgress();
  let p3 = constrain((pr - AS_PHASE_2_END) / max(1e-6, 1 - AS_PHASE_2_END), 0, 1);
  let latchHold = typeof getAsDeepVisualHoldLatch === "function" && getAsDeepVisualHoldLatch();
  let ptrBoost = isPointerDown || latchHold;
  let s3 = 0.28 + 0.55 * p3 + (ptrBoost ? dsC.s3PointerAdd : 0);
  let s4 = 0.88 + 0.28 * (ptrBoost ? dsC.s4PointerMul : dsC.s4PointerMulSoft);
  let s = lerp(s3, s4, p3);
  if (focusedZone === 2) {
    s *= getAsDeepPhaseChaosMultiplier() * 0.55 + 0.45;
  }
  s = constrain(s, 0.15, 1.15);
  let ns = getDeepNoiseOffset013();

  blendMode(ADD);
  noFill();
  strokeWeight(1);
  let nH = floor(lerp(28, 110, s));
  for (let i = 0; i < nH; i++) {
    let yy = noise(ns + i * 0.31, t * 1.4) * height;
    let ww = width * (0.08 + noise(ns, i * 0.2, t) * 0.82);
    let xx = (noise(ns + 2, i * 0.17, t * 0.9) - 0.5) * width * 0.12;
    let a = (12 + 38 * s) * noise(ns + i, t * 2);
    stroke(0, 255, 240, a);
    line(xx, yy, xx + ww, yy);
    stroke(255, 40, 140, a * 0.75);
    line(xx + 2, yy + 1, xx + ww * 0.92, yy + 1);
  }

  let nV = floor(lerp(16, 72, s));
  for (let j = 0; j < nV; j++) {
    let vx = noise(ns + j * 0.41, t * 1.1) * width;
    let vh = 8 + noise(ns + j, t * 2.3) * (height * 0.22 * s);
    let vy = noise(ns + j * 0.22, t * 0.7) * (height - vh);
    let a = (10 + 32 * s) * noise(ns + j + 5, t);
    stroke(0, 230, 255, a * 0.9);
    line(vx, vy, vx, vy + vh);
    stroke(255, 60, 160, a * 0.55);
    line(vx + 1.5, vy, vx + 1.5, vy + vh * 0.88);
  }

  for (let q = 0; q < floor(40 * s); q++) {
    let bx = noise(ns + q * 0.51, t * 1.8) * width;
    let by = noise(ns + q * 0.37 + 20, t * 1.6) * height;
    let bw = 2 + noise(q, t) * (14 + 40 * s);
    let bh = 1 + noise(q + 1, t) * (3 + 22 * s);
    fill(255, 255, 255, 8 + 22 * s * noise(q, t));
    noStroke();
    rect(bx, by, bw, bh);
  }
  blendMode(BLEND);
  noStroke();
}

// --- Kriptinis fonas + centrinis tekstas ---
function drawAsDeepCrypticBackground() {
  let ph = getAsDeepPhase();
  if (ph >= 3) {
    return;
  }
  let depthMadness = getDeepChaosLevel(focusedZone);
  let words = AS_DEEP.cryptic.words;
  let count = ph === 1 ? 3 : 4;
  let t = millis() * 0.001;
  let baseA = ph === 1 ? 7 : 9;
  baseA += depthMadness * 1.5;
  let phCh = getAsDeepPhaseChaosMultiplier();
  let ph2Boost = ph === 2 ? 1.85 * phCh : ph === 1 ? phCh : 1;
  let angOff = getDeepNoiseSeedScaled(0.001);

  textAlign(CENTER, CENTER);
  if (typeof setDeepEmotionFont === "function") {
    setDeepEmotionFont();
  } else {
    textFont(treeCanvasFontFallback("deepPoeticMono"));
    textStyle(NORMAL);
  }

  let sizeMul = [0.75, 1.15, 0.9, 1.25];
  for (let i = 0; i < count; i++) {
    let seed = deepSeed + i * 7919 + 90210;
    let bx = 0.06 + abs(sin(seed * 0.0007)) * 0.88;
    let by = 0.08 + abs(cos(seed * 0.0011)) * 0.84;
    let ang = (i / count) * TWO_PI + angOff;
    let x =
      width * bx +
      sin(t * 0.7 + ang) * 18 * ph2Boost +
      (ph === 2 ? sin(t * 11 + i) * 22 : 0);
    let y =
      height * by +
      cos(t * 0.55 + ang * 1.1) * 14 * ph2Boost +
      (ph === 2 ? cos(t * 9 + i * 1.3) * 18 : 0);
    let sBase = width * 0.012;
    let s = min(22, max(8, sBase * sizeMul[i % 4]));
    let a = baseA * (0.5 + 0.5 * sin(t * 1.4 + i * 2.1)) * (ph === 2 ? 1.25 : 1);
    noStroke();
    textSize(s);
    fill(175, 177, 182, a);
    if (ph === 2) {
      push();
      translate(x, y);
      rotate(sin(t * 8 + i * 2) * 0.2);
      scale(1 + sin(t * 14 + i) * 0.12, 1 + cos(t * 12 + i) * 0.1);
      text(words[i], 0, 0);
      pop();
    } else {
      text(words[i], x, y);
    }
  }
}

/** „SISTEMA SUGADINTA“ šrifto dydis (didesnis už Nepergyvenk). */
function getAsDeepSysHeadlineFontSize() {
  let u = AS_DEEP.typography.sysHeadline;
  return min(u.maxPx, max(u.minPx, width * u.widthFrac));
}

/** „Nepergyvenk…“ — aiškiai mažesnis už antraštę. */
function getAsDeepNepergyvenkFontSize() {
  let u = AS_DEEP.typography.nepergyvenk;
  return min(u.maxPx, max(u.minPx, width * u.widthFrac));
}

/** Dvi eilutės su \n — be text(..., w), kad p5 centruotų teisingai. */
function getAsDeepNepergyvenkPhraseText() {
  return AS_DEEP.text.NEPER_GYVENK;
}

/** „SISTEMA SUGADINTA“ — aukščiau centro, daugiau oro iki EKG. */
function getAsDeepCenterHeadlineY() {
  return height * AS_DEEP.layout.HEADLINE_Y_FRAC;
}

/** „Nepergyvenk…“ — tarp antraštės ir EKG linijos. */
function getAsDeepCenterPhraseY() {
  return height * AS_DEEP.layout.PHRASE_Y_FRAC;
}

/** Neoninės EKG vertikalus centras (kartu su translate tree-deep.js). */
function getAsDeepEkgCenterY() {
  return height * AS_DEEP.layout.ECG_CENTER_Y_FRAC;
}

/**
 * „SISTEMA SUGADINTA“ — fiksuotas centras, be translate/rotate; tik chroma ir alpha.
 * @param {number} alphaMul 0…1 bendras permatomumas
 * @param {boolean} allowHoldMag ar didinti laikant pelę (tik 2 fazė)
 */
function drawAsDeepSysHeadlineAt(cx, cy, alphaMul, allowHoldMag) {
  /* „SISTEMA SUGADINTA“ — Inter bold (ne Playfair). */
  if (typeof setDeepZoneTitleFontBold === "function") {
    setDeepZoneTitleFontBold();
  } else {
    textFont(treeCanvasFontFallback("deepZoneTitle"));
    textStyle(BOLD);
  }
  noStroke();
  let depthMadness = getDeepChaosLevel(focusedZone);
  let pulse = 0.5 + 0.5 * sin(millis() * 0.011);
  let chroma = 8 + 10 * pulse + depthMadness * 6;
  let holdMag = 1;
  if (allowHoldMag) {
    if (typeof getAsDeepVisualHoldLatch === "function" && getAsDeepVisualHoldLatch()) {
      holdMag = 1.48;
    } else if (typeof isPointerDown !== "undefined" && isPointerDown) {
      holdMag = lerp(1, 1.48, min(deepHoldFrames / 200, 1));
    }
  }
  let baseS = getAsDeepSysHeadlineFontSize();
  let s1 = baseS * holdMag;
  let holdGlitchBoost = constrain((holdMag - 1) / 0.48, 0, 1);
  let holdProgress =
    typeof AS_DEEP_LOAD_MS === "number" && AS_DEEP_LOAD_MS > 0
      ? constrain((typeof asDeepLoadCommittedMs === "number" ? asDeepLoadCommittedMs : 0) / AS_DEEP_LOAD_MS, 0, 1)
      : 0;
  let progressGlitchBoost = pow(holdProgress, 1.05);
  let startDampen = constrain((holdProgress - 0.18) / 0.82, 0, 1);
  startDampen = startDampen * startDampen * (3 - 2 * startDampen);
  textAlign(CENTER, CENTER);
  let tShow = AS_DEEP_SYS_HEADLINE;
  let finaleRamp = pow(progressGlitchBoost, 2.4);
  let crypticLevel =
    (0.04 + depthMadness * 0.12 + holdGlitchBoost * 0.24) +
    (progressGlitchBoost * 1.35 + finaleRamp * 2.6) * startDampen;
  let crypticTick = holdGlitchBoost > 0.2 || progressGlitchBoost > 0.42 ? 2 : 4;
  if (holdProgress < 0.2) {
    crypticTick = 5;
  }
  if (progressGlitchBoost > 0.8) {
    crypticTick = 1;
  }
  if (typeof distortCrypticText === "function" && frameCount % crypticTick === 0) {
    tShow = distortCrypticText(tShow, crypticLevel);
  }
  if (typeof distortSystemLabelText === "function" && frameCount % (crypticTick + 1) === 0) {
    tShow = distortSystemLabelText(
      tShow,
      (0.03 + depthMadness * 0.1 + holdGlitchBoost * 0.2) +
        (progressGlitchBoost * 0.92 + finaleRamp * 1.1) * startDampen
    );
  }
  let glitch = 0.5 + 0.5 * sin(millis() * 0.045 + frameCount * 0.11);
  let am = constrain(alphaMul, 0.08, 1);
  push();
  translate(cx, cy);
  blendMode(ADD);
  fill(255, 70, 140, (14 + 18 * glitch) * am);
  textSize(s1);
  text(tShow, -chroma, 0);
  fill(90, 220, 255, (12 + 16 * glitch) * am);
  text(tShow, chroma, 0);
  if (frameCount % 2 === 0) {
    let jx = sin(frameCount * 0.33) * (1.2 + depthMadness * 2.4);
    fill(255, 120, 180, (4 + 12 * glitch) * am);
    text(tShow, -chroma * 0.5 - jx, -1.2);
    fill(130, 235, 255, (4 + 10 * glitch) * am);
    text(tShow, chroma * 0.5 + jx, 1.2);
  }
  blendMode(BLEND);
  fill(248, 248, 252, (126 + 24 * pulse) * am);
  textSize(s1);
  text(tShow, 0, 0);
  if (frameCount % 4 === 0) {
    noStroke();
    fill(255, 255, 255, (6 + 18 * glitch) * am);
    let sw = min(width * 0.52, 620);
    let sx = -sw * 0.5;
    for (let i = 0; i < 5; i++) {
      let sy = (-s1 * 0.48) + i * (s1 * 0.24) + sin(frameCount * 0.29 + i) * 1.4;
      rect(sx, sy, sw, 1.15);
    }
  }
  pop();
  textStyle(NORMAL);
}

function drawAsDeepChaosCenterText() {
  let ph = getAsDeepPhase();
  let pulse = 0.5 + 0.5 * sin(millis() * 0.011);
  let cx = getAsDeepTreeCenterX();
  let yHead = getAsDeepCenterHeadlineY();

  if (ph === 1) {
    return;
  }

  if (ph === 2) {
    drawAsDeepSysHeadlineAt(cx, yHead, 1, true);
    return;
  }

  if (ph === 3) {
    drawAsDeepSysHeadlineAt(cx, yHead, 0.62 + 0.06 * pulse, false);
    if (typeof drawAsDeepPhase3CalmPhraseOverlay === "function") {
      drawAsDeepPhase3CalmPhraseOverlay();
    }
    return;
  }

  if (ph === 4) {
    drawAsDeepSysHeadlineAt(cx, yHead, 0.52 + 0.08 * pulse, false);
    if (typeof drawAsDeepPhase3CalmPhraseOverlay === "function") {
      drawAsDeepPhase3CalmPhraseOverlay();
    }
  }
}

function getAsDeepEkgWLine() {
  let ek = AS_DEEP.ekg;
  return min(width * ek.wLineWidthFrac, ek.wLineMaxPx);
}

// --- Sulaužyti: layout + bounds (hit be rėmelio — tik teksto dėžė) ---
let _sulauzykLayoutCacheKey = "";
let _sulauzykLayoutCache = null;

function getAsDeepSulauzykLayout() {
  let key = width + "," + height;
  if (key === _sulauzykLayoutCacheKey && _sulauzykLayoutCache) {
    return _sulauzykLayoutCache;
  }
  _sulauzykLayoutCacheKey = key;
  let c = AS_DEEP.cta;
  let label = c.label;
  let ts = typeof c.fontPx === "number" ? c.fontPx : 18;
  let tx = width * (typeof c.anchorXFrac === "number" ? c.anchorXFrac : 0.16);
  let ty = height * (typeof c.anchorYFrac === "number" ? c.anchorYFrac : 0.68);
  textAlign(LEFT, BASELINE);
  textStyle(NORMAL);
  if (typeof setAsDeepDisplayFont === "function") {
    setAsDeepDisplayFont();
  } else if (typeof fontUI_clean === "function") {
    fontUI_clean();
  } else if (typeof setAsDeepSansFont === "function") {
    setAsDeepSansFont();
  } else {
    setDeepCaptionFont();
  }
  textSize(ts);
  let ctxM = typeof drawingContext !== "undefined" ? drawingContext : null;
  let tp = c.typography || {};
  let spIdle =
    typeof tp.letterSpacingEmIdle === "number" ? tp.letterSpacingEmIdle : 0.12;
  let wsIdle = typeof tp.wordSpacingEmIdle === "number" ? tp.wordSpacingEmIdle : 0.05;
  if (ctxM) {
    if (typeof ctxM.letterSpacing !== "undefined") {
      ctxM.letterSpacing = spIdle + "em";
    }
    if (typeof ctxM.wordSpacing !== "undefined") {
      ctxM.wordSpacing = wsIdle + "em";
    }
  }
  let tw = textWidth(label);
  if (ctxM) {
    if (typeof ctxM.letterSpacing !== "undefined") {
      ctxM.letterSpacing = "0px";
    }
    if (typeof ctxM.wordSpacing !== "undefined") {
      ctxM.wordSpacing = "0px";
    }
  }
  let ascent = textAscent();
  let descent = textDescent();
  let h = ascent + descent;
  let pad = typeof c.hitPad === "number" ? c.hitPad : 10;
  let rx = tx - pad;
  let ry = ty - ascent - pad;
  let rw = tw + 2 * pad;
  let rh = h + 2 * pad;
  _sulauzykLayoutCache = {
    label: label,
    ts: ts,
    tx: tx,
    ty: ty,
    tw: tw,
    th: h,
    rx: rx,
    ry: ry,
    rw: rw,
    rh: rh
  };
  return _sulauzykLayoutCache;
}

/** Hit area for zone 2 „Sulaužyti“ (kairė apačia; sutampa su drawBackButton). */
function getAsDeepSulauzykPlateBounds() {
  let L = getAsDeepSulauzykLayout();
  return { x: L.rx, y: L.ry, w: L.rw, h: L.rh };
}

/**
 * „Sulaužyti“ — Inter (sąmoningai ne Playfair), klaidos fragmentas: nestabilus, be mygtuko rėmelio.
 * letterSpacing / wordSpacing + retesnis distort — „sugadinta juosta“, hover — aiškesnis skaitmuo.
 */
function drawAsDeepSulauzykInteractiveText(L, over) {
  blendMode(BLEND);
  if (over) {
    cursor(HAND);
  }
  let c = AS_DEEP.cta;
  let lg = c.labelGlitch || { distortEvery: 11, distortLevel: 0.2 };
  let tp = c.typography || {};
  let spIdle =
    typeof tp.letterSpacingEmIdle === "number" ? tp.letterSpacingEmIdle : 0.12;
  let spOver =
    typeof tp.letterSpacingEmOver === "number" ? tp.letterSpacingEmOver : 0.034;
  let wsIdle =
    typeof tp.wordSpacingEmIdle === "number" ? tp.wordSpacingEmIdle : 0.05;
  if (typeof setAsDeepDisplayFont === "function") {
    setAsDeepDisplayFont();
  } else if (typeof fontUI_clean === "function") {
    fontUI_clean();
  } else {
    setDeepCaptionFont();
  }
  textStyle(NORMAL);
  textSize(typeof L.ts === "number" ? L.ts : 18);
  textAlign(LEFT, BASELINE);

  let jx = (noise(frameCount * 0.11) - 0.5) * 4.4;
  let jy = (noise(frameCount * 0.15 + 50) - 0.5) * 2.3;
  let g = 0.5 + 0.5 * sin(millis() * 0.07 + frameCount * 0.13);

  let label = c.label;
  let every = max(3, lg.distortEvery | 0);
  let baseD = typeof lg.distortLevel === "number" ? lg.distortLevel : 0.2;
  if (typeof distortCrypticText === "function") {
    let d = baseD + g * (over ? 0.22 : 0.38);
    if (frameCount % every === 0) {
      label = distortCrypticText(label, d);
    }
  }
  if (frameCount % 37 < 2) {
    label = "sulau yti";
  }
  if (frameCount % 53 < 2) {
    label = "sulažyti";
  }

  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx) {
    ctx.save();
    if (typeof ctx.letterSpacing !== "undefined") {
      ctx.letterSpacing = (over ? spOver : spIdle) + "em";
    }
    if (typeof ctx.wordSpacing !== "undefined") {
      ctx.wordSpacing = (over ? "0.015em" : wsIdle + "em");
    }
  }

  let tx = L.tx + jx;
  let ty = L.ty + jy;
  noStroke();
  blendMode(ADD);
  fill(255, 88, 150, (12 + 16 * g) * (over ? 1.2 : 1));
  text(label, tx - 2.2 - jx * 0.35, ty + 0.8);
  fill(90, 225, 255, (11 + 14 * g) * (over ? 1.15 : 0.95));
  text(label, tx + 2.2 + jx * 0.35, ty - 0.8);
  blendMode(BLEND);

  if (over) {
    fill(238, 104, 104, 166);
  } else {
    fill(188, 78, 78, 114);
  }
  text(label, tx, ty);
  if (ctx) {
    ctx.restore();
  }
  textStyle(NORMAL);
}

// --- Laikymo progresas iki 4 fazės (drawDeepMode) ---
function updateAsDeepPointerHoldLoad() {
  if (focusedZone !== 2) {
    return;
  }
  if (isPointerDown) {
    let now = millis();
    if (asDeepLoadLastTickMs < 0) {
      asDeepLoadLastTickMs = now;
    }
    let dt = now - asDeepLoadLastTickMs;
    asDeepLoadLastTickMs = now;
    dt = min(dt, 140);
    asDeepLoadCommittedMs = min(AS_DEEP_LOAD_MS, asDeepLoadCommittedMs + dt);
  } else {
    asDeepLoadLastTickMs = -1;
  }
}
