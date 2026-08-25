import React from "react";
import { useWF } from "../../state";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { MIND_TOOLS } from "./tools";
import {
  MIND_C, TEXT, MUTED, RULE, BG, BORDER, SH,
  GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP,
} from "../../tokens";

/* Mind's equivalent of Eat's meal divisions: the things you actually do,
   listed, each one ticking off as it is done.

   Split in two on purpose. A recommendation buried in a list of four is not a
   recommendation, so the one the coach picked gets its own heading and the
   rest sit under theirs. */
export default function ToolList() {
  const { mindDone, setMindTool } = useWF();

  const picked = MIND_TOOLS.filter((t) => t.coach);
  const rest = MIND_TOOLS.filter((t) => !t.coach);

  const Tool = (t) => {
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
          <span
            style={{
              display: "block",
              fontSize: 13.5,
              fontWeight: 700,
              color: done ? MUTED : TEXT,
              textDecoration: done ? "line-through" : "none",
              textDecorationColor: RULE,
            }}
          >
            {t.label}
          </span>
          <span style={{ display: "block", fontSize: 11.5, color: MUTED, marginTop: 2, lineHeight: 1.45 }}>
            {done ? "Done today" : t.line}
          </span>
        </span>

        {/* What it pays, until it has been paid */}
        {!done && t.coins && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexShrink: 0,
              background: GOLD_TINT,
              border: "1px solid " + GOLD_LINE,
              borderRadius: 999,
              padding: "3px 8px 3px 6px",
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                background: GOLD,
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: GOLD_DEEP }}>+{t.coins}</span>
          </span>
        )}

        {!done && <ChevronRight size={16} color={MUTED} style={{ flexShrink: 0 }} />}
      </button>
    );
  };

  return (
    <div>
      {picked.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
            <Sparkles size={14} color={MIND_C} strokeWidth={2.2} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
              Your coach recommended this today
            </span>
          </div>
          {picked.map(Tool)}
        </>
      )}

      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, margin: "22px 0 10px" }}>
        Ways to boost your mind today
      </div>
      {rest.map(Tool)}
    </div>
  );
}
