import React from "react";
import { useWF } from "../../state";
import { Check } from "lucide-react";
import { ScoreScreen } from "./parts";
import { Cta, KairaMark } from "../sufficiency/parts";
import { QUESTIONS } from "./questions";
import { GREEN, TEXT, MUTED, BG, BG_ALT, BORDER, LINE } from "../../tokens";

/* One question at a time, with a bar that fills as they go.

   Five on one screen is a form, and a form gets skimmed. One at a time is a
   conversation, and the bar is what stops that feeling endless: you can see
   there are five and you can see where you are. */
export default function ScoreProfile() {
  const { setScoreFlow, scoreStep, setScoreStep } = useWF();

  const i = Math.min(scoreStep, QUESTIONS.length - 1);
  const last = i === QUESTIONS.length - 1;

  const back = () => (i === 0 ? setScoreFlow("focus") : setScoreStep(i - 1));
  const next = () => (last ? setScoreFlow("review") : setScoreStep(i + 1));

  return (
    <ScoreScreen
      step="profile"
      onBack={back}
      footer={<Cta onClick={next}>{last ? "Review my answers" : "Next"}</Cta>}
    >
      <div style={{ padding: "0 22px" }}>
        {/* How far in, before the question rather than after it. */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: 1, height: 4, borderRadius: 2, background: LINE, overflow: "hidden" }}>
            <span
              style={{
                display: "block",
                height: "100%",
                width: "100%",
                background: GREEN,
                transformOrigin: "left",
                transform: "scaleX(" + (i + 1) / QUESTIONS.length + ")",
                transition: "transform .4s cubic-bezier(.32,.72,0,1)",
              }}
            />
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, flexShrink: 0 }}>
            {i + 1} of {QUESTIONS.length}
          </span>
        </div>

        {/* Answered questions stay on the screen, folded down to their answer.

           One question at a time is a conversation, but a question that
           replaces the last one takes the conversation with it: five screens
           later somebody has no idea what they have already told us and no way
           to look. They stack now, each one collapsing to its own answer as
           the next opens, so the screen fills up with what you said rather
           than emptying out behind you. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
          {QUESTIONS.slice(0, i + 1).map((x, n) => {
            const open = n === i;
            return (
              <button
                key={x.id}
                onClick={open ? undefined : () => setScoreStep(n)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: open ? BG : BG_ALT,
                  border: "1px solid " + (open ? BORDER : LINE),
                  borderRadius: 16,
                  padding: open ? "16px 15px 18px" : "11px 13px",
                  cursor: open ? "default" : "pointer",
                  fontFamily: "inherit",
                  animation: open ? "riseIn .34s cubic-bezier(.32,.72,0,1) both" : undefined,
                  transition: "padding .28s cubic-bezier(.32,.72,0,1)",
                }}
              >
                {open ? (
                  <>
                    <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <KairaMark size={22} />
                      <span style={{ fontSize: 15.5, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>
                        {x.label}
                      </span>
                    </span>

                    {x.kind === "choice" ? (
                      <span style={{ display: "flex", gap: 8, marginTop: 16 }}>
                        {x.options.map((o) => (
                          <span
                            key={o}
                            style={{
                              flex: 1,
                              textAlign: "center",
                              padding: "10px 0",
                              borderRadius: 11,
                              fontSize: 13,
                              fontWeight: 700,
                              background: o === x.answer ? GREEN : BG_ALT,
                              border: "1px solid " + (o === x.answer ? GREEN : BORDER),
                              color: o === x.answer ? "#fff" : MUTED,
                            }}
                          >
                            {o}
                          </span>
                        ))}
                      </span>
                    ) : (
                      /* Drawn as a filled field rather than a live input.
                         Nothing here is typed: the answers are staged, and a
                         caret that does not accept a keystroke is worse than a
                         field that never claimed to. */
                      <span
                        style={{
                          display: "block",
                          marginTop: 16,
                          padding: "12px 13px",
                          borderRadius: 11,
                          background: BG_ALT,
                          border: "1px solid " + BORDER,
                          fontSize: 14,
                          fontWeight: 600,
                          color: TEXT,
                        }}
                      >
                        {x.answer}
                      </span>
                    )}
                  </>
                ) : (
                  /* Shut: the question in small type and the answer beside it,
                     which is all a finished question is. Tapping reopens it,
                     because a list of what you said that cannot be corrected is
                     a receipt rather than a conversation. */
                  <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Check size={14} color={GREEN} strokeWidth={3} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {x.label}
                    </span>
                    <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 700, color: TEXT }}>
                      {x.answer}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </ScoreScreen>
  );
}
