/**
 * Vienas šaltinis canvas `textFont("…")` šeimų vardams.
 * Išorė — Inter. Gylio zonų pavadinimai, SISTEMA / Pyktis / CTA — Inter (dažnai bold).
 * Playfair tik poetinėms gylio frazėms (`deepPoeticMono`, pvz. Nepergyvenk).
 * Pradžios ekranas: Inter + „viskas prasideda“ — Playfair (`entryPhraseHero`).
 */
const TREE_CANVAS_FONTS = {
  /**
   * Canvas `textFont`: vienas šeimos vardas (be kablelių) — kitaip naršyklė gali
   * sugadinti `ctx.font` ir parodyti numatytąjį serif (klaidingai „kaip Playfair“).
   */
  uiSans: "Inter",
  uiSansMedium: "Inter",
  /** „0 1 0 1“ ir kt. — Inter. */
  uiMono: "Inter",
  /** Gylio SISTEMA / terminalo stilius — Inter. */
  asDeepDisplay: "Inter",
  /** Gylio aprašų body — Inter. */
  uiDeepDescription: "Inter",
  /** Pradžios ekranas: mažesni žodžiai. */
  entryPhraseSmall: "Inter",
  /** Pradžios ekranas: didysis žodis („viskas prasideda“) — Playfair. */
  entryPhraseHero: "Playfair Display",
  /** Gylio poetinės frazės — tik joms Playfair (ne antraštėms). */
  deepPoeticMono: "Playfair Display",
  /** Gylio zonos title (Kamienas gylį atitinka „Pyktis“ ir pan.) — Inter. */
  deepZoneTitle: "Inter",
  /** Atsarginė emocijų eilutė. */
  deepEmotionSerif: "Inter"
};

const FONT_SANS = TREE_CANVAS_FONTS?.uiSans || "Inter";

/**
 * Vienas naratyvinis lankas: įėjimas → kamienas → uždarymas (`sketch-core` / `tree-effects-ui`).
 */
/** Įėjimo viršus kairė — Inter, vidutinis dydis. */
const NARRATIVE_ENTRY_TOP_LEFT = "Čia";
/** Įėjimo centras dešinė — Playfair bold (`entryPhraseHero`). */
const NARRATIVE_ENTRY_HERO_LINE = "viskas prasideda";
/** Viena eilutė atgaliniam suderinamumui (`ENTRY_PHRASE_TEXT`). */
const NARRATIVE_ENTRY_TEXT =
  NARRATIVE_ENTRY_TOP_LEFT + " " + NARRATIVE_ENTRY_HERO_LINE;
/** Įėjimo apačia kairė — Inter, mažas. */
const NARRATIVE_ENTRY_SUBTEXT = "Atrask, kaip viskas susiję";
const NARRATIVE_FINALE_EPILOGUE =
  "Kas prasidėjo, jau stovi. Ką atvėrei, gali nešiotis su savimi.";

/**
 * Balsai: Inter — medis, gylio title, SISTEMA / Sulaužyti / Sustabdyti / Pyktis eilutės.
 * Playfair — tik gylio poetika (`deepPoeticMono`).
 */
const DEEP_POETIC_LETTER_SPACING_EM = "0px";
const DEEP_POETIC_LEADING_MULT = 1.2;
const DEEP_UI_LETTER_SPACING_EM = "0px";

function deepPoeticApplyLetterSpacing() {
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx && "letterSpacing" in ctx) {
    ctx.letterSpacing = DEEP_POETIC_LETTER_SPACING_EM;
  }
}

function deepPoeticResetLetterSpacing() {
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx && "letterSpacing" in ctx) {
    ctx.letterSpacing = "0px";
  }
}

function deepUiApplyLetterSpacing() {
  let ctx = typeof drawingContext !== "undefined" ? drawingContext : null;
  if (ctx && "letterSpacing" in ctx) {
    ctx.letterSpacing = DEEP_UI_LETTER_SPACING_EM;
  }
}

function deepUiResetLetterSpacing() {
  deepPoeticResetLetterSpacing();
}

