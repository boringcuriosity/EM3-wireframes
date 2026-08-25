import React from "react";
import { useWF } from "../../state";
import { Flame } from "lucide-react";
import { TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { byId, INTENSITIES, logBurn } from "./exercises";
import { fmtTime } from "../log/foods";
import Empty from "./Empty";

/* Everything logged today, newest last, the way the meal divisions read. */
export default function LoggedList() {
  const { exLogs } = useWF();

  return (
(exLogs.length === 0 ? (
            <Empty
              title="Nothing logged today"
              line="A walk to the shop counts. So does taking the stairs. Log it and I can tell you what it did."
            />
          ) : (
            exLogs.map((l, i) => {
              const ex = byId(l.id);
              const inten = INTENSITIES.find((x) => x.id === l.intensity);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 16,
                    padding: "13px 15px",
                    marginBottom: 9,
                  }}
                >
                  <span
                    style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: BG_ALT, border: "1px solid " + BORDER,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Flame size={16} color={TEXT} strokeWidth={1.8} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: TEXT }}>
                      {ex.name}
                    </span>
                    <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>
                      {l.minutes} min · {inten.label} · {fmtTime(l.timeMins)}
                    </span>
                  </span>
                  <span style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: TEXT }}>
                      {logBurn(l)}
                    </span>
                    <span style={{ display: "block", fontSize: 9.5, color: MUTED }}>kcal</span>
                  </span>
                </div>
              );
            })
          ))
  );
}
