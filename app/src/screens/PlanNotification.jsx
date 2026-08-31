import React from "react";
import { useWF } from "../state";
import { ChevronLeft, MoreVertical, Paperclip, Camera, Smile, Mic } from "lucide-react";
import { TEXT, TEXT_2, MUTED, FAINT, INDIGO, BG, BG_ALT, BG_SUNK, BORDER, LINE, RULE, SH_SM } from "../tokens";

/* What actually goes out today, reproduced rather than rewritten.

   A plan is written while the person is somewhere else, so the first thing they
   ever read about it is this. It is the handover, and it is the one part of the
   handover that never gets looked at beside the screens it introduces. Putting
   it in the panel is how it gets looked at.

   Not a GoodFlip screen. It is WhatsApp, so it is reachable from the control
   panel alone and it carries no tab bar, no Kaira, nothing of ours except the
   words. Drawn in our own neutrals rather than as a forgery of WhatsApp's
   chrome: the job here is to read the message, not to fake the app around it.

   The copy below is **verbatim**, em dashes and all, including the lower case
   "chandra" in the first message and the hyphen where the second one means an
   em dash. Do not tidy it. The project's copy rules govern what we write, and
   this is a record of what is being sent, which is a different thing. A rewrite
   is only worth arguing about next to the real one. */

// [[...]] marks the spans WhatsApp turns into links, which is why the dates in
// the first message look different from the same dates in the second.
const THREAD = [
  {
    at: "11:20 am",
    lines: [
      "Hi {name},",
      "Your Health Coach, Sahana chandra, has crafted your personalised diet plan—it'll be activated on your GoodFlip app starting [[13-08-2026]].",
      "Your plan runs for 32 days, and ends up on [[13-09-2026]].",
      "If you have any questions or need help at any point, just drop us a message—we're here for you every step of the way!",
      "— Team GoodFlip",
    ],
  },
  {
    at: "11:22 am",
    lines: [
      "Hi {name},",
      "Your Health Coach, Sahana Physio, has crafted your personalised exercise plan-it'll be activated on your GoodFlip app starting 13-August-2026.",
      "Your plan runs for 28 days, and ends up on 09-September-2026.",
      "If you have any questions or need help at any point, just drop us a message—we're here for you every step of the way!",
      "— Team GoodFlip",
    ],
  },
];

export default function PlanNotification() {
  const { setPlanNotif, firstName } = useWF();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG_SUNK, minHeight: 0 }}>
      {/* Their chrome, in our neutrals. Enough of a thread to know where you
          are reading this, and no further. */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "4px 16px 12px",
          background: BG,
          borderBottom: "1px solid " + BORDER,
        }}
      >
        <button
          onClick={() => setPlanNotif(null)}
          aria-label="Back"
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", flexShrink: 0 }}
        >
          <ChevronLeft size={22} color={TEXT} />
        </button>
        <img
          src="/favicon.svg"
          alt=""
          aria-hidden
          style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid " + BORDER, flexShrink: 0 }}
        />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700, color: TEXT }}>GoodFlip</span>
          <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 1 }}>Business account</span>
        </span>
        <MoreVertical size={18} color={MUTED} style={{ flexShrink: 0 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "14px 14px 10px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <span
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 999,
              padding: "4px 13px",
              fontSize: 10.5,
              fontWeight: 600,
              color: MUTED,
            }}
          >
            13 August 2026
          </span>
        </div>

        {THREAD.map((m, mi) => (
          <div
            key={mi}
            style={{
              maxWidth: "90%",
              background: BG,
              borderRadius: "4px 16px 16px 16px",
              boxShadow: SH_SM,
              border: "1px solid " + LINE,
              padding: "11px 13px 9px",
              marginBottom: 10,
              animation: "riseIn .34s cubic-bezier(.32,.72,0,1) " + mi * 0.1 + "s both",
            }}
          >
            {m.lines.map((t, i) => (
              <p
                key={i}
                style={{
                  margin: i === 0 ? 0 : "10px 0 0",
                  fontSize: 12.5,
                  color: TEXT_2,
                  lineHeight: 1.5,
                }}
              >
                {t
                  .replace("{name}", firstName)
                  .split(/\[\[(.+?)\]\]/)
                  .map((part, j) =>
                    j % 2 ? (
                      <span key={j} style={{ color: INDIGO, fontWeight: 700, textDecoration: "underline" }}>
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
              </p>
            ))}
            <div style={{ textAlign: "right", fontSize: 10, color: FAINT, marginTop: 6 }}>{m.at}</div>
          </div>
        ))}
      </div>

      {/* Inert, like every other borrowed chrome in this wireframe. It is here
          so the message is read where it will actually be read. */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "8px 14px 20px",
          background: BG_SUNK,
        }}
      >
        <span
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 999,
            padding: "10px 14px",
          }}
        >
          <Smile size={17} color={FAINT} strokeWidth={1.9} />
          <span style={{ flex: 1, fontSize: 13, color: FAINT }}>Message</span>
          <Paperclip size={16} color={FAINT} strokeWidth={1.9} />
          <Camera size={16} color={FAINT} strokeWidth={1.9} />
        </span>
        <span
          aria-hidden
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            flexShrink: 0,
            background: BG_ALT,
            border: "1px solid " + RULE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Mic size={18} color={MUTED} strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}
