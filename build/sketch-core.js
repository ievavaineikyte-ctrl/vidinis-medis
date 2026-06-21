/** Inter — išorė, įėjimo herojus, gylio title; Playfair — tik gylio poetika (`deepPoeticMono`, `TREE_CANVAS_FONTS`). */
var uiSansFont;
var uiSansFontMedium;
/** „0 1 0 1“ ir kt. — tas pats Inter stack kaip `uiMono`. */
var asMonoFont;
/** Atsarginė nuoroda į bazinį UI šriftą (senas kodas naudoja deepCaptionFont). */
var deepCaptionFont;
/**
 * Rolės: Inter — išorė, įėjimo ekranas, gylio title, SISTEMA/Pyktis bold; Playfair — tik gylio poetinės frazės.
 */

function treeCanvasFontFallback(key) {
  if (typeof TREE_CANVAS_FONTS !== "undefined" && TREE_CANVAS_FONTS[key]) {
    return TREE_CANVAS_FONTS[key];
  }
  if (key === "uiSans" || key === "uiSansMedium") {
    return FONT_SANS;
  }
  if (key === "uiMono") {
    return (typeof TREE_CANVAS_FONTS !== "undefined" && TREE_CANVAS_FONTS.uiMono) || "Inter";
  }
  if (key === "asDeepDisplay") {
    return (typeof TREE_CANVAS_FONTS !== "undefined" && TREE_CANVAS_FONTS.asDeepDisplay) || "Inter";
  }
  if (key === "uiDeepDescription") {
    return (typeof TREE_CANVAS_FONTS !== "undefined" && TREE_CANVAS_FONTS.uiDeepDescription) || "Inter";
  }
  if (key === "deepEmotionSerif") {
    return (typeof TREE_CANVAS_FONTS !== "undefined" && TREE_CANVAS_FONTS.deepEmotionSerif) || "Inter";
  }
  if (key === "deepPoeticMono") {
    return (
      (typeof TREE_CANVAS_FONTS !== "undefined" && TREE_CANVAS_FONTS.deepPoeticMono) ||
      "Playfair Display"
    );
  }
  if (key === "deepZoneTitle") {
    return (
      (typeof TREE_CANVAS_FONTS !== "undefined" && TREE_CANVAS_FONTS.deepZoneTitle) || "Inter"
    );
  }
  if (key === "entryPhraseSmall") {
    return (
      (typeof TREE_CANVAS_FONTS !== "undefined" && TREE_CANVAS_FONTS.entryPhraseSmall) || "Inter"
    );
  }
  if (key === "entryPhraseHero") {
    return (
      (typeof TREE_CANVAS_FONTS !== "undefined" && TREE_CANVAS_FONTS.entryPhraseHero) ||
      "Playfair Display"
    );
  }
  return "sans-serif";
}

function treeSceneBackgroundRgbArray() {
  if (typeof TREE_SCENE_BG_RGB !== "undefined" && TREE_SCENE_BG_RGB && TREE_SCENE_BG_RGB.length >= 3) {
    return TREE_SCENE_BG_RGB;
  }
  return [7, 6, 5];
}

function treeSceneBackgroundFlat() {
  let c = treeSceneBackgroundRgbArray();
  background(c[0], c[1], c[2]);
}

/**
 * Radialinis fonas už medžio – židinys žemiau (kamienas nuo apačios), siauresnis šviesus branduolys.
 */
function treeSceneBackgroundBackdrop() {
  if (typeof width !== "number" || typeof height !== "number" || !isFinite(width) || !isFinite(height) || width < 1 || height < 1) {
    treeSceneBackgroundFlat();
    return;
  }
  let base = treeSceneBackgroundRgbArray();
  let center =
    typeof TREE_SCENE_BG_CENTER_RGB !== "undefined" && TREE_SCENE_BG_CENTER_RGB && TREE_SCENE_BG_CENTER_RGB.length >= 3
      ? TREE_SCENE_BG_CENTER_RGB
      : [min(255, base[0] + 8), min(255, base[1] + 7), min(255, base[2] + 7)];
  let edge =
    typeof TREE_SCENE_BG_EDGE_RGB !== "undefined" && TREE_SCENE_BG_EDGE_RGB && TREE_SCENE_BG_EDGE_RGB.length >= 3
      ? TREE_SCENE_BG_EDGE_RGB
      : [max(0, base[0] - 4), max(0, base[1] - 3), max(0, base[2] - 3)];
  let ctx = drawingContext;
  if (!ctx || typeof ctx.createRadialGradient !== "function") {
    treeSceneBackgroundFlat();
    return;
  }
  let cx = width * 0.5;
  let cy = height * 0.44;
  let r = Math.hypot(width, height) * 0.64;
  let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, "rgb(" + center[0] + "," + center[1] + "," + center[2] + ")");
  g.addColorStop(0.36, "rgb(" + base[0] + "," + base[1] + "," + base[2] + ")");
  g.addColorStop(0.78, "rgb(" + edge[0] + "," + edge[1] + "," + edge[2] + ")");
  g.addColorStop(1, "rgb(" + edge[0] + "," + edge[1] + "," + edge[2] + ")");
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/** Inter — UI / antraštės / statusai (canvas). */
function setUiSansFont() {
  if (typeof uiSansFont !== "undefined" && uiSansFont) {
    textFont(uiSansFont);
  } else {
    textFont(treeCanvasFontFallback("uiSans"));
  }
  textStyle(NORMAL);
}

/** Paryškintas Inter (medžio UI). */
function setUiSansFontMedium() {
  if (typeof uiSansFontMedium !== "undefined" && uiSansFontMedium) {
    textFont(uiSansFontMedium);
  } else {
    textFont(treeCanvasFontFallback("uiSansMedium"));
  }
  textStyle(BOLD);
}

function setDeepDescriptionFont() {
  textFont(treeCanvasFontFallback("uiDeepDescription"));
  textStyle(NORMAL);
}

function setDeepDescriptionFontBold() {
  textFont(treeCanvasFontFallback("uiDeepDescription"));
  textStyle(BOLD);
}

/** Senas alias — dabar tas pats Inter kaip setDeepDescriptionFont. */
function setDeepPoeticFont() {
  setDeepDescriptionFont();
}

/** Inter — dekoratyvus „0 1 0 1“ fragmentas (tas pats šeimos stilius kaip UI). */
function setAsGlitchMonoFont() {
  if (typeof asMonoFont !== "undefined" && asMonoFont) {
    textFont(asMonoFont);
  } else {
    textFont(treeCanvasFontFallback("uiMono"));
  }
  textStyle(NORMAL);
}

/** Inter — gylio fonas (tinklelis, juostos, kriptinis tekstas). */
function setAsDeepDisplayFont() {
  textFont(treeCanvasFontFallback("asDeepDisplay"));
  textStyle(NORMAL);
}

/** Inter Bold — „SISTEMA SUGADINTA“, Pyktis hero ir pan. */
function setAsDeepDisplayFontBold() {
  textFont(treeCanvasFontFallback("asDeepDisplay"));
  textStyle(BOLD);
}

function setup() {
  if (typeof initRuntimeZoneSession === "function") {
    initRuntimeZoneSession();
  }
  pixelDensity(1);
  let cw =
    typeof getLayoutCanvasWidth === "function"
      ? getLayoutCanvasWidth()
      : typeof getViewportWidth === "function"
        ? getViewportWidth()
        : window.innerWidth;
  let ch =
    typeof getLayoutCanvasHeight === "function"
      ? getLayoutCanvasHeight()
      : typeof getViewportHeight === "function"
        ? getViewportHeight()
        : window.innerHeight;
  let treeCnv = createCanvas(cw, ch);
  if (treeCnv && typeof treeCnv.mouseOver === "function" && typeof treeCnv.mouseOut === "function") {
    treeCnv.mouseOver(treeCanvasPointerEnter);
    treeCnv.mouseOut(treeCanvasPointerLeave);
  }
  /* Stabilus taikinys — be 24↔45 perjungimų, kurie jaučiami kaip „lagas“. */
  frameRate(60);
  if (typeof initViewportListeners === "function") {
    initViewportListeners();
  }
  try {
    if (typeof window !== "undefined" && window.matchMedia) {
      let mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      let onMotionPref = function () {
        if (typeof redraw === "function") {
          redraw();
        }
        if (typeof loop === "function") {
          loop();
        }
      };
      if (mq.addEventListener) {
        mq.addEventListener("change", onMotionPref);
      } else if (mq.addListener) {
        mq.addListener(onMotionPref);
      }
    }
  } catch (e) {}
  if (document.fonts && document.fonts.load) {
    let F = typeof TREE_CANVAS_FONTS !== "undefined" ? TREE_CANVAS_FONTS : null;
    let sansStack = FONT_SANS;
    let sansPrimary = "Inter";
    if (sansStack && typeof sansStack === "string") {
      let head = sansStack.split(",")[0].trim();
      if (head.length >= 2 && ((head[0] === '"' && head[head.length - 1] === '"') || (head[0] === "'" && head[head.length - 1] === "'"))) {
        head = head.slice(1, -1);
      }
      if (head) {
        sansPrimary = head;
      }
    }
    document.fonts.load('16px "' + sansPrimary + '"').catch(function () {});
    document.fonts.load('500 16px "' + sansPrimary + '"').catch(function () {});
    document.fonts.load('600 16px "' + sansPrimary + '"').catch(function () {});
    document.fonts.load('700 16px "' + sansPrimary + '"').catch(function () {});
    let entryHero = F && F.entryPhraseHero ? F.entryPhraseHero : "Inter";
    document.fonts.load('700 18px "' + entryHero + '"').catch(function () {});
    document.fonts.load('500 18px "' + entryHero + '"').catch(function () {});
    document.fonts.load('italic 400 18px "' + entryHero + '"').catch(function () {});
    let pf = "Playfair Display";
    document.fonts.load('400 20px "' + pf + '"').catch(function () {});
    document.fonts.load('500 20px "' + pf + '"').catch(function () {});
    document.fonts.load('600 20px "' + pf + '"').catch(function () {});
    document.fonts.load('700 20px "' + pf + '"').catch(function () {});
    document.fonts.load('italic 400 20px "' + pf + '"').catch(function () {});
    document.fonts.load('italic 500 20px "' + pf + '"').catch(function () {});
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (typeof redraw === "function") {
        redraw();
      }
      if (typeof loop === "function") {
        loop();
      }
    });
  }
  initGenerativeState();
  loadEmotionMemory();
  sessionEntryStartMs = millis();
  scheduleStartupGlitch();
  if (typeof setInterval === "function") {
    setInterval(function () {
      if (typeof currentView === "undefined" || currentView !== "tree") {
        return;
      }
      if (typeof deepEnterFadePhase !== "undefined" && deepEnterFadePhase === 1) {
        return;
      }
      if (typeof areOuterZonesUnlocked !== "function" || !areOuterZonesUnlocked()) {
        return;
      }
      /* Jau loop — perteklinis loop() tik apkrauna planuoklį. */
      if (typeof isLooping === "function" && isLooping()) {
        return;
      }
      /* Retesnis pabudimas — decay naudoja dt, todėl 2.2 s tarpas saugus; mažiau „stuckelių“ idle. */
      if (typeof loop === "function") {
        loop();
      }
    }, 2200);
  }
}

