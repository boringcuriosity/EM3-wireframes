import React, { useState } from "react";
import { useWF } from "../state";
import { ChevronLeft, ChevronRight, Check, Video, Pencil, CalendarCheck } from "lucide-react";
import { coachAvatar } from "../ui";
import {
  GREEN, GREEN_DEEP, GREEN_TINT, TEXT, MUTED, FAINT, BG, BG_ALT, BG_SUNK, BORDER, LINE, RULE,
} from "../tokens";

/* Booking the consultation that every plan waits on.

   The plan card says plans are written after the first consultation, and until
   now that sentence went nowhere. This is where it goes.

   One screen, two steps, the way the movement logger picks then confirms: who
   you are seeing, then when. A separate screen for the calendar would mean two
   back buttons for one decision. */

/* A week of real dates, matching the program window the rest of the app
   already states. Written out rather than computed, because the wireframe's
   clock is frozen and a calendar that drifts from the program's own dates
   raises a question nobody meant to ask. */
const DAYS = [
  { id: "17", dow: "Mon", d: "17", full: "17 Aug, 2026", slots: ["9:30 AM", "10:15 AM", "11:00 AM", "4:00 PM", "5:30 PM"] },
  { id: "18", dow: "Tue", d: "18", full: "18 Aug, 2026", slots: ["10:15 AM", "12:30 PM", "6:15 PM"] },
  { id: "19", dow: "Wed", d: "19", full: "19 Aug, 2026", slots: [] },
  { id: "20", dow: "Thu", d: "20", full: "20 Aug, 2026", slots: ["9:30 AM", "11:00 AM", "4:00 PM", "5:30 PM", "6:15 PM"] },
  { id: "21", dow: "Fri", d: "21", full: "21 Aug, 2026", slots: ["10:15 AM", "4:00 PM"] },
  { id: "22", dow: "Sat", d: "22", full: "22 Aug, 2026", slots: ["9:30 AM", "10:15 AM"] },
  { id: "23", dow: "Sun", d: "23", full: "23 Aug, 2026", slots: [] },
];

