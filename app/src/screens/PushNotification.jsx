import React from "react";
import { useWF } from "../state";
import { ChevronUp } from "lucide-react";
import { TEXT, MUTED, FAINT, BG, BORDER, LINE, GREEN_WASH, BG_SUNK, SH_MD } from "../tokens";

/* The push, on the lock screen where it lands.

   The WhatsApp message is the long version, and it is read sitting down. This
   is the one that arrives face up on a table, so it gets a glance and a
   decision, and the decision is only ever open it or leave it.

   So it is two lines and a name. It says who did the work, because that is the
   part worth waking up for, and what is waiting, because a notification that
   announces itself and nothing else is a notification people turn off. There is
   no date and no duration: the long version has those, and a push that lists
   them spends its one glance on arithmetic.

   Not a GoodFlip screen either. Reachable from the control panel alone, and the
   wallpaper is a plain wash standing in for whatever the person actually has. */

const PUSH = {
  title: "Your diet plan is ready",
  body: "Sahana planned your meals. Tap to see today's.",
  when: "now",
};

export default function PushNotification() {
  const { setPlanNotif, setActiveTab, setEatDetail } = useWF();

  const open = () => {
    setPlanNotif(null);
    setEatDetail(false);
    setActiveTab("track");
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        background: "linear-gradient(170deg, " + GREEN_WASH + " 0%, " + BG_SUNK + " 55%, #E7EAF0 100%)",
      }}
    >
      {/* The clock a lock screen leads with, which is why a push has to say its
          piece under something already holding the eye. */}
      <div style={{ flexShrink: 0, textAlign: "center", padding: "34px 0 30px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: MUTED, letterSpacing: 0.2 }}>
          Thursday, 13 August
        </div>
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 62,
            fontWeight: 500,
            color: TEXT,
            lineHeight: 1.05,
            marginTop: 2,
          }}
        >
          9:41
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: "0 14px" }}>
        <div
          role="button"
          tabIndex={0}
          onClick={open}
          onKeyDown={(e) => e.key === "Enter" && open()}
          style={{
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 20,
            padding: "13px 14px",
            boxShadow: SH_MD,
            cursor: "pointer",
            animation: "riseIn .4s cubic-bezier(.32,.72,0,1) both",
          }}
        >
          {/* Who it is from, the way a system draws it: the icon, the app name,
              and how long ago. */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <img
              src="/favicon.svg"
              alt=""
              aria-hidden
              style={{ width: 17, height: 17, borderRadius: 4, flexShrink: 0 }}
            />
            <span
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              GoodFlip
            </span>
            <span style={{ fontSize: 11, color: FAINT, flexShrink: 0 }}>{PUSH.when}</span>
          </div>

          <div style={{ fontSize: 14.5, fontWeight: 700, color: TEXT, lineHeight: 1.35 }}>
            {PUSH.title}
          </div>
          <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.45, marginTop: 3 }}>
            {PUSH.body}
          </div>
        </div>

        {/* One notification and a whole screen under it. Nothing else is
            competing, which is the only moment this message ever gets. */}
        <div style={{ height: 1, background: LINE, margin: "18px 6px 0", opacity: 0.6 }} />
      </div>

      <button
        onClick={() => setPlanNotif(null)}
        style={{
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          background: "none",
          border: "none",
          padding: "0 0 26px",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <ChevronUp size={17} color={MUTED} strokeWidth={2.2} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: MUTED }}>Swipe up to unlock</span>
      </button>
    </div>
  );
}