let sway = 0;
let isSwaying = false;
let startupMs = -1;
let swayStartMs = 0;

const GLITCH_DELAY_MS = 0;
const GLITCH_DURATION_MS = 90;

let sceneRevealStartMs = -1;
const SCENE_REVEAL_MS = 3400;

let fastRenderMode = false;
let firstClickGlitchDone = false;
let firstScreenGlitchUntilMs = 0;
const FIRST_SCREEN_GLITCH_MS = 420;
const ZONE_BLOOM_WARP_MS = 1100;
let zoneBloomUntilMs = new Float32Array(9);
/** Po pirmo „Mano esybė“ atrakinimo — širdies šakos papildomas švytėjimas / „twinkle“. */
const HEART_UNLOCK_BRANCH_PULSE_MS = 5600;
let heartUnlockBranchPulseUntilMs = 0;
let zoneShapeMorphStrength = new Float32Array(9);
let zoneShapeMorphTarget = new Float32Array(9);
let zoneShapeMorphFrom = new Float32Array(9);
let zoneShapeMorphStartMs = new Float64Array(9);
const ZONE_SHAPE_MORPH_MS = 940;
/** Pyktis morph — trumpesnis ir su retesniu pilno medžio perbraižymu (našumas). */
const ZONE_SHAPE_MORPH_MS_PYKTIS = 520;

let branchSegments = [];
let hoverGrid = new Map();
const HOVER_GRID_SIZE = 32;

let treeBaseBuffer = null;
let treeBaseValid = false;
let cachedBranchSegments = null;
let cachedHoverGrid = null;

let glitchFullFrame = null;
let glitchTreeFrameStartup = null;
let glitchTreeFrameFinale = null;

let hoveredZoneId = -1;
const BRANCH_PICK_RADIUS = 2.5;

/** Bazinis užpildymo greitis; žemiau slenkstis — dar greitesnis pirmiems kadrų. */
const ZONE_FILL_SPEED = 0.022;
const ZONE_FILL_SPEED_BOOT = 0.042;

let zoneFillProgress = new Float32Array(9);
let zoneActivated = new Uint8Array(9);
let zoneFillTarget = new Float32Array(9);
let zoneStage = new Uint8Array(9); // 0=hover-only, 1=selected, 2=opened

let hasAnyZoneFill = false;
let activeZoneCount = 0;
let pointerDirty = true;
/** false kai pelė už drobės (p5.Element mouseOut + koordinatės mouseMoved). */
let treeCanvasPointerInside = true;

let revealPulseUntilMs = 0;
let revealPulseStrength = 0;
let revealPulseDurationMs = 190;
let revealPulseMode = 0;

let finaleGlitchUntilMs = 0;
const FINALE_GLITCH_MS = 2600;

/** Pyktis: antras bandymas į gylį — trumpas „užsidarymo“ blyksnis ant medžio. */
let pyktisRejectionFlashUntilMs = 0;
let pyktisRejectionFlashDurationMs = 780;

let currentCaptionTitle = "";
let currentCaptionText = "";
let currentCaptionEpilogue = "";
let currentCaptionUntilMs = 0;
let currentCaptionZone = -1;
let currentCaptionStartMs = 0;
/** 2…8: zona, kur vartotojas bandė patekti, kol „Pradėk nuo pagrindo“ — frazė išilgai šakos. */
var lockedStartPromptFromZone = -1;
const CAPTION_FADE_IN_MS = 420;
/** Po `currentCaptionUntilMs` — švelnus išnykimas (ne „nukirptas“ viršutiniai hintai). */
const CAPTION_FADE_OUT_MS = 720;
/** Gylio pastabos / statuso tekstui — lėtesnis įėjimas nei viršutinėms užuominoms. */
const DEEP_CAPTION_FADE_IN_MS = 700;

let deepReturnCalmUntilMs = 0;
/**
 * Po gylio: 0 = jokių vėlavimų — hover, antra paspaudimo užuomina, aura ir antraštės iškart kaip įprasta.
 * Jei norėsi vėl „tylos“ lango, padidink (pvz. 1200–3400).
 */
const DEEP_RETURN_CALM_MS = 0;

/** Po lūžio „Sustabdyti“ — švelnus nuraminimo sluoksnis (ms). */
let asBreakExitCalmStartMs = -1;
const AS_BREAK_EXIT_CALM_MS = 1400;

let currentView = "tree"; // "tree" | "deep"
let focusedZone = -1;

/** Pirmas kontaktas: „paliesk“ (be ilgos instrukcijos). */
let showTouchHint = true;
let touchHintStartMs = -1;

/** Antras paspaudimas: pritraukiama šaka → užtamsėja → juoda, tada iškart gylis (be papildomo šviesėjimo). */
let deepEnterFadePhase = 0;
let deepEnterFadeStartMs = 0;
let deepEnterPendingZone = -1;
let deepEnterGlitchMode = 0;
let deepEnterGlitchSeed = 0;
let deepEnterGlitchFirstVisit = true;
let deepEnterGlitchEnabled = false;
/** Trukmė, per kurią t eina 0→1 (priartėjimas + medžio fade + juoda) – tik gylio įėjimas. */
const DEEP_ENTER_TOTAL_MS = 920;
/** Juoda pauzė prieš gylį (po animacijos). */
const DEEP_ENTER_PRE_DEEP_HOLD_MS = 240;
/** Iki šios dalies: priartėjimas + dim. */
const DEEP_ENTER_PULL_END = 0.52;
/**
 * 0–1 (tas pats t kaip getDeepEnterTransitionState): medis sluoksniu „išeina“ minkščiau,
 * o ne staigiu kirpimu. Pabaigoje t — tik gryna juoda (be buferio).
 */
const DEEP_ENTER_TREE_FADE_START = 0.30;
const DEEP_ENTER_TREE_FADE_END = 0.8;

let deepSeed = 1;
let deepZoneSeeds = {};
let deepZoneGrowth = Array(9).fill(0);
let deepZoneVisited = new Uint8Array(9);
let deepZoneEntryCount = new Uint16Array(9);
/** Sinchronizuojama su įėjimų skaičiumi — „atminties gylis“ (zonos 3–7). */
let zoneDepth = {
  kamienas: 0,
  as: 0,
  juokas: 0,
  jautrumas: 0,
  drama: 0,
  meile: 0,
  empatija: 0,
  pyktis: 0
};

function syncZoneDepthFromEntries() {
  zoneDepth.kamienas = deepZoneEntryCount[1] | 0;
  zoneDepth.as = deepZoneEntryCount[2] | 0;
  zoneDepth.juokas = deepZoneEntryCount[3] | 0;
  zoneDepth.jautrumas = deepZoneEntryCount[4] | 0;
  zoneDepth.drama = deepZoneEntryCount[5] | 0;
  zoneDepth.meile = deepZoneEntryCount[6] | 0;
  zoneDepth.empatija = deepZoneEntryCount[7] | 0;
  zoneDepth.pyktis = deepZoneEntryCount[8] | 0;
}

/** Gylio atminties medžiai (3–7): šakos pusė piešimui („left“ / „right“ / „single“). */
let deepTreeWing = "single";
/** Dabartinės zonos atminties gylis 1–2 (įėjimas / lūžis) — nustatoma prieš medį. */
let deepTreeMemoryDepth = 1;

let deepModeEnteredMs = 0;
let outerZoneLeafGrowth = new Float32Array(9);
let asBreakSequenceActive = false;
let asBreakStartMs = 0;
let asStopPromptVisible = false;
/** „Nepergyvenk…“ laikas — AS gylio 3-ioje fazėje (tree-deep + tree-effects-ui). */
const AS_BREAK_PHRASE_DELAY_MS = 2200;
const AS_BREAK_PHRASE_DURATION_MS = 2800;
/** Medžio lūžyje: po tiek ms rodomas „Sustabdyti“ (be frazės medyje). */
const AS_BREAK_WAIT_MS = 3200;