export default function BookAppointment() {
  const { setBookOpen, bookWith, setBookWith, careTeam, bookings, setBookings, setSessionState, setToast } = useWF();

  const [day, setDay] = useState(DAYS[0].id);
  const [slot, setSlot] = useState(null);

  const who = careTeam.find((c) => c.id === bookWith);
  const picked = DAYS.find((x) => x.id === day) || DAYS[0];

  /* Entering the picker carries whatever is already booked, so editing starts
     where the person left it rather than at the top of the week. */
  const openFor = (id) => {
    const b = bookings[id];
    setDay(b ? b.day : DAYS[0].id);
    setSlot(b ? b.time : null);
    setBookWith(id);
  };

  const back = () => {
    if (bookWith) {
      setBookWith(null);
      setSlot(null);
      return;
    }
    setBookOpen(false);
  };

  /* Back to the list, not out of the screen. Three consultations get booked in
     one sitting, so throwing somebody to Home after the first one makes them
     find their way back for the other two. */
  const confirm = () => {
    setBookings({ ...bookings, [bookWith]: { day: picked.id, dow: picked.dow, d: picked.d, full: picked.full, time: slot } });
    setSessionState("booked");
    setBookWith(null);
    setSlot(null);
    setToast({
      title: "Session booked",
      line: who.name.split(" ")[0] + " · " + picked.full + " at " + slot,
    });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG_ALT, minHeight: 0 }}>
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "4px 18px 14px",
          background: BG,
          borderBottom: "1px solid " + BORDER,
        }}
      >
        <button
          onClick={back}
          aria-label="Back"
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", flexShrink: 0 }}
        >
          <ChevronLeft size={22} color={TEXT} />
        </button>
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 19,
            fontWeight: 600,
            color: TEXT,
          }}
        >
          {bookWith ? "Pick a time" : "Book a consultation"}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 18px 24px" }}>
        {!bookWith ? (
          <>
            {careTeam.map((c) => (
              <button
                key={c.id}
                onClick={() => openFor(c.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: BG,
                  border: "1px solid " + (bookings[c.id] ? GREEN + "55" : BORDER),
                  borderRadius: 18,
                  padding: "15px 16px",
                  marginBottom: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {coachAvatar(42)}
                  <span style={{ flex: 1, minWidth: 0 }}>
                    {/* The person, then the job. A card that leads with the role
                        is a directory; the program is people. */}
                    <span style={{ display: "block", fontSize: 14.5, fontWeight: 700, color: TEXT }}>
                      {c.name}
                    </span>
                    <span style={{ display: "block", fontSize: 11.5, color: MUTED, marginTop: 2 }}>
                      {c.role}
                    </span>
                  </span>
                </span>

                {/* The same row, carrying the booking once it exists. A card
                    that still said "Select date and time" after a slot was
                    picked would leave somebody wondering whether it took. */}
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: bookings[c.id] ? GREEN_TINT : BG_SUNK,
                    border: "1px solid " + (bookings[c.id] ? GREEN + "44" : BORDER),
                    borderRadius: 12,
                    padding: "11px 13px",
                    marginTop: 13,
                  }}
                >
                  {bookings[c.id] ? (
                    <>
                      <CalendarCheck size={15} color={GREEN_DEEP} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, color: GREEN_DEEP }}>
                        {bookings[c.id].dow} {bookings[c.id].d} Aug · {bookings[c.id].time}
                      </span>
                      <Pencil size={14} color={GREEN_DEEP} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                    </>
                  ) : (
                    <>
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: TEXT }}>
                        Select date and time
                      </span>
                      <ChevronRight size={16} color={MUTED} style={{ flexShrink: 0 }} />
                    </>
                  )}
                </span>
              </button>
            ))}
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 16,
                padding: "12px 14px",
                marginBottom: 16,
              }}
            >
              {coachAvatar(36)}
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: 700, color: TEXT }}>
                  {who.name}
                </span>
                <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>
                  {who.role} · 30 minutes, on video
                </span>
              </span>
              <Video size={17} color={MUTED} style={{ flexShrink: 0 }} />
            </div>

            {/* The week, edge to edge, so a scroll is obviously a scroll. */}
            <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, marginBottom: 9 }}>August 2026</div>
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                scrollbarWidth: "none",
                margin: "0 -18px",
                padding: "0 18px 4px",
              }}
            >
              {DAYS.map((x) => {
                const on = x.id === day;
                const free = x.slots.length > 0;
                return (
                  <button
                    key={x.id}
                    onClick={() => {
                      setDay(x.id);
                      setSlot(null);
                    }}
                    disabled={!free}
                    aria-label={x.full + (free ? "" : ", nothing free")}
                    style={{
                      width: 52,
                      flexShrink: 0,
                      background: on ? TEXT : BG,
                      border: "1px solid " + (on ? TEXT : BORDER),
                      borderRadius: 14,
                      padding: "9px 0 10px",
                      cursor: free ? "pointer" : "default",
                      fontFamily: "inherit",
                      opacity: free ? 1 : 0.45,
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: on ? "rgba(255,255,255,0.7)" : MUTED,
                      }}
                    >
                      {x.dow}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: 16,
                        fontWeight: 700,
                        color: on ? "#fff" : TEXT,
                        marginTop: 2,
                      }}
                    >
                      {x.d}
                    </span>
                    {/* A dot for a day with something free, so the strip says
                        where to look before anybody taps to find out. */}
                    <span
                      aria-hidden
                      style={{
                        display: "block",
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        margin: "5px auto 0",
                        background: free ? (on ? "#fff" : GREEN) : "transparent",
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, margin: "18px 0 9px" }}>
              {picked.slots.length > 0 ? "Free on " + picked.dow + " " + picked.d : "Nothing free that day"}
            </div>

            {picked.slots.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {picked.slots.map((t) => {
                  const on = slot === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setSlot(t)}
                      style={{
                        background: on ? GREEN_TINT : BG,
                        border: "1px solid " + (on ? GREEN : BORDER),
                        borderRadius: 12,
                        padding: "11px 0",
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: on ? GREEN_DEEP : TEXT,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  background: BG,
                  border: "1px dashed " + RULE,
                  borderRadius: 14,
                  padding: "24px 16px",
                  textAlign: "center",
                  fontSize: 12.5,
                  color: MUTED,
                  lineHeight: 1.55,
                }}
              >
                {who.name.split(" ")[0]} has nothing open on this one. The days with a green dot
                have room.
              </div>
            )}
          </>
        )}
      </div>

      {bookWith && (
        <div style={{ flexShrink: 0, borderTop: "1px solid " + LINE, padding: "12px 18px 24px", background: BG }}>
          <button
            onClick={confirm}
            disabled={!slot}
            style={{
              width: "100%",
              height: 50,
              borderRadius: 14,
              background: slot ? GREEN : BG_SUNK,
              border: "none",
              color: slot ? "#fff" : FAINT,
              fontSize: 14.5,
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: slot ? "pointer" : "default",
              boxShadow: slot ? "0 2px 0 " + GREEN_DEEP : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {slot ? (
              <>
                <Check size={16} strokeWidth={3} />
                {bookings[bookWith] ? "Move to " : "Book "}
                {picked.dow} {picked.d} at {slot}
              </>
            ) : (
              "Pick a time"
            )}
          </button>
        </div>
      )}

      {!bookWith && (
        <div style={{ flexShrink: 0, padding: "0 18px 24px" }}>
          <button
            onClick={() => setBookOpen(false)}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              padding: "8px 0",
              fontSize: 12.5,
              fontWeight: 600,
              color: MUTED,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {Object.keys(bookings).length ? "Done" : "Not now"}
          </button>
        </div>
      )}
    </div>
  );
}
