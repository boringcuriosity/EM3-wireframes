import React from "react";
import { useWF } from "../state";

/* Marks a piece of the UI as somewhere the tour can point. It renders nothing
   of its own, it only hands the real node to the registry, so wrapping an
   element in one changes neither its layout nor its styling. */
export default function TourTarget({ id, children, style }) {
  const { tourTargets } = useWF();
  return (
    <div
      ref={(el) => {
        if (el) tourTargets.current[id] = el;
        else delete tourTargets.current[id];
      }}
      style={style}
    >
      {children}
    </div>
  );
}
