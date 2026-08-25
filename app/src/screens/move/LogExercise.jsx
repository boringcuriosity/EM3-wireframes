import React, { useState } from "react";
import { useWF } from "../../state";
import { ChevronLeft, ChevronRight, Search, X, Plus, Minus } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { EXERCISES, byId, INTENSITIES, burnt } from "./exercises";
import { fmtTime, timeSlots } from "../log/foods";

const NOW = 13 * 60 + 30;
const COINS = 2;

/* Log exercise, in one decision. Picking the activity is the only thing asked
   for; duration, effort and time all arrive with sensible defaults and stay out
   of the way until someone wants them. */
export default function LogExercise() {
  const { setLogExOpen, exLogs, setExLogs, flipcoins, setFlipcoins, setToast } = useWF();

  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(null);
  const [minutes, setMinutes] = useState(20);
  const [intensity, setIntensity] = useState("moderate");
  const [when, setWhen] = useState(NOW);
  const [adjust, setAdjust] = useState(false);

  const q = query.trim().toLowerCase();
  const list = q
    ? EXERCISES.filter((x) => x.name.toLowerCase().includes(q))
    : EXERCISES.filter((x) => x.tags.includes("common"));

  const ex = picked ? byId(picked) : null;
  const inten = INTENSITIES.find((i) => i.id === intensity);
  const kcal = ex ? burnt({ met: ex.met, minutes, factor: inten.factor }) : 0;

  const submit = () => {
    setExLogs(exLogs.concat({ id: picked, minutes, intensity, timeMins: when }));
    setFlipcoins(flipcoins + COINS);
    setToast({
      title: "Movement logged",
      line: ex.name + " · " + minutes + " min · about " + kcal + " kcal",
      coins: COINS,
    });
    setLogExOpen(false);
  };

  return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "6px 22px 14px" }}>
          <button
            onClick={() => (picked ? setPicked(null) : setLogExOpen(false))}
            aria-label="Back"
            style={{
              width: 34, height: 34, borderRadius: "50%", background: BG_ALT,
              border: "1px solid " + BORDER, display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}
          >
            <ChevronLeft size={18} color={TEXT} />
          </button>
          <span style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: 700, color: TEXT }}>
            {picked ? "How long?" : "What did you do?"}
          </span>
          <span style={{ width: 34 }} />
        </div>

        {!picked ? (
          /* One job: name the activity. */
          <div style={{ flex: 1, overflowY: "auto", padding: "0 22px 20px", minHeight: 0 }}>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 9, background: BG_ALT,
                border: "1px solid " + BORDER, borderRadius: 13, padding: "12px 13px",
              }}
            >
              <Search size={16} color={MUTED} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search an activity"
                aria-label="Search an activity"
                style={{
                  flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent",
                  fontSize: 13.5, fontFamily: "inherit", color: TEXT,
                }}
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Clear search"
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                  <X size={15} color={MUTED} />
                </button>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              {list.length === 0 ? (
                <div style={{ padding: "34px 10px", textAlign: "center", fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
                  Nothing matches that. Try a simpler word, like walk, cycle or yoga.
                </div>
              ) : (
                list.map((x) => (
                  <button
                    key={x.id}
                    onClick={() => setPicked(x.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      textAlign: "left",
                      background: BG,
                      border: "none",
                      borderBottom: "1px solid " + BORDER,
                      padding: "15px 2px",
                      fontSize: 14.5,
                      color: TEXT,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <span style={{ flex: 1 }}>{x.name}</span>
                    <ChevronRight size={17} color={MUTED} />
                  </button>
                ))
              )}
            </div>

            {!q && list.length > 0 && (
              <div style={{ fontSize: 11, color: MUTED, marginTop: 14, lineHeight: 1.55 }}>
                Search for anything else. Housework and gardening count too.
              </div>
            )}
          </div>
        ) : (
          /* Everything else already has an answer. This is a confirm, not a form. */
          <div style={{ flex: 1, overflowY: "auto", padding: "0 22px 20px", minHeight: 0 }}>
            <div
              style={{
                background: BG_ALT,
                border: "1px solid " + BORDER,
                borderRadius: 20,
                padding: "20px 18px 22px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{ex.name}</div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, marginTop: 18 }}>
                <Round onClick={() => setMinutes(Math.max(5, minutes - 5))} aria="Five minutes less">
                  <Minus size={19} color={TEXT} strokeWidth={2.4} />
                </Round>
                <span style={{ display: "flex", alignItems: "baseline", gap: 5, minWidth: 104, justifyContent: "center" }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: TEXT, lineHeight: 1, letterSpacing: -1 }}>
                    {minutes}
                  </span>
                  <span style={{ fontSize: 14, color: MUTED }}>min</span>
                </span>
                <Round onClick={() => setMinutes(Math.min(180, minutes + 5))} aria="Five minutes more">
                  <Plus size={19} color={TEXT} strokeWidth={2.4} />
                </Round>
              </div>

              <div style={{ fontSize: 12, color: MUTED, marginTop: 16 }}>
                about <strong style={{ color: TEXT }}>{kcal} kcal</strong> burnt
              </div>
            </div>

            {/* The two things almost nobody changes, folded into one quiet row */}
            <button
              onClick={() => setAdjust(true)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 14,
                padding: "13px 15px",
                marginTop: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <span style={{ flex: 1, fontSize: 12.5, color: TEXT }}>
                {inten.label} effort · {fmtTime(when)}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>Change</span>
              <ChevronRight size={15} color={MUTED} />
            </button>

            <button
              onClick={() => setPicked(null)}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                padding: "14px 0 0",
                fontSize: 12.5,
                fontWeight: 600,
                color: MUTED,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Pick a different activity
            </button>
          </div>
        )}

        {picked && (
          <div style={{ flexShrink: 0, borderTop: "1px solid " + BORDER, padding: "12px 22px 24px" }}>
            <button
              onClick={submit}
              style={{
                width: "100%", background: GREEN, border: "none", borderRadius: 14,
                padding: "14px 0", color: "#fff", fontSize: 14.5, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Log exercise
            </button>
          </div>
        )}
      </div>

      {adjust && (
        <div
          onClick={() => setAdjust(false)}
          style={{
            position: "absolute", inset: 0, zIndex: 48, background: "rgba(31,38,48,0.42)",
            display: "flex", alignItems: "flex-end", animation: "scrimIn .24s ease both",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", background: BG, borderRadius: "26px 26px 0 0",
              padding: "10px 0 24px", boxShadow: "0 -12px 40px rgba(31,38,48,0.22)",
              animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
            }}
          >
            <div style={{ width: 38, height: 4, borderRadius: 2, background: BORDER, margin: "0 auto 16px" }} />

            <div style={{ padding: "0 22px" }}>
              <Label>HOW HARD WAS IT</Label>
              <div style={{ display: "flex", gap: 7 }}>
                {INTENSITIES.map((i) => {
                  const on = i.id === intensity;
                  return (
                    <button
                      key={i.id}
                      onClick={() => setIntensity(i.id)}
                      aria-pressed={on}
                      style={{
                        flex: 1,
                        background: on ? GREEN : BG,
                        border: "1px solid " + (on ? GREEN : BORDER),
                        borderRadius: 12,
                        padding: "11px 0",
                        fontSize: 12.5,
                        fontWeight: on ? 700 : 500,
                        color: on ? "#fff" : TEXT,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {i.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 9, lineHeight: 1.5 }}>
                {inten.hint}
              </div>

              <Label style={{ marginTop: 22 }}>WHEN</Label>
            </div>

            <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "0 22px 4px", scrollbarWidth: "none" }}>
              {timeSlots(NOW).map((t) => {
                const on = t === when;
                return (
                  <button
                    key={t}
                    onClick={() => setWhen(t)}
                    style={{
                      flexShrink: 0,
                      background: on ? GREEN : BG,
                      border: "1px solid " + (on ? GREEN : BORDER),
                      borderRadius: 12,
                      padding: "10px 14px",
                      fontSize: 12.5,
                      fontWeight: on ? 700 : 500,
                      color: on ? "#fff" : TEXT,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {fmtTime(t)}
                  </button>
                );
              })}
            </div>

            <div style={{ padding: "18px 22px 0" }}>
              <button
                onClick={() => setAdjust(false)}
                style={{
                  width: "100%", background: GREEN, border: "none", borderRadius: 14,
                  padding: "14px 0", color: "#fff", fontSize: 14.5, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Round({ onClick, children, aria }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      style={{
        width: 42, height: 42, borderRadius: "50%", background: BG,
        border: "1px solid " + BORDER, display: "flex", alignItems: "center",
        justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0,
      }}
    >
      {children}
    </button>
  );
}

function Label({ children, style }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.9, margin: "0 0 10px", ...style }}>
      {children}
    </div>
  );
}