let deepHoldFrames = 0;
let deepGrowthProgress = 0;
/** Tik zona 8 (Pyktis): žaibinis „charge → explosion“, ne lėtas hold bar kitoms zonoms. */
let pyktisAngerCharge = 0;
let pyktisPrevCharge = 0;
let pyktisExplosionFramesLeft = 0;
/** Po sprogimo: „tylos“ būsena — skilusi linija, kol vėl neliečia branduolio. */
let pyktisPostBreakCalm = false;
/** Kol pelė nuleista ant Pykties branduolio — laikyk veikia net šiek tiek nuslinkus nuo centro. */
let pyktisCoreHoldLatched = false;
/** Po sprogimo pabaigos: Pyktis gylis lieka „lūžęs“ (glitch) kol neišeinama iš zonos. */
let pyktisDeepBrokenLatched = false;
const PYKTIS_EXPLOSION_FRAMES = 52;
let deepInitialized = false;
let deepHoldStartMs = -1;
/** Zone 2 (AS): cumulative hold time toward load bar; does not reset when mouse is released. */
let asDeepLoadCommittedMs = 0;
let asDeepLoadLastTickMs = -1;
let asDeepLatch404 = false;
let asDeepLatchSubtitle = false;
let deepZoneCinematicState = {};
const DEEP_HOLD_TRIGGER_MS = 900;
let deepReturnStatusText = "";
let deepReturnStatusStartMs = 0;
let deepReturnStatusUntilMs = 0;
let deepReturnStatusVariant = "none";
/** Kiekvienai zonai 3–7 atskirai: ar jau rodytas pirmo išėjimo iš jos gylio kvietimas. */
let deepFirstReturnHintShownByZone = new Uint8Array(9);
/** Kad iš eilės išeinant iš skirtingų zonų nekartotų tos pačios frazės, jei įmanoma. */
let _lastDeepFirstReturnHintLine = "";
/** Vieną kartą parodomas tekstas ir bloom, kai pirmą kartą atrakinama „Mano esybė“. */
let asHeartUnlockFanfareDone = false;

let isPointerDown = false;
let trunkIntroCalmUntilMs = 0;
let trunkZoneUnlockAtMs = 0;
const TRUNK_ENTRY_CALM_MS = 0;

/** Juodas įėjimas + vienas sakinys (prieš medį) — medis tik po „Atrask“ paspaudimo. */
let sessionEntryStartMs = 0;
/** Kol `true`, rodomas įvadas; `false` tik po `dismissEntryPhraseFromAtrask()`. */
var entryPhraseAwaitingClick = true;
const ENTRY_PHRASE_TEXT =
  typeof NARRATIVE_ENTRY_TEXT !== "undefined" ? NARRATIVE_ENTRY_TEXT : "Čia viskas prasideda";

/** Vienas netikėtas smūgis (vieną kartą naršyklėje). */
const ONE_TIME_SHOCK_STORAGE_KEY = "basic-medis-one-shock-done";
let oneTimeShockStartAtMs = -1;
let oneTimeShockPendingAtMs = 0;
let oneTimeShockHiddenZone = -1;
const ONE_TIME_SHOCK_MS = 950;
let deepExitCount = 0;
let emotionWeight = new Float32Array(9);
let generativeSessionSeed = 1;
let lastGenerativeRebuildMs = 0;
/** Tarpas iki naujos generatyvios medžio variacijos — ilgesnis = aiškesnis „kvėpavimas“. */
const TREE_REGEN_INTERVAL_MS = 20000;
/** Po intervalo: medis dar nepasikeičia šį laiką — tylus laukimas prieš naują ciklą. */
let generativeRegenArmedAtMs = 0;
const TREE_REGEN_QUIET_BEFORE_MS = 1700;
let reflectionProfiles = [];
const REFLECTION_HISTORY_MAX = 90;
let geometryInstability = 0;
let emotionConflict = 0;
let conflictHotspots = [];
let lastHotspotRegenMs = 0;
let showConflictDebug = false;
let lastEmotionDecayMs = 0;
let currentConflictType = "none";
let currentConflictIntensity = 0;
let lastEmotionZone = 1;
let strongestMomentZone = 1;
let strongestMomentValue = 0;
let dominantEmotionZone = 1;
let ghostImprint = new Float32Array(9);
let systemStateInfluence = 0;
let causeChainLog = [];
let lastCauseChainText = "";
let memoryPressure = 0;
let conflictHistory = [];
const CONFLICT_HISTORY_MAX = 5;
let repeatedConflictCount = 0;
let oldGhostGeometry = { angle: 1, jitter: 0.12, sharpness: 0.9 };
let formChangeIntensity = 0;
/** Svoriai iš emotionWeight (nudgeEmotionWeight / commitZoneActivation) maišosi į geometriją per getGlobalGeometryProfile(). */
const EMOTION_GEOMETRY = {
  juokas: { angle: 0.9, jitter: 0.25, sharpness: 0.9, zone: 3 },
  jautrumas: { angle: 0.6, jitter: 0.05, sharpness: 0.6, zone: 4 },
  drama: { angle: 1.0, jitter: 0.2, sharpness: 1.0, zone: 5 },
  meile: { angle: 0.7, jitter: 0.1, sharpness: 0.8, zone: 6 },
  pyktis: { angle: 1.4, jitter: 0.3, sharpness: 1.2, zone: 8 }
};

// Deep renderer shared vars (used by treeMaker/stickMaker/leafMaker when added).
let tmaxLen = 0;
let tminLen = 0;
let smaxLen = 0;
let sminLen = 0;
let growthProgress = 0;
let holdFrames = 0;
let leafDrawCount = 0;

const MAX_LEAVES_PER_FRAME = 1300;

/** Keli treeMaker (3–7) — šiek tiek mažesnis lapų limitas, kad kadras nepersikrautų. */
function getMaxLeavesPerFrame() {
  if (
    typeof currentView !== "undefined" &&
    currentView === "deep" &&
    typeof focusedZone === "number" &&
    typeof isDeepMemoryTreeZone === "function" &&
    isDeepMemoryTreeZone(focusedZone)
  ) {
    /* Drama (5) fazė 1 — šiek tiek mažesnis lapų limitas, kad mažiau lagintų. */
    if (
      focusedZone === 5 &&
      typeof deepTreeMemoryDepth === "number" &&
      deepTreeMemoryDepth === 1
    ) {
      return 560;
    }
    return 820;
  }
  return MAX_LEAVES_PER_FRAME;
}

let colKeep = 0;
let deepBarkAccent = [120, 120, 120];
let deepLeafA = [230, 200, 220];
let deepLeafB = [205, 215, 235];
let deepVein = [245, 232, 220];
let deepCore = [250, 244, 228];

/**
 * HTML „nyksta / lieka“ = target (0 = greičiau pamiršta, 1 = kaupiasi).
 * Sistema = current (inercija). Veikia: ghost decay, emocijų slopinimą, glitch, deep augimą / deformaciją.
 */
let emotionPersistenceCurrent = null;
const EMOTION_PERSISTENCE_LERP = 0.045;
const EMOTION_PERSISTENCE_DEADZONE = 0.01;
let _ghostLiekaDecayPulseUntilMs = 0;
let _ghostLiekaDecayPulseStartMs = 0;
let _ghostLiekaDecayNextPulseAtMs = 0;

function getEmotionPersistenceTarget() {
  if (typeof window !== "undefined" && typeof window.__emotionPersistence === "number") {
    return constrain(window.__emotionPersistence, 0, 1);
  }
  return 0.5;
}

function updateEmotionPersistenceSmooth() {
  let target = getEmotionPersistenceTarget();
  if (emotionPersistenceCurrent === null) {
    emotionPersistenceCurrent = target;
    return;
  }
  let diff = target - emotionPersistenceCurrent;
  if (abs(diff) < EMOTION_PERSISTENCE_DEADZONE) {
    emotionPersistenceCurrent = target;
  } else {
    emotionPersistenceCurrent += diff * EMOTION_PERSISTENCE_LERP;
  }
}

/** Emocinės būsenos „nuotaika“ (išlyginta) — ghost sluoksniui ir glitch. */
function getEmotionPersistenceSmooth() {
  return emotionPersistenceCurrent !== null ? emotionPersistenceCurrent : getEmotionPersistenceTarget();
}

/**
 * "Lieka" režime kartais trumpam sustiprėja ghost decay (trumpi netolygūs "nutekėjimai").
 * Grąžina multiplikatorių ghostDecay (1 = be pokyčio, mažiau = greitesnis slopinimas).
 */
function getLiekaGhostDecayBurstMul(nowMs, persistSmooth) {
  if (persistSmooth < 0.72) {
    _ghostLiekaDecayPulseUntilMs = 0;
    _ghostLiekaDecayPulseStartMs = 0;
    _ghostLiekaDecayNextPulseAtMs = 0;
    return 1;
  }
  if (_ghostLiekaDecayNextPulseAtMs <= 0) {
    _ghostLiekaDecayNextPulseAtMs = nowMs + random(900, 2600);
  }
  if (_ghostLiekaDecayPulseUntilMs <= nowMs && nowMs >= _ghostLiekaDecayNextPulseAtMs) {
    let dur = random(320, 880);
    _ghostLiekaDecayPulseStartMs = nowMs;
    _ghostLiekaDecayPulseUntilMs = nowMs + dur;
    _ghostLiekaDecayNextPulseAtMs = _ghostLiekaDecayPulseUntilMs + random(1200, 3600);
  }
  if (_ghostLiekaDecayPulseUntilMs <= nowMs || _ghostLiekaDecayPulseStartMs <= 0) {
    return 1;
  }
  let dur = max(1, _ghostLiekaDecayPulseUntilMs - _ghostLiekaDecayPulseStartMs);
  let ph = constrain((nowMs - _ghostLiekaDecayPulseStartMs) / dur, 0, 1);
  let env = sin(ph * PI); // smooth in/out
  let amp = lerp(0.08, 0.22, constrain((persistSmooth - 0.72) / 0.28, 0, 1));
  return constrain(1 - amp * env, 0.66, 1);
}

/**
 * „nyksta“ → mažiau glitch; „lieka“ → daugiau nestabilumo (reveal / startup / pirmas ekranas).
 */
function getGlitchMoodMultiplier() {
  let s = getEmotionPersistenceSmooth();
  return lerp(0.62, 1.42, s);
}

/**
 * Medžio / bendros scenos skaitmeninio glitch (RGB, blokai, „TV“) mastelis.
 * Dominantė: analoginis film grain (HTML) + švelnus fono grain; pilnas „sistemos skilimas“ – „Aš“ gilyje.
 * Nekeičia applyAsBreakSequenceChaos – tai „Aš“ nutrūkimo tęsinys medžio vaizde.
 */
