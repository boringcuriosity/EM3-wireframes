import React from "react";
import { useWF } from "../state";
import { Menu, MessageCircle, Bell, User } from "lucide-react";
import { TEXT, BG_ALT, BG, BORDER, GOLD, GOLD_TINT, GOLD_LINE, GOLD_DEEP } from "../tokens";

export default function HomeTopBar() {
  const { setChatsOpen, isPaid } = useWF();

  return (
    (
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "6px 18px 12px",
          background: BG,
          borderBottom: "1px solid " + BORDER,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <button
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: "50%",
              border: "1px solid " + BORDER,
              background: BG,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <Menu size={19} color={TEXT} strokeWidth={2.1} />
          </button>

          {isPaid && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                height: 34,
                padding: "0 12px 0 8px",
                borderRadius: 999,
                border: "1px solid " + GOLD_LINE,
                background: GOLD_TINT,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  background: GOLD,
                  clipPath:
                    "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: GOLD_DEEP,
                  whiteSpace: "nowrap",
                }}
              >
                101 Flipcoins
              </span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {[
            { Icon: MessageCircle, badge: null, onClick: () => setChatsOpen(true) },
            { Icon: Bell, badge: isPaid ? "4" : null, onClick: null },
            { Icon: User, badge: null, onClick: null },
          ].map(({ Icon, badge, onClick }, i) => (
            <button
              key={i}
              onClick={onClick || undefined}
              style={{
                position: "relative",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid " + BORDER,
                background: BG,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <Icon size={19} color={TEXT} strokeWidth={2.1} />
              {badge && (
                <span
                  style={{
                    position: "absolute",
                    top: -3,
                    right: -3,
                    minWidth: 17,
                    height: 17,
                    borderRadius: 999,
                    background: TEXT,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid " + BG,
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    )
  );
}
