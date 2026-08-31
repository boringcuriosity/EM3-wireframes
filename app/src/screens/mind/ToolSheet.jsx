import React, { useState } from "react";
import { useWF } from "../../state";
import { X } from "lucide-react";
import { MOODS, AFFIRMATIONS, JOURNAL_PROMPTS, MIND_TOOLS } from "./tools";
import {
  GREEN, GREEN_DEEP, MIND_C, MIND_T, TEXT, MUTED, BG, BG_ALT, BORDER,
} from "../../tokens";

const COINS = 2;

/* One sheet, four tools. They are all the same shape underneath: a short ask,
   a way to answer it, and a button that closes the loop and ticks the row. */
export default function ToolSheet() {
  const {
    mindTool, setMindTool, mindDone, setMindDone, setMindMood, keepMind,
    flipcoins, setFlipcoins, setToast,
  } = useWF();

  const [mood, setMood] = useState(null);
  const [affirmation, setAffirmation] = useState(0);
  const [prompt, setPrompt] = useState(0);
  const [entry, setEntry] = useState("");
  const [breathing, setBreathing] = useState(false);

  const tool = MIND_TOOLS.find((t) => t.id === mindTool);
  if (!tool) return null;

  const finish = () => {
    if (mindTool === "mood" && mood) setMindMood(MOODS.find((m) => m.id === mood).label);
    /* The line they kept and the words they wrote, held past the sheet, so the
       card behind it can say what was done rather than only that it was. */
    if (mindTool === "affirmation") keepMind("affirmation", AFFIRMATIONS[affirmation]);
    if (mindTool === "journal") keepMind("journal", JOURNAL_PROMPTS[prompt]);
    if (!mindDone.includes(mindTool)) {
      setMindDone(mindDone.concat(mindTool));
      setFlipcoins(flipcoins + COINS);
      setToast({ title: tool.label + " done", line: "Mind is part of the work too.", coins: COINS });
    }
    setMindTool(null);
  };

  const ready =
    mindTool === "mood" ? !!mood : mindTool === "journal" ? entry.trim().length > 0 : true;

  return (
    <div
      onClick={() => setMindTool(null)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 55,
        background: "rgba(16,24,40,0.46)",
        display: "flex",
        alignItems: "flex-end",
        animation: "scrimIn .24s ease both",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          maxHeight: "88%",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >

        <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px 0", minHeight: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                background: MIND_T,
                color: MIND_C,
                borderRadius: 999,
                padding: "4px 11px",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0.6,
                textTransform: "uppercase",
              }}
            >
              {tool.label}
            </span>
            <span style={{ flex: 1 }} />
            <button
              onClick={() => setMindTool(null)}
              aria-label="Close"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: -4 }}
            >
              <X size={17} color={MUTED} />
            </button>
          </div>

          {mindTool === "mood" && (
            <>
              <Title>How are you feeling right now?</Title>
              <Sub>No wrong answer. It only takes a tap, and the pattern over a week is what your coach reads.</Sub>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                {MOODS.map((m) => {
                  const on = mood === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMood(m.id)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 5,
                        width: 72,
                        padding: "11px 0",
                        background: on ? MIND_T : BG,
                        border: "1px solid " + (on ? MIND_C : BORDER),
                        borderRadius: 14,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{m.e}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: on ? MIND_C : MUTED }}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {mindTool === "breathing" && (
            <>
              <Title>Three minutes of slow breathing</Title>
              <Sub>Breathe in for four, out for six. The longer breath out is the part that settles your body.</Sub>
              <div style={{ display: "flex", justifyContent: "center", padding: "26px 0 18px" }}>
                <span
                  style={{
                    width: 132,
                    height: 132,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, " + MIND_T + " 0%, " + BG + " 78%)",
                    border: "1.5px solid " + MIND_C,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    fontWeight: 700,
                    color: MIND_C,
                    animation: breathing ? "glowBreathe 5s ease-in-out infinite" : "none",
                  }}
                >
                  {breathing ? "Breathe out" : "Ready"}
                </span>
              </div>
              {!breathing && (
                <button
                  onClick={() => setBreathing(true)}
                  style={{
                    width: "100%",
                    background: BG,
                    border: "1px solid " + MIND_C,
                    borderRadius: 12,
                    padding: "11px 0",
                    fontSize: 13,
                    fontWeight: 700,
                    color: MIND_C,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Start breathing
                </button>
              )}
            </>
          )}

          {mindTool === "affirmation" && (
            <>
              <Title>One line for today</Title>
              <div
                style={{
                  background: MIND_T,
                  borderRadius: 16,
                  padding: "22px 18px",
                  marginTop: 16,
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: TEXT,
                  lineHeight: 1.4,
                  textAlign: "center",
                }}
              >
                {AFFIRMATIONS[affirmation]}
              </div>
              <button
                onClick={() => setAffirmation((affirmation + 1) % AFFIRMATIONS.length)}
                style={{
                  width: "100%",
                  marginTop: 12,
                  background: "none",
                  border: "none",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: MIND_C,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Show me another
              </button>
            </>
          )}

          {mindTool === "journal" && (
            <>
              <Title>{JOURNAL_PROMPTS[prompt]}</Title>
              <Sub>Nobody reads this but you, unless you choose to share it with your coach.</Sub>
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Start writing"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  marginTop: 14,
                  minHeight: 116,
                  resize: "none",
                  background: BG_ALT,
                  border: "1px solid " + BORDER,
                  borderRadius: 14,
                  padding: 13,
                  fontSize: 13,
                  color: TEXT,
                  lineHeight: 1.6,
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <button
                onClick={() => setPrompt((prompt + 1) % JOURNAL_PROMPTS.length)}
                style={{
                  marginTop: 10,
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: MIND_C,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Try another prompt
              </button>
            </>
          )}
        </div>

        <div style={{ flexShrink: 0, padding: "16px 22px 24px" }}>
          <button
            onClick={() => ready && finish()}
            disabled={!ready}
            style={{
              width: "100%",
              background: ready ? GREEN : BG_ALT,
              border: "1px solid " + (ready ? GREEN : BORDER),
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 700,
              color: ready ? "#fff" : MUTED,
              cursor: ready ? "pointer" : "default",
              fontFamily: "inherit",
              boxShadow: ready ? "0 2px 0 " + GREEN_DEEP : "none",
            }}
          >
            {mindTool === "journal" ? "Save entry" : mindTool === "mood" ? "Save how I feel" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Title({ children }) {
  return (
    <h2
      style={{
        margin: "13px 0 0",
        fontSize: 20,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: TEXT,
        lineHeight: 1.3,
      }}
    >
      {children}
    </h2>
  );
}

function Sub({ children }) {
  return <p style={{ margin: "8px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>{children}</p>;
}
