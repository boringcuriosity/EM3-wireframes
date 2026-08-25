import React from "react";
import { Play, Heart } from "lucide-react";
import { TEXT, MUTED, BG, BG_ALT, BORDER } from "../../tokens";
import { VIDEO_SECTIONS } from "./exercises";

/* Move's Learn tab. Videos rather than articles, because movement is shown
   better than it is described. */
export default function VideoList() {
  return (
    <>
      {VIDEO_SECTIONS.map((sec) => (
            <div key={sec.title} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT, marginBottom: 10 }}>
                {sec.title}
              </div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none" }}>
                {sec.items.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      flex: sec.featured ? "1 1 100%" : "0 0 190px",
                      background: BG,
                      border: "1px solid " + BORDER,
                      borderRadius: 16,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: sec.featured ? 118 : 96,
                        background: BG_ALT,
                        borderBottom: "1px dashed " + BORDER,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          width: 36, height: 36, borderRadius: "50%", background: BG,
                          border: "1px solid " + BORDER, display: "flex",
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Play size={15} color={TEXT} fill={TEXT} />
                      </span>
                    </div>
                    <div style={{ padding: "11px 13px 13px" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{v.name}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
                        {[v.level, v.kind].map((tag) => (
                          <span
                            key={tag}
                            style={{
                              background: BG_ALT,
                              border: "1px solid " + BORDER,
                              borderRadius: 999,
                              padding: "3px 9px",
                              fontSize: 10,
                              color: MUTED,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {v.likes && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 9 }}>
                          <Heart size={12} color={MUTED} />
                          <span style={{ fontSize: 11, color: MUTED }}>{v.likes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
    </>
  );
}
