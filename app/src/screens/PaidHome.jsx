import React from "react";
import { useWF } from "../state";
import DailyTasks from "../components/DailyTasks";
import HomeTopBar from "../components/HomeTopBar";
import SmartDevices from "../components/SmartDevices";
import StreakStrip from "../components/StreakStrip";
import { ChevronRight, Calendar, Hourglass, Heart, Store, FlaskConical } from "lucide-react";
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER, SH } from "../tokens";
import { sectionLabel, coachAvatar } from "../ui";
import TourTarget from "../components/TourTarget";
import CtaArrow from "../components/CtaArrow";
import NextActionCard from "../components/NextActionCard";

export default function PaidHomePage() {
  const { setActiveTab, homeProgramTab, setHomeProgramTab, sessionState, scoreState, setProgramDetail, CARD_W, CARD_GAP, CARD_PAD, CARD_H, SHOW_PROGRAM_TABS, program, bookedSession, CARD_TAIL, carouselRef, handleCarouselScroll, nextAction, HOME_CARDS } = useWF();

  return (
    (
      <>
        {<HomeTopBar />}

        {/* Day-streak strip, taps through to the leaderboard */}
        {<StreakStrip />}

        {/* Program / Sessions switch — hidden behind SHOW_PROGRAM_TABS */}
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
          ].map((t) => {
            const active = homeProgramTab === t.id;
            const badge =
              t.id === "sessions" && sessionState === "booked"
                ? "1"
                : t.id === "next" && nextAction
                ? "1"
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
            card === "next" ? (
              <div key="next" style={{ flexShrink: 0, scrollSnapAlign: "start" }}>
                <NextActionCard />
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
                }}
              >
                <div style={{ padding: "14px 16px 16px" }}>
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
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ display: "flex" }}>
                        {[0, 1, 2].map((i) => (
                          <div key={i} style={{ marginLeft: i === 0 ? 0 : -11 }}>
                            {coachAvatar(32)}
                          </div>
                        ))}
                      </div>
                      <button
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "8px 14px",
                          borderRadius: 999,
                          border: "none",
                          background: GREEN,
                          color: "#fff",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        Book now<CtaArrow />
                      </button>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>No upcoming sessions</div>
                    <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5, lineHeight: 1.4 }}>
                      Connect with your coaches every 15 days for your assessments.
                    </div>
                  </>
                )}
              </div>
              </TourTarget>
            )
          )}
        </div>

        {/* Today's tasks — the daily engine, replaces the one-time setup card */}
        {<DailyTasks />}

        {/* Smart Devices — shared with free Home, same block */}
        <TourTarget id="devices">{<SmartDevices />}</TourTarget>

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
