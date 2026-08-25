import React from "react";
import { BookOpen } from "lucide-react";
import { TEXT, MUTED, BG, BG_ALT, BORDER } from "../tokens";

/* The Learn tab on any pillar: a category, then what there is to read.

   Lifted out of Eat, which was the only screen that had one. The pillars each
   have their own reading list but there is no reason for them to look like
   different libraries. */
export default function ArticleList({ category, items }) {
  return (
    <div style={{ margin: "-8px -22px 0", background: BG }}>
      <div style={{ background: "linear-gradient(180deg,#F2F4F7,#F9FAFB)", padding: "26px 22px 22px" }}>
        <div
          style={{
            fontSize: 30,
            lineHeight: 1.15,
            fontWeight: 600,
            color: TEXT,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {category}
        </div>
      </div>

      <div style={{ padding: "6px 22px 20px" }}>
        {items.map((a, i, arr) => (
          <div key={a.title}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "18px 0" }}>
              <div
                style={{
                  width: 76,
                  height: 76,
                  flexShrink: 0,
                  borderRadius: 14,
                  background: BG_ALT,
                  border: "1px solid " + BORDER,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={24} color="#D0D5DD" strokeWidth={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15.5,
                    lineHeight: 1.35,
                    fontWeight: 600,
                    color: TEXT,
                    marginBottom: 12,
                  }}
                >
                  {a.title}
                </div>
                <div style={{ fontSize: 12.5, color: MUTED }}>{a.meta}</div>
              </div>
            </div>
            {i < arr.length - 1 && <div style={{ height: 1, background: BORDER }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
