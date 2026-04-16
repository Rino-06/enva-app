// ============================================================
// sharedStyles.js — Ortak inline-style nesnesi
// Tüm page bileşenleri bu fonksiyonu çağırarak S nesnesini alır.
// ============================================================

import { C } from "./constants.js";

/**
 * makeStyles(C) → S
 *
 * inp  : <input> temel stili
 * lbl  : etiket (label) stili
 * btn  : buton stili factory — btn(bg, fg) → stil objesi
 * chip : renkli küçük rozet factory — chip(color) → stil objesi
 */
export const makeStyles = () => ({
  inp: {
    width: "100%",
    padding: "11px 12px",
    background: C.card2,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    color: C.text,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  },
  lbl: {
    color: C.muted,
    fontSize: 10,
    fontWeight: 800,
    display: "block",
    marginBottom: 5,
    letterSpacing: "0.09em",
  },
  btn: (bg, fg = "#fff") => ({
    padding: "11px 16px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    background: bg,
    color: fg,
    fontWeight: 800,
    fontSize: 13,
    fontFamily: "inherit",
  }),
  chip: (color) => ({
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 7px",
    borderRadius: 5,
    background: `${color}25`,
    color,
    letterSpacing: "0.04em",
  }),
});