/** Naršyklės „sumažinti judesį“ — canvas gylis gali slopinti animacijas. */
function prefersReducedMotionCanvas() {
  try {
    return (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch (e) {
    return false;
  }
}

/** 1 = pilnas judesys; ~0.12 = beveik statika (gylio mirgėjimas / dreifas). */
function getDeepCanvasMotionFactor() {
  return prefersReducedMotionCanvas() ? 0.12 : 1;
}

/**
 * Scenos „šviesos dėsnis“: tamsūs ramiūs kraštai, šviesesnis židinys kur medis / skaitoma.
 * Bazė – ramesnė už ankstesnį #080706; centras kelia židinį, kraštai nusileidžia į beveik juodą.
 */
const TREE_SCENE_BG_RGB = [7, 6, 5];
/** Židinys už kamieno / lajos (šviesiau – akis skaito piešinį). */
const TREE_SCENE_BG_CENTER_RGB = [26, 22, 20];
/** Kraštai – kur akis ilsisi (tamsiau už bazę). */
const TREE_SCENE_BG_EDGE_RGB = [2, 2, 1];

/**
 * Labai platus ekranas: getTreeSceneMetrics() siaurina „lajos“ plotį (h * mul), kad medis liktų vizualinis židinys.
 */
const TREE_SCENE_ASPECT_WIDE = 1.62;
const TREE_SCENE_ASPECT_ULTRA = 1.92;
const TREE_SCENE_ASPECT_ULTRA_STRONG = 2.12;
const TREE_SCENE_CANOPY_H_MUL_DEFAULT = 1.5;
const TREE_SCENE_CANOPY_H_MUL_WIDE = 1.38;
const TREE_SCENE_CANOPY_H_MUL_ULTRA = 1.24;
const TREE_SCENE_CANOPY_H_MUL_ULTRA_STRONG = 1.1;

/** Bendras laikymo užrašas (Inter) — zona 8 ir gyliai su hardcoded hint. */
const UI_HOLD_HINT = "spausk ir laikyk";

const TREE_UX = {
  touchLabel: "PALIESK",
  /** Kai dar neatvertas kamienas, bet bandoma emocines zonas. */
  lockedStartPrompt: "Pradėk nuo pagrindo",
  /** „Mano esybė“ užrakinta — kol ne visos emocijų zonos bent kartą aplankytos gilyje. */
  asZoneLockedPoetic: "Dar ne laikas grįžti.",
  /** Bandymas spausti kitą šaką, kol nebaigtas dabartinis įsipareigojimas (jei naudojama). */
  zoneJumpBlockedPoetic: "Vienas kelias vienu metu.",
  /** Po širdies atrakinimo — vieną kartą; aiškiai pasako, ką daryti (rodoma ryškiau nei kiti hintai). */
  asHeartUnlockedPoetic: "Mano esybė atrakinta. Paliesk širdį.",
  /**
   * Papildomos instrukcijos (hover / 2 paspaudimas / po 1 paspaudimo) — tuščios,
   * kad neliktų „tutorial“ teksto virš medžio; užpildyk, jei vėl norėsi aiškaus feedback.
   */
  zoneHoverFlowLine: "",
  zoneSecondTapHint: "",
  zoneAfterFirstTapTitle: ""
};

/**
 * Pirmas išėjimas iš gylio (zonos 3–7): atsitiktinė užuoma — tas pats dešinysis stulpelis kaip kiti poetiniai hintai.
 */
const DEEP_FIRST_RETURN_HINT_LINES = [
  "Grįžti į vidų?..",
  "Grįžk į vidų dar kartą.",
  "Sugrįžk į vidų.",
  "Dar kartą į vidų.",
  "Pabandyk dar kartą.",
  "Dar gali pažvelkti giliau.",
  "Čia dar yra ką pamatyti.",
  "Sugrįžk trumpam.",
  "Dar ne viskas apžiūrėta.",
  "Gali tęsti toliau.",
  "Pažvelk dar kartą.",
  "Dar vienas žingsnis į vidų.",
  "Tęsk nuo čia."
];

function captionTextIsHeartUnlockFanfare(textBody) {
  return (
    typeof textBody === "string" &&
    typeof TREE_UX !== "undefined" &&
    textBody === TREE_UX.asHeartUnlockedPoetic
  );
}

function captionTextIsDeepFirstReturnHint(textBody) {
  if (typeof textBody !== "string" || !textBody.length) {
    return false;
  }
  if (typeof DEEP_FIRST_RETURN_HINT_LINES === "undefined" || !DEEP_FIRST_RETURN_HINT_LINES.length) {
    return false;
  }
  for (let i = 0; i < DEEP_FIRST_RETURN_HINT_LINES.length; i++) {
    if (DEEP_FIRST_RETURN_HINT_LINES[i] === textBody) {
      return true;
    }
  }
  return false;
}

/** Tas pats dešinysis Playfair stulpelis kaip „Grįžti į vidų?..“ ir Pyktis atmetimai. */
function captionTextUsesUnifiedPoeticHintStyle(textBody) {
  if (typeof textBody !== "string" || !textBody.length) {
    return false;
  }
  if (typeof captionTextIsDeepFirstReturnHint === "function" && captionTextIsDeepFirstReturnHint(textBody)) {
    return true;
  }
  if (typeof captionTextIsPyktisRejection === "function" && captionTextIsPyktisRejection(textBody)) {
    return true;
  }
  if (textBody.indexOf("Grįžti į vidų") >= 0) {
    return true;
  }
  if (textBody.indexOf("Nurimsta, ką čia atradai") >= 0) {
    return true;
  }
  if (textBody.indexOf("Nyksta greičiau") >= 0 || textBody.indexOf("Lieka ilgiau") >= 0) {
    return true;
  }
  if (textBody.indexOf("Čia viskas stovi") >= 0) {
    return true;
  }
  if (typeof TREE_UX !== "undefined") {
    if (textBody === TREE_UX.asZoneLockedPoetic) {
      return true;
    }
    if (textBody === TREE_UX.zoneJumpBlockedPoetic) {
      return true;
    }
    if (textBody === TREE_UX.asHeartUnlockedPoetic) {
      return true;
    }
  }
  return false;
}

/** Pyktis: atsitiktinė frazė antro bandymo į gylį atmetimui — tas pats stilius kaip „Grįžti į vidų?..“. */
const PYKTIS_REJECTION_CAPTIONS = [
  "Ne.",
  "Neįleisiu.",
  "Nebeįeisi.",
  "Užtenka.",
  "Čia nebegrįši.",
  "Durys užsidarė.",
  "Ten jau buvai — kitaip nebeįeina.",
  "Vidus nebeatidaro.",
  "Nebe tas kelias.",
  "Riba jau buvo.",
  "Kartą peržengta — daugiau ne.",
  "Lieka lauke.",
  "Ne šįkart.",
  "Stop.",
  "Nebe ten."
];

function captionTextIsPyktisRejection(textBody) {
  if (typeof textBody !== "string" || !textBody.length) {
    return false;
  }
  for (let i = 0; i < PYKTIS_REJECTION_CAPTIONS.length; i++) {
    if (PYKTIS_REJECTION_CAPTIONS[i] === textBody) {
      return true;
    }
  }
  return false;
}

/**
 * Vienas medžio Inter dydis: „grįžti“, „PALIESK“, „Pradėk nuo pagrindo“ ir panašūs.
 * (Anksčiau „grįžti“ buvo 9.5–11px – per silpna; vieninga kreivė, šiek tiek didesnė.)
 */
function treeSansUiTextSizePx() {
  if (typeof width !== "number" || !isFinite(width) || width < 1) {
    return 12.5;
  }
  return max(11, min(15, width * 0.038));
}

function fontUI_clean() {
  textFont(FONT_SANS);
  textStyle(NORMAL);
}

/**
 * Zonų spalvos: „Aš“ (2) – giliausias chroma (akcentas); 3–8 – šiek tiek pastelizuotos,
 * vienas „saturation step“ su kamieno žeme. Antraštėms – color / colorName.
 */
const ZONE_DATA = {
  1: {
    title: "Kamienas",
    colorName: "šilta nutildinta žemė",
    color: "#BAAA8E",
    meaning: "pagrindas, atrama",
    text: "Čia viskas stovi."
  },
  2: {
    title: "Mano esybė",
    colorName: "gili miško žalia",
    color: "#2E5E4E",
    meaning: "branduolys, laikymas",
    text: "..."
  },
  3: {
    title: "Juokas",
    colorName: "švelni dangaus mėlyna",
    color: "#6FA3B8",
    meaning: "lengvumas, ironija",
    text: "Juokiuosi, nes aiškinti per sunku."
  },
  4: {
    title: "Jautrumas",
    colorName: "matinė rausva",
    color: "#D9A8AA",
    meaning: "gilus jausmas",
    text: "Per daug jaučiu."
  },
  5: {
    title: "Drama",
    colorName: "šilta terakota",
    color: "#BF7352",
    meaning: "intensyvumas, reakcija",
    text: "Mažas dalykas — didelis jausmas."
  },
  6: {
    title: "Meilė",
    colorName: "matinė violetinė",
    color: "#7D72A5",
    meaning: "prisirišimas, šiluma",
    text: "Iki galo."
  },
  7: {
    title: "Empatija",
    colorName: "šilta gintaro geltona",
    color: "#D4BB72",
    meaning: "įsijautimas, supratimas",
    text: "Stipriau nei save."
  },
  8: {
    title: "Pyktis",
    colorName: "plytų raudona",
    color: "#A34B4D",
    meaning: "reakcija, ribos",
    text: "Greitai. Ir vėl paleidžiu."
  }
};

const ZONE_HINTS = [
  "",
  "kamienas",
  "mano esybė",
  "juokas",
  "jautrumas",
  "drama",
  "meilė",
  "empatija",
  "pyktis"
];

const BRANCH_COLORS = [
  // 1) kamienas – sutampa su ZONE_DATA[1] (šiek tiek nutildinta žemė)
  [186, 170, 142],  // #BAAA8E

  // 2) Aš – giliausias chroma; 3–8 – pastelizuota šeima (žr. ZONE_DATA komentarą)
  [46, 94, 78],     // #2E5E4E
  [111, 163, 184],  // #6FA3B8
  [217, 168, 170],  // #D9A8AA
  [191, 115, 82],   // #BF7352
  [125, 114, 165],  // #7D72A5
  [212, 187, 114],  // #D4BB72
  [163, 75, 77]     // #A34B4D
];

const TRUNK_BASE_COLOR = [186, 170, 142];

const CANOPY_ZONE_SLICE_EDGES = [0, 0.27, 0.45, 0.6, 0.66, 0.73, 0.89, 1];
let RUNTIME_CANOPY_ZONE_SLICE_EDGES = CANOPY_ZONE_SLICE_EDGES.slice();
let RUNTIME_CANOPY_ZONE_ORDER = [2, 3, 4, 5, 6, 7, 8];
let RUNTIME_CANOPY_ANGLE_OFFSET = 0;
let RUNTIME_BRANCH_COLORS = BRANCH_COLORS.map(function (c) {
  return [c[0], c[1], c[2]];
});

function _runtimeClampRgb(v) {
  return constrain(Math.round(v), 0, 255);
}

function _runtimeMulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function _runtimeColorVariantForZone(zoneId, baseRgb, rnd01) {
  if (zoneId === 1) {
    return [baseRgb[0], baseRgb[1], baseRgb[2]];
  }
  let warm = zoneId === 5 || zoneId === 7 || zoneId === 8;
  let cool = zoneId === 2 || zoneId === 3 || zoneId === 4 || zoneId === 6;
  let shift = (rnd01() - 0.5) * 24;
  let lift = (rnd01() - 0.5) * 18;
  let r = baseRgb[0] + shift * (warm ? 1.08 : 0.72) + (cool ? -2 : 2);
  let g = baseRgb[1] + lift * 0.86 + (warm ? -1 : 1);
  let b = baseRgb[2] + shift * (cool ? 1.08 : 0.62) + (warm ? -3 : 2);
  return [_runtimeClampRgb(r), _runtimeClampRgb(g), _runtimeClampRgb(b)];
}

function _runtimeSessionSignature(order, edges, offset) {
  let o = order.join("-");
  let e = edges
    .slice(1, 7)
    .map(function (v) {
      return Math.round(v * 1000);
    })
    .join("-");
  let a = Math.round(offset * 1000000);
  return o + "|" + e + "|" + a;
}

function initRuntimeZoneSession() {
  let LAST_KEY = "basic-medis-runtime-layout-last";
  let HISTORY_KEY = "basic-medis-runtime-layout-history";
  let previousSig = "";
  let history = [];
  try {
    previousSig = localStorage.getItem(LAST_KEY) || "";
    let rawHistory = localStorage.getItem(HISTORY_KEY);
    if (rawHistory) {
      let parsed = JSON.parse(rawHistory);
      if (Array.isArray(parsed)) {
        history = parsed.filter(function (x) {
          return typeof x === "string" && x.length > 0;
        });
      }
    }
  } catch (e) {}
  let historySet = new Set(history);

  let generatedOrder = RUNTIME_CANOPY_ZONE_ORDER.slice();
  let generatedEdges = RUNTIME_CANOPY_ZONE_SLICE_EDGES.slice();
  let generatedOffset = RUNTIME_CANOPY_ANGLE_OFFSET;
  let generatedColors = RUNTIME_BRANCH_COLORS.map(function (c) {
    return [c[0], c[1], c[2]];
  });
  let finalSig = "";

  for (let attempt = 0; attempt < 64; attempt++) {
    let seed = ((Date.now() + attempt * 7919) ^ ((Math.random() * 0xffffffff) >>> 0)) >>> 0;
    let rnd01 = _runtimeMulberry32(seed || 1);

    let order = [2, 3, 4, 5, 6, 7, 8];
    for (let i = order.length - 1; i > 0; i--) {
      let j = Math.floor(rnd01() * (i + 1));
      let tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
    }

    let baseWidths = [];
    for (let i = 0; i < 7; i++) {
      baseWidths.push(CANOPY_ZONE_SLICE_EDGES[i + 1] - CANOPY_ZONE_SLICE_EDGES[i]);
    }
    let varied = [];
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      let w = baseWidths[i] * (0.72 + rnd01() * 0.56);
      w = max(0.055, min(0.28, w));
      varied.push(w);
      sum += w;
    }
    let edges = [0];
    let acc = 0;
    for (let i = 0; i < 7; i++) {
      acc += varied[i] / max(0.000001, sum);
      edges.push(i === 6 ? 1 : acc);
    }

    let pyktisSlice = order.indexOf(8);
    if (pyktisSlice >= 0) {
      let widths = [];
      for (let i = 0; i < 7; i++) {
        widths.push(edges[i + 1] - edges[i]);
      }
      let minPyW = 0.092;
      if (widths[pyktisSlice] < minPyW) {
        let deficit = minPyW - widths[pyktisSlice];
        let li = (pyktisSlice + 6) % 7;
        let ri = (pyktisSlice + 1) % 7;
        function takeFrom(idx, amt) {
          let d = min(amt, max(0, widths[idx] - 0.052));
          widths[idx] -= d;
          return d;
        }
        let got = 0;
        got += takeFrom(li, deficit * 0.55);
        got += takeFrom(ri, deficit - got);
        if (got < deficit) {
          got += takeFrom(li, deficit - got);
        }
        if (got < deficit) {
          got += takeFrom(ri, deficit - got);
        }
        widths[pyktisSlice] += got;
        acc = 0;
        for (let i = 0; i < 7; i++) {
          acc += widths[i];
          edges[i + 1] = i === 6 ? 1 : acc;
        }
      }
    }

    let offset = rnd01();

    let colors = [];
    for (let z = 1; z <= 8; z++) {
      let base = BRANCH_COLORS[z - 1] || TRUNK_BASE_COLOR;
      colors.push(_runtimeColorVariantForZone(z, base, rnd01));
    }

    let sig = _runtimeSessionSignature(order, edges, offset);
    generatedOrder = order;
    generatedEdges = edges;
    generatedOffset = offset;
    generatedColors = colors;
    finalSig = sig;
    if ((!previousSig || sig !== previousSig) && !historySet.has(sig)) {
      break;
    }
  }

  RUNTIME_CANOPY_ZONE_ORDER = generatedOrder;
  RUNTIME_CANOPY_ZONE_SLICE_EDGES = generatedEdges;
  RUNTIME_CANOPY_ANGLE_OFFSET = generatedOffset;
  RUNTIME_BRANCH_COLORS = generatedColors;

  try {
    if (finalSig) {
      localStorage.setItem(LAST_KEY, finalSig);
      history.push(finalSig);
      if (history.length > 4000) {
        history = history.slice(history.length - 4000);
      }
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  } catch (e) {}
}

function getCanopyZoneSliceEdges() {
  return RUNTIME_CANOPY_ZONE_SLICE_EDGES || CANOPY_ZONE_SLICE_EDGES;
}

function getZoneIdForCanopySlice(sliceIdx) {
  let idx = constrain(sliceIdx | 0, 0, 6);
  let order = RUNTIME_CANOPY_ZONE_ORDER || [2, 3, 4, 5, 6, 7, 8];
  return order[idx] || (2 + idx);
}

function getRuntimeCanopyAngleOffset() {
  return RUNTIME_CANOPY_ANGLE_OFFSET || 0;
}

function getRuntimeBranchColor(zoneId) {
  let z = constrain(zoneId | 0, 1, 8);
  let arr = RUNTIME_BRANCH_COLORS || BRANCH_COLORS;
  let c = arr[z - 1] || BRANCH_COLORS[z - 1] || TRUNK_BASE_COLOR;
  return [c[0], c[1], c[2]];
}

// Zone visual "weight" profile: lightness + stroke presence.
// Makes zone identity readable even without text labels.
const ZONE_VISUAL_WEIGHT = {
  3: { light: 1.16, width: 0.92 }, // Juokas - lightest
  4: { light: 1.08, width: 0.96 }, // Jautrumas - soft
  6: { light: 1.0, width: 1.0 },   // Meile - medium
  5: { light: 0.9, width: 1.08 },  // Drama - stronger
  8: { light: 0.78, width: 1.16 }  // Pyktis - darkest
};

/**
 * Skirtingas „svoris“ medyje / gilyje: hover pulsas, stroke, šviesa, gylio glitch.
 * Empatija (7) – švelniau; Pyktis (8) – aštresniau; Meilė (6) – daugiau glow.
 */
const ZONE_PERSONALITY = {
  1: { hoverPulseHz: 0.09, strokeMul: 1.02, glowMul: 0.9, scaleNudge: 0.006, deepChaosMul: 0.96 },
  2: { hoverPulseHz: 0.1, strokeMul: 1.1, glowMul: 1.0, scaleNudge: 0.008, deepChaosMul: 1.0 },
  3: { hoverPulseHz: 0.11, strokeMul: 1.0, glowMul: 0.94, scaleNudge: 0.007, deepChaosMul: 0.9 },
  4: { hoverPulseHz: 0.078, strokeMul: 1.08, glowMul: 1.1, scaleNudge: 0.01, deepChaosMul: 0.88 },
  5: { hoverPulseHz: 0.13, strokeMul: 1.1, glowMul: 0.86, scaleNudge: 0.009, deepChaosMul: 1.06 },
  6: { hoverPulseHz: 0.085, strokeMul: 1.06, glowMul: 1.24, scaleNudge: 0.011, deepChaosMul: 0.9 },
  7: { hoverPulseHz: 0.062, strokeMul: 1.05, glowMul: 1.2, scaleNudge: 0.01, deepChaosMul: 0.72 },
  8: { hoverPulseHz: 0.175, strokeMul: 1.16, glowMul: 0.8, scaleNudge: 0.013, deepChaosMul: 1.2 }
};

function getZonePersonality(zoneId) {
  let z = constrain(typeof zoneId === "number" ? zoneId : 1, 1, 8);
  return ZONE_PERSONALITY[z] || ZONE_PERSONALITY[2];
}

/** Išorinės scenos fonas — labai tamsūs tonai (OVERLAY / po juoda). */
const ZONE_ATMOSPHERE_RGB = {
  2: [10, 28, 22],
  3: [6, 22, 40],
  4: [26, 12, 30],
  5: [38, 14, 8],
  6: [22, 10, 34],
  7: [32, 28, 12],
  8: [34, 8, 10]
};

function getZoneAtmosphereRgb(zoneId) {
  let z = constrain(zoneId | 0, 1, 8);
  return ZONE_ATMOSPHERE_RGB[z] || [12, 12, 18];
}

// Paviršiaus antraštėms: 2 variantai / zona. Gylį valdo vienas ZONE_DATA.text sakinys.
const ZONE_TEXT_VARIANTS = {
  1: [
    "Čia viskas stovi.",
    "Čia prasidedu aš.\nNe kaip jausmas,\nkaip tai, kas laiko.",
    "Ten, kur prasidėjo, ten ir stovi."
  ],
  2: ["Laikau.", "Kartais tik apsimetu."],
  3: ["Aiškinti per sunku.", "Net kai skauda."],
  4: ["Per daug jaučiu.", "Liečia ir tai, ko nėra."],
  5: ["Mažas dalykas — didelis jausmas.", "Vidus nebetelpa."],
  6: ["Iki galo.", "Nepaleidžiu lengvai."],
  7: ["Stipriau nei save.", "Girdžiu nesakoma."],
  8: ["Greitai. Ir vėl paleidžiu.", "Be žodžių — pyktis."]
};

/** Šakos pasirinkimui: didesnis taikinys pirštui / siauram ekranui. */
function getTouchPickRadiusBoost() {
  let w =
    typeof width === "number" && width > 0
      ? width
      : typeof window !== "undefined"
        ? window.innerWidth
        : 1024;
  let narrow = w < 520;
  let coarse =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(pointer: coarse)").matches;
  if (narrow || coarse) {
    return 1.55;
  }
  return 1;
}

/**
 * Gylio „Pyktis“ (zona 8) — įtampos mazgas: tamsus diskas, lūžtančios linijos,
 * nepilnas pildomas žiedas, iškrova (ne medis, ne organinis augimas).
 */
const DEEP_ZONE_PYKTIS = {
  accent: [178, 72, 88],
  coreX: 0.5,
  coreY: 0.46,
  coreRadius: 112,
  /** Laikymo užuomina Pykčio gilyje — tik „laikyk“ (be „spausk ir“). */
  holdHint: "laikyk",
  textStages: ["mano...", "mano riba", "peržengta", "PERŽENGTA"],
  textStagesRepeat: ["vėl...", "užtenka", "", ""],
  returnHint: "sugrįžk",
  /** Kaip „Sulaužyti“: retesnis distort + platesnis tarp raidžių (grįžimo etiketė, užuominos). */
  ctaTypography: {
    letterSpacingEmIdle: 0.1,
    letterSpacingEmOver: 0.032,
    wordSpacingEmIdle: 0.045
  },
  labelGlitch: { distortEvery: 11, distortLevel: 0.18 }
};

/** Bendras 0…1 progresas → 4 fazių modelis (visoms emocijoms). */
function getDeepUniversalPhase(t) {
  let p = typeof t === "number" ? constrain(t, 0, 1) : 0;
  if (p < 0.2) {
    return 1;
  }
  if (p < 0.5) {
    return 2;
  }
  if (p < 0.95) {
    return 3;
  }
  return 4;
}

/**
 * `deepSeed * mul` gylio noise atskaitai — skaičiuojama kartą per kadrą (ne 200+ kartų cikle).
 * Kintant `deepSeed` ar `frameCount` – cache atnaujinamas.
 */
var _gnsFrame = -1;
var _gnsSeed = NaN;
var _gnsByMul = new Map();

function getDeepNoiseSeedScaled(mul) {
  let fc = typeof frameCount === "number" ? frameCount : 0;
  let ds = typeof deepSeed === "number" ? deepSeed : 1;
  if (fc !== _gnsFrame || ds !== _gnsSeed) {
    _gnsFrame = fc;
    _gnsSeed = ds;
    _gnsByMul = new Map();
  }
  if (!_gnsByMul.has(mul)) {
    _gnsByMul.set(mul, ds * mul);
  }
  return _gnsByMul.get(mul);
}

function getDeepNoiseOffset013() {
  return getDeepNoiseSeedScaled(0.00013);
}
