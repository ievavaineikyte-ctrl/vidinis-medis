function trunkDist01FromWorld(px, py) {
  let ax = typeof width === "number" ? width * 0.5 : 0;
  let ay = typeof height === "number" ? height + 34 : 0;
  let span =
    typeof height === "number" && typeof width === "number"
      ? height * 0.9 + min(width, height) * 0.22
      : 800;
  return constrain(dist(px, py, ax, ay) / max(80, span), 0, 1);
}

function segmentTrunkDist01(b) {
  if (typeof b.trunkDist01 === "number" && !isNaN(b.trunkDist01)) {
    return constrain(b.trunkDist01, 0, 1);
  }
  let mx = (b.x1 + b.x2) * 0.5;
  let my = (b.y1 + b.y2) * 0.5;
  return trunkDist01FromWorld(mx, my);
}

function segmentWoodColor(b) {
  if (
    typeof b.woodR === "number" &&
    typeof b.woodG === "number" &&
    typeof b.woodB === "number"
  ) {
    return color(b.woodR, b.woodG, b.woodB);
  }
  let my = (b.y1 + b.y2) * 0.5;
  let yn =
    typeof height === "number" ? constrain((height - my) / max(1, height), 0, 1) : 0.5;
  let wr = lerp(TRUNK_BASE_COLOR[0], 92 + yn * 28, 0.58);
  let wg = lerp(TRUNK_BASE_COLOR[1], 82 + yn * 22, 0.58);
  let wb = lerp(TRUNK_BASE_COLOR[2], 74 + yn * 18, 0.58);
  return color(constrain(wr, 0, 255), constrain(wg, 0, 255), constrain(wb, 0, 255));
}

let _deepEnterCentroidZ = -1;
let _deepEnterCentroidX = 0;
let _deepEnterCentroidY = 0;

function resetDeepEnterCentroidCache() {
  _deepEnterCentroidZ = -1;
}

function segmentTouchesDeepEnterFocus(b, z) {
  if (z < 1 || z > 8) {
    return true;
  }
  // Mišiniai 1–2, 1–3 ir pan. neturi fokuso z, bet priklauso kamienui – be to dingo emocinė spalva.
  if (b.zoneId === 1 || b.zoneA === 1 || b.zoneB === 1) {
    return true;
  }
  return b.zoneId === z || b.zoneA === z || b.zoneB === z;
}

function getDeepEnterFocusCentroid(z) {
  if (!branchSegments || branchSegments.length === 0) {
    return {
      x: typeof width === "number" ? width * 0.5 : 400,
      y: typeof height === "number" ? height * 0.4 : 300
    };
  }
  if (z === _deepEnterCentroidZ) {
    return { x: _deepEnterCentroidX, y: _deepEnterCentroidY };
  }
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (let i = 0; i < branchSegments.length; i++) {
    let b = branchSegments[i];
    if (!segmentTouchesDeepEnterFocus(b, z)) {
      continue;
    }
    sx += (b.x1 + b.x2) * 0.5;
    sy += (b.y1 + b.y2) * 0.5;
    n++;
  }
  if (n < 1) {
    return {
      x: width * 0.5,
      y: height * 0.4
    };
  }
  _deepEnterCentroidZ = z;
  _deepEnterCentroidX = sx / n;
  _deepEnterCentroidY = sy / n;
  return { x: _deepEnterCentroidX, y: _deepEnterCentroidY };
}

function emotionEaseInOutCubic(t) {
  let u = constrain(t, 0, 1);
  return u < 0.5 ? 4 * u * u * u : 1 - pow(-2 * u + 2, 3) / 2;
}

function smoothstep0101(t) {
  let u = constrain(t, 0, 1);
  return u * u * (3 - 2 * u);
}

/** Švelnesnis emocijos „banga“ nuo kamieno — platesnis perėjimas, mažiau „nukirpto“. */
function emotionColorSpreadT(zoneId, fillP, trunkD01, mx) {
  let visitBoost = 0;
  if (typeof deepZoneEntryCount !== "undefined" && zoneId >= 1 && zoneId <= 8) {
    visitBoost = constrain((deepZoneEntryCount[zoneId] || 0) / 5, 0, 0.48);
  }
  let wave = fillP * (1.04 + visitBoost * 0.34);
  let d = trunkD01 * (0.065 + fillP * 0.085);
  let t = constrain(wave - d, 0, 1);
  if (zoneId === 7 && typeof width === "number") {
    let nx = (mx - width * 0.5) / max(1, width * 0.42);
    t = constrain(t + nx * 0.08 * fillP, 0, 1);
  }
  if (zoneId !== 8) {
    let sm = smoothstep0101(t);
    t = lerp(t, sm, 0.45);
  }
  return t;
}

function emotionEaseForZone(zoneId, rawT) {
  let t = constrain(rawT, 0, 1);
  if (zoneId === 8) {
    return min(1, t * t * 1.28);
  }
  if (zoneId === 6 || zoneId === 4 || zoneId === 7) {
    return emotionEaseInOutCubic(t);
  }
  if (zoneId === 5) {
    return constrain(t + (noise(t * 4.2, zoneId * 3.1) - 0.5) * 0.1, 0, 1);
  }
  if (zoneId === 3) {
    return emotionEaseInOutCubic(t);
  }
  return t * t * (3 - 2 * t);
}

function emotionBlendAtPoint(b, px, py, effFill, mixT, segIndex, tMs, forHoverHint) {
  let wood = segmentWoodColor(b);
  let trunkD = trunkDist01FromWorld(px, py);
  if (forHoverHint) {
    trunkD *= 0.88;
  }

  // Use point-local canopy blend to avoid hard color cuts during active zone overlays.
  let localBlend =
    b.zoneId === 1 || typeof getZoneBlendAtPoint !== "function"
      ? { zoneA: b.zoneA, zoneB: b.zoneB, t: mixT }
      : getZoneBlendAtPoint(px, py, b.zoneId);
  let zoneA = localBlend.zoneA;
  let zoneB = localBlend.zoneB;
  let localMixT = constrain(typeof localBlend.t === "number" ? localBlend.t : mixT, 0, 1);

  let tA = emotionColorSpreadT(zoneA, effFill, trunkD, px);
  let tB = emotionColorSpreadT(zoneB, effFill, trunkD, px);
  if (b.zoneId === 7 && typeof width === "number") {
    let nx = (px - width * 0.5) / max(1, width * 0.45);
    tA = constrain(tA + nx * 0.11 * effFill, 0, 1);
    tB = constrain(tB - nx * 0.11 * effFill, 0, 1);
  }
  tA = emotionEaseForZone(b.zoneA, tA);
  tB = emotionEaseForZone(b.zoneB, tB);

  let cA =
    typeof getRuntimeZoneColor === "function"
      ? getRuntimeZoneColor(zoneA)
      : [b.colorR, b.colorG, b.colorB];
  let cB =
    typeof getRuntimeZoneColor === "function"
      ? getRuntimeZoneColor(zoneB)
      : [b.colorR, b.colorG, b.colorB];
  let colA = lerpColor(wood, color(cA[0], cA[1], cA[2]), tA);
  let colB = lerpColor(wood, color(cB[0], cB[1], cB[2]), tB);
  let out = lerpColor(colA, colB, localMixT);

  let rr = red(out);
  let gg = green(out);
  let bb = blue(out);
  let alphaMul = 1;

  if (b.zoneId === 3 && effFill > 0.04) {
    rr = constrain(rr + sin(tMs * 0.005 + segIndex * 0.31 + px * 0.002) * 8, 0, 255);
    gg = constrain(gg + cos(tMs * 0.0041 + segIndex * 0.27 + py * 0.002) * 9, 0, 255);
    bb = constrain(bb + sin(tMs * 0.0033 + segIndex * 0.19) * 7, 0, 255);
  }
  if (b.zoneId === 6 && effFill > 0.06) {
    let glow = sin(tMs * 0.0022 + trunkD * 5) * 0.16 + 0.92;
    rr = constrain(lerp(rr, 255, 0.06 * glow * effFill), 0, 255);
    gg = constrain(lerp(gg, 248, 0.08 * glow * effFill), 0, 255);
    bb = constrain(lerp(bb, 255, 0.05 * glow * effFill), 0, 255);
  }
  if (b.zoneId === 8) {
    alphaMul = 0.82 + 0.18 * (0.5 + 0.5 * sin(tMs * 0.021 + segIndex * 1.73));
  }

  return { r: rr, g: gg, b: bb, alphaMul: alphaMul };
}

