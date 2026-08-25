import React from "react";
import { ChevronRight } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BORDER, SH } from "../tokens";

export default function CarePage() {
  return (
    (
      <div style={{ padding: "16px 22px 28px" }}>
        {/* Intro */}
        <p
          style={{
            margin: "0 0 20px",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 17,
            lineHeight: 1.5,
            color: TEXT,
            fontWeight: 500,
          }}
        >
          Taking care of your metabolism is easier with the right support. Speed
          up your health journey with our Care.
        </p>

        {/* Promotional banners — horizontally scrollable */}
        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            paddingBottom: 6,
            marginBottom: 22,
            scrollbarWidth: "none",
          }}
        >
          {[
            "Book Lab Test",
            "Science Pack Supplements",
            "GoodFlip Smart Scale",
            "GoodFlip CGM",
            "GoodFlip Care Programs",
          ].map((title) => (
            <div
              key={title}
              style={{
                flex: "0 0 82%",
                height: 130,
                borderRadius: 16,
                background: "#F2F4F7",
                border: "1px solid " + BORDER,
                display: "flex",
                alignItems: "flex-end",
                padding: 16,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: TEXT,
                }}
              >
                {title}
              </div>
            </div>
          ))}
        </div>

        {/* Devices */}
        <div
          style={{
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 18,
            padding: 18,
            marginBottom: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            boxShadow: SH,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 18,
                fontWeight: 600,
                color: TEXT,
              }}
            >
              Devices
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: MUTED,
                marginTop: 6,
                lineHeight: 1.45,
                maxWidth: 240,
              }}
            >
              Smart devices that let you see your metabolism as it happens and act
              on it in real time.
            </div>
          </div>
          <ChevronRight size={18} color={GREEN} strokeWidth={2.4} />
        </div>

        {/* Programs */}
        <div
          style={{
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 18,
            padding: 18,
            marginBottom: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            boxShadow: SH,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 18,
                fontWeight: 600,
                color: TEXT,
              }}
            >
              Programs
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: MUTED,
                marginTop: 6,
                lineHeight: 1.45,
                maxWidth: 240,
              }}
            >
              Structured, doctor guided plans built around your body and your
              goals.
            </div>
          </div>
          <ChevronRight size={18} color={GREEN} strokeWidth={2.4} />
        </div>

        {/* Lab Tests */}
        <div
          style={{
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 18,
            padding: 18,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            boxShadow: SH,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 18,
                fontWeight: 600,
                color: TEXT,
              }}
            >
              Lab Tests
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: MUTED,
                marginTop: 6,
                lineHeight: 1.45,
                maxWidth: 240,
              }}
            >
              Understand what's happening inside your body and track the markers
              that matter.
            </div>
          </div>
          <ChevronRight size={18} color={GREEN} strokeWidth={2.4} />
        </div>
      </div>
    )
  );
}
