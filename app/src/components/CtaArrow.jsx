import React from "react";
import { ArrowRight } from "lucide-react";

/* The one arrow the app uses on calls to action. Drawn rather than typed, so
   it has the same weight as the label beside it instead of the thin hairline
   the → character renders at. Colour is inherited, so it is white on a filled
   button and brand green on a text link without being told. */
export default function CtaArrow({ size = 15, style }) {
  return (
    <ArrowRight
      size={size}
      strokeWidth={2.6}
      style={{ verticalAlign: -2, marginLeft: 5, flexShrink: 0, ...style }}
    />
  );
}
