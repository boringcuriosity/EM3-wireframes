import React from "react";
import { ChevronRight } from "lucide-react";
import { GREEN, TEXT, MUTED, BG, BORDER } from "../tokens";

export default function MorePage() {
  return (
    (
      <div style={{ padding: "16px 22px 28px" }}>
        <p
          style={{
            margin: "0 0 20px",
            fontSize: 13,
            lineHeight: 1.5,
            color: MUTED,
          }}
        >
          Find everything we have for you.
        </p>

        {[
          {
            title: "FlipFeed",
            desc: "Learn about your metabolism with articles and guides across every pillar.",
            tag: "New stories",
          },
          {
            title: "Records",
            desc: "Store your health records with GoodFlip security.",
            tag: "04 records stored",
          },
          {
            title: "Virtual Health Scan",
            desc: "Scan your face and get 21 vital signs in seconds.",
            tag: "Scan now",
          },
          {
            title: "AI Lab Reports",
            desc: "Understand your lab reports using KAIRA AI.",
            tag: "Upload report",
          },
          {
            title: "ABHA Account",
            desc: "Access your digital health records easily.",
            tag: "Powered by ABHA",
          },
        ].map((c) => (
          <div
            key={c.title}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "stretch",
              marginBottom: 18,
            }}
          >
            {/* Left: text */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 16,
                  fontWeight: 600,
                  color: TEXT,
                }}
              >
                {c.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: MUTED,
                  marginTop: 5,
                  lineHeight: 1.45,
                }}
              >
                {c.desc}
              </div>
            </div>
            {/* Right: visual placeholder card */}
            <div
              style={{
                flex: "0 0 46%",
                height: 92,
                borderRadius: 14,
                background: "#F2F4F7",
                border: "1px solid " + BORDER,
                position: "relative",
                display: "flex",
                alignItems: "flex-start",
                padding: 10,
                boxSizing: "border-box",
              }}
            >
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  color: TEXT,
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 8,
                  padding: "3px 7px",
                }}
              >
                {c.tag}
              </span>
              <div
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  background: GREEN,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ChevronRight size={14} color="#fff" strokeWidth={2.6} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  );
}
