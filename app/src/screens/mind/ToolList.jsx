import React from "react";
import { useWF } from "../../state";
import { Check, ChevronRight, Smile, Wind, Sparkles, BookOpen } from "lucide-react";
import { MIND_TOOLS, MIND_TEMPLATES, CADENCE, MOODS } from "./tools";
import { MIND_C, MIND_T, MIND_W, TEXT, MUTED, BG, BORDER, SH } from "../../tokens";

/* What Mind offers, in two lists that are two different kinds of thing.

   **The tools** are yours, always there, and short. Four of them read as a
   grid rather than as a column: they are peers you pick between, not a
   sequence you work down, and side by side they take a third of the screen
   they took stacked. That leaves room for the part below.

   **The worksheets** are the psychologist's, and they come with a cadence and
   a name long enough to need the width. So they stay full width, one per row,
   the way Eat's meals and Move's exercises do.

   No circle on either. An empty one sat where a control should be, doing
   nothing, on a card that opens when you tap it anywhere. Done, a card says
   **what** was done rather than that it was: the mood you picked, the line you
   kept, the prompt you answered. "Done today" told somebody what they already
   knew. */

const ICON = { mood: Smile, breathing: Wind, affirmation: Sparkles, journal: BookOpen };

// What each tool leaves behind, said in the card's own subtitle.
const record = (id, kept) => {
  if (id === "mood" && kept.mood) {
    const m = MOODS.find((x) => x.label === kept.mood);
    return "You felt " + kept.mood + (m ? " " + m.e : "");
  }
  if (id === "breathing") return "3 minutes done";
  if (id === "affirmation" && kept.affirmation) return "“" + kept.affirmation + "”";
  if (id === "journal" && kept.journal) return "You wrote about " + kept.journal.replace(/\?$/, "").toLowerCase();
  return "Done today";
};

export default function ToolList() {
  const { mindDone, setMindTool, mindKept, mindPlan, templateKept, setMindTemplate, bookedSession, sessionState } = useWF();

  return (
    <div>
      <Heading>Ways to boost your mind today</Heading>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {MIND_TOOLS.map((t) => {
          const done = mindDone.includes(t.id);
          const Icon = ICON[t.id];
          return (
            <button
              key={t.id}
              onClick={() => setMindTool(t.id)}
              style={{
                textAlign: "left",
                background: done ? MIND_W : BG,
                border: "1px solid " + (done ? MIND_C : BORDER),
                borderRadius: 16,
                padding: "12px 13px 13px",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: SH,
                minHeight: 104,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
                <Icon size={15} color={MIND_C} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }} />
                {done && (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: MIND_C,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={11} color="#fff" strokeWidth={3.2} />
                  </span>
                )}
              </span>

              <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>
                {t.label}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  color: done ? MIND_C : MUTED,
                  marginTop: 3,
                  lineHeight: 1.4,
                }}
              >
                {done ? record(t.id, mindKept) : t.line}
              </span>
            </button>
          );
        })}
      </div>

      {/* What the psychologist set, once there is one. Worksheets rather than
          practices, so the record is what somebody wrote in them. */}
      {mindPlan && (
        <>
          <Heading top>From Manya, your psychologist</Heading>

          {/* The frame the rest sit inside: everything below is what she asked
              for, and this is what you want to raise. Slimmer and tinted, so it
              reads as the band across the top of her section rather than as a
              sixth worksheet. */}
          {MIND_TEMPLATES.filter((t) => t.strip).map((t) => {
            const kept = (templateKept || {})[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setMindTemplate(t.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  background: MIND_W,
                  border: "1px solid " + MIND_C + "33",
                  borderRadius: 14,
                  padding: "11px 13px",
                  marginBottom: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <t.Icon size={16} color={MIND_C} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: TEXT }}>
                    {t.name}
                  </span>
                  {/* The session itself when there is one booked, because the
                      notes are for a particular hour rather than for the idea
                      of a next time. */}
                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: MUTED,
                      marginTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {kept
                      ? kept.summary
                      : sessionState === "booked"
                      ? bookedSession.coach.split(" ")[0] + ", " + bookedSession.date + " at " + bookedSession.time
                      : t.line}
                  </span>
                </span>
                {kept ? (
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: MIND_C,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={12} color="#fff" strokeWidth={3.2} />
                  </span>
                ) : (
                  <ChevronRight size={16} color={MIND_C} style={{ flexShrink: 0 }} />
                )}
              </button>
            );
          })}

          {MIND_TEMPLATES.filter((t) => !t.strip).map((t) => {
            const kept = (templateKept || {})[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setMindTemplate(t.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: BG,
                  border: "1px solid " + (kept ? MIND_C : BORDER),
                  borderRadius: 16,
                  padding: "13px 14px",
                  marginBottom: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  boxShadow: SH,
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    flexShrink: 0,
                    background: MIND_T,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <t.Icon size={15} color={MIND_C} strokeWidth={2.2} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{t.name}</span>
                    {/* How often, which is the thing a worksheet has to say and
                        the one the live version leaves out. */}
                    {!kept && (
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
                  <span
                    style={{
                      display: "block",
                      fontSize: 11.5,
                      color: MUTED,
                      marginTop: 3,
                      lineHeight: 1.45,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {kept ? kept.summary : t.line}
                  </span>
                </span>

                {kept ? (
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: MIND_C,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={12} color="#fff" strokeWidth={3.2} />
                  </span>
                ) : (
                  <ChevronRight size={16} color={MUTED} style={{ flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}

function Heading({ children, top }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: TEXT,
        margin: top ? "24px 0 10px" : "0 0 10px",
      }}
    >
      {children}
    </div>
  );
}
