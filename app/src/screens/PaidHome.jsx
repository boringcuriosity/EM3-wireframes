import React, { useEffect, useRef } from "react";
import { useWF } from "../state";
import DailyTasks from "../components/DailyTasks";
import HomeTopBar from "../components/HomeTopBar";
import SmartDevices from "../components/SmartDevices";
import { ChevronRight, Calendar, Hourglass, Heart, Store, FlaskConical, Radio } from "lucide-react";
import { GREEN, GREEN_DEEP, GREEN_TINT, GREEN_WASH, TEXT, MUTED, BG_ALT, BG, BORDER, SH } from "../tokens";
import { sectionLabel, coachAvatar } from "../ui";
import TourTarget from "../components/TourTarget";
import CtaArrow from "../components/CtaArrow";
import PrereqRail from "../components/PrereqRail";
import PrereqCard from "../components/PrereqCard";

export default function PaidHomePage() {
  const { setActiveTab, setHomeProgramTab, sessionState, scoreState, setProgramDetail, CARD_W, CARD_GAP, CARD_PAD, CARD_H, SHOW_PROGRAM_TABS, program, bookedSession, CARD_TAIL, carouselRef, handleCarouselScroll, nextOpen, HOME_CARDS, HOME_TABS, homeTab, firstName, liveSession, openBooking, nextScrollDue, setNextScrollDue } = useWF();

  /* Somebody who put the first steps away on To-do and asked to be shown
     where they went arrives here. Take them to the rail rather than ringing
     the strip they just shut. */
  const railRef = useRef(null);
  useEffect(() => {
    if (!nextScrollDue) return;
    setNextScrollDue(false);
    /* One scroll, once the screen has settled. Measured off the offset chain
       rather than off rectangles, because a rectangle read mid-animation
       measures where the page is passing through rather than where it sits.

       Not scrollIntoView either: the page inside the phone frame is one
       scroller among several and the browser picks the outermost, which moves
       the frame rather than the screen. */
    const absTop = (node) => {
      let t = 0;
      for (let n = node; n; n = n.offsetParent) t += n.offsetTop;
      return t;
    };
    setTimeout(() => {
      const el = railRef.current;
      if (!el) return;
      let sc = el.parentElement;
      while (sc && sc.scrollHeight <= sc.clientHeight + 1) sc = sc.parentElement;
      if (!sc) return;
      /* Hand-rolled rather than behavior: "smooth", which this scroller
         ignores. Quarter of a second of ease-out is enough to read as
         movement rather than as a jump cut. */
      const from = sc.scrollTop;
      const to = Math.min(
        sc.scrollHeight - sc.clientHeight,
        Math.max(0, absTop(el) - absTop(sc) - 8)
      );
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 420);
        sc.scrollTop = from + (to - from) * (1 - Math.pow(1 - k, 3));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 300);
  }, [nextScrollDue]);

  return (
    (
      <>
        {<HomeTopBar />}

        {/* Day-streak strip, taps through to the leaderboard */}
        {/* The streak used to open Home and Today's focus repeated it a
            screen later, in a different denominator. One card owns the day
            now, streak included. */}

        {/* Program / Sessions switch — hidden behind SHOW_PROGRAM_TABS */}
        {/* What has to happen before a coach can write anything. It opens the
            screen now rather than riding in the carousel: it is the only thing
            here that blocks everything else, and a card you have to swipe to is
            a poor place for the one thing somebody has to do first. */}
        <div style={{ padding: "14px 22px 0" }}>
          <PrereqRail keep />
        </div>


        {/* Today's tasks — the daily engine, replaces the one-time setup card */}
        {<DailyTasks />}

        {/* Smart Devices — shared with free Home, same block */}
        {/* Devices carries no bottom padding of its own, so the rail below it
            used to sit right against the card. */}
        <TourTarget id="devices" style={{ paddingBottom: 22 }}>{<SmartDevices />}</TourTarget>
        {/* Your program, the bookings and any live session. Below the day and
            the devices now: it is the standing context around the program
            rather than the thing to do this morning. */}
        <div ref={railRef} style={{ scrollMarginTop: 8 }}>
        {SHOW_PROGRAM_TABS && (
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            scrollbarWidth: "none",
            padding: "14px 22px 0",
          }}
        >
          {[
            { id: "program", label: "Your Program" },
            { id: "next", label: "Next Action(s)" },
            { id: "sessions", label: "Upcoming Session(s)" },
            { id: "live", label: "Live Sessions" },
          ]
            .filter((t) => HOME_TABS.includes(t.id))
            .map((t) => {
              const active = homeTab === t.id;
            const badge =
              t.id === "sessions" && sessionState === "booked"
                ? "1"
                : t.id === "live" && liveSession
                ? "1"
                : t.id === "next" && nextOpen.length
                ? String(nextOpen.length)
                : null;
            return (
              <button
                key={t.id}
                onClick={() => setHomeProgramTab(t.id)}
                style={{
                  position: "relative",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 13px",
                  borderRadius: 999,
                  border: "1px solid " + (active ? GREEN : BORDER),
                  background: active ? BG : BG_ALT,
                  color: active ? GREEN : MUTED,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <span style={{ whiteSpace: "nowrap" }}>{t.label}</span>
                {badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: -7,
                      right: -5,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 999,
                      background: TEXT,
                      color: "#fff",
                      fontSize: 9.5,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                    }}
                  >
                    {badge}
                  </span>
                )}
                </button>
              );
            })}
        </div>
        )}

        {/* Carousel — cards keep their order; the tab slides the rail */}
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          style={{
            display: "flex",
            gap: CARD_GAP,
            overflowX: "auto",
            scrollbarWidth: "none",
            scrollSnapType: "x mandatory",
            scrollPaddingLeft: CARD_PAD,
            paddingLeft: CARD_PAD,
            paddingRight: CARD_TAIL,
            paddingTop: 14,
            paddingBottom: 20,
          }}
        >
          {HOME_CARDS.map((card) =>
            card.startsWith("next:") ? (
              /* One first step to a card, the same card the To-do rail draws.
                 They live in the Start here strip at the top of Home too; this
                 is where somebody browsing their program finds them. */
              <PrereqCard key={card} id={card.slice(5)} width={CARD_W} minHeight={CARD_H} />
            ) : card === "live" ? (
              /* Live sessions. Not a consultation: nobody books it, it is not
                 yours, and it runs whether or not you turn up. Drawn in the
                 pillar's own tint rather than as another white card, so a
                 thing open to everybody does not read as another slot with
                 your name on it. */
              <div
                key="live"
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  flexShrink: 0,
                  scrollSnapAlign: "start",
                  boxSizing: "border-box",
                  background: "linear-gradient(160deg, " + GREEN_WASH + " 0%, " + BG + " 62%)",
                  border: "1px solid " + GREEN_TINT,
                  borderRadius: 18,
                  padding: 14,
                  boxShadow: SH,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Radio size={12} color={GREEN_DEEP} strokeWidth={2.4} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: GREEN_DEEP }}>
                    Live on {liveSession.date}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                  {coachAvatar(30)}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, color: MUTED }}>{liveSession.role}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginTop: 1 }}>
                      {liveSession.host}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 11.5, color: MUTED, marginTop: 8, lineHeight: 1.45 }}>
                  {liveSession.topic}
                </div>

                <button
                  style={{
                    marginTop: "auto",
                    alignSelf: "flex-start",
                    /* Flex, so the label and the arrow centre on each
                       other. Left inline, the arrow's 15px box hangs 2px
                       below the baseline and drags the line box with it,
                       which put the text a pixel low inside its own
                       padding. */
                    display: "inline-flex",
                    alignItems: "center",
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: "6px 13px",
                    borderRadius: 999,
                    border: "none",
                    background: GREEN,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  View session<CtaArrow />
                </button>
              </div>
            ) : card === "program" ? (
              <TourTarget
                key="program"
                id="program"
                style={{ flexShrink: 0, scrollSnapAlign: "start" }}
              >
              <div
                onClick={() => setProgramDetail(true)}
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  boxSizing: "border-box",
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 18,
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: SH,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: TEXT }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{program.status}</span>
                    </div>
                    <ChevronRight size={18} color={MUTED} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11 }}>
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 7,
                        background: BG_ALT,
                        border: "1px solid " + BORDER,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <program.icon size={14} color={TEXT} />
                    </span>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: TEXT,
                      }}
                    >
                      {program.name}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>
                    {program.duration} · {program.category}
                  </div>
                </div>

                {/* Whose program it is. A card about a year of someone's care
                    should have their name on it, the way a membership does. */}
                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: BG_ALT,
                    borderTop: "1px solid " + BORDER,
                    padding: "9px 16px",
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, color: TEXT }}>
                    {firstName}
                  </span>
                  <svg width="15" height="17" viewBox="0 0 22 24" fill="none" aria-hidden>
                    <path
                      d="M11 1.2 20.1 6.6v10.8L11 22.8 1.9 17.4V6.6z"
                      stroke={MUTED}
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              </TourTarget>
            ) : (
              <TourTarget
                key="sessions"
                id="sessions"
                style={{ flexShrink: 0, scrollSnapAlign: "start" }}
              >
              <div
                style={{
                  width: CARD_W,
                  height: CARD_H,
                  boxSizing: "border-box",
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 18,
                  padding: 14,
                  boxShadow: SH,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {sessionState === "booked" ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {coachAvatar(30)}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 10.5, color: MUTED }}>{bookedSession.role}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginTop: 1 }}>
                          {bookedSession.coach}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginTop: 8,
                        padding: "5px 9px",
                        background: BG_ALT,
                        border: "1px solid " + BORDER,
                        borderRadius: 9,
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Calendar size={13} color={MUTED} />
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: TEXT }}>
                          {bookedSession.date}
                        </span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Hourglass size={13} color={MUTED} />
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: TEXT }}>
                          {bookedSession.time}
                        </span>
                      </span>
                    </div>
                    <button
                      style={{
                        marginTop: "auto",
                        alignSelf: "flex-start",
                        /* Flex, so the label and the arrow centre on each
                           other. Left inline, the arrow's 15px box hangs 2px
                           below the baseline and drags the line box with it,
                           which put the text a pixel low inside its own
                           padding. */
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: 11.5,
                        fontWeight: 600,
                        padding: "6px 13px",
                        borderRadius: 999,
                        border: "none",
                        background: GREEN,
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      {bookedSession.cta}<CtaArrow />
                    </button>
                  </>
                ) : (
                  /* Who, then what is missing, then why, then the ask. The
                     button used to sit at the top beside the faces, so you were
                     asked to act one line before being told what for, and it
                     was the only CTA on Home that did not sit at the foot of
                     its card the way the booked one does. */
                  <>
                    <div style={{ display: "flex", marginBottom: 9 }}>
                      {[0, 1, 2].map((i) => (
                        <div key={i} style={{ marginLeft: i === 0 ? 0 : -11 }}>
                          {coachAvatar(30)}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>No upcoming sessions</div>
                    <div style={{ fontSize: 11.5, color: MUTED, marginTop: 4, lineHeight: 1.45 }}>
                      Your coaches like to see you every couple of weeks.
                    </div>
                    <button
                      onClick={openBooking}
                      style={{
                        marginTop: "auto",
                        alignSelf: "flex-start",
                        /* Flex, so the label and the arrow centre on each
                           other. Left inline, the arrow's 15px box hangs 2px
                           below the baseline and drags the line box with it,
                           which put the text a pixel low inside its own
                           padding. */
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: 11.5,
                        fontWeight: 600,
                        padding: "6px 13px",
                        borderRadius: 999,
                        border: "none",
                        background: GREEN,
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Book a session<CtaArrow />
                    </button>
                  </>
                )}
              </div>
              </TourTarget>
            )
          )}

        </div>
        </div>

        {/* MET Score */}
        <TourTarget id="score" style={{ padding: "20px 22px 0" }}>
          <div>
          <div
            onClick={() => setActiveTab("med")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: 13,
              cursor: "pointer",
              boxShadow: SH,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.6">
                  <path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" />
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your metabolic score</span>
              </div>
              {scoreState === "locked" ? (
                <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5, lineHeight: 1.4 }}>
                  Start understanding your metabolic health
                </div>
              ) : scoreState === "first" ? (
                <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5, lineHeight: 1.4 }}>
                  Your score indicates{" "}
                  <span style={{ fontWeight: 700, color: TEXT }}>moderate metabolic risk</span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 7 }}>
                  <span style={{ fontSize: 11.5, color: MUTED }}>
                    {scoreState === "up"
                      ? "Improved by"
                      : scoreState === "down"
                      ? "Reduced by"
                      : "No recent changes"}
                  </span>
                  {scoreState !== "flat" && (
                    <span
                      style={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: TEXT,
                        background: BG_ALT,
                        border: "1px solid " + BORDER,
                        borderRadius: 6,
                        padding: "3px 7px",
                      }}
                    >
                      {scoreState === "up" ? "+4 points" : "−6 points"}
                    </span>
                  )}
                </div>
              )}
              {scoreState !== "locked" && scoreState !== "first" && (
                <div style={{ fontSize: 10.5, color: MUTED, marginTop: 4 }}>Last updated · 11 Aug</div>
              )}
            </div>
            <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
              <svg width="64" height="64" viewBox="0 0 84 84">
                <circle cx="42" cy="42" r="35" fill="none" stroke="#F2F4F7" strokeWidth="7" />
                {scoreState !== "locked" && (
                  <circle
                    cx="42"
                    cy="42"
                    r="35"
                    fill="none"
                    stroke={TEXT}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray="220"
                    strokeDashoffset="70"
                    transform="rotate(-90 42 42)"
                  />
                )}
              </svg>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {scoreState === "locked" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.8">
                    <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
                    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                  </svg>
                ) : (
                  <>
                    <span style={{ fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1 }}>68</span>
                    <span style={{ fontSize: 8, color: MUTED, marginTop: 1 }}>out of 100</span>
                  </>
                )}
              </div>
            </div>
            <ChevronRight size={18} color={MUTED} />
          </div>
          </div>
        </TourTarget>


        {/* GoodFlip Services — two square tiles plus a wide promo tile */}
        <div style={{ padding: "22px 22px 0" }}>
          {sectionLabel("GoodFlip Services")}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            {[
              { l: "Programs", Icon: Heart },
              { l: "Shop", Icon: Store },
            ].map(({ l, Icon: TileIcon }) => (
              <div key={l} style={{ width: 66, textAlign: "center", cursor: "pointer" }}>
                <div
                  style={{
                    height: 66,
                    borderRadius: 16,
                    background: BG,
                    border: "1px solid " + BORDER,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 7,
                  }}
                >
                  <TileIcon size={24} color={GREEN} strokeWidth={1.7} />
                </div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>{l}</div>
              </div>
            ))}

            <div style={{ flex: 1, minWidth: 0, textAlign: "center", cursor: "pointer" }}>
              <div
                style={{
                  height: 66,
                  borderRadius: 16,
                  background: BG,
                  border: "1px solid " + BORDER,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 12px",
                  marginBottom: 7,
                  overflow: "hidden",
                }}
              >
                <FlaskConical size={24} color={GREEN} strokeWidth={1.7} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 11, color: MUTED, textAlign: "left", lineHeight: 1.35 }}>
                  Get discounts on lab tests upto{" "}
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 10,
                      fontWeight: 700,
                      color: TEXT,
                      background: BG_ALT,
                      border: "1px solid " + BORDER,
                      borderRadius: 4,
                      padding: "1px 5px",
                    }}
                  >
                    50% OFF
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>
                Book Lab Tests
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 24 }} />
      </>
    )
  );
}
