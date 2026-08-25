import React from "react";
import { useWF } from "../state";
import HomeTopBar from "../components/HomeTopBar";
import SmartDevices from "../components/SmartDevices";
import { Home, Activity, ChevronRight, Utensils } from "lucide-react";
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER, SH, SH_SM } from "../tokens";

export default function FreeHome() {
  const { setActiveTab, setEatDetail, program, isReturning, isDevice } = useWF();

  return (
            <>
            {<HomeTopBar />}

            {/* Header — small welcome label + mission statement + pillar cards */}
            <div
              style={{
                padding: "2px 22px 16px",
                background: BG_ALT,
              }}
            >
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: MUTED,
                letterSpacing: 0.2,
              }}
            >
              {isReturning ? "Welcome back to GoodFlip" : "Welcome to GoodFlip"}
            </span>
            <p
              style={{
                margin: "8px 0 0",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 17,
                lineHeight: 1.5,
                color: TEXT,
                fontWeight: 500,
              }}
            >
              {isReturning
                ? "Keep working on your metabolism."
                : "Your metabolism, built on Eat, Move, Mind. We've crafted simple daily habits across each to help you see it and change it."}
            </p>

            {/* Three pillar cards — stateful */}
            {isReturning ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: 8,
                  marginTop: 18,
                }}
              >
                {["Eat", "Move", "Mind", "Measure"].map((label) => (
                  <div
                    key={label}
                    onClick={() =>
                      label === "Eat"
                        ? setEatDetail(true)
                        : label === "Measure"
                        ? setActiveTab("med")
                        : null
                    }
                    style={{
                      background: BG,
                      border: "1px solid " + BORDER,
                      borderRadius: 12,
                      padding: "14px 8px",
                      textAlign: "center",
                      cursor: "pointer",
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 14,
                      fontWeight: 600,
                      color: TEXT,
                      boxShadow: SH_SM,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: 8,
                  marginTop: 18,
                }}
              >
                {[
                  { label: "Eat", desc: "Fuel your body right", pillar: true },
                  { label: "Move", desc: "Stay active every day", pillar: true },
                  { label: "Mind", desc: "Rest, calm, focus", pillar: true },
                  { label: "Measure", desc: "See the full picture", pillar: true },
                ].map((p) => (
                  <div
                    key={p.label}
                    onClick={() =>
                      p.label === "Eat"
                        ? setEatDetail(true)
                        : p.label === "Measure"
                        ? setActiveTab("med")
                        : null
                    }
                    style={{
                      position: "relative",
                      minHeight: 118,
                      background: BG,
                      border: "1px solid " + BORDER,
                      borderRadius: 14,
                      padding: 10,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "flex-end",
                      textAlign: "left",
                      cursor: "pointer",
                      boxShadow: SH_SM,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 7,
                        right: 7,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: BG_ALT,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ChevronRight size={11} color={GREEN} strokeWidth={2.4} />
                    </div>
                    <div
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 14,
                        fontWeight: 600,
                        color: TEXT,
                      }}
                    >
                      {p.label}
                    </div>
                    <div
                      style={{
                        fontSize: 9.5,
                        color: MUTED,
                        marginTop: 4,
                        lineHeight: 1.3,
                        textAlign: "left",
                      }}
                    >
                      {p.desc}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>

            {/* Device users: device card jumps to top */}
            {isDevice && <SmartDevices />}

            {/* Continue where you left off — returning users only */}
            {isReturning && (
              <div style={{ padding: "20px 22px 0" }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: TEXT,
                    marginBottom: 10,
                  }}
                >
                  Continue where you left off
                </div>
                <div
                  onClick={() => setEatDetail(true)}
                  style={{
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 16,
                    padding: "18px 18px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 16,
                        fontWeight: 600,
                        color: TEXT,
                        lineHeight: 1.35,
                        marginBottom: 6,
                      }}
                    >
                      You're 4 of 7 days in.
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: MUTED,
                        lineHeight: 1.45,
                        marginBottom: 12,
                      }}
                    >
                      Log today's meals. 3 more days to your first weekly
                      insight.
                    </div>
                    {/* 7-day progress dots, 4 filled */}
                    <div style={{ display: "flex", gap: 6 }}>
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <div
                          key={d}
                          style={{
                            width: 22,
                            height: 6,
                            borderRadius: 3,
                            background: d <= 4 ? "#101828" : "#E4E7EC",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: GREEN,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ChevronRight size={18} color="#fff" strokeWidth={2.2} />
                  </div>
                </div>
              </div>
            )}

            {/* Start Today section — campaign hooks */}
            <div style={{ padding: "20px 22px 0" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: TEXT,
                  marginBottom: 10,
                }}
              >
                Start today
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  overflowX: "auto",
                  paddingBottom: 4,
                  scrollbarWidth: "none",
                }}
              >
                {/* Card 1 — Sufficiency hook → Eat detail (migrates to Continue section for returning users) */}
                {!isReturning && (
                <div
                  style={{
                    flex: "0 0 78%",
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 16,
                    height: 160,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Placeholder image */}
                  <div
                    style={{
                      height: 64,
                      flexShrink: 0,
                      background: BG_ALT,
                      borderBottom: "1px solid " + BORDER,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Utensils size={20} color="#D0D5DD" strokeWidth={1.6} />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14.5,
                          fontWeight: 700,
                          color: TEXT,
                          marginBottom: 5,
                          lineHeight: 1.25,
                        }}
                      >
                        Know your sufficiency today
                      </div>
                      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>
                        Eating right is better than eating less.
                      </div>
                    </div>
                    <button
                      onClick={() => setEatDetail(true)}
                      style={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        borderRadius: "50%",
                        background: GREEN,
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <ChevronRight size={18} color="#fff" strokeWidth={2.2} />
                    </button>
                  </div>
                </div>
                )}

                {/* Card 2 — Metabolic Kickstarter */}
                <div
                  style={{
                    flex: "0 0 78%",
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 16,
                    height: 160,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Placeholder image */}
                  <div
                    style={{
                      height: 64,
                      flexShrink: 0,
                      background: BG_ALT,
                      borderBottom: "1px solid " + BORDER,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Activity size={20} color="#D0D5DD" strokeWidth={1.6} />
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14.5,
                          fontWeight: 700,
                          color: TEXT,
                          marginBottom: 5,
                          lineHeight: 1.25,
                        }}
                      >
                        Metabolic Kickstarter
                      </div>
                      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>
                        The free program to jumpstart your metabolism. Try it now.
                      </div>
                    </div>
                    <button
                      style={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        borderRadius: "50%",
                        background: GREEN,
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <ChevronRight size={18} color="#fff" strokeWidth={2.2} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Devices section — default position for non-device users */}
            {!isDevice && <SmartDevices />}

            {/* Your Metabolic Score section */}
            <div style={{ padding: "20px 22px 0" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: TEXT,
                  marginBottom: 10,
                }}
              >
                Your Metabolic Score
              </div>
              <div
                style={{
                  position: "relative",
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 16,
                  height: 100,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 16px",
                  overflow: "hidden",
                }}
              >
                {/* Hexagon score icon */}
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#98A2B3"
                  strokeWidth="1.8"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M12 2l8 4.6v9.2L12 22l-8-4.6V6.6L12 2z" />
                </svg>

                {/* Copy */}
                <div
                  style={{
                    flex: 1,
                    fontSize: 15.5,
                    lineHeight: 1.4,
                    fontWeight: 600,
                    color: TEXT,
                    minWidth: 0,
                  }}
                >
                  Start understanding your metabolic health
                </div>

                {/* Locked score visual: dotted ring + padlock */}
                <div
                  style={{
                    width: 76,
                    height: 76,
                    flexShrink: 0,
                    borderRadius: "50%",
                    border: "2px dotted #D0D5DD",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#98A2B3"
                    strokeWidth="1.8"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2.5" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <circle cx="12" cy="15.5" r="1.4" fill="#98A2B3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Next Home sections will be appended here */}
            <div style={{ padding: "0 22px 24px" }} />
            </>
  );
}
