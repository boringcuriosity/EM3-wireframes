import React from "react";
import { useWF } from "../state";
import ProgramProgressPage from "./ProgramProgress";
import { ChevronRight, ChevronLeft, TrendingUp, Info, Stethoscope, MessageCircle } from "lucide-react";
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER, SH, SH_SM } from "../tokens";
import { sectionLabel, coachAvatar } from "../ui";
import CtaArrow from "../components/CtaArrow";
import PrereqRail from "../components/PrereqRail";

export default function ProgramDetailPage() {
  const { setEatDetail, setProgramDetail, programSub, setProgramSub, setChatsOpen, program, careTeam } = useWF();

  return (
    (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 18px 12px",
            background: BG,
            borderBottom: "1px solid " + BORDER,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Your program</span>
          <button
            onClick={() => setChatsOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 14px",
              borderRadius: 999,
              border: "1px solid " + BORDER,
              background: BG,
              color: TEXT,
              cursor: "pointer",
            }}
          >
            <MessageCircle size={15} color={TEXT} strokeWidth={2.1} />
            Chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", background: BG_ALT, paddingTop: 14 }}>
          {programSub === "progress" ? (
            <ProgramProgressPage />
          ) : (
            <>
              {/* Program identity */}
              <div style={{ textAlign: "center", padding: "0 22px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: TEXT }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>Active</span>
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 22,
                    fontWeight: 600,
                    color: TEXT,
                    marginTop: 8,
                  }}
                >
                  Diabetes Management
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 5 }}>
                  Comprehensive 12 months · Diabetes Care
                </div>
                <button
                  style={{
                    marginTop: 14,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "9px 16px",
                    borderRadius: 999,
                    border: "none",
                    background: GREEN,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Program information<CtaArrow />
                </button>
              </div>

              {/* Time remaining */}
              <div style={{ padding: "20px 22px 0" }}>
                <div
                  style={{
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 16,
                    padding: 14,
                  }}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>348 days remaining</div>
                  <div
                    style={{
                      height: 6,
                      background: BG_ALT,
                      borderRadius: 3,
                      marginTop: 10,
                      overflow: "hidden",
                      border: "1px solid " + BORDER,
                    }}
                  >
                    <div style={{ width: "5%", height: "100%", background: TEXT }} />
                  </div>
                  <div style={{ fontSize: 10.5, color: MUTED, marginTop: 7 }}>27 Jul 2026 – 26 Jul 2027</div>
                </div>
              </div>

              {/* What the program is still waiting on, before anything it
                  builds. The blocks below are what the program does once it
                  can start, and it cannot start until these are done. The same
                  card as To-do, sharing its state, so opening or putting it
                  away here does the same there. */}
              <div style={{ padding: "22px 22px 0" }}>
                <PrereqRail />
              </div>

              {/* Daily building blocks */}
              <div style={{ padding: "22px 22px 0" }}>
                {sectionLabel("Daily building blocks")}
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { l: "Eat", to: () => setEatDetail(true) },
                    { l: "Move", to: null },
                    { l: "Progress", to: () => setProgramSub("progress") },
                    { l: "Medication", to: null },
                    { l: "Mind", to: null },
                  ].map((b) => (
                    <div
                      key={b.l}
                      onClick={b.to || undefined}
                      style={{ flex: 1, textAlign: "center", cursor: b.to ? "pointer" : "default" }}
                    >
                      <div
                        style={{
                          height: 52,
                          borderRadius: 13,
                          background: BG,
                          border: "1px solid " + BORDER,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 6,
                        }}
                      >
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: "#E4E7EC" }} />
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: TEXT }}>{b.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Care team */}
              <div style={{ padding: "24px 22px 0" }}>
                {sectionLabel("Care team & sessions")}
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: -4, marginBottom: 12 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: TEXT }} />
                  <span style={{ fontSize: 11.5, color: MUTED }}>Book your first session now</span>
                </div>

                {careTeam.map((c) => (
                  <div
                    key={c.name}
                    style={{
                      background: BG,
                      border: "1px solid " + BORDER,
                      borderRadius: 16,
                      overflow: "hidden",
                      marginBottom: 12,
                      boxShadow: SH_SM,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14 }}>
                      {coachAvatar(48)}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, color: MUTED }}>{c.role}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginTop: 2 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>No sessions yet</div>
                      </div>
                      <Info size={15} color={MUTED} strokeWidth={2} />
                    </div>
                    <button
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "11px 14px",
                        border: "none",
                        borderTop: "1px solid " + BORDER,
                        background: GREEN,
                        color: "#fff",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Book your first session now
                      <ChevronRight size={16} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Health monitoring tools */}
              <div style={{ padding: "12px 22px 0" }}>
                {sectionLabel("Health monitoring tools")}
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { l: "Weight", s: "Connect with a GoodFlip Smart BCA" },
                    { l: "Sugar Levels", s: "Connect with your glucose monitor" },
                  ].map((t) => (
                    <div
                      key={t.l}
                      style={{
                        flex: 1,
                        background: BG,
                        border: "1px solid " + BORDER,
                        borderRadius: 16,
                        padding: 13,
                        boxShadow: SH_SM,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 16, height: 16, borderRadius: 5, background: "#E4E7EC" }} />
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{t.l}</span>
                        </div>
                        <ChevronRight size={15} color={MUTED} />
                      </div>
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 7, lineHeight: 1.45 }}>{t.s}</div>
                      <div style={{ height: 52, borderRadius: 10, background: BG_ALT, marginTop: 11 }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Help & support */}
              <div style={{ padding: "24px 22px 24px" }}>
                {sectionLabel("Help & support")}
                <div style={{ fontSize: 11.5, color: MUTED, marginTop: -4, marginBottom: 12, lineHeight: 1.5 }}>
                  Stuck somewhere, or have a question about your program? Pick the kind of help you need.
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 16,
                    padding: 14,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: "#E4E7EC", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Technical support</div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
                      App, appointments, devices &amp; accessories
                    </div>
                  </div>
                  <ChevronRight size={16} color={MUTED} />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Program bottom nav: Back · Programs · Status */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            padding: "8px 6px 22px",
            background: BG,
            borderTop: "1px solid " + BORDER,
          }}
        >
          {[
            {
              id: "back",
              label: "Back",
              Icon: ChevronLeft,
              active: false,
              onClick: () => {
                setProgramDetail(false);
                setProgramSub(null);
              },
            },
            {
              id: "programs",
              label: "Programs",
              Icon: Stethoscope,
              active: programSub === null,
              onClick: () => setProgramSub(null),
            },
            {
              id: "status",
              label: "Status",
              Icon: TrendingUp,
              active: programSub === "progress",
              onClick: () => setProgramSub("progress"),
            },
          ].map((t) => (
            <button
              key={t.id}
              onClick={t.onClick}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  border: "1px solid " + (t.active ? GREEN : BORDER),
                  background: t.active ? "rgba(16,24,40,0.08)" : BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <t.Icon size={17} color={t.active ? GREEN : MUTED} strokeWidth={2} />
              </div>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: t.active ? 600 : 500,
                  color: t.active ? GREEN : MUTED,
                }}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  );
}
