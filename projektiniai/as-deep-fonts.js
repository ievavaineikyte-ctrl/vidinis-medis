/**
 * Gylio režimo sans (antraštės, CTA) — tas pats kaip visas medis: Inter.
 * Kraunama prieš tree-deep.js; runtime gali deleguoti į sketch-core setUiSansFont().
 */
function setAsDeepSansFont() {
  if (typeof setUiSansFont === "function") {
    setUiSansFont();
    return;
  }
  textFont(FONT_SANS);
  textStyle(NORMAL);
}
