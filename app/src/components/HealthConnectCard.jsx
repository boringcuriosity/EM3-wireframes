import React from "react";
import { useWF } from "../state";
import { RefreshCw, Check } from "lucide-react";
import Skel from "./Skel";
import { GREEN, MUTED } from "../tokens";

/* One line saying where this pillar's numbers come from.

   There is no offer state here any more: the first-run gate makes the choice
   before the screen is ever shown, so by the time this renders the answer
   always exists. Three things it can say: fetching, fetched, or you are doing
   it by hand. */
export default function HealthConnectCard({ signal }) {
  const { healthSource, setHealthSheet, healthSync } = useWF();
  const src = healthSource[signal];
  const syncing = healthSync === signal;

  if (!src) return null;

  if (syncing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 0 0" }}>
        <RefreshCw
          size={12}
          color={MUTED}
          strokeWidth={2.2}
          style={{ animation: "onbspin 1.1s linear infinite" }}
        />
        <span style={{ fontSize: 11, color: MUTED }}>Syncing from Health Connect</span>
        <Skel w={34} h={9} />
      </div>
    );
  }

  return (
    <button
      onClick={() => setHealthSheet(signal)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "none",
        border: "none",
        padding: "2px 0 0",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {src === "phone" ? (
        <RefreshCw size={12} color={MUTED} strokeWidth={2.2} />
      ) : (
        <Check size={12} color={MUTED} strokeWidth={2.6} />
      )}
      <span style={{ flex: 1, minWidth: 0, fontSize: 11, color: MUTED, textAlign: "left" }}>
        {src === "phone" ? "Synced from Health Connect, just now" : "You are entering this by hand"}
      </span>
      <span style={{ fontSize: 11, fontWeight: 700, color: GREEN }}>Change</span>
    </button>
  );
}