function getTreeSceneDigitalGlitchScale() {
  return 0.36;
}

function isEntryPhraseActive() {
  return !!entryPhraseAwaitingClick;
}

function dismissEntryPhraseFromAtrask() {
  if (!entryPhraseAwaitingClick) {
    return false;
  }
  entryPhraseAwaitingClick = false;
  if (typeof sceneRevealStartMs === "number" && sceneRevealStartMs < 0) {
    sceneRevealStartMs = millis();
  }
  return true;
}

function hasOneTimeShockBeenDone() {
  try {
    return localStorage.getItem(ONE_TIME_SHOCK_STORAGE_KEY) === "1";
  } catch (e) {
    return false;
  }
}

function isOneTimeShockActive() {
  return oneTimeShockStartAtMs > 0 && millis() - oneTimeShockStartAtMs < ONE_TIME_SHOCK_MS;
}

function processPendingOneTimeShock() {
  if (oneTimeShockPendingAtMs <= 0) {
    return;
  }
  if (millis() < oneTimeShockPendingAtMs) {
    return;
  }
  oneTimeShockPendingAtMs = 0;
  oneTimeShockStartAtMs = millis();
  randomSeed((millis() % 100000) + generativeSessionSeed);
  oneTimeShockHiddenZone = floor(random(2, 9));
  try {
    localStorage.setItem(ONE_TIME_SHOCK_STORAGE_KEY, "1");
  } catch (e) {}
  loop();
}

function onDeepExitForShock() {
  if (hasOneTimeShockBeenDone()) {
    return;
  }
  deepExitCount++;
  if (deepExitCount < 2) {
    return;
  }
  oneTimeShockPendingAtMs = millis();
}

/**
 * Išorinis medis = pilnai atsiskleidęs po frazė + juodu SCENE_REVEAL overlay (žr. draw()).
 * Naudok body.tree-scene-revealed vėlesniems HTML užrašams; tas pats signalas kaip has-emotion-slider.
 */
function isTreeSceneRevealComplete() {
  if (typeof sceneRevealStartMs !== "number" || sceneRevealStartMs < 0) {
    return false;
  }
  return millis() - sceneRevealStartMs >= SCENE_REVEAL_MS;
}

/** Kontrolė tik pagrindinėje medžio scenoje, kai medis jau rodomas (ne įvadinė frazė, ne atskleidimo fade). */
let _emotionSliderDomSig = -1;
function syncEmotionSliderDomVisibility() {
  if (typeof document === "undefined" || !document.body) {
    return;
  }
  let elapsed = startupMs >= 0 ? millis() - startupMs : 0;
  let isStartupGlitching =
    startupMs >= 0 &&
    elapsed >= GLITCH_DELAY_MS &&
    elapsed < GLITCH_DELAY_MS + GLITCH_DURATION_MS;
  let revealComplete =
    currentView === "tree" && typeof isTreeSceneRevealComplete === "function" && isTreeSceneRevealComplete();
  let inDeepOrEntering =
    currentView === "deep" ||
    (typeof deepEnterFadePhase !== "undefined" && deepEnterFadePhase === 1);
  let show =
    !inDeepOrEntering &&
    currentView === "tree" &&
    document.body.classList.contains("is-loaded") &&
    !asBreakSequenceActive &&
    !isStartupGlitching &&
    !isEntryPhraseActive() &&
    revealComplete;
  let asSulauzykLock =
    currentView === "deep" &&
    typeof focusedZone === "number" &&
    focusedZone === 2 &&
    typeof getAsDeepShowSulauzyk === "function" &&
    getAsDeepShowSulauzyk();
  let nowTrunkTouched =
    typeof zoneStage !== "undefined" && zoneStage[1] > 0;
  /* trunk-touched turi patekti į parašą — kitaip po kamieno paspaudimo anksti return ir juosta niekad neatsiranda. */
  let domSig =
    (show ? 1 : 0) |
    (inDeepOrEntering ? 2 : 0) |
    (asSulauzykLock ? 4 : 0) |
    (nowTrunkTouched ? 8 : 0);
  if (domSig === _emotionSliderDomSig) {
    return;
  }
  _emotionSliderDomSig = domSig;
  let hadEmotionSlider = document.body.classList.contains("has-emotion-slider");
  document.body.classList.toggle("has-emotion-slider", show);
  document.body.classList.toggle("tree-scene-revealed", show);
  document.body.classList.toggle("deep-mode", inDeepOrEntering);
  document.body.classList.toggle("as-deep-sulauzyk", asSulauzykLock);
  if (show && !hadEmotionSlider && typeof document.dispatchEvent === "function") {
    try {
      document.dispatchEvent(new CustomEvent("medis-emotion-ui-ready", { bubbles: true }));
    } catch (e) {}
  }
  let wasTrunkTouched = document.body.classList.contains("trunk-touched");
  document.body.classList.toggle("trunk-touched", nowTrunkTouched);
  if (nowTrunkTouched && !wasTrunkTouched && typeof document.dispatchEvent === "function") {
    try {
      document.dispatchEvent(
        new CustomEvent("medis-trunk-first-touched", { bubbles: true })
      );
    } catch (e) {}
  }
}

function startDeepEnterTransition(zone) {
  if (zone < 1 || zone > 8) {
    return;
  }
  if (
    zone === 8 &&
    typeof deepZoneEntryCount !== "undefined" &&
    (deepZoneEntryCount[8] | 0) >= 1
  ) {
    return;
  }
  deepEnterPendingZone = zone;
  deepEnterFadePhase = 1;
  deepEnterFadeStartMs = millis();
  let visits =
    typeof deepZoneEntryCount !== "undefined" && zone >= 1 && zone <= 8
      ? deepZoneEntryCount[zone] | 0
      : 0;
  deepEnterGlitchFirstVisit = visits <= 0;
  deepEnterGlitchSeed = ((zone * 9973 + visits * 3253 + (millis() | 0)) >>> 0) % 100000;
  // Random per-entry: not every deep enter should glitch.
  // 1st visit = lighter + rarer, later visits = stronger + a bit more frequent.
  deepEnterGlitchEnabled = random() < (deepEnterGlitchFirstVisit ? 0.45 : 0.62);
  deepEnterGlitchMode = floor(random(0, 3));
  if (typeof resetDeepEnterCentroidCache === "function") {
    resetDeepEnterCentroidCache();
  }
  revealPulseUntilMs = 0;
  revealPulseStrength = 0;
  finaleGlitchUntilMs = 0;
  firstScreenGlitchUntilMs = 0;
  if (typeof zoneBloomUntilMs !== "undefined" && zoneBloomUntilMs.fill) {
    zoneBloomUntilMs.fill(0);
  }
  if (typeof heartUnlockBranchPulseUntilMs !== "undefined") {
    heartUnlockBranchPulseUntilMs = 0;
  }
  /* Pyktis: įėjimas į gylį — „laužo taisykles“: stipresnis ekrano plyšys nei kitoms zonoms. */
  if (zone === 8 && typeof triggerRevealPulse === "function") {
    triggerRevealPulse();
    if (typeof revealPulseStrength !== "undefined") {
      revealPulseStrength = max(revealPulseStrength, 1.86);
    }
    if (typeof revealPulseDurationMs !== "undefined") {
      revealPulseDurationMs = max(revealPulseDurationMs | 0, 1080);
    }
    if (typeof revealPulseUntilMs !== "undefined") {
      revealPulseUntilMs = millis() + (revealPulseDurationMs | 0);
    }
  }
  loop();
}

function _deepEnterEaseCubicInOut(u) {
  u = constrain(u, 0, 1);
  return u < 0.5 ? 4 * u * u * u : 1 - pow(-2 * u + 2, 3) / 2;
}

/**
 * 1) „Kamera“: priartėjimas (scale) apie pasirinktos šakos židinį – ne segmentų lokalus mastelis.
 * 2) Užtamsa + juoda, tada gylis.
 */
function getDeepEnterTransitionState() {
  let T = DEEP_ENTER_TOTAL_MS;
  let el = millis() - deepEnterFadeStartMs;
  let t = constrain(el / T, 0, 1);
  let pullEnd = DEEP_ENTER_PULL_END;
  let uPull = t < pullEnd ? t / pullEnd : 1;
  uPull = _deepEnterEaseCubicInOut(uPull);
  let uBlack = t <= pullEnd ? 0 : constrain((t - pullEnd) / (1 - pullEnd), 0, 1);
  uBlack = _deepEnterEaseCubicInOut(uBlack);

  let deFocus = deepEnterPendingZone;
  let cx0 = width * 0.5;
  let cy0 = height * 0.4;
  if (typeof getDeepEnterFocusCentroid === "function" && deFocus >= 1) {
    let c = getDeepEnterFocusCentroid(deFocus);
    cx0 = c.x;
    cy0 = c.y;
  }
  let cx = lerp(cx0, width * 0.5, uPull * 0.1);
  let cy = lerp(cy0, height * 0.44, uPull * 0.08);

  /** Be pilno ekrano užtemdymo — tik zoom + glitch (be „nusidažymo“). */
  let bgDim = 0;

  return {
    t,
    el,
    hideOthers: uPull,
    /** Visas medis + overlay vienoje koordinačių sistemoje. */
    cameraZoom: lerp(1, 1.55, uPull),
    /**
     * Nuo 1-o kadro tamsa (ne 0) – kitaip pilnas pilkas buferis = „senas“ visas medis.
     */
    bgDim: bgDim,
    black: uBlack,
    cx,
    cy,
    /** Ties t ≥ fade pabaiga: be medžio, tik tuščias fonas – tada nėra pilko per alfa. */
    inBlackoutPhase: t >= DEEP_ENTER_TREE_FADE_END
  };
}

/**
 * Medžio + zonų piešinys ant juodo: 1 = pilnas, 0 = nieko (paskutiniai t kai dar braižome).
 * Švelnus ease-in-out, kad ne „nukirptų“.
 */
