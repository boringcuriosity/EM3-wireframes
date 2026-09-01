import React from "react";
import { useWF } from "../state";
import { Home, BarChart3, FlaskConical, MessagesSquare, X } from "lucide-react";
import {
  GREEN, GREEN_DEEP, TEXT, MUTED, BG, BG_ALT, BORDER, LINE, RULE,
  WARN, WARN_TINT, WARN_LINE,
} from "../tokens";

/* Where the Start here cards go when you put them away.

   Hiding them is reasonable: they are the same two asks every morning until
   they are done, and a person who has read them twice does not need them
   above the day a third time. What is not reasonable is letting them vanish.
   The work still gates the whole program, so this sheet has one job, which is
   to say the cards moved rather than went, and to name the place by the words
   printed on the tab: Home, then Next actions.

   The picture shows the gesture rather than the idea: Home's carousel being
   swiped one card along. Nobody needs to imagine cards migrating across the
   app, they need to know which way to swipe. */

const ICONS = { score: BarChart3, labs: FlaskConical, assess: MessagesSquare };

export default function PrereqHideSheet() {
  const { prereqAsk, setPrereqAsk, setPrereqHidden, nextOpen } = useWF();
  if (!prereqAsk) return null;

  const close = () => setPrereqAsk(false);
  const n = nextOpen.length;

  return (
    <div
      onClick={close}
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
        aria-labelledby="prereq-hide-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight: "88%",
          position: "relative",
          background: BG,
          borderRadius: "26px 26px 0 0",
          overflow: "hidden",
          boxShadow: "0 -12px 40px rgba(16,24,40,0.22)",
          display: "flex",
          flexDirection: "column",
          animation: "sheetUp .42s cubic-bezier(.32,.72,0,1) both",
        }}
      >
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 1,
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: BG,
            border: "1px solid " + BORDER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
            boxShadow: "0 1px 3px rgba(16,24,40,0.1)",
          }}
        >
          <X size={15} color={MUTED} strokeWidth={2.4} />
        </button>

        <Illustration ids={nextOpen} />

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "20px 22px 0" }}>
          <h2
            id="prereq-hide-title"
            style={{ margin: 0, fontSize: 19, fontWeight: 800, color: TEXT, letterSpacing: -0.3 }}
          >
            You'll find {n === 1 ? "this next action" : "these next actions"} on Home
          </h2>
          {/* Where to swipe, then why to bother. Written against the
              consultation rather than against booking it: nothing gates
              openBooking, so telling somebody to finish these before they book
              would be a rule the app does not keep. */}
          <p style={{ margin: "8px 0 0", fontSize: 13.5, color: MUTED, lineHeight: 1.6 }}>
            Swipe across the top section to reach{" "}
            <strong style={{ color: TEXT }}>Next actions</strong>. Complete{" "}
            {n === 1 ? "this task" : "these tasks"} before your first consultation, as{" "}
            {n === 1 ? "it is" : "they are"} very important for your care program.
          </p>
        </div>

        <div style={{ flexShrink: 0, padding: "20px 22px 26px" }}>
          <button
            onClick={() => {
              setPrereqHidden(true);
              close();
            }}
            style={{
              width: "100%",
              background: GREEN,
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 2px 0 " + GREEN_DEEP,
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

/* The thing you will actually do, shown once and then again.

   It used to be two boxes with a dotted road between them, which is a diagram
   of the idea rather than the idea. Nobody has to picture cards migrating
   across the app; they have to know to swipe Home's carousel one card along.
   So that is what this is: Home's rail, moving. */
function Illustration({ ids }) {
  const Icon = ICONS[ids[0]] || BarChart3;
  return (
    <div
      aria-hidden
      style={{
        flexShrink: 0,
        height: 168,
        background: BG_ALT,
        borderBottom: "1px solid " + LINE,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 210,
          height: 116,
          borderRadius: 16,
          background: BG,
          border: "1px solid " + BORDER,
          boxShadow: "0 2px 10px rgba(16,24,40,0.08)",
          overflow: "hidden",
          padding: "11px 0 0 12px",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: 0.9,
            textTransform: "uppercase",
            color: RULE,
            marginBottom: 9,
          }}
        >
          <Home size={9} strokeWidth={2.4} />
          Home
        </span>

        {/* The rail, one card along and back. Transform only, so the loop
            never asks the browser to lay the frame out again. */}
        <span
          style={{
            display: "flex",
            gap: 8,
            animation: "prereqSwipe 4s cubic-bezier(.32,.72,0,1) infinite",
          }}
        >
          <MiniCard />
          <MiniCard amber Icon={Icon} n={ids.length} />
          <MiniCard />
        </span>

        {/* The hand doing it. */}
        <span
          style={{
            position: "absolute",
            right: 44,
            bottom: 16,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "rgba(16,24,40,0.16)",
            border: "1.5px solid rgba(16,24,40,0.22)",
            animation: "prereqDrag 4s cubic-bezier(.32,.72,0,1) infinite",
          }}
        />
      </div>
    </div>
  );
}

function MiniCard({ amber, Icon, n }) {
  return (
    <span
      style={{
        flex: "0 0 96px",
        height: 60,
        borderRadius: 10,
        background: amber ? WARN_TINT : BG_ALT,
        border: "1px solid " + (amber ? WARN_LINE : LINE),
        padding: "9px 9px 0",
        boxSizing: "border-box",
      }}
    >
      {amber ? (
        <>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Icon size={11} color={WARN} strokeWidth={2.2} />
            <span style={{ fontSize: 8, fontWeight: 800, color: TEXT }}>Next actions</span>
            <span
              style={{
                marginLeft: "auto",
                minWidth: 13,
                height: 13,
                borderRadius: 999,
                background: WARN,
                color: "#fff",
                fontSize: 8,
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 3px",
              }}
            >
              {n}
            </span>
          </span>
          <span style={{ display: "block", height: 5, borderRadius: 2, background: WARN_LINE, marginTop: 8, opacity: 0.7 }} />
          <span style={{ display: "block", height: 5, borderRadius: 2, background: WARN_LINE, marginTop: 4, width: "60%", opacity: 0.5 }} />
        </>
      ) : (
        [0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "block",
              height: 5,
              borderRadius: 2,
              background: LINE,
              marginTop: i ? 5 : 2,
              width: i === 2 ? "55%" : "100%",
            }}
          />
        ))
      )}
    </span>
  );
}
