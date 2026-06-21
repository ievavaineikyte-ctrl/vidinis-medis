/**
 * Gylio tipografija išskirta iš tree-deep.js,
 * kad atsakomybės būtų aiškesnės ir failai mažesni.
 */
function setDeepCaptionFont() {
  if (typeof setDeepDescriptionFont === "function") {
    setDeepDescriptionFont();
    return;
  }
  if (typeof setAsDeepSansFont === "function") {
    setAsDeepSansFont();
  } else if (typeof deepCaptionFont !== "undefined" && deepCaptionFont) {
    textFont(deepCaptionFont);
    textStyle(NORMAL);
  } else {
    textFont(FONT_SANS);
    textStyle(NORMAL);
  }
}

/** Poetinės / emocinės gylio frazės — Playfair (žr. `deepPoeticMono`). */
function setDeepEmotionFont() {
  textFont(treeCanvasFontFallback("deepPoeticMono"));
  textStyle(NORMAL);
}

/**
 * Išorinio medžio zonos caption antraštės dydis (Inter); gylio title naudoja `setDeepZoneTitleFont`.
 */
function getTreeZoneCaptionTitleTextSize() {
  return min(30, max(20, width * 0.022));
}

/** Gylio zonos pavadinimas (title) — Inter. */
function setDeepZoneTitleFont() {
  textFont(treeCanvasFontFallback("deepZoneTitle"));
  textStyle(NORMAL);
}

/**
 * Inter bold — „SISTEMA SUGADINTA“, Pyktis „mano riba“ / „PERŽENGTA“, terminalo antraštės.
 * Poetikai — atskirai `setDeepEmotionFont()` (Playfair).
 */
function setDeepZoneTitleFontBold() {
  if (typeof setUiSansFontMedium === "function") {
    setUiSansFontMedium();
  } else {
    textFont(treeCanvasFontFallback("uiSansMedium"));
    textStyle(BOLD);
  }
}