function getEmotionLerpedStrokeRgb(b, fillProgress, segIndex, tMs, forHoverHint) {
  let mx = (b.x1 + b.x2) * 0.5;
  let my = (b.y1 + b.y2) * 0.5;
  let pA = typeof zoneFillProgress !== "undefined" ? zoneFillProgress[b.zoneA] || 0 : 0;
  let pB = typeof zoneFillProgress !== "undefined" ? zoneFillProgress[b.zoneB] || 0 : 0;
  let mixT = b.blendT || 0;
  let fillBlend = lerp(pA, pB, mixT);
  let effFill = forHoverHint
    ? fillProgress
    : min(1, max(fillProgress, fillBlend) * (1 + fillProgress * 0.06));
  return emotionBlendAtPoint(b, mx, my, effFill, mixT, segIndex, tMs, forHoverHint);
}

/**
 * Piešia šaką trumpais segmentais — spalva skaičiuojama kiekviename taške (gradientas palei šaką).
 */
function drawEmotionGradientStroke(
  b,
  x1r,
  y1r,
  x2r,
  y2r,
  effFill,
  mixT,
  eased,
  stageBoost,
  dramaW,
  heavy,
  segIndex,
  tMs,
  forHoverHint,
  alphaUnder,
  alphaMain,
  wUnder,
  wMain,
  impSway,
  impSwayY,
  memDx,
  memDy
) {
  let segLen = dist(x1r, y1r, x2r, y2r);
  let steps = heavy ? 4 : constrain(ceil(segLen / 13), 4, 18);
  for (let s = 0; s < steps; s++) {
    let u0 = s / steps;
    let u1 = (s + 1) / steps;
    let xa = lerp(x1r, x2r, u0) + impSway + memDx;
    let ya = lerp(y1r, y2r, u0) + impSwayY + memDy;
    let xb = lerp(x1r, x2r, u1) + impSway + memDx;
    let yb = lerp(y1r, y2r, u1) + impSwayY + memDy;
    let px = (xa + xb) * 0.5;
    let py = (ya + yb) * 0.5;
    let c = emotionBlendAtPoint(b, px, py, effFill, mixT, segIndex, tMs, forHoverHint);
    let uMid = (u0 + u1) * 0.5;
    let soft = 0.9 + 0.1 * sin(uMid * PI);
    let am = c.alphaMul;
    if (alphaUnder > 0 && !heavy) {
      stroke(c.r, c.g, c.b, alphaUnder * eased * stageBoost * soft * am);
      strokeWeight(max(1, wUnder));
      line(xa, ya, xb, yb);
    }
    stroke(c.r, c.g, c.b, alphaMain * eased * stageBoost * soft * am);
    strokeWeight(max(1, wMain));
    line(xa, ya, xb, yb);
  }
}

