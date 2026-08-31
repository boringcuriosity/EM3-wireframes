import React, { useState } from "react";
import { useWF } from "../../state";
import { X, Plus, Check } from "lucide-react";
import { MIND_TEMPLATES, CADENCE, MOTIVATION_LEVELS, WEEKDAYS } from "./tools";
import {
  MIND_C, MIND_T, TEXT, MUTED, FAINT, BG, BG_ALT, BG_SUNK, BORDER, LINE, RULE, GREEN, GREEN_DEEP,
} from "../../tokens";

const COINS = 3;

/* A psychologist's worksheet, filled in.

   Mind's plan is not practices at hours the way Eat's is meals and Move's is
   exercises. It is worksheets: a thing to think about and write down. So the
   record is what somebody wrote, and filling one is what finishes it.

   The live version puts eight of these open at once down one page, each with
   its own Save. Nobody fills eight worksheets in a sitting, and a page of
   eight open forms says nothing about which one is for today. Here each one is
   a card on Mind and a sheet of its own, opened from that card or straight
   from the row on the day's list.

   Three shapes cover all of them, so a new worksheet is an entry in
   MIND_TEMPLATES rather than a screen:

     fields  a list of written answers, which is most of them
     list    something you add items to, one at a time
     week    a thing you fill a day at a time across a week */
