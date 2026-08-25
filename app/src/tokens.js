// GoodFlip palette. Every value below is a token from the design system's
// colour foundations, so nothing here is invented.
// Neutrals carry the app. Colour is the exception, and each family means one
// thing: green is the brand and the primary action, indigo is movement, teal
// is calm, gold is knowledge and reward, red and amber are status.

/* ---------- Brand ---------- */
export const GREEN      = "#299D6B"; // brand-600, primary fills and interaction
export const GREEN_DEEP = "#2A805A"; // brand-700, pressed and depth
export const GREEN_TINT = "#E6FAF1"; // brand-100, selected and highlighted surfaces
export const GREEN_WASH = "#F3FCF8"; // brand-50, the faintest brand wash

/* ---------- Neutrals ---------- */
export const TEXT    = "#101828"; // gray-900, text-primary
export const TEXT_2  = "#344054"; // gray-700, text-secondary
export const MUTED   = "#667085"; // gray-500, text-tertiary
export const FAINT   = "#98A2B3"; // gray-400, text-disabled
export const BG      = "#FFFFFF"; // cards and sheets
export const BG_ALT  = "#F9FAFB"; // gray-50, the page behind cards
export const BG_SUNK = "#F2F4F7"; // gray-100, recessed sections and bar tracks
export const BORDER  = "#E4E7EC"; // gray-200, border-strong
export const LINE    = "#F2F4F7"; // gray-100, border-default
export const RULE    = "#D0D5DD"; // gray-300, the strongest hairline

/* Indigo is the system's secondary accent, and it owns one job here: the
   focused state of an input. Green means "this is the action", so an input
   that merely has the cursor in it should not wear it. */
export const INDIGO      = "#444CE7"; // indigo-600
export const INDIGO_RING = "rgba(68,76,231,0.16)";

/* ---------- Pillar hues ----------
   Eat takes the brand. Move takes indigo, the system's "actionable" accent.
   Mind takes teal, its decorative calm. Measure takes gold, which the system
   reserves for information and insight, and that is exactly what Measure is.
   Darkened steps, because the light ends of teal and gold cannot be read. */
export const EAT_C     = "#299D6B"; // brand-600
export const MOVE_C    = "#444CE7"; // indigo-600
export const MIND_C    = "#2DA6A6"; // teal-800
export const MEASURE_C = "#CDA935"; // gold-700

export const EAT_T     = "#E6FAF1"; // brand-100
export const MOVE_T    = "#E0EAFF"; // indigo-100
export const MIND_T    = "#E0FFFF"; // teal-100
export const MEASURE_T = "#FFF8E0"; // gold-100

/* A step below the tints, for surfaces large enough that a tint would read as
   a block of colour rather than as an accent. */
export const EAT_W     = "#F3FCF8"; // brand-50
export const MOVE_W    = "#F5F8FF"; // indigo-25
export const MIND_W    = "#F5FFFF"; // teal-25
export const MEASURE_W = "#FFFDF5"; // gold-25

/* One lookup, so any surface can tint itself by pillar without a local map. */
export const PILLAR = {
  eat:     { c: EAT_C,     t: EAT_T,     w: EAT_W },
  move:    { c: MOVE_C,    t: MOVE_T,    w: MOVE_W },
  mind:    { c: MIND_C,    t: MIND_T,    w: MIND_W },
  measure: { c: MEASURE_C, t: MEASURE_T, w: MEASURE_W },
};

/* ---------- Reward and status ---------- */
export const GOLD      = "#E7C144"; // gold-600, FlipCoins
export const GOLD_DEEP = "#A68A2D"; // gold-800, gold text that has to be read
export const GOLD_TINT = "#FFFBEE"; // gold-50
export const GOLD_LINE = "#FEF1C7"; // gold-200

export const OK        = "#039855"; // success-600
export const OK_TINT   = "#ECFDF3"; // success-50
export const WARN      = "#DC6803"; // warning-600
export const WARN_TINT = "#FFFAEB"; // warning-50
export const BAD       = "#D92D20"; // error-600
export const BAD_TINT  = "#FEF3F2"; // error-50

/* ---------- Elevation ----------
   The design system's shadow scale, at its real strength. The wireframe had
   been running these at a twentieth of the intended alpha, which is why every
   card sat flat on the page. */
export const SH_SM = "0 1px 2px rgba(0,0,0,0.05)";
export const SH    = "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)";
export const SH_MD = "0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10)";
export const SH_LG = "0 10px 15px -3px rgba(0,0,0,0.10), 0 4px 6px -4px rgba(0,0,0,0.10)";
export const SH_XL = "0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)";

import { Home, ListChecks, BarChart3, Heart, LayoutGrid } from "lucide-react";
export const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "track", label: "To-do", icon: ListChecks },
  { id: "med", label: "Measure", icon: BarChart3 },
  { id: "care", label: "Care", icon: Heart },
  { id: "more", label: "More", icon: LayoutGrid },
];