function drawHoveredZoneOverlay() {
  let hasHoverHint = hoveredZoneId >= 1;

  if (!hasAnyZoneFill && !hasHoverHint) {
    if (showConflictDebug) {
      drawConflictHotspotAura();
    }
    return;
  }

  let heavyMode = activeZoneCount >= 4;
  strokeCap(ROUND);

  let tMs = millis();
  let shockOn =
    typeof isOneTimeShockActive === "function" && isOneTimeShockActive();
  let shockHz =
    typeof oneTimeShockHiddenZone !== "undefined" ? oneTimeShockHiddenZone : -1;

  let deFocus = -1;
  let deepEnter =
    typeof deepEnterFadePhase !== "undefined" && deepEnterFadePhase === 1;
  if (deepEnter) {
    hasHoverHint = false;
    deFocus = typeof deepEnterPendingZone === "number" ? deepEnterPendingZone : -1;
  }

  let hoverPulse = 0;
  let hoverHz = 0.1;
  if (
    hasHoverHint &&
    hoveredZoneId >= 1 &&
    hoveredZoneId <= 8 &&
    zoneStage[hoveredZoneId] === 0
  ) {
    if (typeof getZonePersonality === "function") {
      hoverHz = getZonePersonality(hoveredZoneId).hoverPulseHz;
    }
    hoverPulse = sin(frameCount * hoverHz) * 0.5 + 0.5;
  }
  let hovZ = { strokeMul: 1, glowMul: 1, scaleNudge: 0.01 };
  if (hasHoverHint && hoveredZoneId >= 1 && hoveredZoneId <= 8) {
    if (typeof getZonePersonality === "function") {
      hovZ = getZonePersonality(hoveredZoneId);
    }
  }

  for (let i = 0; i < branchSegments.length; i++) {
    let b = branchSegments[i];
    if (shockOn && shockHz >= 1) {
      if (b.zoneId === shockHz || b.zoneA === shockHz || b.zoneB === shockHz) {
        continue;
      }
    }
    if (deepEnter && deFocus >= 1) {
      if (!segmentTouchesDeepEnterFocus(b, deFocus)) {
        let pA0 = zoneFillProgress[b.zoneA] || 0;
        let pB0 = zoneFillProgress[b.zoneB] || 0;
        let mx0 = b.blendT || 0;
        let fp0 = lerp(pA0, pB0, mx0);
        if (fp0 <= 0.001) {
          continue;
        }
      }
    }
    let pA = zoneFillProgress[b.zoneA] || 0;
    let pB = zoneFillProgress[b.zoneB] || 0;
    let mixT = b.blendT || 0;
    let fillProgress = lerp(pA, pB, mixT);
    let hoverMix = 0;

    if (hasHoverHint) {
      if (b.zoneA === hoveredZoneId && b.zoneB === hoveredZoneId) {
        hoverMix = 1;
      } else if (b.zoneA === hoveredZoneId) {
        hoverMix = 1 - mixT;
      } else if (b.zoneB === hoveredZoneId) {
        hoverMix = mixT;
      }
    }

    if (hoverMix > 0 && zoneStage[hoveredZoneId] > 0) {
      hoverMix = 0;
    }

    if (fillProgress <= 0 && hoverMix <= 0) {
      continue;
    }

    let easedLinear = fillProgress * fillProgress * (3 - 2 * fillProgress);
    let eased = pow(constrain(fillProgress, 0, 1), 0.66) * (0.22 + 0.78 * easedLinear);
    let effFill = fillProgress;
    let chr = getEmotionLerpedStrokeRgb(b, fillProgress, i, tMs, false);
    let zoneColorR = chr.r;
    let zoneColorG = chr.g;
    let zoneColorB = chr.b;

    if (fillProgress > 0) {
      let stageBoost = zoneStage[b.zoneId] === 2 ? 1.18 : 1;
      if (b.zoneId === 2) {
        stageBoost *= 1.12;
      }

      let zVisits = (b.zoneId >= 1 && b.zoneId <= 8) ? (deepZoneEntryCount[b.zoneId] || 0) : 0;
      let wearMul = 1 + constrain((zVisits - 2) * 0.15, 0, 1.2);
      let jiggleJuokas = 1;
      let impSway = sin(tMs * 0.00012 + i * 0.37) * 0.4 * wearMul * jiggleJuokas;
      let impSwayY = cos(tMs * 0.0001 + i * 0.53) * 0.3 * wearMul * jiggleJuokas;
      let memDx = 0;
      let memDy = 0;
      if (b.zoneId >= 1 && b.zoneId <= 8 && zVisits > 0) {
        let mem = constrain((zVisits - 1) * 0.0038, 0, 0.026);
        let nx = b.y2 - b.y1;
        let ny = -(b.x2 - b.x1);
        let nlen = max(1, sqrt(nx * nx + ny * ny));
        nx /= nlen;
        ny /= nlen;
        let wob = sin(tMs * 0.00013 + i * 0.41 + b.zoneId * 0.63);
        memDx = nx * mem * 16 * wob;
        memDy = ny * mem * 16 * wob;
      }

      let dramaW =
        b.zoneId === 5
          ? 1 + fillProgress * (0.22 + constrain((zVisits || 0) * 0.04, 0, 0.35))
          : 1;
      let rotJ = 0;
      let cosJ = cos(rotJ);
      let sinJ = sin(rotJ);
      let mx = (b.x1 + b.x2) * 0.5;
      let my = (b.y1 + b.y2) * 0.5;
      let x1r = mx + (b.x1 - mx) * cosJ - (b.y1 - my) * sinJ;
      let y1r = my + (b.x1 - mx) * sinJ + (b.y1 - my) * cosJ;
      let x2r = mx + (b.x2 - mx) * cosJ - (b.y2 - my) * sinJ;
      let y2r = my + (b.x2 - mx) * sinJ + (b.y2 - my) * cosJ;

      let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
      let useGlow =
        !heavyMode &&
        (b.zoneId === 4 || b.zoneId === 6 || b.zoneId === 7) &&
        fillProgress > 0.12;
      if (useGlow && ctx && i % 9 === 0) {
        ctx.save();
        let glowBlur = (4.5 + 7 * eased) * (b.zoneId === 6 ? 1.06 : 1);
        ctx.shadowBlur = glowBlur;
        ctx.shadowColor =
          "rgba(" +
          floor(zoneColorR) +
          "," +
          floor(zoneColorG) +
          "," +
          floor(zoneColorB) +
          ",0.16)";
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      let wMain = max(
        1,
        b.weight * ((heavyMode ? 0.76 : 0.68) + 0.34 * eased) * stageBoost * dramaW
      );
      let wUnder = max(
        1,
        b.weight * (1.08 + 0.48 * eased) * stageBoost * dramaW
      );
      drawEmotionGradientStroke(
        b,
        x1r,
        y1r,
        x2r,
        y2r,
        effFill,
        mixT,
        eased,
        stageBoost,
        dramaW,
        heavyMode,
        i,
        tMs,
        false,
        heavyMode ? 0 : 48,
        heavyMode ? 242 : 198,
        wUnder,
        wMain,
        impSway,
        impSwayY,
        memDx,
        memDy
      );

      if (useGlow && ctx && i % 9 === 0) {
        ctx.restore();
      }

      if (!heavyMode && useGlow) {
        drawEmotionGradientStroke(
          b,
          x1r,
          y1r,
          x2r,
          y2r,
          effFill,
          mixT,
          eased,
          stageBoost,
          dramaW,
          false,
          i,
          tMs,
          false,
          0,
          14,
          1,
          max(1.05, b.weight * (1.45 + 0.55 * eased)),
          impSway,
          impSwayY,
          memDx,
          memDy
        );
      }

      if (b.zoneId === 5 && fillProgress > 0.16 && !heavyMode) {
        let ox =
          (noise(mx * 0.031, my * 0.031, tMs * 0.00015) - 0.5) * 6.5 * fillProgress;
        let oy =
          (noise(mx * 0.027 + 11, my * 0.027, tMs * 0.00012) - 0.5) * 6.5 * fillProgress;
        stroke(
          zoneColorR * 0.9,
          zoneColorG * 0.86,
          zoneColorB * 0.84,
          48 * eased
        );
        strokeWeight(max(0.85, b.weight * (0.5 + fillProgress * 0.42)));
        line(
          x1r + impSway + memDx + ox,
          y1r + impSwayY + memDy + oy,
          x2r + impSway + memDx - ox * 0.6,
          y2r + impSwayY + memDy - oy * 0.6
        );
      }
    }

    if (hoverMix > 0) {
      let pulse = 0.5 + 0.5 * sin(frameCount * 0.065 + i * 0.07);
      let hintStrength = lerp(0.36, 0.54, pulse) * hoverMix;
      let isAsZoneHover = hoveredZoneId === 2 && (b.zoneA === 2 || b.zoneB === 2 || b.zoneId === 2);
      if (isAsZoneHover) {
        hintStrength *= 1.35;
      }

      if (heavyMode) {
        hintStrength *= 0.72;
      }

      let sm = hovZ.strokeMul;
      let gm = hovZ.glowMul;
      let sScale =
        1 + hovZ.scaleNudge * hintStrength * (0.5 + 0.5 * pulse) * 1.06;
      let mx0 = (b.x1 + b.x2) * 0.5;
      let my0 = (b.y1 + b.y2) * 0.5;
      let hx1 = mx0 + (b.x1 - mx0) * sScale;
      let hy1 = my0 + (b.y1 - my0) * sScale;
      let hx2 = mx0 + (b.x2 - mx0) * sScale;
      let hy2 = my0 + (b.y2 - my0) * sScale;

      let effH = max(fillProgress, hoverMix * 0.62);
      let hoverA = (128 + hoverPulse * 105) * hintStrength * 1.32;
      let wHov = max(1, b.weight * (isAsZoneHover ? 1.12 : (0.92 + 0.12 * pulse)) * sm * 1.1);
      let wHovHalo = max(1, b.weight * (isAsZoneHover ? 1.34 : (1.18 + 0.16 * pulse)) * sm * 1.12);
      drawEmotionGradientStroke(
        b,
        hx1,
        hy1,
        hx2,
        hy2,
        effH,
        mixT,
        1,
        1,
        1,
        heavyMode,
        i,
        tMs,
        true,
        hoverA * 0.58 * gm * 1.1,
        hoverA * gm,
        wHovHalo,
        wHov,
        0,
        0,
        0,
        0
      );
    }
  }

  /* Atrakinta „Mano esybė“: visa širdies šaka (2 + mišiniai su 2) — šviesesnis pulsas. */
  if (
    typeof isAsZoneUnlocked === "function" &&
    isAsZoneUnlocked() &&
    typeof zoneStage !== "undefined" &&
    zoneStage[2] === 0
  ) {
    let breath = 0.5 + 0.5 * sin(tMs * 0.001 + frameCount * 0.028);
    let unlockPulse = 0;
    if (
      typeof heartUnlockBranchPulseUntilMs !== "undefined" &&
      millis() < heartUnlockBranchPulseUntilMs
    ) {
      let durMs =
        typeof HEART_UNLOCK_BRANCH_PULSE_MS === "number"
          ? HEART_UNLOCK_BRANCH_PULSE_MS
          : 5600;
      let left = constrain((heartUnlockBranchPulseUntilMs - millis()) / durMs, 0, 1);
      let reduceMotion =
        typeof prefersReducedMotionCanvas === "function" && prefersReducedMotionCanvas();
      if (reduceMotion) {
        unlockPulse = 0.32 * left;
      } else {
        unlockPulse =
          (0.5 + 0.5 * sin(frameCount * 0.44)) * (0.22 + 0.78 * left);
      }
    }
    strokeCap(ROUND);
    for (let hi = 0; hi < branchSegments.length; hi++) {
      let b = branchSegments[hi];
      if (b.zoneId !== 2 && b.zoneA !== 2 && b.zoneB !== 2) {
        continue;
      }
      let pA = zoneFillProgress[b.zoneA] || 0;
      let pB = zoneFillProgress[b.zoneB] || 0;
      let mixT = b.blendT || 0;
      let fillProgress = lerp(pA, pB, mixT);
      let heartEdge = 0;
      if (b.zoneA === 2) {
        heartEdge = max(heartEdge, pA);
      }
      if (b.zoneB === 2) {
        heartEdge = max(heartEdge, pB);
      }
      let glowT = max(fillProgress, heartEdge * 0.92, 0.05);
      if (glowT <= 0.008) {
        continue;
      }
      let aMul = min(1, glowT * 1.15);
      let lineA = (22 + 26 * breath) * aMul * (1 + 0.95 * unlockPulse);
      let lineW =
        max(1.15, b.weight * (0.88 + 0.32 * breath) * (0.35 + 0.65 * aMul)) *
        (1 + 0.62 * unlockPulse);
      stroke(255, 250, 242, min(255, lineA));
      strokeWeight(lineW);
      line(b.x1, b.y1, b.x2, b.y2);
      noStroke();
    }
  }

  drawShadowBranchesLayer();
}

function updateZoneFillAnimation() {
  hasAnyZoneFill = false;
  activeZoneCount = 0;

  for (let z = 1; z <= 8; z++) {
    if (!zoneActivated[z] || !zoneFillTarget[z]) {
      continue;
    }

    hasAnyZoneFill = true;
    activeZoneCount++;

    let p = zoneFillProgress[z] || 0;

    if (p < zoneFillTarget[z]) {
      let spd =
        typeof ZONE_FILL_SPEED_BOOT !== "undefined" && p < 0.28
          ? ZONE_FILL_SPEED_BOOT
          : ZONE_FILL_SPEED;
      zoneFillProgress[z] = min(zoneFillTarget[z], p + (1 - p) * spd);
    }
  }
}

let _treeSceneMetricsKey = "";
let _treeSceneMetricsCache = null;

function getTreeSceneMetrics() {
  let key = width + "," + height;
  if (key === _treeSceneMetricsKey && _treeSceneMetricsCache) {
    return _treeSceneMetricsCache;
  }
  _treeSceneMetricsKey = key;
  let cx = width * 0.5;
  let h = max(1, height);
  let asp = width / h;
  let canopyHMul =
    typeof TREE_SCENE_CANOPY_H_MUL_DEFAULT === "number" ? TREE_SCENE_CANOPY_H_MUL_DEFAULT : 1.5;
  if (typeof TREE_SCENE_ASPECT_ULTRA_STRONG === "number" && asp >= TREE_SCENE_ASPECT_ULTRA_STRONG) {
    canopyHMul =
      typeof TREE_SCENE_CANOPY_H_MUL_ULTRA_STRONG === "number" ? TREE_SCENE_CANOPY_H_MUL_ULTRA_STRONG : 1.1;
  } else if (typeof TREE_SCENE_ASPECT_ULTRA === "number" && asp >= TREE_SCENE_ASPECT_ULTRA) {
    canopyHMul = typeof TREE_SCENE_CANOPY_H_MUL_ULTRA === "number" ? TREE_SCENE_CANOPY_H_MUL_ULTRA : 1.24;
  } else if (typeof TREE_SCENE_ASPECT_WIDE === "number" && asp >= TREE_SCENE_ASPECT_WIDE) {
    canopyHMul = typeof TREE_SCENE_CANOPY_H_MUL_WIDE === "number" ? TREE_SCENE_CANOPY_H_MUL_WIDE : 1.38;
  }
  let w = min(width, h * canopyHMul);
  let left = cx - w * 0.5;
  let right = cx + w * 0.5;
  _treeSceneMetricsCache = { cx: cx, w: w, left: left, right: right };
  return _treeSceneMetricsCache;
}

/** Siauram portretui — šiek tiek platesnis lajos elipsės X skalė, kad medis mažiau „suspaustas". */
function getPortraitCanopyRxScale() {
  if (typeof width !== "number" || typeof height !== "number" || !isFinite(width) || !isFinite(height) || height < 1) {
    return 1;
  }
  let asp = width / height;
  if (asp >= 0.58) {
    return 1;
  }
  return 1 + constrain(0.58 - asp, 0, 0.28) * 0.92;
}

function shortestAngleDelta(fromA, toB) {
  return atan2(sin(toB - fromA), cos(toB - fromA));
}

function branch(len, weight, wx, wy, worldTheta, stemFromTrunkSplit) {
  stemFromTrunkSplit = stemFromTrunkSplit === true;
  let scene = getTreeSceneMetrics();
  let cx = scene.cx;
  let sceneW = scene.w;
  let geo = getGlobalGeometryProfile();

  let swayFactor = map(len, 10, 150, 0.2, 1, true);
  let theta = worldTheta + sway * swayFactor;
  theta += random(-0.018, 0.018) * geo.jitter;

  let p1 = { x: wx, y: wy };
  let p2 = {
    x: wx + sin(theta) * len,
    y: wy - cos(theta) * len
  };

  let mx = (p1.x + p2.x) * 0.5;
  let my = (p1.y + p2.y) * 0.5;
  let localConflict = getConflictInfluenceAt(mx, my);
  theta += random(-0.08, 0.08) * localConflict;
  let zoneId = getZoneForPoint(mx, my);
  let zoneMorph = zoneId >= 2 ? zoneShapeMorphStrength[zoneId] || 0 : 0;

  // First-zone click morph should physically re-shape branches, not only post FX.
  if (zoneMorph > 0) {
    let yNormMorph = constrain((height - my) / max(1, height), 0, 1);
    let lenNormMorph = constrain(map(len, 12, 120, 0, 1), 0, 1);
    // Keep deformation on mid/upper structural branches only.
    let morphEnvelope = smoothstep01(0.22, 0.82, yNormMorph) * smoothstep01(0.18, 0.88, lenNormMorph);
    // Keep all zones responsive, but avoid harsh geometry snapping.
    zoneMorph *= lerp(0.36, 1, morphEnvelope);
    zoneMorph = smoothstep01(0, 1, zoneMorph);

    let focus = getZoneWarpFocus(zoneId);
    let outward = atan2(my - focus.y, mx - focus.x);
    let delta = shortestAngleDelta(theta, outward);
    // Keep morph subtle and elegant (no aggressive distortion).
    theta += delta * (0.11 * zoneMorph);

    p2.x = wx + sin(theta) * len;
    p2.y = wy - cos(theta) * len;
    mx = (p1.x + p2.x) * 0.5;
    my = (p1.y + p2.y) * 0.5;
    zoneId = getZoneForPoint(mx, my);
  }

  // Expensive blend math only when overlay can be visible.
  let needBlendData = hasAnyZoneFill || hoveredZoneId >= 1 || pointerDirty;
  let blend = needBlendData
    ? getZoneBlendAtPoint(mx, my, zoneId)
    : { zoneA: zoneId, zoneB: zoneId, t: 0 };

  let cA = getRuntimeZoneColor(blend.zoneA);
  let cB = getRuntimeZoneColor(blend.zoneB);
  let mixedColor = blend.zoneA === blend.zoneB ? cA : mixColorArr(cA, cB, blend.t);

  let yNormWood = constrain((height - my) / max(1, height), 0, 1);
  let woodR = lerp(TRUNK_BASE_COLOR[0], 92 + yNormWood * 28, 0.58);
  let woodG = lerp(TRUNK_BASE_COLOR[1], 82 + yNormWood * 22, 0.58);
  let woodB = lerp(TRUNK_BASE_COLOR[2], 74 + yNormWood * 18, 0.58);
  let trunkAx = width * 0.5;
  let trunkAy = height + 34;
  let trunkSpan = height * 0.9 + min(width, height) * 0.22;
  let trunkDist01 = constrain(dist(mx, my, trunkAx, trunkAy) / max(80, trunkSpan), 0, 1);

  let threshold = max(BRANCH_PICK_RADIUS, weight * 1.35);
  if (zoneId === 8) {
    threshold *= 1.58;
    threshold = max(threshold, 11);
  }

  let isMainTrunkStem = len >= 125 && weight >= 12.5;

  push();
  translate(wx, wy);
  rotate(theta);
  drawTexturedWoodSegment(
    len,
    weight,
    zoneId,
    p1.x,
    p1.y,
    p2.x,
    p2.y,
    stemFromTrunkSplit
  );
  pop();
  let featherMix = mixedColor;
  if (stemFromTrunkSplit) {
    featherMix = mixColorArr(TRUNK_BASE_COLOR, mixedColor, 0.52);
  }
  drawSegmentJoinFeather(p1.x, p1.y, weight, featherMix);

  let segment = {
    x1: p1.x,
    y1: p1.y,
    x2: p2.x,
    y2: p2.y,
    weight: weight,
    hitThresholdSq: threshold * threshold,
    minX: (p1.x < p2.x ? p1.x : p2.x) - threshold,
    maxX: (p1.x > p2.x ? p1.x : p2.x) + threshold,
    minY: (p1.y < p2.y ? p1.y : p2.y) - threshold,
    maxY: (p1.y > p2.y ? p1.y : p2.y) + threshold,
    zoneId: zoneId,
    zoneA: blend.zoneA,
    zoneB: blend.zoneB,
    blendT: blend.t,
    colorR: mixedColor[0],
    colorG: mixedColor[1],
    colorB: mixedColor[2],
    woodR: constrain(woodR, 0, 255),
    woodG: constrain(woodG, 0, 255),
    woodB: constrain(woodB, 0, 255),
    trunkDist01: trunkDist01
  };

  branchSegments.push(segment);
  addSegmentToHoverGrid(segment, branchSegments.length - 1);

  let canopy = getCanopyEnvelope(p2.x, p2.y);
  let nx = constrain((p2.x - cx) / max(1, sceneW * 0.44), -1, 1);
  let edge = abs(nx);
  let minLen = lerp(11, 16.5, edge);

  // Keep crown in a clean sakura dome.
  if (!canopy.inside) {
    if (p2.y < height * 0.64 || edge > 0.9) {
      return;
    }
    minLen += 2.6;
  }

  if (len <= minLen) {
    return;
  }

  let yNorm = constrain((height - p2.y) / max(1, height), 0, 1);
  let centerPull = 1 - constrain(abs(p2.x - cx) / (sceneW * 0.24), 0, 1);
  let edgePull = 1 - centerPull;
  let inwardDir = p2.x < cx ? 1 : -1;

  let baseSplit = lerp(20, 34, yNorm) * geo.angle;
  baseSplit -= centerPull * 2.4;
  baseSplit += edgePull * 1.1;
  baseSplit += 2.05 * zoneMorph;
  baseSplit += localConflict * 6.5;

  let splitJitter =
    random(-1.2, 1.2) * (0.55 + geo.jitter * 1.9) * (0.72 + geo.sharpness * 0.42);
  splitJitter += random(-3.4, 3.4) * localConflict;
  let inwardBias = edgePull * lerp(1.1, 4.2, yNorm) * inwardDir;

  let leftAngle = baseSplit + splitJitter + inwardBias;
  let rightAngle = baseSplit - splitJitter - inwardBias;

  let scaleSpread = 0.03 + geo.jitter * 0.05;
  let scaleBase = yNorm > 0.52
    ? random(0.68 - scaleSpread, 0.74 + scaleSpread)
    : random(0.73 - scaleSpread, 0.83 + scaleSpread);
  scaleBase += 0.009 * zoneMorph;
  scaleBase += (geo.sharpness - 0.9) * 0.04;
  let scale = constrain(scaleBase + centerPull * 0.024 - edgePull * 0.018 - localConflict * 0.06, 0.5, 0.92);

  let newLen = len * scale;
  let newWeight = max(0.9, weight * 0.73);

  let childStemFromTrunk = isMainTrunkStem;
  branch(newLen, newWeight, p2.x, p2.y, theta + radians(leftAngle), childStemFromTrunk);
  branch(newLen, newWeight, p2.x, p2.y, theta + radians(-rightAngle), childStemFromTrunk);

  // Sparse supporting twigs to avoid heavy tangles.
  let twigChance = fastRenderMode ? 0.008 : 0.018;
  twigChance *= lerp(0.92, 0.2, edgePull);
  twigChance *= 1 + zoneMorph * 0.07;
  if (yNorm > 0.58) {
    twigChance *= 0.45;
  }
  if (random() < twigChance && len < 58) {
    let tAng = random(-3.5, 3.5);
    branch(
      len * random(0.5, 0.57),
      newWeight * 0.8,
      p2.x,
      p2.y,
      theta + radians(tAng)
    );
  }
}

function drawSegmentJoinFeather(x, y, weight, mixedColor) {
  let r = max(1.6, weight * 0.72);
  let c = mixedColor || [186, 170, 142];
  push();
  noStroke();
  // Soft additive halo to hide hard Y-junction cuts.
  blendMode(ADD);
  fill(c[0], c[1], c[2], 14);
  circle(x, y, r * 3.1);
  blendMode(BLEND);
  // Opaque core keeps wood body cohesive at segment joins.
  fill(
    lerp(184, c[0], 0.42),
    lerp(176, c[1], 0.42),
    lerp(168, c[2], 0.42),
    84
  );
  circle(x, y, r * 1.6);
  pop();
}

function getCanopyEnvelope(mx, my) {
  let scene = getTreeSceneMetrics();
  let cx = scene.cx;
  let cy = height * 0.435;
  let rxS = typeof getPortraitCanopyRxScale === "function" ? getPortraitCanopyRxScale() : 1;
  let rx = scene.w * 0.35 * rxS;
  let ry = height * 0.265;
  let nx = (mx - cx) / rx;
  let ny = (my - cy) / ry;
  let d = nx * nx + ny * ny;

  return {
    // Softer, fuller sakura-like dome.
    inside: d <= 0.98,
    dist: d
  };
}

function getInwardBias(x, y) {
  let scene = getTreeSceneMetrics();
  let cx = scene.cx;
  let topZone = y < height * 0.5;

  if (!topZone) {
    return 0;
  }

  let dx = x - cx;
  let t = constrain(abs(dx) / (scene.w * 0.28), 0, 1);
  return 12 * t;
}

function getZoneForPoint(mx, my) {
  let scene = getTreeSceneMetrics();
  // Keep trunk isolated from canopy so colors do not bleed.
  let trunkCenterX = scene.cx;
  let trunkHalfW = scene.w * 0.055;
  let trunkTopY = height * 0.67;

  if (my > trunkTopY && abs(mx - trunkCenterX) < trunkHalfW) {
    return 1;
  }

  // Canopy as an ellipse for smoother boundary (avoids "chopped" segments).
  let cx = scene.cx;
  let cy = height * 0.43;
  let rxS2 = typeof getPortraitCanopyRxScale === "function" ? getPortraitCanopyRxScale() : 1;
  let rx = scene.w * 0.395 * rxS2;
  let ry = height * 0.275;
  let nx = (mx - cx) / max(1, rx);
  let ny = (my - cy) / max(1, ry);
  let inCanopy = nx * nx + ny * ny <= 0.98;

  // Split canopy into 7 angular slices (zones 2..8), with expanded zone 4 (Jautrumas).
  let dx = mx - cx;
  let dy = my - cy;
  let angle = atan2(dy, dx);
  let angleOffset =
    typeof getRuntimeCanopyAngleOffset === "function" ? getRuntimeCanopyAngleOffset() : 0;
  let normalizedAngle = (angle + PI) / (2 * PI) + angleOffset; // 0 to 1 (+session offset)
  let sliceInfo = getCanopySliceInfo(normalizedAngle);
  let slice = sliceInfo.slice;

  // Fallback to trunk only in lower center; otherwise stay in canopy zone ring.
  if (!inCanopy && my > height * 0.6 && abs(mx - trunkCenterX) < scene.w * 0.13) {
    return 1;
  }

  return typeof getZoneIdForCanopySlice === "function" ? getZoneIdForCanopySlice(slice) : 2 + slice;
}

// zones 3 (Juokas), 4 (Jautrumas), 7 (Empatija) intentionally widened

function getCanopySliceInfo(normalizedAngle) {
  let u = ((normalizedAngle % 1) + 1) % 1;
  let edges =
    typeof getCanopyZoneSliceEdges === "function"
      ? getCanopyZoneSliceEdges()
      : CANOPY_ZONE_SLICE_EDGES;

  for (let i = 0; i < 7; i++) {
    let a = edges[i];
    let b = edges[i + 1];
    if (u < b || i === 6) {
      let frac = (u - a) / max(0.000001, b - a);
      return { slice: i, frac: constrain(frac, 0, 0.9999) };
    }
  }

  return { slice: 6, frac: 0.9999 };
}

function getZoneBlendAtPoint(mx, my, fallbackZone) {
  let scene = getTreeSceneMetrics();
  let trunkCenterX = scene.cx;
  let trunkHalfW = scene.w * 0.055;
  let trunkTopY = height * 0.67;

  if (my > trunkTopY && abs(mx - trunkCenterX) < trunkHalfW) {
    return { zoneA: 1, zoneB: 1, t: 0 };
  }

  let cx = scene.cx;
  let cy = height * 0.43;
  let rxS3 = typeof getPortraitCanopyRxScale === "function" ? getPortraitCanopyRxScale() : 1;
  let rx = scene.w * 0.395 * rxS3;
  let ry = height * 0.275;
  let nx = (mx - cx) / max(1, rx);
  let ny = (my - cy) / max(1, ry);
  let inCanopy = nx * nx + ny * ny <= 0.98;

  if (!inCanopy) {
    return { zoneA: fallbackZone, zoneB: fallbackZone, t: 0 };
  }

  let dx = mx - cx;
  let dy = my - cy;
  let angle = atan2(dy, dx);
  let angleOffset =
    typeof getRuntimeCanopyAngleOffset === "function" ? getRuntimeCanopyAngleOffset() : 0;
  let normalizedAngle = (angle + PI) / (2 * PI) + angleOffset; // 0..1 (+session offset)
  let sliceInfo = getCanopySliceInfo(normalizedAngle);
  let slice = sliceInfo.slice;
  let frac = sliceInfo.frac;

  let zoneHere =
    typeof getZoneIdForCanopySlice === "function"
      ? getZoneIdForCanopySlice(slice)
      : 2 + slice;
  // Strong organic softness: keep transitions broad (avoid hard slice cuts).
  let radial01 = constrain(sqrt(nx * nx + ny * ny), 0, 1);
  let spatialJitter = (noise(mx * 0.0032 + 11.7, my * 0.0037 + 5.3) - 0.5) * 0.1;
  let blendWidth = constrain(lerp(0.34, 0.5, radial01) + spatialJitter, 0.28, 0.56);

  if (frac > 1 - blendWidth) {
    let nextSlice = (slice + 1) % 7;
    return {
      zoneA: zoneHere,
      zoneB:
        typeof getZoneIdForCanopySlice === "function"
          ? getZoneIdForCanopySlice(nextSlice)
          : 2 + nextSlice,
      t: smoothstep01(1 - blendWidth, 1, frac)
    };
  }

  if (frac < blendWidth) {
    let prevSlice = (slice + 6) % 7;
    return {
      zoneA:
        typeof getZoneIdForCanopySlice === "function"
          ? getZoneIdForCanopySlice(prevSlice)
          : 2 + prevSlice,
      zoneB: zoneHere,
      t: smoothstep01(0, blendWidth, frac)
    };
  }

  return { zoneA: zoneHere, zoneB: zoneHere, t: 0 };
}

function mixColorArr(a, b, t) {
  return [
    lerp(a[0], b[0], t),
    lerp(a[1], b[1], t),
    lerp(a[2], b[2], t)
  ];
}

function getCanopySliceBlend(mx) {
  let cx = width * 0.52;
  let rx = width * 0.405;
  let canopyLeft = cx - rx;
  let canopyRight = cx + rx;
  let t = (mx - canopyLeft) / max(1, canopyRight - canopyLeft);
  t = constrain(t, 0, 0.9999);

  let x7 = t * 7;
  let leftSlice = constrain(floor(x7), 0, 6);
  let rightSlice = (leftSlice + 1) % 7;
  let frac = x7 - leftSlice;

  // Soft horizontal blend helper used by canopy overlays.
  let zoneLeft =
    typeof getZoneIdForCanopySlice === "function"
      ? getZoneIdForCanopySlice(leftSlice)
      : 2 + leftSlice;
  let zoneRight =
    typeof getZoneIdForCanopySlice === "function"
      ? getZoneIdForCanopySlice(rightSlice)
      : 2 + rightSlice;
  let tBlend = smoothstep01(0.18, 0.82, frac);
  return {
    zoneA: zoneLeft,
    zoneB: zoneRight,
    t: tBlend
  };
}

function smoothstep01(edge0, edge1, x) {
  let t = constrain((x - edge0) / max(1e-6, edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function drawTexturedWoodSegment(
  len,
  weight,
  zoneId,
  x1w,
  y1w,
  x2w,
  y2w,
  stemFromTrunkSplit
) {
  stemFromTrunkSplit = stemFromTrunkSplit === true;
  let profile = (typeof ZONE_VISUAL_WEIGHT !== "undefined" && ZONE_VISUAL_WEIGHT[zoneId]) || { light: 1, width: 1 };
  let zoneLight = profile.light || 1;
  let zoneWidth = profile.width || 1;
  let w = max(1, weight * zoneWidth);
  let zcStart = zoneId === 1 ? TRUNK_BASE_COLOR : getRuntimeZoneColor(zoneId);
  let zcEnd = zcStart;
  if (
    zoneId !== 1 &&
    typeof getZoneBlendAtPoint === "function" &&
    typeof x1w === "number" &&
    typeof y1w === "number" &&
    typeof x2w === "number" &&
    typeof y2w === "number"
  ) {
    let b0 = getZoneBlendAtPoint(x1w, y1w, zoneId);
    let b1 = getZoneBlendAtPoint(x2w, y2w, zoneId);
    let c0a = getRuntimeZoneColor(b0.zoneA);
    let c0b = getRuntimeZoneColor(b0.zoneB);
    let c1a = getRuntimeZoneColor(b1.zoneA);
    let c1b = getRuntimeZoneColor(b1.zoneB);
    zcStart = mixColorArr(c0a, c0b, b0.t || 0);
    zcEnd = mixColorArr(c1a, c1b, b1.t || 0);
  }

  // Very subtle tint so it still reads as wood.
  let tintAmt = constrain(map(w, 1, 12, 0.02, 0.08, true), 0.02, 0.09);

  // Tapered core: draw in a few chunks (cheap, but removes "tube" feel).
  let steps = fastRenderMode ? 3 : 5;
  strokeCap(ROUND);

  for (let s = 0; s < steps; s++) {
    let t0 = s / steps;
    let t1 = (s + 1) / steps;
    let y0 = -len * t0;
    let y1 = -len * t1;
    let tw = lerp(w, max(1, w * 0.62), t0);
    let zt = (t0 + t1) * 0.5;
    let zc = [
      lerp(zcStart[0], zcEnd[0], zt),
      lerp(zcStart[1], zcEnd[1], zt),
      lerp(zcStart[2], zcEnd[2], zt)
    ];
    if (stemFromTrunkSplit) {
      let stemU = smoothstep01(0, 0.78, zt);
      zc = mixColorArr(TRUNK_BASE_COLOR, zc, stemU);
    }
    let baseR = constrain(lerp(110, zc[0], tintAmt) * zoneLight, 0, 255);
    let baseG = constrain(lerp(110, zc[1], tintAmt) * zoneLight, 0, 255);
    let baseB = constrain(lerp(110, zc[2], tintAmt) * zoneLight, 0, 255);
    let hiR = constrain(lerp(188, zc[0], tintAmt * 0.6) * zoneLight, 0, 255);
    let hiG = constrain(lerp(192, zc[1], tintAmt * 0.6) * zoneLight, 0, 255);
    let hiB = constrain(lerp(204, zc[2], tintAmt * 0.6) * zoneLight, 0, 255);
    let surfR = lerp(174, hiR, 0.55 + (zoneId >= 2 ? 0.06 : 0));
    let surfG = lerp(180, hiG, 0.55 + (zoneId >= 2 ? 0.06 : 0));
    let surfB = lerp(198, hiB, 0.55 + (zoneId >= 2 ? 0.06 : 0));

    push();
    blendMode(ADD);
    stroke(105, 132, 178, zoneId === 1 ? 18 : 14);
    strokeWeight(max(2, tw * 1.08 + 3.8));
    line(0, y0, 0, y1);

    blendMode(BLEND);
    stroke(baseR * 0.48, baseG * 0.5, baseB * 0.52, 76);
    strokeWeight(tw * 1.12);
    line(0, y0, 0, y1);

    let mainA = zoneId === 1 ? 228 : 202;
    stroke(surfR, surfG, surfB, mainA);
    strokeWeight(tw);
    line(0, y0, 0, y1);

    stroke(138, 152, 172, 76);
    strokeWeight(max(0.8, tw * 0.14));
    line(-tw * 0.2, y0, -tw * 0.2, y1);

    stroke(72, 78, 94, 112);
    strokeWeight(max(0.85, tw * 0.19));
    line(tw * 0.24, y0, tw * 0.24, y1);
    pop();
  }

  // Fibers: a few thin strokes along the segment.
  let fiberCount = fastRenderMode
    ? floor(map(len, 10, 150, 0, 4, true))
    : floor(map(len, 10, 150, 2, 10, true));

  strokeWeight(1);

  for (let i = 0; i < fiberCount; i++) {
    let px = random(-w * 0.28, w * 0.28);
    let y0 = random(-len, -2);
    let y1 = y0 - random(6, 22);
    let a = random(18, 62);
    stroke(152 + random(26), 162 + random(22), 182 + random(18), a);
    line(px, y0, px + random(-1.2, 1.2), y1);
  }

  // Small bark marks (keep it subtle; too many reads as "flowers").
  let texCount = fastRenderMode
    ? floor(map(len, 10, 150, 0, 1, true))
    : floor(map(len, 10, 150, 0, 3, true));

  for (let i = 0; i < texCount; i++) {
    let py = random(-len + 2, -2);
    let px = random(-w * 0.28, w * 0.28);
    let pw = random(w * 0.18, w * 0.42);
    let ph = random(w * 0.14, w * 0.34);
    drawBarkPetal(px, py, pw, ph, random(-0.7, 0.7));
  }
}

function getHoveredZoneId() {
  return getHoveredZoneIdAt(mouseX, mouseY);
}

function getHoveredZoneIdAt(mx, my) {
  let closestDistSq = Infinity;
  let hoveredZoneFallback = -1;
  let candidateIdx = getHoverGridCandidates(mx, my);

  if (candidateIdx.length === 0) {
    return -1;
  }

  let pickBoost =
    typeof getTouchPickRadiusBoost === "function" ? getTouchPickRadiusBoost() : 1;
  let pickSq = pickBoost * pickBoost;

  for (let c = 0; c < candidateIdx.length; c++) {
    let i = candidateIdx[c];
    let b = branchSegments[i];

    // Cheap AABB reject before expensive segment distance math.
    if (mx < b.minX || mx > b.maxX || my < b.minY || my > b.maxY) {
      continue;
    }

    let dSq = distToSegmentSq(mx, my, b.x1, b.y1, b.x2, b.y2);

    if (dSq < b.hitThresholdSq * pickSq && dSq < closestDistSq) {
      closestDistSq = dSq;
      hoveredZoneFallback = b.zoneId;
    }
  }

  if (hoveredZoneFallback < 1) {
    _resolveZoneSticky = -1;
    return -1;
  }

  // Resolve hover zone by actual color-blend zone at pointer position,
  // so caption always matches visible zone/color under cursor.
  return resolveZoneAtPointer(mx, my, hoveredZoneFallback);
}

/**
 * Forgiving resolver for click/touch (wider than hover).
 * Uses the same segment distance logic, but with configurable radius multiplier.
 */
function getPressZoneIdAt(mx, my, radiusMul) {
  let mul = max(1, typeof radiusMul === "number" ? radiusMul : 1);
  if (!branchSegments || branchSegments.length === 0) {
    return -1;
  }
  let candidateIdx = getHoverGridCandidates(mx, my);
  let scanAll = candidateIdx.length === 0;
  let bestDistSq = Infinity;
  let fallbackZone = -1;
  let pickBoost =
    typeof getTouchPickRadiusBoost === "function" ? getTouchPickRadiusBoost() : 1;
  let pickSq = mul * mul * pickBoost * pickBoost;

  if (scanAll) {
    for (let i = 0; i < branchSegments.length; i++) {
      let b = branchSegments[i];
      let dSq = distToSegmentSq(mx, my, b.x1, b.y1, b.x2, b.y2);
      if (dSq < b.hitThresholdSq * pickSq && dSq < bestDistSq) {
        bestDistSq = dSq;
        fallbackZone = b.zoneId;
      }
    }
  } else {
    for (let c = 0; c < candidateIdx.length; c++) {
      let i = candidateIdx[c];
      let b = branchSegments[i];
      if (mx < b.minX || mx > b.maxX || my < b.minY || my > b.maxY) {
        continue;
      }
      let dSq = distToSegmentSq(mx, my, b.x1, b.y1, b.x2, b.y2);
      if (dSq < b.hitThresholdSq * pickSq && dSq < bestDistSq) {
        bestDistSq = dSq;
        fallbackZone = b.zoneId;
      }
    }
  }

  if (fallbackZone < 1) {
    return -1;
  }
  return resolveZoneAtPointer(mx, my, fallbackZone);
}

/** Ant zonų ribų: be histerezės t≈0.5 šokinėja A↔B ir užrašai „persimeta“. */
let _resolveZoneSticky = -1;

function clearZoneHoverSticky() {
  _resolveZoneSticky = -1;
}

function resolveZoneAtPointer(px, py, fallbackZone) {
  let blend = getZoneBlendAtPoint(px, py, fallbackZone);

  if (fallbackZone === 8 && blend.zoneA !== blend.zoneB) {
    let a = blend.zoneA;
    let b = blend.zoneB;
    if (a === 8 || b === 8) {
      let t = blend.t;
      let toward8 = a === 8 ? 1 - t : t;
      if (toward8 >= 0.36) {
        _resolveZoneSticky = 8;
        return 8;
      }
    }
  }

  if (blend.zoneA === blend.zoneB) {
    _resolveZoneSticky = blend.zoneA;
    return blend.zoneA;
  }

  let a = blend.zoneA;
  let b = blend.zoneB;
  let t = blend.t;
  let prev = _resolveZoneSticky;
  let out;
  if (prev !== a && prev !== b) {
    out = t >= 0.5 ? b : a;
  } else if (prev === a) {
    out = t >= 0.58 ? b : a;
  } else {
    out = t <= 0.42 ? a : b;
  }
  _resolveZoneSticky = out;
  return out;
}

function addSegmentToHoverGrid(segment, idx) {
  let minGX = floor(segment.minX / HOVER_GRID_SIZE);
  let maxGX = floor(segment.maxX / HOVER_GRID_SIZE);
  let minGY = floor(segment.minY / HOVER_GRID_SIZE);
  let maxGY = floor(segment.maxY / HOVER_GRID_SIZE);

  for (let gx = minGX; gx <= maxGX; gx++) {
    for (let gy = minGY; gy <= maxGY; gy++) {
      let key = gx + ":" + gy;
      let cell = hoverGrid.get(key);

      if (!cell) {
        cell = [];
        hoverGrid.set(key, cell);
      }

      cell.push(idx);
    }
  }
}

function getHoverGridCandidates(mx, my) {
  let gx = floor(mx / HOVER_GRID_SIZE);
  let gy = floor(my / HOVER_GRID_SIZE);
  let out = [];
  let seen = new Set();

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      let key = gx + dx + ":" + (gy + dy);
      let cell = hoverGrid.get(key);

      if (!cell) {
        continue;
      }

      for (let i = 0; i < cell.length; i++) {
        let idx = cell[i];

        if (seen.has(idx)) {
          continue;
        }

        seen.add(idx);
        out.push(idx);
      }
    }
  }

  return out;
}

function distToSegmentSq(px, py, x1, y1, x2, y2) {
  let A = px - x1;
  let B = py - y1;
  let C = x2 - x1;
  let D = y2 - y1;
  let dot = A * C + B * D;
  let lenSq = C * C + D * D;
  let param = lenSq !== 0 ? dot / lenSq : -1;

  let xx;
  let yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  let dx = px - xx;
  let dy = py - yy;

  return dx * dx + dy * dy;
}

function drawBarkPetal(x, y, w, h, rot) {
  push();
  translate(x, y);
  rotate(rot);
  noStroke();

  let petalsPerMark = fastRenderMode ? 3 : 5;

  for (let k = 0; k < petalsPerMark; k++) {
    let a = (TWO_PI / 5) * k;
    fill(158 + random(34), 168 + random(30), 186 + random(26), random(12, 34));
    ellipse(
      cos(a) * w * 0.2,
      sin(a) * h * 0.2,
      w * random(0.42, 0.62),
      h * random(0.42, 0.66)
    );
  }

  fill(182, 188, 198, random(6, 17));
  ellipse(0, 0, w * 0.24, h * 0.24);
  pop();
}

function drawOuterZoneGrowthLeaves() {
  if (!branchSegments || branchSegments.length === 0) {
    return;
  }

  let outerActive = 0;
  let growthSum = 0;
  for (let z = 2; z <= 8; z++) {
    let g = outerZoneLeafGrowth[z] || 0;
    if (g > 0.001) {
      outerActive++;
      growthSum += g;
    }
  }
  let outerHeavy =
    outerActive >= 4 ||
    growthSum >= 2.35 ||
    (typeof activeZoneCount === "number" && activeZoneCount >= 6);
  let outerMedium =
    outerActive >= 3 ||
    growthSum >= 1.3 ||
    (typeof activeZoneCount === "number" && activeZoneCount >= 5);
  let segStep = outerHeavy ? 2 : 1;
  let simpleLeaf = outerHeavy;
  let reduceMotion =
    typeof prefersReducedMotionCanvas === "function" && prefersReducedMotionCanvas();

  for (let zone = 2; zone <= 8; zone++) {
    let growth = outerZoneLeafGrowth[zone] || 0;
    if (growth <= 0.001) {
      continue;
    }

    let zc = getRuntimeZoneColor(zone);
    let leafA = [lerp(246, zc[0], 0.24), lerp(220, zc[1], 0.26), lerp(236, zc[2], 0.24)];
    let leafB = [lerp(232, zc[0], 0.31), lerp(214, zc[1], 0.33), lerp(242, zc[2], 0.3)];
    let vein = [lerp(255, zc[0], 0.12), lerp(246, zc[1], 0.12), lerp(236, zc[2], 0.12)];
    let core = [lerp(255, zc[0], 0.08), lerp(252, zc[1], 0.08), lerp(246, zc[2], 0.08)];

    let gateThreshold = growth;
    if (growth > 0.5) {
      let over = (growth - 0.5) / 0.5;
      gateThreshold = growth / (1 + over * 0.4);
    }
    let leafPasses = growth > 0.82 ? 2 : 3;
    if (outerHeavy || reduceMotion) {
      leafPasses = 1;
    } else if (outerMedium || (typeof fastRenderMode !== "undefined" && fastRenderMode)) {
      leafPasses = min(leafPasses, 2);
    }

    let i0 = segStep > 1 ? zone & 1 : 0;
    for (let i = i0; i < branchSegments.length; i += segStep) {
      let b = branchSegments[i];
      if (b.zoneId !== zone || b.weight > 5.1) {
        continue;
      }

      let segLen = dist(b.x1, b.y1, b.x2, b.y2);
      if (segLen < 8) {
        continue;
      }

      for (let k = 0; k < leafPasses; k++) {
        let seed = (zone * 1000003 + i * 9176 + k * 131) * 0.00001;
        let gate = fract(sin(seed * 12.9898) * 43758.5453);
        if (gate > gateThreshold) {
          continue;
        }

        let t = fract(sin((seed + 1.371) * 78.233) * 12345.678);
        let side = fract(sin((seed + 2.991) * 44.123) * 32454.123) > 0.5 ? 1 : -1;
        let px = lerp(b.x1, b.x2, t);
        let py = lerp(b.y1, b.y2, t);
        let dx = b.x2 - b.x1;
        let dy = b.y2 - b.y1;
        let dLen = max(0.0001, sqrt(dx * dx + dy * dy));
        let nx = -dy / dLen;
        let ny = dx / dLen;
        let off = (1.5 + b.weight * 0.45) * side;
        px += nx * off;
        py += ny * off;

        let szX = lerp(4.2, 8.8, fract(sin((seed + 4.1) * 97.7) * 11677.1));
        let szY = szX * lerp(0.58, 0.78, fract(sin((seed + 6.4) * 53.4) * 9182.2));
        let tone = lerp(0.84, 1.12, fract(sin((seed + 8.7) * 25.1) * 7263.3));
        let blossomSwing = reduceMotion
          ? 0
          : sin((typeof frameCount === "number" ? frameCount : 0) * 0.031 + seed * 19.7) * 0.22;

        push();
        translate(px, py);
        rotate(atan2(dy, dx) + side * 0.72 + blossomSwing);

        if (simpleLeaf) {
          noStroke();
          fill(leafA[0] * tone, leafA[1] * tone, leafA[2] * tone, 184);
          ellipse(0, 0, szX * 1.48, szY * 1.06);
          fill(leafB[0] * tone * 0.97, leafB[1] * tone * 0.97, leafB[2] * tone * 0.97, 158);
          ellipse(szX * 0.08, 0, szX * 0.88, szY * 0.78);
        } else {
          noStroke();
          fill(leafA[0] * tone, leafA[1] * tone, leafA[2] * tone, 188);
          ellipse(0, 0, szX * 1.55, szY * 1.1);
          fill(leafB[0] * tone * 0.97, leafB[1] * tone * 0.97, leafB[2] * tone * 0.97, 172);
          ellipse(szX * 0.24, 0, szX * 1.02, szY * 0.86);
          ellipse(-szX * 0.2, 0, szX * 0.92, szY * 0.82);

          stroke(vein[0], vein[1], vein[2], 108);
          strokeWeight(0.7);
          line(-szX * 0.42, 0, szX * 0.28, 0);

          noStroke();
          fill(core[0], core[1], core[2], 64);
          ellipse(0, 0, szX * 0.36, szY * 0.3);
        }
        pop();
      }
    }
  }
}

/**
 * Daug įėjimų / išėjimų iš gylio: outerZoneLeafGrowth greitai priartėja prie 1 ir
 * drawOuterZoneGrowthLeaves kiekvieną kadrą perbėga beveik visus segmentus — tada lagina.
 * Lėtai mažiname tik tada, kai bendra apkrova jau didelė (vizualiai beveik nepastebima).
 */
function softenOuterZoneLeafGrowthForPerf() {
  if (typeof outerZoneLeafGrowth === "undefined" || !outerZoneLeafGrowth.length) {
    return;
  }
  if (typeof currentView !== "undefined" && currentView !== "tree") {
    return;
  }
  if (typeof asBreakSequenceActive !== "undefined" && asBreakSequenceActive) {
    return;
  }
  let sum = 0;
  for (let z = 2; z <= 8; z++) {
    sum += outerZoneLeafGrowth[z] || 0;
  }
  if (sum < 1.08) {
    return;
  }
  let f = sum > 2.5 ? 0.9985 : 0.99932;
  for (let z = 2; z <= 8; z++) {
    let g = outerZoneLeafGrowth[z] || 0;
    if (g > 0.001) {
      outerZoneLeafGrowth[z] = max(0, g * f);
    }
  }
}

function drawZoneMemoryImprints() {
  if (!branchSegments || branchSegments.length === 0 || zoneStage[1] === 0) {
    return;
  }

  let memoryZoneCount = 0;
  for (let z = 2; z <= 8; z++) {
    if ((deepZoneEntryCount[z] || 0) >= 2) {
      memoryZoneCount++;
    }
  }
  let imprintStep =
    memoryZoneCount >= 6 ? 3 : memoryZoneCount >= 4 ? 2 : 1;

  blendMode(ADD);
  strokeCap(ROUND);
  let pulse = 0.5 + 0.5 * sin(millis() * 0.0048);

  for (let zone = 2; zone <= 8; zone++) {
    let entries = deepZoneEntryCount[zone] || 0;
    if (entries < 2) {
      continue;
    }

    let strength = constrain((entries - 1) * 0.23, 0.12, 0.9);
    let c = getRuntimeZoneColor(zone);
    let alpha = (22 + 62 * strength) * (0.82 + 0.36 * pulse);
    let widthBoost = 1.05 + 0.55 * strength;
    let skipHalfImprints = entries >= 2;
    if (skipHalfImprints) {
      alpha = min(255, alpha * 1.12);
    }

    let iStart = imprintStep > 1 ? zone & 1 : 0;
    for (let i = iStart; i < branchSegments.length; i += imprintStep) {
      if (skipHalfImprints && (i & 1) !== (zone & 1)) {
        continue;
      }
      let b = branchSegments[i];
      if (b.zoneId !== zone || b.weight > 4.4) {
        continue;
      }

      stroke(c[0], c[1], c[2], alpha);
      strokeWeight(max(1, b.weight * widthBoost));
      line(b.x1, b.y1, b.x2, b.y2);
    }
  }

  blendMode(BLEND);
}

function fract(v) {
  return v - floor(v);
}

function drawShadowBranchesLayer() {
  let pyktis = getEmotionWeight(8);
  let meile = getEmotionWeight(6);
  let juokas = getEmotionWeight(3);
  let shadowDrive = max(pyktis * 0.12, meile * 0.07, juokas * 0.08);
  shadowDrive += emotionConflict * 0.55 + geometryInstability * 0.35;
  let asMetaMode = currentView === "deep" && focusedZone === 2;
  if (asMetaMode) {
    shadowDrive += 0.45;
  }
  if (!showConflictDebug && shadowDrive < 0.2) {
    return;
  }

  let t = millis() * 0.002;
  let driveK = constrain(shadowDrive, 0, 1.8);
  let drift = 4 + 9 * driveK + formChangeIntensity * 6;
  let alpha = 55 + 85 * driveK;
  if (showConflictDebug) {
    drift = max(drift, 11);
    alpha = 230;
  }
  strokeWeight(showConflictDebug ? 2 : 1.35);

  for (let i = 0; i < branchSegments.length; i++) {
    let b = branchSegments[i];
    if (b.zoneId < 2) {
      continue;
    }
    let memoryBoost = 1;
    if (b.zoneId === strongestMomentZone || b.zoneId === dominantEmotionZone) {
      memoryBoost = 1.45;
    }
    memoryBoost += (ghostImprint[b.zoneId] || 0) * 0.35;
    /* Deterministinis „skip“ vietoj random() — tūkstančiai kvietinių kiekviename kadre buvo brangu. */
    if (!showConflictDebug) {
      let gate = fract(sin(i * 12.9898 + t * 2.714) * 43758.5453);
      let gateSkip = 0.45 + driveK * 0.2;
        if (typeof activeZoneCount === "number" && activeZoneCount >= 5) {
          gateSkip += 0.12;
        } else if (typeof activeZoneCount === "number" && activeZoneCount >= 4) {
          gateSkip += 0.06;
        }
        if (pyktis >= 9) {
          gateSkip += 0.08 + min(0.1, (pyktis - 9) * 0.006);
        }
        if (gate > gateSkip) {
        continue;
      }
    }
    let profileDrift = 1 + abs(oldGhostGeometry.angle - 1) * 0.6 + oldGhostGeometry.jitter * 0.8;
    let ox = sin(t + i * 0.13) * drift * profileDrift;
    let oy = cos(t * 1.3 + i * 0.11) * drift * (0.8 + oldGhostGeometry.sharpness * 0.3);
    stroke(
      showConflictDebug
        ? color(80, 255, 255, alpha * memoryBoost)
        : color(170, 245, 255, alpha * memoryBoost)
    );
    line(b.x1 + ox, b.y1 + oy, b.x2 + ox, b.y2 + oy);
  }
}
function drawConflictHotspotAura() {
  if (!conflictHotspots || conflictHotspots.length === 0) {
    return;
  }
  noStroke();
  blendMode(ADD);
  for (let i = 0; i < conflictHotspots.length; i++) {
    let h = conflictHotspots[i];
    snapHotspotToTree(h);
    let p = 0.5 + 0.5 * sin(millis() * 0.004 + i * 0.9);
    let r = h.radius * (0.24 + 0.18 * p);
    let a = 10 + 26 * h.strength * p;
    let cA = [255, 70, 140];
    let cB = [90, 210, 255];
    if (currentConflictType === "inner_break") {
      cA = [255, 90, 90];
      cB = [110, 200, 255];
    } else if (currentConflictType === "overflow") {
      cA = [255, 170, 120];
      cB = [255, 120, 210];
    } else if (currentConflictType === "masking") {
      cA = [255, 240, 120];
      cB = [170, 255, 220];
    }
    fill(cA[0], cA[1], cA[2], a);
    circle(h.x, h.y, r * 2);
    fill(cB[0], cB[1], cB[2], a * 0.62);
    circle(h.x, h.y, r * 1.2);

    if (showConflictDebug) {
      noFill();
      stroke(255, 240, 120, 220);
      strokeWeight(1.5);
      circle(h.x, h.y, h.radius * 2);
      noStroke();
      fill(255, 90, 90, 230);
      circle(h.x, h.y, 8);
      fill(255, 255, 255, 220);
      textAlign(CENTER, CENTER);
      if (typeof fontUI_clean === "function") {
        fontUI_clean();
      } else {
        textFont(typeof FONT_SANS !== "undefined" ? FONT_SANS : "Inter");
      }
      textSize(11);
      text("H" + i, h.x, h.y - h.radius * 0.55);
    }
  }
  blendMode(BLEND);
}

function snapHotspotToTree(h) {
  if (!h || !branchSegments || branchSegments.length === 0) {
    return;
  }

  let bestX = h.x;
  let bestY = h.y;
  let bestD = Infinity;

  // Sample sparse subset for performance.
  let step = max(1, floor(branchSegments.length / 220));
  for (let i = 0; i < branchSegments.length; i += step) {
    let b = branchSegments[i];
    if (!b) {
      continue;
    }
    let mx = (b.x1 + b.x2) * 0.5;
    let my = (b.y1 + b.y2) * 0.5;
    let d = dist(h.x, h.y, mx, my);
    if (d < bestD) {
      bestD = d;
      bestX = mx;
      bestY = my;
    }
  }

  // Pull hotspot toward real branch space if drifting into empty air.
  if (bestD > 24) {
    let pull = bestD > 100 ? 0.32 : 0.16;
    h.x = lerp(h.x, bestX, pull);
    h.y = lerp(h.y, bestY, pull);
  }
}