function getDeepEnterTreeViewAlpha01(st) {
  if (typeof deepEnterFadePhase === "undefined" || deepEnterFadePhase !== 1) {
    return 1;
  }
  let t = st.t;
  let a0 = DEEP_ENTER_TREE_FADE_START;
  let a1 = DEEP_ENTER_TREE_FADE_END;
  if (t <= a0) {
    return 1;
  }
  if (t >= a1) {
    return 0;
  }
  let u = (t - a0) / (a1 - a0);
  u = _deepEnterEaseCubicInOut(constrain(u, 0, 1));
  return 1 - u;
}

function finalizeDeepEnterTransitionIfReady() {
  if (deepEnterFadePhase !== 1) {
    return false;
  }
  let st = getDeepEnterTransitionState();
  if (st.el < DEEP_ENTER_TOTAL_MS + DEEP_ENTER_PRE_DEEP_HOLD_MS) {
    return false;
  }
  let z = deepEnterPendingZone;
  deepEnterFadePhase = 0;
  deepEnterPendingZone = -1;
  if (typeof resetDeepEnterCentroidCache === "function") {
    resetDeepEnterCentroidCache();
  }
  enterDeepMode(z);
  return true;
}

function drawDeepEnterBackgroundDimLayer() {
  /* Pilnas dim išjungtas — bgDim visada 0 (žr. getDeepEnterTransitionState). */
}

function applyDeepEnterTransitionGlitch() {
  if (deepEnterFadePhase !== 1) {
    return;
  }
  if (!deepEnterGlitchEnabled) {
    return;
  }
  let st = getDeepEnterTransitionState();
  if (st.inBlackoutPhase) {
    return;
  }
  // Keep strongest around middle of transition, softer at start/end.
  let pulse = sin(constrain(st.t, 0, 1) * PI);
  let base = pow(max(0, pulse), 1.25);
  let mood = typeof getGlitchMoodMultiplier === "function" ? getGlitchMoodMultiplier() : 1;
  let digital = typeof getTreeSceneDigitalGlitchScale === "function" ? getTreeSceneDigitalGlitchScale() : 0.36;
  let visitMul = deepEnterGlitchFirstVisit ? 0.72 : 1.28;
  let intensity = constrain(base * mood * digital * visitMul * 1.55, 0, 1.2);
  if (intensity < 0.025) {
    return;
  }

  let stripBase = deepEnterGlitchFirstVisit ? 5 : 10;
  let stripCount = floor(stripBase + intensity * (deepEnterGlitchFirstVisit ? 12 : 28));
  for (let i = 0; i < stripCount; i++) {
    let y = random(height);
      let h = random(2, deepEnterGlitchFirstVisit ? 6 : 12);
      let dx = random(-1, 1) * (10 + intensity * (deepEnterGlitchFirstVisit ? 54 : 148));
    copy(0, y, width, h, dx, y + random(-1, 1) * 3 * intensity, width, h);
  }

  /* Režimai 0 ir 1: tik copy juostos (be tint / be spalvotų ADD sluoksnių). */
  if (deepEnterGlitchMode === 2) {
    strokeWeight(1);
    let lines = floor(2 + intensity * (deepEnterGlitchFirstVisit ? 7 : 16));
    for (let i = 0; i < lines; i++) {
      stroke(255, 255, 255, 10 + intensity * (deepEnterGlitchFirstVisit ? 30 : 66));
      let yy = random(height);
      line(0, yy, width, yy + random(-1, 1) * 2.2 * intensity);
    }
    let dots = floor((deepEnterGlitchFirstVisit ? 14 : 28) + intensity * (deepEnterGlitchFirstVisit ? 56 : 130));
    for (let i = 0; i < dots; i++) {
      stroke(random() < 0.5 ? color(255, 24 + intensity * 60) : color(0, 26 + intensity * 64));
      point(random(width), random(height));
    }
  }
}

function clearTreeCanvasPostFx() {
  let cv = typeof drawingContext !== "undefined" && drawingContext && drawingContext.canvas;
  if (cv && cv.style) {
    cv.style.filter = "";
  }
}

function syncTreeCanvasPostFxFromState() {
  let cv = typeof drawingContext !== "undefined" && drawingContext && drawingContext.canvas;
  if (cv && cv.style) {
    cv.style.filter = "";
  }
}

function getEmotionAtmosphereTint() {
  if (typeof zoneFillProgress === "undefined" || !width || !height) {
    return null;
  }
  let r = 0;
  let g = 0;
  let b = 0;
  let wsum = 0;
  for (let z = 2; z <= 8; z++) {
    let p = zoneFillProgress[z] || 0;
    if (p < 0.02) {
      continue;
    }
    let ar =
      typeof getZoneAtmosphereRgb === "function"
        ? getZoneAtmosphereRgb(z)
        : [14, 14, 18];
    let stageBoost =
      typeof zoneStage !== "undefined" && zoneStage[z] === 2 ? 1.22 : 1;
    let wt = p * stageBoost;
    r += ar[0] * wt;
    g += ar[1] * wt;
    b += ar[2] * wt;
    wsum += wt;
  }
  if (wsum < 0.035) {
    return null;
  }
  r /= wsum;
  g /= wsum;
  b /= wsum;
  return { r: r, g: g, b: b, wsum: wsum };
}

function drawEmotionAtmosphereOverCachedTree() {
  if (typeof deepEnterFadePhase !== "undefined" && deepEnterFadePhase === 1) {
    return;
  }
  let tint = getEmotionAtmosphereTint();
  if (!tint) {
    return;
  }
  push();
  blendMode(OVERLAY);
  noStroke();
  let baseA = constrain(28 + tint.wsum * 22, 0, 72);
  fill(tint.r, tint.g, tint.b, baseA);
  rectMode(CORNER);
  rect(0, 0, width, height);
  blendMode(BLEND);
  pop();
}

/** Saugus pakartotinis pabaigos bandymas (paprastai juoda faze jau kliudo finalize ties early-exit). */
function drawDeepEnterFadeOverlayIfAny() {
  return finalizeDeepEnterTransitionIfReady();
}

/**
 * Atsitiktinio medžio kūrimo ciklo „tick“ – sutampa su buvusiu draw( ) pradžios bloku.
 * Grąžina true, jei priverstinai atnaujinta sėkla (treeBaseValid = false).
 * Kai p5 ciklas sustabdytas (noLoop), retas laikrodis pabudina piešinį tik esant
 * areOuterZonesUnlocked – taip neprarandamas lėtas regen, bet nebėra nuolatinio ciklo tuščiai.
 */
function tryGenerativeRegenInTreeDraw() {
  if (typeof deepEnterFadePhase !== "undefined" && deepEnterFadePhase === 1) {
    return false;
  }
  if (typeof lastGenerativeRebuildMs !== "number" || typeof millis !== "function") {
    return false;
  }
  if (millis() - lastGenerativeRebuildMs <= TREE_REGEN_INTERVAL_MS) {
    generativeRegenArmedAtMs = 0;
    return false;
  }
  if (generativeRegenArmedAtMs <= 0) {
    generativeRegenArmedAtMs = millis();
    return false;
  }
  if (millis() - generativeRegenArmedAtMs < TREE_REGEN_QUIET_BEFORE_MS) {
    return false;
  }
  generativeRegenArmedAtMs = 0;
  lastGenerativeRebuildMs = millis();
  generativeSessionSeed = floor((generativeSessionSeed * 1.07 + 19) % 999983);
  treeBaseValid = false;
  return true;
}

