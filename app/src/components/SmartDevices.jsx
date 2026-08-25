import React from "react";
import { useWF } from "../state";
import { Droplet, Hourglass } from "lucide-react";
import { GREEN, TEXT, MUTED, BG_ALT, BG, BORDER } from "../tokens";
import CtaArrow from "./CtaArrow";

export default function SmartDevices() {
  const { deviceTab, setDeviceTab, deviceTabConnected, setDeviceTabConnected, isDevice } = useWF();

  return (
    (
      <div style={{ padding: "10px 22px 0" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: TEXT,
            marginBottom: 10,
          }}
        >
          Smart Devices
        </div>
        {isDevice ? (
          /* Connected state — at least one device (CGM) is connected */
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 16,
              height: 240,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              padding: "12px 12px 12px",
            }}
          >
            {/* Device tabs: CGM (connected) · Ring · BCA */}
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              {[
                { id: "cgm", label: "CGM", connected: true },
                { id: "ring", label: "Ring", connected: false },
                { id: "bca", label: "BCA", connected: false },
                { id: "bpm", label: "BPM", connected: false },
              ].map((d) => {
                const active = deviceTabConnected === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDeviceTabConnected(d.id)}
                    style={{
                      flex: 1,
                      background: active ? BG_ALT : BG,
                      border: "1px solid " + BORDER,
                      borderBottom: active
                        ? "3px solid " + GREEN
                        : "1px solid " + BORDER,
                      borderRadius: 12,
                      padding: "8px 4px 6px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: d.id === "bca" || d.id === "bpm" ? 7 : "50%",
                        border:
                          d.id === "ring"
                            ? "4px solid #D0D5DD"
                            : "1px solid #D0D5DD",
                        background: d.id === "ring" ? "transparent" : BG_ALT,
                      }}
                    />
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        fontWeight: active ? 700 : 500,
                        color: active ? TEXT : MUTED,
                      }}
                    >
                      {d.connected && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: GREEN,
                          }}
                        />
                      )}
                      {d.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {deviceTabConnected === "cgm" ? (
              <>
                {/* Metric chips */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    padding: "10px 0",
                    minHeight: 0,
                  }}
                >
                  {[
                    { icon: Droplet, label: "Avg Glucose", value: "104 mg/dl" },
                    { icon: Hourglass, label: "Time In Range", value: "99.7%" },
                  ].map((m, i) => {
                    const MIcon = m.icon;
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          background: BG_ALT,
                          border: "1px solid " + BORDER,
                          borderRadius: 14,
                          padding: "12px 14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12.5,
                            color: TEXT,
                            marginBottom: 6,
                          }}
                        >
                          <MIcon size={14} color={TEXT} strokeWidth={2} />
                          {m.label}
                        </div>
                        <div
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: "#101828",
                          }}
                        >
                          {m.value}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Last synced + View Details */}
                <div
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>
                    Last Synced:
                    <div style={{ fontWeight: 700, color: TEXT }}>
                      02:00 AM, Today
                    </div>
                  </div>
                  <button
                    style={{
                      flex: 1,
                      background: GREEN,
                      border: "none",
                      borderRadius: 12,
                      padding: "12px 0",
                      color: "#fff",
                      fontSize: 14.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    View Details<CtaArrow />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Not-connected device inside connected card — explore/connect */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "10px 4px",
                    minHeight: 0,
                  }}
                >
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      flexShrink: 0,
                      borderRadius: 14,
                      background: BG_ALT,
                      border: "1px solid " + BORDER,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: deviceTabConnected === "bca" || deviceTabConnected === "bpm" ? 9 : "50%",
                        border:
                          deviceTabConnected === "ring"
                            ? "6px solid #D0D5DD"
                            : "1px solid #D0D5DD",
                        background:
                          deviceTabConnected === "ring"
                            ? "transparent"
                            : "#F2F4F7",
                      }}
                    />
                  </div>
                  {deviceTabConnected === "ring" || deviceTabConnected === "bpm" ? (
                    <div
                      style={{
                        flex: 1,
                        fontSize: 16.5,
                        lineHeight: 1.35,
                        fontWeight: 700,
                        color: "#101828",
                      }}
                    >
                      {deviceTabConnected === "bpm"
                        ? "Track blood pressure with GoodFlip Monitor"
                        : "Listen to your body signals with GoodFlip Ring"}
                    </div>
                  ) : (
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 13, width: "88%", background: "#E4E7EC", borderRadius: 6, marginBottom: 8 }} />
                      <div style={{ height: 13, width: "70%", background: "#E4E7EC", borderRadius: 6, marginBottom: 8 }} />
                      <div style={{ height: 13, width: "45%", background: "#F2F4F7", borderRadius: 6 }} />
                    </div>
                  )}
                </div>
                <div style={{ flexShrink: 0, display: "flex", gap: 10 }}>
                  <button
                    style={{
                      flex: 1,
                      background: BG,
                      border: "1px solid " + GREEN,
                      borderRadius: 12,
                      padding: "12px 0",
                      color: GREEN,
                      fontSize: 14.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Explore
                  </button>
                  <button
                    style={{
                      flex: 1.4,
                      background: GREEN,
                      border: "none",
                      borderRadius: 12,
                      padding: "12px 0",
                      color: "#fff",
                      fontSize: 14.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Connect{" "}
                    {deviceTabConnected === "ring"
                      ? "Ring"
                      : deviceTabConnected === "bpm"
                      ? "BPM"
                      : "BCA"}
                    <CtaArrow />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
        <div
          style={{
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 16,
            height: 240,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            padding: "12px 12px 12px",
          }}
        >
          {/* Device tabs: Ring · CGM · BCA */}
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            {[
              { id: "ring", label: "Ring" },
              { id: "cgm", label: "CGM" },
              { id: "bca", label: "BCA" },
              { id: "bpm", label: "BPM" },
            ].map((d) => {
              const active = deviceTab === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDeviceTab(d.id)}
                  style={{
                    flex: 1,
                    background: active ? BG_ALT : BG,
                    border: "1px solid " + BORDER,
                    borderBottom: active
                      ? "3px solid " + GREEN
                      : "1px solid " + BORDER,
                    borderRadius: 12,
                    padding: "8px 4px 6px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                  }}
                >
                  {/* Device glyph placeholder */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: d.id === "bca" || d.id === "bpm" ? 7 : "50%",
                      border:
                        d.id === "ring"
                          ? "4px solid #D0D5DD"
                          : "1px solid #D0D5DD",
                      background: d.id === "ring" ? "transparent" : BG_ALT,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      color: active ? TEXT : MUTED,
                    }}
                  >
                    {d.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Device hero: image + headline */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 4px",
              minHeight: 0,
            }}
          >
            {/* Product image placeholder */}
            <div
              style={{
                width: 84,
                height: 84,
                flexShrink: 0,
                borderRadius: 14,
                background: BG_ALT,
                border: "1px solid " + BORDER,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: deviceTab === "bca" || deviceTab === "bpm" ? 9 : "50%",
                  border:
                    deviceTab === "ring"
                      ? "6px solid #D0D5DD"
                      : "1px solid #D0D5DD",
                  background: deviceTab === "ring" ? "transparent" : "#F2F4F7",
                }}
              />
            </div>
            {deviceTab === "ring" || deviceTab === "bpm" ? (
              <div
                style={{
                  flex: 1,
                  fontSize: 16.5,
                  lineHeight: 1.35,
                  fontWeight: 700,
                  color: "#101828",
                }}
              >
                {deviceTab === "bpm"
                  ? "Track blood pressure with GoodFlip Monitor"
                  : "Listen to your body signals with GoodFlip Ring"}
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                {/* Headline placeholder for CGM / BCA */}
                <div style={{ height: 13, width: "88%", background: "#E4E7EC", borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 13, width: "70%", background: "#E4E7EC", borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 13, width: "45%", background: "#F2F4F7", borderRadius: 6 }} />
              </div>
            )}
          </div>

          {/* CTAs — Explore (secondary) + Connect (primary) */}
          <div style={{ flexShrink: 0, display: "flex", gap: 10 }}>
            <button
              style={{
                flex: 1,
                background: BG,
                border: "1px solid " + GREEN,
                borderRadius: 12,
                padding: "12px 0",
                color: GREEN,
                fontSize: 14.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Explore
            </button>
            <button
              style={{
                flex: 1.4,
                background: GREEN,
                border: "none",
                borderRadius: 12,
                padding: "12px 0",
                color: "#fff",
                fontSize: 14.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Connect{" "}
              {deviceTab === "ring"
                ? "Ring"
                : deviceTab === "cgm"
                ? "CGM"
                : deviceTab === "bpm"
                ? "BPM"
                : "BCA"}
              <CtaArrow />
            </button>
          </div>
        </div>
        )}
      </div>
    )
  );
}
