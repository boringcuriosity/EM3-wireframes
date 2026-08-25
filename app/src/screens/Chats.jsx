import React from "react";
import { useWF } from "../state";
import { ChevronLeft } from "lucide-react";
import { TEXT, MUTED, BG_ALT, BG, BORDER } from "../tokens";
import { coachAvatar } from "../ui";

export default function ChatsPage() {
  const { setChatsOpen, isPaid, program } = useWF();

  return (
    (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "4px 18px 14px",
            background: BG,
            borderBottom: "1px solid " + BORDER,
          }}
        >
          <button
            onClick={() => setChatsOpen(false)}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
          >
            <ChevronLeft size={22} color={TEXT} />
          </button>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 20,
              fontWeight: 600,
              color: TEXT,
            }}
          >
            Chats
          </span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", background: BG_ALT, padding: "16px 18px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 14,
              padding: 14,
              marginBottom: 12,
              cursor: "pointer",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="1.6">
              <path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" />
            </svg>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Kaira</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>AI care assistant</div>
            </div>
          </div>

          {isPaid ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 14,
                padding: 14,
                cursor: "pointer",
              }}
            >
              {coachAvatar(38)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Shaheer's group</div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Sahana Physio: hi</div>
              </div>
              <span style={{ fontSize: 11, color: MUTED, flexShrink: 0 }}>Yesterday</span>
            </div>
          ) : (
            <div
              style={{
                background: BG,
                border: "1px dashed " + BORDER,
                borderRadius: 14,
                padding: 16,
                fontSize: 11.5,
                color: MUTED,
                lineHeight: 1.5,
              }}
            >
              Coach chats appear here once you join a program and complete your first consultation.
            </div>
          )}
        </div>
      </div>
    )
  );
}