function draw() {
  updateEmotionPersistenceSmooth();

  syncEmotionSliderDomVisibility();

  if (currentView === "deep") {
    loop();
    drawDeepMode();
    clearTreeCanvasPostFx();
    return;
  }

  processPendingOneTimeShock();

  if (isEntryPhraseActive()) {
    treeSceneBackgroundBackdrop();
    if (typeof drawEntryPhraseOverlay === "function") {
      drawEntryPhraseOverlay();
    }
    clearTreeCanvasPostFx();
    loop();
    return;
  }

  if (showTouchHint && touchHintStartMs < 0) {
    touchHintStartMs = millis();
  }

  // Slow generative regeneration: same mood for a while, then new variation.
  tryGenerativeRegenInTreeDraw();
  randomSeed(generativeSessionSeed);
  applyEmotionDecay();
  updateReflectiveState();

  fastRenderMode = isSwaying;

  let elapsed = startupMs >= 0 ? millis() - startupMs : 0;
  let isGlitching =
    startupMs >= 0 &&
    elapsed >= GLITCH_DELAY_MS &&
    elapsed < GLITCH_DELAY_MS + GLITCH_DURATION_MS;

  let morphAnimating = updateZoneShapeMorphAnimation();
  // Morph is the heaviest path (full tree rebuild). Use lightweight stroke/texture profile while morphing.
  fastRenderMode = fastRenderMode || morphAnimating;
  if (typeof outerZoneLeafGrowth !== "undefined" && outerZoneLeafGrowth) {
    let ozBloom = 0;
    for (let z = 2; z <= 8; z++) {
      if ((outerZoneLeafGrowth[z] || 0) > 0.02) {
        ozBloom++;
      }
    }
    fastRenderMode = fastRenderMode || ozBloom >= 3;
  }
  let structurallyStable = !isSwaying && !isGlitching && !morphAnimating;
  let hasTreeBuffer =
    treeBaseValid &&
    treeBaseBuffer &&
    cachedBranchSegments &&
    cachedHoverGrid;
  // During morph: reuse tree bitmap between full branch() rebuilds (žr. morph šaką su get() žemiau).
  let pyktisMorphTween =
    morphAnimating && (zoneShapeMorphTarget[8] || 0) > 0;
  let morphCacheStride = pyktisMorphTween ? 3 : 2;
  let allowMorphCacheFrame =
    morphAnimating &&
    hasTreeBuffer &&
    (frameCount % morphCacheStride) !== 0;
  let readFromTreeCache =
    hasTreeBuffer && (structurallyStable || deepEnterFadePhase === 1 || allowMorphCacheFrame);

  if (isGlitching) {
    // During startup glitch: flat scene bg, no tree generation at all
    treeSceneBackgroundFlat();
    clearTreeCanvasPostFx();
    return;
  }

  blendMode(BLEND);
  noTint();

  if (deepEnterFadePhase === 1) {
    let stBlackout = getDeepEnterTransitionState();
    if (stBlackout.inBlackoutPhase) {
      treeSceneBackgroundFlat();
      clearTreeCanvasPostFx();
      if (finalizeDeepEnterTransitionIfReady()) {
        loop();
        return;
      }
      loop();
      return;
    }
  }

  let useDeepEnterCamera = false;
  let _prevTreeLayerGlobalAlpha = 1;
  if (readFromTreeCache) {
    treeSceneBackgroundBackdrop();
    useDeepEnterCamera = deepEnterFadePhase === 1;
    let stDeep = useDeepEnterCamera ? getDeepEnterTransitionState() : null;
    if (useDeepEnterCamera && stDeep) {
      let aTree = getDeepEnterTreeViewAlpha01(stDeep);
      if (typeof drawingContext !== "undefined" && drawingContext) {
        _prevTreeLayerGlobalAlpha = drawingContext.globalAlpha;
        drawingContext.globalAlpha = _prevTreeLayerGlobalAlpha * aTree;
      }
      push();
      translate(stDeep.cx, stDeep.cy);
      scale(stDeep.cameraZoom);
      translate(-stDeep.cx, -stDeep.cy);
    }
    let treeBreathX = sin(frameCount * 0.014) * 0.22;
    if (!useDeepEnterCamera || !stDeep) {
      push();
    }
    translate(treeBreathX, 0);
    image(treeBaseBuffer, 0, 0);
    if (!useDeepEnterCamera || !stDeep) {
      pop();
    }
    branchSegments = cachedBranchSegments;
    hoverGrid = cachedHoverGrid;
  } else {
    treeSceneBackgroundBackdrop();
    branchSegments = [];
    hoverGrid = new Map();
    stroke(255);
    let treeBreathX = sin(frameCount * 0.014) * 0.22;
    push();
    translate(treeBreathX, 0);

    // Start trunk slightly below canvas so blossom pile fully covers base.
    branch(145, 16.6, width / 2, height + 34, 0);
    pop();

    if (structurallyStable) {
      treeBaseBuffer = get();
      cachedBranchSegments = branchSegments;
      cachedHoverGrid = hoverGrid;
      treeBaseValid = true;
      // Pre-warm label placement cache so first hover is instant.
      if (typeof _zoneLabelPlacementCache !== "undefined") {
        _zoneLabelPlacementCache = {};
        _zoneLabelPlacementCacheKey = "";
        if (typeof getZoneLabelCompositionPlacement === "function") {
          for (let _z = 1; _z <= 8; _z++) {
            getZoneLabelCompositionPlacement(_z);
          }
        }
      }
    } else if (morphAnimating) {
      treeBaseBuffer = get();
      cachedBranchSegments = branchSegments;
      cachedHoverGrid = hoverGrid;
      treeBaseValid = true;
    } else {
      treeBaseValid = false;
    }
  }

  drawEmotionAtmosphereOverCachedTree();

  let treeRevealLocked =
    currentView === "tree" &&
    typeof isTreeSceneRevealComplete === "function" &&
    !isTreeSceneRevealComplete();

  if (treeRevealLocked) {
    hoveredZoneId = -1;
    pointerDirty = false;
    if (typeof clearZoneHoverSticky === "function") {
      clearZoneHoverSticky();
    }
  } else if (!treeCanvasPointerInside) {
    hoveredZoneId = -1;
    pointerDirty = false;
    if (typeof clearZoneHoverSticky === "function") {
      clearZoneHoverSticky();
    }
  } else if (pointerDirty) {
    hoveredZoneId = getHoveredZoneId();
    pointerDirty = false;
  }

  if (DEEP_RETURN_CALM_MS > 0 && millis() < deepReturnCalmUntilMs) {
    hoveredZoneId = -1;
  }

  updateZoneFillAnimation();
  drawHoveredZoneOverlay();
  if (typeof softenOuterZoneLeafGrowthForPerf === "function") {
    softenOuterZoneLeafGrowthForPerf();
  }
  drawOuterZoneGrowthLeaves();
  drawZoneMemoryImprints();

  if (useDeepEnterCamera) {
    pop();
  }
  if (
    useDeepEnterCamera &&
    typeof drawingContext !== "undefined" &&
    drawingContext
  ) {
    drawingContext.globalAlpha = _prevTreeLayerGlobalAlpha;
  }

  drawDeepEnterBackgroundDimLayer();

  let deepEnterInProgress = deepEnterFadePhase === 1;
  if (deepEnterInProgress) {
    applyDeepEnterTransitionGlitch();
  }
  /**
   * Į gylį: be glitch / bloom / – kitaip per fade juodą vėl „perlaužia“ medį
   * ir atrodo kaip uzglitchinimas prieš paskutinę juodą.
   */
  if (!deepEnterInProgress) {
    applyTrunkEntryCalm();

    applyRevealPulseGlitch();
    applyFinaleChaosGlitch();
    applyFirstScreenGlitch();
    applyZoneBloomWarp();
    applyAsBreakSequenceChaos();
    if (typeof applyOneTimeShockGlitch === "function") {
      applyOneTimeShockGlitch();
    }
    if (typeof drawPyktisRejectionClosureFlash === "function") {
      drawPyktisRejectionClosureFlash();
    }
  }
  if (!deepEnterInProgress && typeof drawAsBreakExitCalmOverlay === "function") {
    drawAsBreakExitCalmOverlay();
  }
  if (!asBreakSequenceActive && !deepEnterInProgress) {
    drawHoverZoneHint();
    drawZoneCaption();
    drawInteractiveAura();
  }
  if (!asBreakSequenceActive && !deepEnterInProgress) {
    drawConflictDebugHud();
  }

  // Sway disabled completely.
  sway = 0;

  let revealElapsed = sceneRevealStartMs >= 0 ? millis() - sceneRevealStartMs : 0;
  let revealDone = revealElapsed >= SCENE_REVEAL_MS;
  if (!revealDone && !asBreakSequenceActive && !deepEnterInProgress) {
    let t = constrain(revealElapsed / SCENE_REVEAL_MS, 0, 1);
    let ease = t * t * t;
    let blackAlpha = (1 - ease) * 255;
    noStroke();
    fill(0, 0, 0, blackAlpha);
    rectMode(CORNER);
    rect(0, 0, width, height);
  }

  if (typeof drawFinaleHarmonyOverlay === "function" && !deepEnterInProgress) {
    drawFinaleHarmonyOverlay();
  }
  if (typeof drawZoneStageSecondClickHint === "function") {
    drawZoneStageSecondClickHint();
  }
  if (typeof drawTouchPalieskHint === "function" && !deepEnterInProgress) {
    drawTouchPalieskHint();
  }

  if (!deepEnterInProgress) {
    drawAsStopPrompt();
  }

  if (drawDeepEnterFadeOverlayIfAny()) {
    clearTreeCanvasPostFx();
    loop();
    return;
  }

  syncTreeCanvasPostFxFromState();

  let keepRunningForGlitch =
    startupMs >= 0 && elapsed < GLITCH_DELAY_MS + GLITCH_DURATION_MS;

  let keepRunningForReveal = !revealDone;
  let keepRunningForEntryPhrase = isEntryPhraseActive();
  let keepRunningForOneShock = isOneTimeShockActive();
  let keepRunningForPendingShock = oneTimeShockPendingAtMs > 0 && millis() < oneTimeShockPendingAtMs + 120;
  let persistTarget = getEmotionPersistenceTarget();
  let persistSmooth = getEmotionPersistenceSmooth();
  let persistDiff = abs(persistTarget - persistSmooth);
  /* Mažas, bet ne mikroskopinis slenkstis: neužlaiko bereikalingo 60 FPS idle režime. */
  let keepRunningForEmotionSmooth = persistDiff > 8e-4;
  let keepRunningForDeepEnterFade = deepEnterFadePhase === 1;
  let keepRunningForDeepReturnCalm = millis() < deepReturnCalmUntilMs;
  let calmBreakDur =
    typeof AS_BREAK_EXIT_CALM_MS !== "undefined" ? AS_BREAK_EXIT_CALM_MS : 1400;
  let keepRunningForBreakExitCalm =
    typeof asBreakExitCalmStartMs === "number" &&
    asBreakExitCalmStartMs >= 0 &&
    millis() - asBreakExitCalmStartMs < calmBreakDur;
  let keepRunningForGenerativeQuietHold =
    typeof generativeRegenArmedAtMs === "number" &&
    generativeRegenArmedAtMs > 0 &&
    millis() - generativeRegenArmedAtMs < TREE_REGEN_QUIET_BEFORE_MS;
  let keepRunningForLivingEmotionPaint = false;
  /* Tik kol užpildymas dar juda į target — ne „p > 0.035“ amžinai (tai laikė 60 FPS net po užpildymo). */
  for (let z = 2; z <= 8; z++) {
    let p = zoneFillProgress[z] || 0;
    let tgt = zoneFillTarget[z] || 0;
    if (zoneActivated[z] && tgt > 0 && p < tgt - 0.004) {
      keepRunningForLivingEmotionPaint = true;
      break;
    }
  }
  /* Hover: nelaikyti nuolatinio 60 FPS vien dėl užvestos pelės.
     Ciklas leidžiamas tik trumpai UI įėjimo animacijai (jei tokia aktyvi). */
  if (
    !keepRunningForLivingEmotionPaint &&
    typeof hoveredZoneId === "number" &&
    hoveredZoneId >= 1 &&
    hoveredZoneId <= 8 &&
    typeof zoneStage !== "undefined" &&
    (zoneStage[hoveredZoneId] === 0 || zoneStage[hoveredZoneId] === 1) &&
    typeof treeCanvasPointerInside !== "undefined" &&
    treeCanvasPointerInside
  ) {
    keepRunningForLivingEmotionPaint =
      typeof isHoverZoneUiAnimating === "function" && isHoverZoneUiAnimating();
  }
  /* Antraštė po paspaudimo (zoneStage jau ne 0) — drawZoneCaption fade vis tiek reikalauja loop. */
  if (
    !keepRunningForLivingEmotionPaint &&
    typeof currentCaptionUntilMs === "number" &&
    millis() <= currentCaptionUntilMs + CAPTION_FADE_OUT_MS &&
    (currentCaptionTitle || currentCaptionText)
  ) {
    keepRunningForLivingEmotionPaint = true;
  }
  if (
    !asBreakSequenceActive &&
    !keepRunningForGlitch &&
    !keepRunningForReveal &&
    !keepRunningForEntryPhrase &&
    !keepRunningForOneShock &&
    !keepRunningForPendingShock &&
    !keepRunningForEmotionSmooth &&
    !keepRunningForDeepEnterFade &&
    !keepRunningForDeepReturnCalm &&
    !keepRunningForBreakExitCalm &&
    !keepRunningForGenerativeQuietHold &&
    !keepRunningForLivingEmotionPaint &&
    !isSwaying
  ) {
    noLoop();
  }
}