export default function MindTemplateSheet() {
  const {
    mindTemplate, setMindTemplate, templateKept, setTemplateKept,
    flipcoins, setFlipcoins, setToast,
  } = useWF();

  const t = MIND_TEMPLATES.find((x) => x.id === mindTemplate);
  const saved = (templateKept || {})[mindTemplate];

  const [answers, setAnswers] = useState(() => (saved && saved.answers) || {});
  const [items, setItems] = useState(() => (saved && saved.items) || []);
  const [draft, setDraft] = useState("");
  const [levels, setLevels] = useState(() => (saved && saved.levels) || {});
  const [motivators, setMotivators] = useState(() => (saved && saved.motivators) || ["", "", "", ""]);

  if (!t) return null;

  const set = (id, v) => setAnswers((a) => ({ ...a, [id]: v }));

  /* Enough to save, which is deliberately little. A worksheet half filled is
     still worth keeping, and a psychologist would rather read four honest
     words than wait for six polished ones. */
  const filled =
    t.kind === "fields"
      ? Object.values(answers).some((v) => (v || "").trim())
      : t.kind === "list"
      ? items.length > 0
      : Object.keys(levels).length > 0 || motivators.some((m) => m.trim());

  // What the card says afterwards: the shortest true summary of the writing.
  const summary = () => {
    if (t.kind === "fields") {
      const first = t.fields.map((f) => (answers[f.id] || "").trim()).find(Boolean);
      const n = t.fields.filter((f) => (answers[f.id] || "").trim()).length;
      return n === t.fields.length ? first : first + " · " + n + " of " + t.fields.length + " answered";
    }
    if (t.kind === "list") return items.length + (items.length === 1 ? " worry written down" : " worries written down");
    const days = Object.keys(levels).length;
    return days + (days === 1 ? " day marked this week" : " days marked this week");
  };

  const save = () => {
    setTemplateKept({
      ...(templateKept || {}),
      [t.id]: { answers, items, levels, motivators, summary: summary() },
    });
    if (!saved) {
      setFlipcoins(flipcoins + COINS);
      setToast({ title: t.name + " saved", line: "Manya reads this before your next session.", coins: COINS });
    }
    setMindTemplate(null);
  };

  return (
    <div
      onClick={() => setMindTemplate(null)}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 56,
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
          height: "88%",
          background: BG,
          borderRadius: "26px 26px 0 0",
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >

        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "20px 22px 12px",
            borderBottom: "1px solid " + LINE,
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              flexShrink: 0,
              background: MIND_T,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 1,
            }}
          >
            <t.Icon size={17} color={MIND_C} strokeWidth={2.2} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: TEXT, letterSpacing: "-0.01em" }}>
                {t.name}
              </span>
              {/* Left off the one whose title already says it. "Before your
                  next session" beside a chip reading "Before your session" is
                  the same words twice, fighting for the same line. */}
              {!t.strip && (
                <span
                  style={{
                    flexShrink: 0,
                    background: MIND_T,
                    borderRadius: 999,
                    padding: "2px 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: MIND_C,
                  }}
                >
                  {CADENCE[t.cadence]}
                </span>
              )}
            </span>
            <span style={{ display: "block", fontSize: 11.5, color: MUTED, marginTop: 3, lineHeight: 1.45 }}>
              {t.line}
            </span>
          </span>
          <button
            onClick={() => setMindTemplate(null)}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, margin: "-4px -4px 0 0", display: "flex", flexShrink: 0 }}
          >
            <X size={18} color={MUTED} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, background: BG_ALT, padding: "16px 18px 8px" }}>
          {t.kind === "fields" &&
            t.fields.map((f) => (
              <div key={f.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  {f.tag && (
                    <span
                      style={{
                        width: 19,
                        height: 19,
                        borderRadius: 6,
                        flexShrink: 0,
                        background: MIND_T,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10.5,
                        fontWeight: 800,
                        color: MIND_C,
                      }}
                    >
                      {f.tag}
                    </span>
                  )}
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{f.label}</span>
                </div>
                <textarea
                  value={answers[f.id] || ""}
                  onChange={(e) => set(f.id, e.target.value)}
                  placeholder={f.hint}
                  rows={2}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    resize: "none",
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 12,
                    padding: "10px 12px",
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: TEXT,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
              </div>
            ))}

          {t.kind === "list" && (
            <>
              {items.length === 0 ? (
                <div
                  style={{
                    background: BG,
                    border: "1px dashed " + RULE,
                    borderRadius: 14,
                    padding: "26px 16px",
                    textAlign: "center",
                    fontSize: 12.5,
                    color: MUTED,
                  }}
                >
                  {t.empty}
                </div>
              ) : (
                items.map((it, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      background: BG,
                      border: "1px solid " + BORDER,
                      borderRadius: 14,
                      padding: "11px 13px",
                      marginBottom: 9,
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>{it}</span>
                    <button
                      onClick={() => setItems(items.filter((_, j) => j !== i))}
                      aria-label={"Remove " + it}
                      style={{ background: "none", border: "none", padding: 2, margin: -2, cursor: "pointer", display: "flex", flexShrink: 0 }}
                    >
                      <X size={14} color={FAINT} />
                    </button>
                  </div>
                ))
              )}

              <div style={{ display: "flex", gap: 9, marginTop: 12 }}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && draft.trim()) {
                      setItems(items.concat(draft.trim()));
                      setDraft("");
                    }
                  }}
                  placeholder="What is on your mind?"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 12,
                    padding: "11px 13px",
                    fontSize: 12.5,
                    color: TEXT,
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => {
                    if (!draft.trim()) return;
                    setItems(items.concat(draft.trim()));
                    setDraft("");
                  }}
                  aria-label={t.addLabel}
                  style={{
                    width: 44,
                    flexShrink: 0,
                    borderRadius: 12,
                    background: MIND_C,
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={18} color="#fff" strokeWidth={2.6} />
                </button>
              </div>
            </>
          )}

          {t.kind === "week" && (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
                Four things that keep you going
              </div>
              {motivators.map((m, i) => (
                <input
                  key={i}
                  value={m}
                  onChange={(e) => setMotivators(motivators.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={i + 1 + "."}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 12,
                    padding: "10px 12px",
                    fontSize: 12.5,
                    color: TEXT,
                    fontFamily: "inherit",
                    outline: "none",
                    marginBottom: 8,
                  }}
                />
              ))}

              <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, margin: "16px 0 8px" }}>
                How each day felt
              </div>
              {/* A day at a time, and only the days that have happened. A row
                  for Sunday on a Monday is a box nobody can honestly fill. */}
              {WEEKDAYS.map((d, i) => {
                const past = i <= 0;
                return (
                  <div
                    key={d}
                    style={{
                      background: BG,
                      border: "1px solid " + BORDER,
                      borderRadius: 12,
                      padding: "10px 12px",
                      marginBottom: 8,
                      opacity: past ? 1 : 0.55,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: past ? TEXT : MUTED }}>{d}</span>
                      {!past && <span style={{ fontSize: 11, color: FAINT }}>Available on {d}</span>}
                    </div>
                    {past && (
                      <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
                        {MOTIVATION_LEVELS.map((l) => {
                          const on = levels[d] === l.id;
                          return (
                            <button
                              key={l.id}
                              onClick={() => setLevels({ ...levels, [d]: l.id })}
                              style={{
                                background: on ? MIND_C : BG,
                                border: "1px solid " + (on ? MIND_C : BORDER),
                                borderRadius: 999,
                                padding: "5px 12px",
                                fontSize: 11.5,
                                fontWeight: 700,
                                color: on ? "#fff" : MUTED,
                                cursor: "pointer",
                                fontFamily: "inherit",
                              }}
                            >
                              {l.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div style={{ flexShrink: 0, borderTop: "1px solid " + LINE, padding: "12px 22px 24px", background: BG }}>
          {/* The button names the worksheet. "Save" alone is a word about a
              file, and the psychologist reads all five of these, so her name
              was the half of it that said least. */}
          <button
            onClick={save}
            disabled={!filled}
            style={{
              width: "100%",
              height: 50,
              borderRadius: 14,
              background: filled ? GREEN : BG_SUNK,
              border: "none",
              color: filled ? "#fff" : FAINT,
              fontSize: 14.5,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: filled ? "pointer" : "default",
              boxShadow: filled ? "0 2px 0 " + GREEN_DEEP : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {saved && <Check size={16} strokeWidth={3} />}
            {saved ? "Save changes" : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
