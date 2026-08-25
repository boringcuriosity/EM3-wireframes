import React from "react";
import { useWF } from "../../state";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { MIND_TOOLS } from "./tools";
import { MIND_C, MIND_T, TEXT, MUTED, RULE, BG, BORDER, SH } from "../../tokens";

/* Mind's equivalent of Eat's meal divisions: the things you actually do,
   listed, each one ticking off as it is done.

   The coach mark is the important part. Four wellness tools with no owner is a
   menu; two of them chosen for you by a person is care. */
export default function ToolList() {
  const { mindDone, setMindTool } = useWF();

  const picked = MIND_TOOLS.find((t) => t.coach);

  return (
    <div>
      {picked && (
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
          <Sparkles size={13} color={MIND_C} strokeWidth={2.2} />
          <span style={{ fontSize: 11.5, color: MUTED }}>
            Your coach picked <strong style={{ color: TEXT }}>{picked.label.toLowerCase()}</strong> for
            you today
          </span>
        </div>
      )}

      {MIND_TOOLS.map((t) => {
        const done = mindDone.includes(t.id);
        return (
          <button
            key={t.id}
            onClick={() => setMindTool(t.id)}
            style={{
              width: "100%",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: BG,
              border: "1px solid " + (done ? MIND_C : BORDER),
              borderRadius: 16,
              padding: "13px 14px",
              marginBottom: 10,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: SH,
              opacity: done ? 0.9 : 1,
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                flexShrink: 0,
                background: done ? MIND_C : BG,
                border: "1.5px solid " + (done ? MIND_C : RULE),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {done && <Check size={13} color="#fff" strokeWidth={3} />}
            </span>

            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: done ? MUTED : TEXT,
                    textDecoration: done ? "line-through" : "none",
                    textDecorationColor: RULE,
                  }}
                >
                  {t.label}
                </span>
                {t.coach && !done && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: 0.4,
                      textTransform: "uppercase",
                      color: MIND_C,
                      background: MIND_T,
                      borderRadius: 999,
                      padding: "2px 7px",
                    }}
                  >
                    Today\u2019s pick
                  </span>
                )}
              </span>
              <span style={{ display: "block", fontSize: 11.5, color: MUTED, marginTop: 2, lineHeight: 1.45 }}>
                {done ? "Done today" : t.line}
              </span>
            </span>

            {!done && <ChevronRight size={16} color={MUTED} style={{ flexShrink: 0 }} />}
          </button>
        );
      })}
    </div>
  );
}