function treeCanvasPointerEnter() {
  treeCanvasPointerInside = true;
  pointerDirty = true;
  if (typeof scheduleTreeHoverRedraw === "function") {
    scheduleTreeHoverRedraw();
  } else if (typeof loop === "function") {
    loop();
  }
}

function treeCanvasPointerLeave() {
  treeCanvasPointerInside = false;
  hoveredZoneId = -1;
  pointerDirty = false;
  if (typeof clearZoneHoverSticky === "function") {
    clearZoneHoverSticky();
  }
  if (typeof scheduleTreeHoverRedraw === "function") {
    scheduleTreeHoverRedraw();
  } else if (typeof loop === "function") {
    loop();
  }
}

function initGenerativeState() {
  generativeSessionSeed = floor((Date.now() % 1000000) + 97);
  lastGenerativeRebuildMs = 0;
  generativeRegenArmedAtMs = 0;
  lastEmotionDecayMs = millis();
}

function nudgeEmotionWeight(zone, amount) {
  if (zone < 1 || zone > 8) {
    return;
  }
  emotionWeight[zone] = constrain((emotionWeight[zone] || 0) + amount, 0, 20);
  ghostImprint[zone] = min(1.5, (ghostImprint[zone] || 0) + amount * 0.12);
  lastEmotionZone = zone;
  if (emotionWeight[zone] > strongestMomentValue) {
    strongestMomentValue = emotionWeight[zone];
    strongestMomentZone = zone;
  }
  dominantEmotionZone = getDominantEmotionZone();
  saveEmotionMemory();
}

function getEmotionWeight(zone) {
  if (zone < 1 || zone > 8) {
    return 0;
  }
  return emotionWeight[zone] || 0;
}

function getDominantEmotionZone() {
  let zBest = 1;
  let wBest = -1;
  for (let z = 2; z <= 8; z++) {
    let w = emotionWeight[z] || 0;
    if (w > wBest) {
      wBest = w;
      zBest = z;
    }
  }
  return zBest;
}

function getEmotionGeometryByZone(zone) {
  for (let key in EMOTION_GEOMETRY) {
    let cfg = EMOTION_GEOMETRY[key];
    if (cfg.zone === zone) {
      return cfg;
    }
  }
  return null;
}

function loadEmotionMemory() {
  try {
    let raw = localStorage.getItem("basic-medis-emotion-weight");
    if (!raw) {
      return;
    }
    let parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return;
    }
    for (let z = 1; z <= 8; z++) {
      emotionWeight[z] = constrain(Number(parsed[z] || 0), 0, 20);
    }
  } catch (e) {
    // Ignore storage errors silently.
  }
}

function saveEmotionMemory() {
  try {
    let out = {};
    for (let z = 1; z <= 8; z++) {
      out[z] = Number((emotionWeight[z] || 0).toFixed(3));
    }
    localStorage.setItem("basic-medis-emotion-weight", JSON.stringify(out));
  } catch (e) {
    // Ignore storage errors silently.
  }
}

function getGlobalGeometryProfile() {
  let total = 0;
  let out = { angle: 1, jitter: 0.12, sharpness: 0.9 };
  let sumAngle = 0;
  let sumJitter = 0;
  let sumSharpness = 0;

  for (let key in EMOTION_GEOMETRY) {
    let cfg = EMOTION_GEOMETRY[key];
    let w = getEmotionWeight(cfg.zone);
    if (w <= 0) {
      continue;
    }
    total += w;
    sumAngle += cfg.angle * w;
    sumJitter += cfg.jitter * w;
    sumSharpness += cfg.sharpness * w;
  }

  if (total > 0.0001) {
    out.angle = sumAngle / total;
    out.jitter = sumJitter / total;
    out.sharpness = sumSharpness / total;
  }

  // Dominant emotion drives ~60%, the rest modulates (~40%).
  let dominant = getDominantEmotionZone();
  let dCfg = getEmotionGeometryByZone(dominant);
  if (dCfg) {
    out.angle = lerp(out.angle, dCfg.angle, 0.6);
    out.jitter = lerp(out.jitter, dCfg.jitter, 0.6);
    out.sharpness = lerp(out.sharpness, dCfg.sharpness, 0.6);
  }

  // Emotion hierarchy: each emotion influences a specific layer.
  let juokas = getEmotionWeight(3);
  let jautrumas = getEmotionWeight(4);
  let drama = getEmotionWeight(5);
  let meile = getEmotionWeight(6);
  let pyktis = getEmotionWeight(8);
  out.jitter += pyktis * 0.012 + drama * 0.006; // Pyktis/Drama -> distortion pressure
  out.sharpness += pyktis * 0.015 + drama * 0.008;
  out.angle += pyktis * 0.01 - meile * 0.005; // Meile stabilizes
  out.jitter -= meile * 0.006 + jautrumas * 0.004; // Jautrumas smooths
  out.sharpness -= jautrumas * 0.01;
  out.angle += juokas * 0.002; // Juokas mostly color/text, minimal geometry

  // "Aš" unlock adds meta-instability to the global form grammar.
  if (typeof isAsZoneUnlocked === "function" && isAsZoneUnlocked()) {
    let wobble = 0.5 + 0.5 * sin(millis() * 0.0018);
    out.angle *= lerp(0.85, 1.25, wobble);
    out.jitter *= lerp(1.1, 1.8, wobble);
    out.sharpness *= lerp(0.9, 1.15, wobble);
  }

  // Break sequence: system rules collapse.
  if (asBreakSequenceActive) {
    out.angle = random(0.55, 1.65);
    out.jitter = random(0.12, 0.52);
    out.sharpness = random(0.6, 1.5);
  }

  out.angle = constrain(out.angle, 0.5, 1.9);
  out.jitter = constrain(out.jitter, 0.01, 0.65);
  out.sharpness = constrain(out.sharpness, 0.45, 1.7);
  out.jitter = constrain(out.jitter + geometryInstability * 0.35 + emotionConflict * 0.28, 0.01, 0.95);
  out.angle = constrain(out.angle * (1 + emotionConflict * 0.18), 0.45, 2.2);
  // Feedback loop: system reacts to its own state.
  out.jitter = constrain(out.jitter + systemStateInfluence * 0.28, 0.01, 1.1);
  out.angle = constrain(out.angle * (1 + systemStateInfluence * 0.14), 0.4, 2.4);
  return out;
}

function getEmotionGrowthMultiplier() {
  let pyktis = getEmotionWeight(8);
  let jautrumas = getEmotionWeight(4);
  let drama = getEmotionWeight(5);
  let meile = getEmotionWeight(6);
  let t = millis() * 0.0011;
  let burst = 1 + 0.12 * sin(t * 1.15 + drama * 0.12);
  let multiplier = 1 + pyktis * 0.035 - jautrumas * 0.022 + drama * 0.02 - meile * 0.012;
  multiplier *= 1 + emotionConflict * 0.22;
  return constrain(multiplier * burst, 0.55, 2.1);
}

function applyEmotionDecay() {
  let now = millis();
  let dt = now - (lastEmotionDecayMs || now);
  if (dt < 120) {
    return;
  }
  lastEmotionDecayMs = now;
  let decayBase = pow(0.9985, dt / 16.6667);
  let persistSmooth = getEmotionPersistenceSmooth();
  let ghostFast = pow(0.9979, dt / 16.6667);
  let ghostSlow = pow(0.99972, dt / 16.6667);
  let ghostDecay = lerp(ghostFast, ghostSlow, persistSmooth);
  ghostDecay *= getLiekaGhostDecayBurstMul(now, persistSmooth);
  let weightDecayFast = pow(0.9972, dt / 16.6667);
  let weightDecay = lerp(weightDecayFast, decayBase, persistSmooth);
  for (let z = 1; z <= 8; z++) {
    let w = emotionWeight[z] || 0;
    if (w <= 0.0005) {
      emotionWeight[z] = 0;
      continue;
    }
    emotionWeight[z] = w * weightDecay;
    ghostImprint[z] = max(0, (ghostImprint[z] || 0) * ghostDecay);
  }
  let w8 = emotionWeight[8] || 0;
  if (w8 > 13) {
    emotionWeight[8] = max(0, w8 - (w8 - 13) * 0.04);
  }
}

function updateReflectiveState() {
  let current = getGlobalGeometryProfileRaw();
  formChangeIntensity = constrain(
    abs(current.angle - oldGhostGeometry.angle) * 0.7 +
    abs(current.jitter - oldGhostGeometry.jitter) * 1.6 +
    abs(current.sharpness - oldGhostGeometry.sharpness) * 0.75,
    0,
    1.4
  );
  reflectionProfiles.push(current);
  if (reflectionProfiles.length > REFLECTION_HISTORY_MAX) {
    reflectionProfiles.shift();
  }

  if (reflectionProfiles.length < 8) {
    geometryInstability = 0;
  } else {
    let prev = reflectionProfiles[max(0, reflectionProfiles.length - 9)];
    let dA = abs(current.angle - prev.angle);
    let dJ = abs(current.jitter - prev.jitter);
    let dS = abs(current.sharpness - prev.sharpness);
    geometryInstability = constrain(dA * 0.85 + dJ * 1.8 + dS * 0.7, 0, 1);
  }

  let pyktis = getEmotionWeight(8);
  let jautrumas = getEmotionWeight(4);
  let drama = getEmotionWeight(5);
  let meile = getEmotionWeight(6);
  let c1 = min(pyktis, jautrumas) / 8;
  let c2 = min(drama, meile) / 9;
  emotionConflict = constrain(max(c1, c2), 0, 1);
  let signature = getConflictSignature();
  currentConflictType = signature.type;
  currentConflictIntensity = signature.intensity;
  pushConflictHistory(signature);
  dominantEmotionZone = getDominantEmotionZone();
  // Feedback loop: unstable state reinforces itself, stable state calms down.
  let targetInfluence = geometryInstability * 0.2 + currentConflictIntensity * 0.22 + formChangeIntensity * 0.18;
  systemStateInfluence = lerp(systemStateInfluence, targetInfluence, 0.052);
  systemStateInfluence = constrain(systemStateInfluence, 0, 1.2);
  oldGhostGeometry = {
    angle: lerp(oldGhostGeometry.angle, current.angle, 0.017),
    jitter: lerp(oldGhostGeometry.jitter, current.jitter, 0.017),
    sharpness: lerp(oldGhostGeometry.sharpness, current.sharpness, 0.017)
  };
  updateCauseChain(current, signature);
  updateMemoryPressure();
  updateConflictHotspots();
}

function getConflictSignature() {
  let pyktis = getEmotionWeight(8);
  let jautrumas = getEmotionWeight(4);
  let drama = getEmotionWeight(5);
  let meile = getEmotionWeight(6);
  let juokas = getEmotionWeight(3);
  let pairs = [
    { type: "inner_break", value: min(pyktis, jautrumas) / 8 },   // Pyktis + Jautrumas
    { type: "overflow", value: min(drama, meile) / 9 },           // Drama + Meile
    { type: "masking", value: min(juokas, pyktis) / 8.5 }         // Juokas + Pyktis
  ];
  pairs.sort(function (a, b) { return b.value - a.value; });
  let top = pairs[0];
  return {
    type: top.value > 0.08 ? top.type : "none",
    intensity: constrain(top.value, 0, 1)
  };
}

function pushConflictHistory(signature) {
  if (!signature || signature.type === "none") {
    repeatedConflictCount = max(0, repeatedConflictCount - 1);
    return;
  }
  conflictHistory.push({
    type: signature.type,
    intensity: signature.intensity,
    ms: millis()
  });
  if (conflictHistory.length > CONFLICT_HISTORY_MAX) {
    conflictHistory.shift();
  }

  let repeats = 0;
  for (let i = conflictHistory.length - 1; i >= 0; i--) {
    if (conflictHistory[i].type === signature.type) {
      repeats++;
    }
  }
  repeatedConflictCount = repeats;
}

function updateCauseChain(currentGeo, signature) {
  let dom = getDominantEmotionZone();
  let dName = ZONE_DATA[dom] ? ZONE_DATA[dom].title : "Emocija";
  let conflictLabel = "ramybė";
  if (signature.type === "inner_break") {
    conflictLabel = "vidinis lūžis";
  } else if (signature.type === "overflow") {
    conflictLabel = "perteklius";
  } else if (signature.type === "masking") {
    conflictLabel = "maskavimas";
  }
  let chain = dName +
    " -> konfliktas(" + conflictLabel + ") -> forma(" + nf(currentGeo.jitter, 1, 2) +
    ") -> tekstas -> šešėlis";
  lastCauseChainText = chain;
  causeChainLog.push({
    ms: millis(),
    text: chain,
    dominantZone: dom,
    conflictType: signature.type,
    conflictIntensity: signature.intensity,
    jitter: currentGeo.jitter,
    angle: currentGeo.angle,
    formDelta: formChangeIntensity,
    ghost: ghostImprint[dom] || 0
  });
  if (causeChainLog.length > 80) {
    causeChainLog.shift();
  }
}

function updateMemoryPressure() {
  let historyFactor = causeChainLog.length / 16;
  let conflictFactor = currentConflictIntensity;
  let repeatFactor = constrain(repeatedConflictCount / 4, 0, 1);
  memoryPressure = constrain(historyFactor * (0.45 + conflictFactor * 0.9 + repeatFactor * 0.55), 0, 1.8);
  // Soft decay so pressure does not stay flat forever.
  memoryPressure = max(0, memoryPressure - 0.0022);
  systemStateInfluence = constrain(systemStateInfluence + memoryPressure * 0.01, 0, 1.5);
}

function getGlobalGeometryProfileRaw() {
  let total = 0;
  let out = { angle: 1, jitter: 0.12, sharpness: 0.9 };
  let sumAngle = 0;
  let sumJitter = 0;
  let sumSharpness = 0;

  for (let key in EMOTION_GEOMETRY) {
    let cfg = EMOTION_GEOMETRY[key];
    let w = getEmotionWeight(cfg.zone);
    if (w <= 0) {
      continue;
    }
    total += w;
    sumAngle += cfg.angle * w;
    sumJitter += cfg.jitter * w;
    sumSharpness += cfg.sharpness * w;
  }

  if (total > 0.0001) {
    out.angle = sumAngle / total;
    out.jitter = sumJitter / total;
    out.sharpness = sumSharpness / total;
  }
  return out;
}

function updateConflictHotspots() {
  let desiredCount = floor(emotionConflict * 3);
  if (emotionConflict > 0.24) {
    desiredCount = max(1, desiredCount);
  }

  // Keep at least one hotspot in normal tree state after trunk entry.
  if (typeof areOuterZonesUnlocked === "function" && areOuterZonesUnlocked()) {
    desiredCount = max(1, desiredCount);
  }

  // Debug mode must always show visible hotspots.
  if (showConflictDebug) {
    desiredCount = max(3, desiredCount);
  }

  if (currentView === "deep" && focusedZone === 2) {
    desiredCount = max(desiredCount, 3);
  }

  if (conflictHotspots.length !== desiredCount) {
    regenerateConflictHotspots(desiredCount);
  }

  // Even with stable conflict, re-seed hotspots periodically so they do not stick forever.
  if (desiredCount > 0 && millis() - lastHotspotRegenMs > 14000) {
    regenerateConflictHotspots(desiredCount);
  }

  let t = millis() * 0.001;
  let scene = getTreeSceneMetrics();
  let canopyCx = scene.cx;
  let canopyCy = height * 0.43;
  let canopyRx = scene.w * 0.35;
  let canopyRy = height * 0.27;
  for (let i = 0; i < conflictHotspots.length; i++) {
    let h = conflictHotspots[i];
    let repeatBoost = 1 + repeatedConflictCount * 0.08;
    let driftAmp = (16 + 58 * emotionConflict) * repeatBoost;
    let wanderX = sin(t * (h.speed * 0.63) + h.phase * 0.7) * driftAmp * 0.7;
    let wanderY = cos(t * (h.speed * 0.57) + h.phase * 0.9) * driftAmp * 0.68;
    let orbitX = sin(t * h.speed + h.phase) * driftAmp;
    let orbitY = cos(t * (h.speed * 0.92) + h.phase * 1.3) * driftAmp;
    h.x = h.baseX + orbitX + wanderX;
    h.y = h.baseY + orbitY + wanderY;
    let nx = (h.x - canopyCx) / max(1, canopyRx);
    let ny = (h.y - canopyCy) / max(1, canopyRy);
    let d = nx * nx + ny * ny;
    if (d > 1) {
      let k = 1 / sqrt(d);
      h.x = canopyCx + nx * canopyRx * k;
      h.y = canopyCy + ny * canopyRy * k;
    }
  }
}

function regenerateConflictHotspots(count) {
  conflictHotspots = [];
  if (count <= 0) {
    return;
  }

  randomSeed(generativeSessionSeed + floor(emotionConflict * 1000) + 77);
  lastHotspotRegenMs = millis();
  let scene = getTreeSceneMetrics();
  let canopyCx = scene.cx;
  let canopyCy = height * 0.43;
  let canopyRx = scene.w * 0.33;
  let canopyRy = height * 0.25;

  for (let i = 0; i < count; i++) {
    let a = random(TWO_PI);
    let r = sqrt(random()) * 0.95;
    let baseX = canopyCx + cos(a) * canopyRx * r;
    let baseY = canopyCy + sin(a) * canopyRy * r;
    let noveltyBoost = repeatedConflictCount === 0 && currentConflictIntensity > 0.3 ? 1.25 : 1;
    let radius = random(56, 130) * (1 + emotionConflict * 0.38) * noveltyBoost;
    if (currentView === "deep" && focusedZone === 2) {
      radius *= 1.5;
    }
    conflictHotspots.push({
      baseX: baseX,
      baseY: baseY,
      x: baseX,
      y: baseY,
      radius: radius,
      strength: random(0.45, 1) * (1 + repeatedConflictCount * 0.1),
      phase: random(TWO_PI),
      speed: random(0.6, 1.8)
    });
  }
}

function getConflictInfluenceAt(x, y) {
  if (!conflictHotspots || conflictHotspots.length === 0) {
    return 0;
  }
  let influence = 0;
  for (let i = 0; i < conflictHotspots.length; i++) {
    let h = conflictHotspots[i];
    let d = dist(x, y, h.x, h.y);
    if (d > h.radius) {
      continue;
    }
    let local = (1 - d / max(1, h.radius)) * h.strength;
    influence += local;
  }
  return constrain(influence, 0, 1.8);
}
