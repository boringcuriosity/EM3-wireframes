import React, { useState, useRef, useEffect } from "react";
import {
  Home,
  Activity,
  BarChart3,
  Heart,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Utensils,
  TrendingUp,
  Info,
  Gift,
  Check,
  Calendar,
  Stethoscope,
  Moon,
  BookOpen,
  Droplet,
  Hourglass,
  ListChecks,
  Menu,
  MessageCircle,
  Bell,
  User,
  Camera,
  Search,
  Mic,
} from "lucide-react";

// GoodFlip design tokens
const GREEN = "#299D6B";
const TEXT = "#344054";
const MUTED = "#8A94A6";
const BG = "#FFFFFF";
const BG_ALT = "#FAFBFA";
const BORDER = "#ECEFF3";

const TABS = [
  { id: "home", label: "Home", icon: Home },
  { id: "track", label: "Today", icon: ListChecks },
  { id: "med", label: "Measure", icon: BarChart3 },
  { id: "care", label: "Care", icon: Heart },
  { id: "more", label: "More", icon: LayoutGrid },
];

export default function GoodFlipWireframe() {
  const [activeTab, setActiveTab] = useState("home");
  // userState: "free" | "returning" | "device" | "deviceReturning"
  const [userState, setUserState] = useState("free");
  // eatDetail: full-screen Eat page (no bottom nav)
  const [eatDetail, setEatDetail] = useState(false);
  // eatState: "ft" | "fad" | "wc" | "w2"
  const [eatState, setEatState] = useState("ft");
  // progressTab: "achieve" | "medScore" | "vitals"
  const [progressTab, setProgressTab] = useState("achieve");
  // measureApproach: "a0" (current Measure) | "ms" (metabolic-score anchored)
  const [measureApproach, setMeasureApproach] = useState("ms");
  // msRange: "week" | "month" | "custom"
  const [msRange, setMsRange] = useState("week");
  // msDetail: null | "score" | "pillars"
  const [msDetail, setMsDetail] = useState(null);
  // a1Detail: null | "movers"
  const [a1Detail, setA1Detail] = useState(null);
  // msa2Detail: null | "score"
  const [msa2Detail, setMsa2Detail] = useState(null);
  // achieveRange: "week" | "month" | "custom"
  const [achieveRange, setAchieveRange] = useState("week");
  // eatTab: "today" | "trend" | "learn"
  const [eatTab, setEatTab] = useState("today");
  // deviceTab: "ring" | "cgm" | "bca" — Smart Devices card
  const [deviceTab, setDeviceTab] = useState("ring");
  // deviceTabConnected: active tab in the connected-state card (device users); CGM is the connected device
  const [deviceTabConnected, setDeviceTabConnected] = useState("cgm");
  // plan: "free" | "paid" — paid = enrolled in a Care program
  const [plan, setPlan] = useState("paid");
  // homeProgramTab: "program" | "sessions" — paid Home carousel
  const [homeProgramTab, setHomeProgramTab] = useState("program");
  // sessionState: "none" | "booked" — second carousel card on paid Home
  const [sessionState, setSessionState] = useState("none");
  // scoreState: MET Score card on Home.
  // "locked"  — FTUX, no score yet (default)
  // "first"   — first score, shown as a risk band, no delta
  // "down" | "flat" | "up" — subsequent updates
  const [scoreState, setScoreState] = useState("locked");
  // setupState: "new" | "partial" | "done" — the first week checklist above the score
  const [setupState, setSetupState] = useState("new");
  // dailyState — today's task row on Home.
  // "ftux"     — first day, teaching state, meals not yet understood
  // "empty"    — returning user, new day, nothing logged yet
  // "partial"  — some logged today (Eat 1 of 3, others open)
  // "done"     — all three cleared today
  const [dailyState, setDailyState] = useState("ftux");
  // Onboarding takeover launched from the FTUX "Let's start" CTA.
  // onboardingOpen shows the full-screen flow; onboardingStep walks it:
  //   0 = Kaira + pillars intro
  //   1..4 = age, sex, height, weight
  //   5 = "building your plan" beat
  // After it closes, dailyState flips to "empty" and tourStep runs the coach-marks.
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  // Coach-mark tour over the new task row. 0..2 walk the cards, then null.
  const [tourStep, setTourStep] = useState(null);
  // todayOnboarded: has the user completed the Today-tab FTUX (pillar explainer
  // + questions)? When false, opening the Today tab shows onboarding first.
  const [todayOnboarded, setTodayOnboarded] = useState(false);
  // Day streak strip above the program tabs. streakDays is the current run;
  // streakFrozen shows the reserve freeze that absorbs one missed day silently.
  // leaderboardOpen toggles the full-screen ranking.
  const [streakDays, setStreakDays] = useState(5);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  // streakState controls the strip: "new" (day 0, no streak), "active" (running),
  // "nofriends" (running streak but no friend group yet), "broken" (a day missed,
  // revivable for 10 Flipcoins).
  const [streakState, setStreakState] = useState("active");
  // Revive explainer sheet toggled from the leaderboard / broken strip.
  const [freezeInfoOpen, setFreezeInfoOpen] = useState(false);
  // Illustrative Flipcoins balance so the revive can check affordability.
  const flipcoins = 101;
  const REVIVE_COST = 10;
  // programDetail: full-screen program page (no bottom nav)
  const [programDetail, setProgramDetail] = useState(false);
  // programSub: null | "progress" — sub-page inside the program
  const [programSub, setProgramSub] = useState(null);
  // chatsOpen: full-screen chat list (no bottom nav)
  const [chatsOpen, setChatsOpen] = useState(false);

  const isPaid = plan === "paid";

  // Paid Home carousel — tab selection slides the rail; swiping updates the tab.
  const CARD_W = 300;
  const CARD_GAP = 12;
  const CARD_PAD = 22;
  // Both carousel cards are locked to this height so the sessions card does not
  // grow when a session is booked. Content inside each variant must fit.
  const CARD_H = 128;
  // Paid Home: set to true to bring back the "Your Program / Upcoming Session(s)"
  // pill switch above the carousel. When false the carousel is swipe only.
  const SHOW_PROGRAM_TABS = true;

  // Program on the first carousel card. Every field here is dynamic — swap the
  // condition, duration or care type and the card re-renders. icon is any
  // lucide component.
  const program = {
    status: "Active",
    icon: Droplet,
    name: "Diabetes Management",
    duration: "Comprehensive 12 months",
    category: "Diabetes Care",
  };

  // Booked session shown on the second card when sessionState === "booked".
  const bookedSession = {
    role: "Your Success Coach",
    coach: "Manya Jain",
    date: "17 Aug, 2026",
    time: "10:15 AM",
    cta: "Join Your Zoom Session",
  };
  // Trailing space so the second card can actually reach the left edge.
  // Without it max scrollLeft < the snap target and the rail springs back.
  const CARD_TAIL = 390 - CARD_PAD - CARD_W;
  const carouselRef = useRef(null);
  const carouselLock = useRef(false);
  const carouselTimer = useRef(null);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const target = homeProgramTab === "sessions" ? CARD_W + CARD_GAP : 0;
    if (Math.abs(el.scrollLeft - target) < 4) return;
    carouselLock.current = true;
    clearTimeout(carouselTimer.current);
    el.scrollTo({ left: target, behavior: "smooth" });
    carouselTimer.current = setTimeout(() => {
      carouselLock.current = false;
    }, 500);
  }, [homeProgramTab, isPaid, activeTab]);

  // Only react once the swipe has settled, so the pill doesn't flicker mid-drag
  const handleCarouselScroll = (e) => {
    if (carouselLock.current) return;
    const left = e.currentTarget.scrollLeft;
    clearTimeout(carouselTimer.current);
    carouselTimer.current = setTimeout(() => {
      const next = left > (CARD_W + CARD_GAP) / 2 ? "sessions" : "program";
      setHomeProgramTab((prev) => (prev === next ? prev : next));
    }, 130);
  };

  const isReturning = userState === "returning" || userState === "deviceReturning";
  const isDevice = userState === "device" || userState === "deviceReturning";

  const ringStyle = (color, pct) => ({
    width: 88,
    height: 88,
    borderRadius: "50%",
    background: `conic-gradient(${color} ${pct}%, #E8EBEE 0)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  /* ---------- Eat · Today (redesigned) ----------
     Sufficiency leads, calories demote to a slim strip. Then log-a-meal,
     then the meal divisions. Logged food lives inside each division; the
     coach plan's suggested options show only for paid users. */
  const sufficiencyRings = [
    { label: "Protein", pct: 24, val: "23/94g", color: GREEN },
    { label: "Carbs", pct: 70, val: "165/236g", color: "#3B82C4" },
    { label: "Fats", pct: 56, val: "35/62g", color: "#8B6FC4" },
    { label: "Fibre", pct: 60, val: "18/30g", color: "#C0632F" },
  ];

  const sufficiencyRing = (r) => {
    const R = 22, C = 2 * Math.PI * R;
    return (
      <div key={r.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", width: 54, height: 54 }}>
          <svg width="54" height="54" viewBox="0 0 54 54">
            <circle cx="27" cy="27" r={R} fill="none" stroke="#EEF0F3" strokeWidth="5" />
            <circle
              cx="27" cy="27" r={R} fill="none" stroke={r.color} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - r.pct / 100)}
              transform="rotate(-90 27 27)"
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{r.pct}<span style={{ fontSize: 8, color: MUTED }}>%</span></span>
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: TEXT, marginTop: 6 }}>{r.label}</div>
        <div style={{ fontSize: 9.5, color: MUTED, marginTop: 1 }}>{r.val}</div>
      </div>
    );
  };

  // Meal divisions. `plan` options show for paid; `logged` shows what the user ate.
  const eatDivisions = [
    {
      id: "earlymorning", name: "Early Morning", time: "12:00 AM – 1:00 AM", target: 108,
      plan: [
        { food: "Almond", qty: "4 pieces", cal: 52 },
        { food: "Coriander Cumin Cinnamon Water", qty: "1 glass", cal: 3 },
      ],
      logged: [],
    },
    {
      id: "prebreakfast", name: "Pre Breakfast", time: "6:00 – 7:00 AM", target: 2,
      plan: [{ food: "Black Tea With Cinnamon", qty: "1 cup", cal: 2 }],
      logged: [],
    },
    {
      id: "breakfast", name: "Breakfast", time: "8:00 – 9:00 AM", target: 236,
      plan: [
        { food: "Boiled Eggs", qty: "1 number", cal: 78 },
        { food: "Lauki Oats Besan Chilla", qty: "2 number", cal: 150 },
        { food: "Green Chutney", qty: "2 spoon", cal: 8 },
      ],
      logged: [{ food: "Boiled Eggs", qty: "2 number", cal: 156 }],
    },
    {
      id: "morningsnack", name: "Morning Snack", time: "11:00 AM – 12:00 PM", target: 0,
      plan: [],
      logged: [],
    },
    {
      id: "lunch", name: "Lunch", time: "2:00 – 3:00 PM", target: 296,
      plan: [
        { food: "Dahi (Low Fat Curd)", qty: "1 bowl", cal: 107 },
        { food: "Garden Salad", qty: "1 bowl", cal: 18 },
        { food: "Vegetable Quinoa Pulao", qty: "1 bowl", cal: 171 },
      ],
      logged: [],
    },
    {
      id: "eveningsnack", name: "Evening Snack", time: "5:00 – 6:00 PM", target: 90,
      plan: [{ food: "Roasted Makhana", qty: "1 bowl", cal: 90 }],
      logged: [],
    },
    {
      id: "dinner", name: "Dinner", time: "8:00 – 9:00 PM", target: 340,
      plan: [{ food: "Multigrain Roti", qty: "2 number", cal: 160 }, { food: "Mixed Veg Sabzi", qty: "1 bowl", cal: 120 }],
      logged: [],
    },
    {
      id: "bedtime", name: "Bed time", time: "10:00 – 11:00 PM", target: 107,
      plan: [{ food: "Walnuts", qty: "2 number", cal: 52 }, { food: "Chamomile Tea", qty: "1 cup", cal: 2 }],
      logged: [],
    },
  ];

  const eatTodayView = (
    <div style={{ margin: "-8px -22px 0" }}>
      {/* Today selector */}
      <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid " + BORDER, background: BG, borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 700, color: TEXT, cursor: "pointer" }}>
          <span style={{ color: MUTED }}>‹</span> Today <span style={{ color: MUTED }}>›</span>
        </div>
      </div>

      {/* Sufficiency — the hero. For first-time (ft) users it explains what
          sufficiency even is, before any data exists. */}
      <div style={{ padding: "12px 22px 0" }}>
        {eatState === "ft" ? (
          <div style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 20, padding: 18, boxShadow: "0 2px 10px rgba(52,64,84,0.05)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
              <div
                style={{
                  width: 52, height: 58, flexShrink: 0,
                  background: "linear-gradient(160deg,#5B6472,#3B434F)",
                  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff",
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>?</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>What is sufficiency?</div>
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>
                  Calories tell you how much you ate. Sufficiency tells you whether it was enough of the four things your body runs on.
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {[
                { l: "Protein", c: GREEN },
                { l: "Carbs", c: "#3B82C4" },
                { l: "Fats", c: "#8B6FC4" },
                { l: "Fibre", c: "#C0632F" },
              ].map((p) => (
                <div key={p.l} style={{ flex: 1, background: BG_ALT, border: "1px solid " + BORDER, borderRadius: 10, padding: "8px 4px", textAlign: "center" }}>
                  <span style={{ display: "block", width: 8, height: 8, borderRadius: "50%", background: p.c, margin: "0 auto 5px" }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: TEXT }}>{p.l}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.45, marginTop: 12, paddingTop: 12, borderTop: "1px solid " + BORDER }}>
              Nothing to cut. Keep your poha, dal and biryani. Small add-ons close the gaps in what you already eat.
            </div>
          </div>
        ) : (
        <div style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 20, padding: 18, boxShadow: "0 2px 10px rgba(52,64,84,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div
              style={{
                width: 66, height: 74, flexShrink: 0,
                background: "linear-gradient(160deg,#5B6472,#3B434F)",
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                color: "#fff",
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>53<span style={{ fontSize: 11 }}>%</span></span>
              <span style={{ fontSize: 7.5, letterSpacing: 1, marginTop: 2 }}>SUFFICIENT</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Not there yet</div>
              <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.45, marginTop: 3 }}>
                A few small additions get you there. Nothing to cut.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {sufficiencyRings.map(sufficiencyRing)}
          </div>
        </div>
        )}
      </div>

      {/* Journey state — reflects where the user is (eatState). Insight states
          (wc/w2/cg) tap through to the full breakdown under Trend. */}
      <div style={{ padding: "10px 22px 0" }}>
        <div
          onClick={() => {
            if (eatState === "wc" || eatState === "w2" || eatState === "cg") setEatTab("trend");
          }}
          style={{
            display: "flex", alignItems: "flex-start", gap: 11,
            background: BG, border: "1px solid " + BORDER, borderRadius: 16, padding: "13px 15px",
            boxShadow: "0 1px 3px rgba(52,64,84,0.04)",
            cursor: (eatState === "wc" || eatState === "w2" || eatState === "cg") ? "pointer" : "default",
          }}
        >
          <span
            style={{
              width: 26, height: 26, flexShrink: 0, marginTop: 1,
              background: GREEN,
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            K
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                {{
                  ft: "Help your coach understand you",
                  fad: "Day 1 of 7 · nice start",
                  kg: "Day 3 of 7 · keep going",
                  wc: "Week 1 done · first insight ready",
                  w2: "Week 2 · Day 2",
                  cg: "A pattern worth a look",
                }[eatState]}
              </span>
              {(eatState === "wc" || eatState === "w2" || eatState === "cg") && (
                <span style={{ fontSize: 9.5, fontWeight: 700, color: GREEN, border: "1px solid " + GREEN, borderRadius: 5, padding: "1px 6px" }}>
                  Insight
                </span>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.45, marginTop: 3 }}>
              {{
                ft: "You're a Care program user. Before your coach builds your plan, they want to see how you eat. Log at least your 3 main meals each day, every item counts, even papad and pickle.",
                fad: "One day in. A few more and your first weekly insight unlocks.",
                kg: "You're building a habit. Protein is the gap to watch this week.",
                wc: "Your first week is in. Protein ran low most days, lunch is the easiest fix.",
                w2: "This week reads against last week, so you can see what's shifting.",
                cg: "Protein has stayed flat across two weeks. A quick coach consult could help.",
              }[eatState]}
            </div>
            {(eatState === "wc" || eatState === "w2" || eatState === "cg") && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 9, fontSize: 11.5, fontWeight: 700, color: GREEN }}>
                See the full breakdown <ChevronRight size={14} color={GREEN} />
              </div>
            )}

            {/* Building states — gift + weekly progress toward the first insight */}
            {(eatState === "fad" || eatState === "kg") && (
              <div style={{ marginTop: 11 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: MUTED }}>
                    <Gift size={13} color={GREEN} />
                    {eatState === "kg" ? "3 days logged" : "1 day logged"}
                  </span>
                  <span style={{ fontSize: 10.5, color: MUTED }}>
                    {eatState === "kg" ? "Unlocks in 4 days" : "Unlocks in 6 days"}
                  </span>
                </div>
                <div style={{ height: 5, background: "#EAEDF1", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: eatState === "kg" ? "43%" : "14%", background: GREEN, borderRadius: 3 }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calories — slim strip, demoted */}
      <div style={{ padding: "10px 22px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: BG_ALT, border: "1px solid " + BORDER, borderRadius: 12, padding: "10px 14px" }}>
          <span style={{ fontSize: 11.5, color: MUTED }}>Calories today</span>
          {eatState === "ft" ? (
            <span style={{ fontSize: 11.5, color: MUTED }}>nothing logged yet</span>
          ) : (
            <>
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>1040</span>
              <span style={{ fontSize: 11, color: MUTED }}>of 1885 kcal</span>
              <span style={{ marginLeft: "auto", flex: 1, maxWidth: 90, height: 5, background: "#EAEDF1", borderRadius: 3, overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: "55%", background: MUTED, borderRadius: 3 }} />
              </span>
            </>
          )}
        </div>
      </div>

      {/* Log a meal */}
      <div style={{ padding: "14px 22px 0" }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: MUTED, marginBottom: 8 }}>
          Log a meal
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ Icon: Camera, l: "Snap" }, { Icon: Mic, l: "Voice" }, { Icon: Search, l: "Search & log" }].map((m) => (
            <div key={m.l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: BG, border: "1px solid " + BORDER, borderRadius: 14, padding: "12px 0", cursor: "pointer" }}>
              <m.Icon size={18} color={TEXT} strokeWidth={1.9} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: TEXT }}>{m.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Meal divisions */}
      <div style={{ padding: "16px 22px 20px" }}>
        {eatDivisions.map((d) => {
          const loggedCal = d.logged.reduce((s, x) => s + x.cal, 0);
          return (
            <div key={d.id} style={{ background: BG, border: "1px solid " + BORDER, borderRadius: 16, padding: "14px 16px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{d.time}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>
                    {isPaid && eatState !== "ft" ? loggedCal + " of " + d.target + " cal" : loggedCal > 0 ? loggedCal + " cal logged" : "Nothing logged yet"}
                  </div>
                </div>
                <button style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid " + GREEN, background: BG, color: GREEN, fontSize: 18, cursor: "pointer", flexShrink: 0, lineHeight: 1 }}>+</button>
              </div>

              {/* logged items — live inside the division */}
              {d.logged.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + BORDER }}>
                  {d.logged.map((it, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < d.logged.length - 1 ? 8 : 0 }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Check size={11} color="#fff" strokeWidth={3} />
                      </span>
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: TEXT }}>{it.food} <span style={{ color: MUTED, fontWeight: 400 }}>· {it.qty}</span></span>
                      <span style={{ fontSize: 12, color: MUTED }}>{it.cal} cal</span>
                    </div>
                  ))}
                </div>
              )}

              {/* plan suggestion — paid only */}
              {isPaid && eatState !== "ft" && d.plan.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + BORDER }}>
                  <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, color: GREEN, border: "1px solid " + GREEN, borderRadius: 6, padding: "2px 8px", marginBottom: 10 }}>
                    Your coach's plan
                  </div>
                  {d.plan.map((it, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < d.plan.length - 1 ? 9 : 0 }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #D5DBE2", flexShrink: 0 }} />
                      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: TEXT }}>
                        {it.food} <span style={{ color: MUTED, fontWeight: 400 }}>· {it.qty}</span>
                      </span>
                      <span style={{ fontSize: 12, color: MUTED }}>{it.cal} cal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const eatDetailPage = (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto", background: BG_ALT, padding: "8px 22px 20px" }}>
        {eatTab === "learn" ? (
          <div style={{ margin: "-8px -22px 0", background: BG }}>
            {/* Category header */}
            <div
              style={{
                background: "linear-gradient(180deg,#F2F4F8,#FAFBFC)",
                padding: "26px 22px 22px",
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1.15,
                  fontWeight: 600,
                  color: "#1A2233",
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                Nutrition &amp; Metabolic Health
              </div>
            </div>

            {/* Article list */}
            <div style={{ padding: "6px 22px 20px" }}>
              {[
                {
                  title: "Eating Smart: Your Guide to Balanced Nutrition for Weight…",
                  meta: "1 min read . 21 Mar 26",
                },
                {
                  title: "Is Ragi Good for Diabetes? A Simple Guide to This Powerfu…",
                  meta: "7 min read . 07 Jan 26",
                },
                {
                  title: "Is Jackfruit Good for Diabetes? The Complete Indian Guide t…",
                  meta: "10 min read . 02 Jan 26",
                },
                {
                  title: "Drink Smart, Stay Balanced: How Steady Hydration Keeps…",
                  meta: "8 min read . 24 Dec 25",
                },
                {
                  title: "Fasting & Gut Reset: How a Simple 16-Hour Pause Can R…",
                  meta: "6 min read . 18 Dec 25",
                },
              ].map((a, i, arr) => (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 16,
                      padding: "18px 0",
                    }}
                  >
                    {/* Thumbnail placeholder */}
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
                      <BookOpen size={24} color="#C6CDD6" strokeWidth={1.6} />
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
                  {i < arr.length - 1 && (
                    <div style={{ height: 1, background: BORDER }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : eatTab === "trend" ? (
          <div>
            {/* Element 0 — week selector */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: TEXT,
                  border: "1px solid " + BORDER,
                  borderRadius: 999,
                  padding: "5px 14px",
                  background: BG,
                }}
              >
                <span style={{ color: eatState === "w2" || eatState === "cg" ? TEXT : "#C6CDD6" }}>‹</span>
                This week
                <span>›</span>
              </div>
            </div>

            {/* Trend content only for completed weeks (WC, W2, CG); blank for FT/FAD/KG */}
            {(eatState === "wc" || eatState === "w2" || eatState === "cg") && (
            <>
            {/* Element 1 — Kaira interpretation (no number) */}
            <div
              style={{
                background: "linear-gradient(135deg,#EAF6EF,#F5FAF7)",
                border: "1px solid #CDE9D9",
                borderRadius: 18,
                padding: 18,
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: GREEN,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  K
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 0.5 }}>
                  YOUR WEEK, READ BY KAIRA
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: TEXT,
                  lineHeight: 1.35,
                }}
              >
                {eatState === "cg"
                  ? "Protein's stayed the gap for two weeks now, even with the changes."
                  : eatState === "w2"
                  ? "Your protein's improving, but it's still the gap to close."
                  : "Your eating was steady and balanced, protein is the one thing to work on."}
              </div>
              <div style={{ fontSize: 13, color: TEXT, marginTop: 8, lineHeight: 1.5 }}>
                {eatState === "cg"
                  ? "Your calories, carbs and fats held steady, but protein hasn't moved much across two weeks. When the small tweaks don't shift it, the meal pattern itself usually needs a rethink."
                  : eatState === "w2"
                  ? "You lifted protein from last week, nice work. Calories, carbs and fats all stayed on target. Keep nudging protein and your sufficiency climbs."
                  : "Your calories stayed steady and your carbs and fats are on target. Protein is the single thing holding your sufficiency back. Close that, and the rest follows."}
              </div>
            </div>

            {/* CG — free consultation card, under Kaira's first commentary */}
            {eatState === "cg" && (
              <div
                style={{
                  background: BG,
                  border: "1px solid " + BORDER,
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 14,
                  boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
                }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  {/* thumbnail — coach */}
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: "linear-gradient(135deg,#EAF6EF,#D6EADF)",
                      border: "1px solid #CDE9D9",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Stethoscope size={26} color={GREEN} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Gift size={13} color={GREEN} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 0.5 }}>
                        A SMALL GIFT FOR YOU
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 16,
                        fontWeight: 600,
                        color: TEXT,
                        lineHeight: 1.3,
                      }}
                    >
                      A free consult, on us
                    </div>
                    <div style={{ fontSize: 12.5, color: MUTED, marginTop: 4, lineHeight: 1.45 }}>
                      Let a GoodFlip coach help you crack the protein gap for good.
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 14,
                    background: GREEN,
                    color: "#fff",
                    textAlign: "center",
                    borderRadius: 12,
                    padding: "12px 0",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Claim my free consult →
                </div>
              </div>
            )}

            {/* Element 2 — the number + graph */}
            <div
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                marginBottom: 14,
                boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your sufficiency this week</span>
                {eatState === "w2" && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>▲ up from 61%</span>
                )}
                {eatState === "cg" && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#C0632F" }}>≈ same as last week</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
                <span style={{ fontSize: 40, fontWeight: 700, color: TEXT, lineHeight: 1 }}>68</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: MUTED }}>%</span>
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 6, lineHeight: 1.45 }}>
                This is how well this week's meals met your weekly targets, not your overall goal. Your bigger goal lives in Measure.
              </div>

              {/* simple 7-day bar graph */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginTop: 18, position: "relative" }}>
                {/* goal reference line */}
                <div style={{ position: "absolute", top: 30, left: 0, right: 0, borderTop: "1px dashed #C6CDD6" }} />
                {[
                  { d: "M", h: 70, logged: true },
                  { d: "T", h: 82, logged: true },
                  { d: "W", h: 60, logged: true },
                  { d: "T", h: 75, logged: true },
                  { d: "F", h: 88, logged: true },
                  { d: "S", h: 45, logged: false },
                  { d: "S", h: 30, logged: false },
                ].map((b, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                    <div
                      style={{
                        width: "100%",
                        height: b.h + "%",
                        borderRadius: 6,
                        background: b.logged ? GREEN : "transparent",
                        border: b.logged ? "none" : "1.5px dashed #B8C0CA",
                      }}
                    />
                    <span style={{ fontSize: 10, color: MUTED, marginTop: 6 }}>{b.d}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 10, lineHeight: 1.45 }}>
                Lighter days are ones you didn't log. The line shows direction, not a perfect score.
              </div>
            </div>

            {/* Element 3 — what went well */}
            <div
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                marginBottom: 14,
                boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>What went well</div>
              {[
                "You logged 5 of 7 days, enough to see a real pattern.",
                "Calories stayed steady, no big spikes.",
                "Carbs and fats both on target.",
              ].map((p) => (
                <div key={p} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
                  <Check size={15} color={GREEN} strokeWidth={2.6} style={{ marginTop: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.45 }}>{p}</span>
                </div>
              ))}
            </div>

            {/* Element 3b — the gap + action, clubbed */}
            <div
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                marginBottom: 14,
                boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 8 }}>
                The one gap, and how to close it
              </div>
              <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>
                Your protein averaged <strong>71g a day</strong> against your <strong>94g daily target</strong>, a bit short most days, especially at lunch.
              </div>
              <div
                style={{
                  marginTop: 12,
                  background: BG_ALT,
                  border: "1px solid " + BORDER,
                  borderRadius: 12,
                  padding: 12,
                  display: "flex",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: GREEN,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  K
                </div>
                <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>
                  Add one protein anchor at lunch twice next week, dal, curd, paneer, eggs, or chicken. That single change should lift your sufficiency the most, even on days you don't log perfectly.
                </div>
              </div>
            </div>

            {/* Element 4 — macro pattern, daily averages */}
            <div
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                marginBottom: 14,
                boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your daily averages this week</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2, marginBottom: 14 }}>
                Averages across the days you logged.
              </div>
              {[
                { l: "Protein", v: "71g / 94g a day", pct: 75, short: true },
                { l: "Carbs", v: "214g / 236g a day", pct: 91, short: false },
                { l: "Fats", v: "48g / 62g a day", pct: 77, short: false },
              ].map((m) => (
                <div key={m.l} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{m.l}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: m.short ? "#B5852A" : TEXT }}>{m.v}</span>
                  </div>
                  <div style={{ height: 8, background: BG_ALT, borderRadius: 4, overflow: "hidden", border: "1px solid " + BORDER }}>
                    <div style={{ width: m.pct + "%", height: "100%", background: m.short ? "#C9962F" : GREEN }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Element 5 — forward hook */}
            <div
              style={{
                background: "#344054",
                borderRadius: 18,
                padding: 18,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                Next week
              </div>
              <div style={{ fontSize: 12.5, color: "#8FD9B8", lineHeight: 1.5 }}>
                {eatState === "w2"
                  ? "Log next week and let's see if you can beat 68%. I'll track whether the lunch fix is working."
                  : "Log through next week and I'll show you if that lunch change lifts your protein. Let's build on this."}
              </div>
            </div>
            </>
            )}
          </div>
        ) : (
          eatTodayView
        )}
      </div>

      {/* Eat bottom nav: Back · Eat · Trend · Learn */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "10px 6px 22px",
          background: BG,
          borderTop: "1px solid " + BORDER,
        }}
      >
        <button
          onClick={() => setEatDetail(false)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={22} color={MUTED} strokeWidth={1.8} />
          <span style={{ fontSize: 11, fontWeight: 500, color: MUTED }}>Back</span>
        </button>

        <button
          onClick={() => setEatTab("today")}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Utensils
            size={22}
            color={eatTab === "today" ? GREEN : MUTED}
            strokeWidth={eatTab === "today" ? 2.4 : 1.8}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: eatTab === "today" ? 700 : 500,
              color: eatTab === "today" ? GREEN : MUTED,
            }}
          >
            Eat
          </span>
        </button>

        <button
          onClick={() => setEatTab("trend")}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <TrendingUp
            size={22}
            color={eatTab === "trend" ? GREEN : MUTED}
            strokeWidth={eatTab === "trend" ? 2.4 : 1.8}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: eatTab === "trend" ? 700 : 500,
              color: eatTab === "trend" ? GREEN : MUTED,
            }}
          >
            Trend
          </span>
        </button>

        <button
          onClick={() => setEatTab("learn")}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <BookOpen
            size={22}
            color={eatTab === "learn" ? GREEN : MUTED}
            strokeWidth={eatTab === "learn" ? 2.4 : 1.8}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: eatTab === "learn" ? 700 : 500,
              color: eatTab === "learn" ? GREEN : MUTED,
            }}
          >
            Learn
          </span>
        </button>
      </div>
    </div>
  );

  const progressTabs = [
    { id: "achieve", label: "Achieve" },
    { id: "medScore", label: "MET Score" },
    { id: "vitals", label: "Vitals" },
  ];

  const progressPage = (
    <div>
      {/* Top tab bar — underline style */}
      <div
        style={{
          display: "flex",
          padding: "4px 12px 0",
          background: BG_ALT,
          borderBottom: "1px solid " + BORDER,
        }}
      >
        {progressTabs.map((t) => {
          const active = progressTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setProgressTab(t.id)}
              style={{
                flex: 1,
                fontSize: 15,
                fontWeight: active ? 700 : 500,
                padding: "12px 0 14px",
                background: "none",
                border: "none",
                borderBottom:
                  "2.5px solid " + (active ? GREEN : "transparent"),
                color: active ? TEXT : MUTED,
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ padding: "16px 22px 28px" }}>
        {progressTab === "achieve" ? (
          <div>
            {/* Time-range toggle */}
            <div
              style={{
                display: "flex",
                gap: 6,
                background: BG_ALT,
                border: "1px solid " + BORDER,
                borderRadius: 999,
                padding: 4,
                marginBottom: 16,
              }}
            >
              {[
                { id: "week", label: "This week" },
                { id: "month", label: "This month" },
                { id: "custom", label: "Custom" },
              ].map((r) => {
                const active = achieveRange === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setAchieveRange(r.id)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      padding: "7px 0",
                      borderRadius: 999,
                      border: "none",
                      background: active ? BG : "transparent",
                      color: active ? TEXT : MUTED,
                      cursor: "pointer",
                      boxShadow: active ? "0 1px 4px rgba(52,64,84,0.12)" : "none",
                    }}
                  >
                    {r.id === "custom" && <Calendar size={12} color={active ? GREEN : MUTED} />}
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* Element 1 — Kaira cumulative read */}
            <div
              style={{
                background: "linear-gradient(135deg,#EAF6EF,#F5FAF7)",
                border: "1px solid #CDE9D9",
                borderRadius: 18,
                padding: 18,
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: GREEN,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  K
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 0.5 }}>
                  YOUR WEEK ACROSS EAT, MOVE, MIND
                </span>
              </div>
              <div style={{ fontSize: 13.5, color: TEXT, lineHeight: 1.5 }}>
                Your nutrition sufficiency climbed this week, and it lined up with the days you moved more. Sleep was the one thing that slipped, and that's likely why the last couple of days felt harder.
              </div>
            </div>

            {/* Element 2 — cumulative graph, 3 blended pillar lines */}
            <div
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                marginBottom: 14,
                boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Everything you're tracking, together</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2, marginBottom: 14 }}>
                Each line shows how close you got to your goal that week. Tap a pillar to see what's inside.
              </div>

              {/* legend (tappable pillars) */}
              <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                {[
                  { l: "Eat", c: GREEN },
                  { l: "Move", c: "#3B82C4" },
                  { l: "Mind", c: "#8B6FC4" },
                ].map((p) => (
                  <div key={p.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 20, height: 3, borderRadius: 2, background: p.c }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{p.l}</span>
                    <ChevronRight size={12} color={MUTED} />
                  </div>
                ))}
              </div>

              {/* multi-line chart (SVG) */}
              <svg viewBox="0 0 300 150" style={{ width: "100%", height: "auto" }}>
                {/* horizontal gridlines */}
                {[0, 37.5, 75, 112.5, 150].map((y, i) => (
                  <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#EEF0F3" strokeWidth="1" />
                ))}
                {/* Eat line */}
                <polyline
                  fill="none"
                  stroke={GREEN}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,95 60,80 120,70 180,55 240,48 300,40"
                />
                {/* Move line */}
                <polyline
                  fill="none"
                  stroke="#3B82C4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,70 60,72 120,60 180,66 240,58 300,62"
                />
                {/* Mind line */}
                <polyline
                  fill="none"
                  stroke="#8B6FC4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,60 60,66 120,72 180,80 240,92 300,98"
                />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {["W1", "W2", "W3", "W4", "W5", "Now"].map((w) => (
                  <span key={w} style={{ fontSize: 10, color: MUTED }}>{w}</span>
                ))}
              </div>
            </div>

            {/* Element 3 — the averages (honest metrics) */}
            <div
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                marginBottom: 14,
                boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 14 }}>This week's averages</div>
              {[
                { pillar: "Eat", c: GREEN, metrics: [{ l: "Nutrition sufficiency", v: "68%", up: true }] },
                { pillar: "Move", c: "#3B82C4", metrics: [{ l: "Steps / day", v: "6,200", up: true }, { l: "Exercises logged", v: "3", up: false }] },
                { pillar: "Mind", c: "#8B6FC4", metrics: [{ l: "Sleep / night", v: "6h 40m", up: false }, { l: "Breathing sessions", v: "2", up: true }] },
              ].map((p) => (
                <div key={p.pillar} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 14, height: 3, borderRadius: 2, background: p.c }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{p.pillar}</span>
                  </div>
                  {p.metrics.map((m) => (
                    <div key={m.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
                      <span style={{ fontSize: 12.5, color: MUTED }}>{m.l}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                        {m.v}{" "}
                        <span style={{ color: m.up ? GREEN : "#C0632F", fontSize: 11 }}>{m.up ? "↑" : "↓"}</span>
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Element 4 — how to improve (denominator-driven) */}
            <div
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>How to improve</div>
              {[
                { pillar: "Eat", c: GREEN, text: "You're 515 kcal under your TDEE target most days, and protein is the gap. Add one protein anchor at lunch." },
                { pillar: "Move", c: "#3B82C4", text: "Steps averaged 6,200 against your 8,000 goal. A 15-minute walk after lunch closes most of it." },
                { pillar: "Mind", c: "#8B6FC4", text: "You're averaging 6h 40m against your 7h 30m need. A fixed wake-up time is the easiest lever." },
              ].map((p) => (
                <div key={p.pillar} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 3, borderRadius: 2, background: p.c, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{p.pillar}</div>
                    <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{p.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
        <div
          style={{
            background: BG,
            border: "1px dashed #D4DAE2",
            borderRadius: 16,
            minHeight: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            textAlign: "center",
            color: MUTED,
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        >
          {progressTabs.find((t) => t.id === progressTab)?.label} content will
          come over here.
        </div>
        )}
      </div>
    </div>
  );

  const msPage = (
    <div style={{ padding: "16px 22px 28px" }}>
      {msDetail === "score" ? (
        /* ---------- Detail: MET score week by week ---------- */
        <div>
          <button
            onClick={() => setMsDetail(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              padding: 0,
              marginBottom: 16,
              color: TEXT,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={18} /> Back
          </button>

          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
            How your MET Score has moved
          </div>
          <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 18, lineHeight: 1.5 }}>
            Week by week, with what changed each week.
          </div>

          {/* Score trend graph */}
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: 16,
              marginBottom: 16,
              boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
            }}
          >
            <svg viewBox="0 0 300 140" style={{ width: "100%", height: "auto" }}>
              {[0, 35, 70, 105, 140].map((y, i) => (
                <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#EEF0F3" strokeWidth="1" />
              ))}
              <polyline
                fill="none"
                stroke={GREEN}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="0,105 60,98 120,100 180,80 240,72 300,58"
              />
              {[
                [0, 105], [60, 98], [120, 100], [180, 80], [240, 72], [300, 58],
              ].map(([cx, cy], i) => (
                <circle key={i} cx={cx} cy={cy} r="3.5" fill={BG} stroke={GREEN} strokeWidth="2" />
              ))}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {["W1", "W2", "W3", "W4", "W5", "Now"].map((w) => (
                <span key={w} style={{ fontSize: 10, color: MUTED }}>{w}</span>
              ))}
            </div>
          </div>

          {/* Week-by-week change list */}
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: 16,
              boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>
              Week by week
            </div>
            {[
              { w: "This week", v: "68", d: "+4", dir: "up", note: "Eat and Move both improved." },
              { w: "Last week", v: "64", d: "+3", dir: "up", note: "Steps picked up mid-week." },
              { w: "W4", v: "61", d: "0", dir: "same", note: "No real change." },
              { w: "W3", v: "61", d: "−2", dir: "down", note: "Sleep dropped for four nights." },
              { w: "W2", v: "63", d: "+1", dir: "up", note: "First full week of logging." },
            ].map((r) => (
              <div
                key={r.w}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid " + BORDER,
                }}
              >
                <div style={{ width: 74, flexShrink: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT }}>{r.w}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>Score {r.v}</div>
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    flexShrink: 0,
                    width: 30,
                    color:
                      r.dir === "up" ? GREEN : r.dir === "down" ? "#C0632F" : MUTED,
                  }}
                >
                  {r.dir === "up" ? "↑" : r.dir === "down" ? "↓" : "—"} {r.d}
                </div>
                <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.45 }}>{r.note}</div>
              </div>
            ))}
          </div>
        </div>
      ) : msDetail === "pillars" ? (
        /* ---------- Detail: Eat / Move / Mind ---------- */
        <div>
          <button
            onClick={() => setMsDetail(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              padding: 0,
              marginBottom: 16,
              color: TEXT,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={18} /> Back
          </button>

          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
            Eat, Move, Mind this week
          </div>
          <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 18, lineHeight: 1.5 }}>
            The three daily movers behind your score.
          </div>

          {/* Three separate line graphs */}
          {[
            { p: "Eat", c: GREEN, pts: "0,95 60,80 120,70 180,55 240,48 300,40", sub: "Nutrition sufficiency" },
            { p: "Move", c: "#3B82C4", pts: "0,70 60,72 120,60 180,66 240,58 300,62", sub: "Steps & activity" },
            { p: "Mind", c: "#8B6FC4", pts: "0,60 60,66 120,72 180,80 240,92 300,98", sub: "Sleep & breathing" },
          ].map((g) => (
            <div
              key={g.p}
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 16,
                marginBottom: 14,
                boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <div style={{ width: 16, height: 3, borderRadius: 2, background: g.c }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{g.p}</span>
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>{g.sub}</div>
              <svg viewBox="0 0 300 110" style={{ width: "100%", height: "auto" }}>
                {[0, 36, 72, 108].map((y, i) => (
                  <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#EEF0F3" strokeWidth="1" />
                ))}
                <polyline
                  fill="none"
                  stroke={g.c}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={g.pts}
                />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: MUTED }}>{d}</span>
                ))}
              </div>
            </div>
          ))}

          {/* This week's averages */}
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: 16,
              marginBottom: 14,
              boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 14 }}>
              This week's averages
            </div>
            {[
              { pillar: "Eat", c: GREEN, metrics: [{ l: "Nutrition sufficiency", v: "68%", up: true }] },
              { pillar: "Move", c: "#3B82C4", metrics: [{ l: "Steps / day", v: "6,200", up: true }, { l: "Exercises logged", v: "3", up: false }] },
              { pillar: "Mind", c: "#8B6FC4", metrics: [{ l: "Sleep / night", v: "6h 40m", up: false }, { l: "Breathing sessions", v: "2", up: true }] },
            ].map((p) => (
              <div key={p.pillar} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <div style={{ width: 14, height: 3, borderRadius: 2, background: p.c }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{p.pillar}</span>
                </div>
                {p.metrics.map((m) => (
                  <div key={m.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0" }}>
                    <span style={{ fontSize: 12.5, color: MUTED }}>{m.l}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                      {m.v}{" "}
                      <span style={{ color: m.up ? GREEN : "#C0632F", fontSize: 11 }}>{m.up ? "↑" : "↓"}</span>
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* How to improve */}
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: 16,
              boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 12 }}>How to improve</div>
            {[
              { pillar: "Eat", c: GREEN, text: "You're 515 kcal under your TDEE target most days, and protein is the gap. Add one protein anchor at lunch." },
              { pillar: "Move", c: "#3B82C4", text: "Steps averaged 6,200 against your 8,000 goal. A 15-minute walk after lunch closes most of it." },
              { pillar: "Mind", c: "#8B6FC4", text: "You're averaging 6h 40m against your 7h 30m need. A fixed wake-up time is the easiest lever." },
            ].map((p) => (
              <div key={p.pillar} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 3, borderRadius: 2, background: p.c, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{p.pillar}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>{p.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ---------- MS main ---------- */
        <>
          {/* 0 — Goal anchor */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
              Losing weight
            </div>
            <div style={{ width: 3, height: 3, borderRadius: "50%", background: MUTED }} />
            <div style={{ fontSize: 12.5, color: MUTED }}>Week 3 of 26</div>
          </div>

          {/* 1 — Snapshot: where the score stands now */}
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: "20px 16px 16px",
              marginBottom: 16,
              boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.6, textAlign: "center", marginBottom: 12 }}>
              YOUR MET SCORE TODAY
            </div>

            {/* Score ring */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ position: "relative", width: 148, height: 148 }}>
                <svg width="148" height="148" viewBox="0 0 148 148">
                  <circle cx="74" cy="74" r="62" fill="none" stroke="#EEF0F3" strokeWidth="12" />
                  <circle
                    cx="74" cy="74" r="62" fill="none"
                    stroke={GREEN} strokeWidth="12" strokeLinecap="round"
                    strokeDasharray="390" strokeDashoffset="125"
                    transform="rotate(-90 74 74)"
                  />
                </svg>
                <div
                  style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <div style={{ fontSize: 40, fontWeight: 800, color: TEXT, lineHeight: 1 }}>68</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>out of 100 · Good</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: GREEN, marginTop: 4 }}>↑ 4 this week</div>
                </div>
              </div>
            </div>

            <div style={{ fontSize: 11, color: MUTED, textAlign: "center", marginBottom: 14 }}>
              Built from 3 of 4 inputs
            </div>

            {/* 4 components */}
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { l: "Eat", v: "72", c: GREEN, locked: false },
                { l: "Move", v: "64", c: "#3B82C4", locked: false },
                { l: "Mind", v: "58", c: "#8B6FC4", locked: false },
                { l: "Body", v: null, c: MUTED, locked: true },
              ].map((c) => (
                <div
                  key={c.l}
                  style={{
                    flex: 1,
                    background: BG_ALT,
                    border: "1px solid " + BORDER,
                    borderRadius: 12,
                    padding: "10px 4px",
                    textAlign: "center",
                  }}
                >
                  {c.locked ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.8" style={{ margin: "3px auto 5px", display: "block" }}>
                      <rect x="4" y="10" width="16" height="11" rx="2.5" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                  ) : (
                    <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginBottom: 2 }}>{c.v}</div>
                  )}
                  <div style={{ fontSize: 10, fontWeight: 600, color: MUTED }}>{c.l}</div>
                  <div style={{ height: 3, borderRadius: 2, background: c.locked ? "#E8EBEE" : c.c, marginTop: 6 }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, marginTop: 10 }}>
              Eat, Move and Mind move your score daily. Body unlocks with a scan, a smart scale, a CGM or a lab test.
            </div>
          </div>

          {/* 2 — What moves it today (the only action on this screen) */}
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: 16,
              marginBottom: 16,
              boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.6, marginBottom: 8 }}>
              WHAT MOVES IT TODAY
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, lineHeight: 1.35, marginBottom: 6 }}>
              Your biggest lever right now is sleep.
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
              Mind is your lowest component at 58. It's the one part of your score
              that's been sliding all week.
            </div>
            <button
              onClick={() => setActiveTab("track")}
              style={{
                width: "100%",
                background: GREEN,
                border: "none",
                borderRadius: 12,
                padding: "11px 0",
                color: "#fff",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Go to today's tasks →
            </button>
          </div>

          {/* 3 — Time range */}
          <div
            style={{
              display: "flex",
              gap: 6,
              background: BG_ALT,
              border: "1px solid " + BORDER,
              borderRadius: 999,
              padding: 4,
              marginBottom: 16,
            }}
          >
            {[
              { id: "week", label: "This week" },
              { id: "month", label: "This month" },
              { id: "custom", label: "Custom" },
            ].map((r) => {
              const active = msRange === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setMsRange(r.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    padding: "7px 0",
                    borderRadius: 999,
                    border: "none",
                    background: active ? BG : "transparent",
                    color: active ? TEXT : MUTED,
                    cursor: "pointer",
                    boxShadow: active ? "0 1px 4px rgba(52,64,84,0.12)" : "none",
                  }}
                >
                  {r.id === "custom" && <Calendar size={12} color={active ? GREEN : MUTED} />}
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* 3 — MET score movement */}
          <div
            onClick={() => setMsDetail("score")}
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: 16,
              marginBottom: 14,
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your score this week</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Moved from 64 to 68</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: GREEN }}>↑ 4</span>
                <ChevronRight size={18} color={MUTED} />
              </div>
            </div>

            <svg viewBox="0 0 300 90" style={{ width: "100%", height: "auto" }}>
              {[0, 30, 60, 90].map((y, i) => (
                <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#EEF0F3" strokeWidth="1" />
              ))}
              <polyline
                fill="none" stroke={GREEN} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                points="0,66 50,62 100,64 150,50 200,46 250,40 300,34"
              />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, marginBottom: 12 }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} style={{ fontSize: 10, color: MUTED }}>{d}</span>
              ))}
            </div>

            {/* Kaira commentary */}
            <div
              style={{
                background: "linear-gradient(135deg,#EAF6EF,#F5FAF7)",
                border: "1px solid #CDE9D9",
                borderRadius: 14,
                padding: 12,
                display: "flex",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 22, height: 22, flexShrink: 0, borderRadius: "50%",
                  background: GREEN, display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#fff", fontSize: 11,
                  fontWeight: 600, fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                K
              </div>
              <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>
                Four points up — your best week yet. Most of it came from eating more consistently, not from any one big day.
              </div>
            </div>
          </div>

          {/* 4 — Eat / Move / Mind movement */}
          <div
            onClick={() => setMsDetail("pillars")}
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: 16,
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>What moved it</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>These are what you do — Eat, Move and Mind this week</div>
              </div>
              <ChevronRight size={18} color={MUTED} />
            </div>

            {/* legend */}
            <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
              {[
                { l: "Eat", c: GREEN, d: "↑" },
                { l: "Move", c: "#3B82C4", d: "↑" },
                { l: "Mind", c: "#8B6FC4", d: "↓" },
              ].map((p) => (
                <div key={p.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 18, height: 3, borderRadius: 2, background: p.c }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{p.l}</span>
                  <span style={{ fontSize: 11, color: p.d === "↑" ? GREEN : "#C0632F" }}>{p.d}</span>
                </div>
              ))}
            </div>

            <svg viewBox="0 0 300 130" style={{ width: "100%", height: "auto" }}>
              {[0, 32.5, 65, 97.5, 130].map((y, i) => (
                <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#EEF0F3" strokeWidth="1" />
              ))}
              <polyline fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                points="0,85 50,72 100,64 150,50 200,44 250,38 300,32" />
              <polyline fill="none" stroke="#3B82C4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                points="0,66 50,68 100,56 150,62 200,54 250,50 300,58" />
              <polyline fill="none" stroke="#8B6FC4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                points="0,54 50,60 100,66 150,74 200,86 250,90 300,96" />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, marginBottom: 12 }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} style={{ fontSize: 10, color: MUTED }}>{d}</span>
              ))}
            </div>

            {/* Kaira commentary */}
            <div
              style={{
                background: "linear-gradient(135deg,#EAF6EF,#F5FAF7)",
                border: "1px solid #CDE9D9",
                borderRadius: 14,
                padding: 12,
                display: "flex",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 22, height: 22, flexShrink: 0, borderRadius: "50%",
                  background: GREEN, display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#fff", fontSize: 11,
                  fontWeight: 600, fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                K
              </div>
              <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>
                Eat climbed steadily and Move followed it. Mind slipped all week — sleep is the one holding your score back.
              </div>
            </div>
          </div>

          {/* 6 — Your body's side of the story (pre-framed, not a padlock) */}
          <div
            style={{
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 18,
              padding: 16,
              marginTop: 14,
              marginBottom: 14,
              boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 6 }}>
              Your body's side of the story
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55, marginBottom: 10 }}>
              Right now your score reflects your habits. A scan, a smart scale, a
              CGM or a lab test adds what your body is actually doing — and the two
              don't always agree. That gap is the useful part.
            </div>
            <div
              style={{
                fontSize: 11.5,
                fontStyle: "italic",
                color: TEXT,
                lineHeight: 1.5,
                background: BG_ALT,
                border: "1px solid " + BORDER,
                borderRadius: 12,
                padding: "10px 12px",
                marginBottom: 14,
              }}
            >
              Adding Body data may move your score up or down. Either way, it
              becomes a measurement instead of an estimate.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Take a scan", "Book a lab test"].map((c, i) => (
                <button
                  key={c}
                  style={{
                    flex: 1,
                    background: i === 0 ? GREEN : BG,
                    border: i === 0 ? "none" : "1px solid " + GREEN,
                    borderRadius: 12,
                    padding: "11px 0",
                    color: i === 0 ? "#fff" : GREEN,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {c} →
                </button>
              ))}
            </div>
          </div>

          {/* 7 — Explore your measurements (reference catalogue) */}
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
            Explore your measurements
          </div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginBottom: 12 }}>
            Everything GoodFlip can measure. Not all of it feeds your score.
          </div>
          {[
            { l: "CGM Analytics", d: "Glucose spikes, dips and time in range", s: "Connect a CGM" },
            { l: "Cardiovascular Health", d: "Heart rate, blood pressure, circulation", s: "7 of 10 measured" },
            { l: "Body Composition", d: "Fat, muscle, water and metabolic age", s: "Connect a smart scale" },
            { l: "Advanced Health Metrics", d: "HRV and deeper physiological markers", s: "3 of 3 measured" },
            { l: "Well-being and Stress", d: "Stress, sleep quality and breathing", s: "1 of 3 measured" },
            { l: "Lab Report Results", d: "Upload a report and we'll read it for you", s: "Upload a report" },
          ].map((c) => (
            <div
              key={c.l}
              style={{
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 14,
                padding: "13px 14px",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{c.l}</div>
                <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.4 }}>{c.d}</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 5, fontWeight: 600 }}>{c.s}</div>
              </div>
              <ChevronRight size={18} color={MUTED} />
            </div>
          ))}
        </>
      )}
    </div>
  );

  const a1Page = (
    <div style={{ padding: "16px 22px 28px" }}>
      {a1Detail === "movers" ? (
        /* ---------- Detail: daily movers ---------- */
        <div>
          <button
            onClick={() => setA1Detail(null)}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "none",
              border: "none", padding: 0, marginBottom: 16, color: TEXT,
              fontSize: 13.5, fontWeight: 600, cursor: "pointer",
            }}
          >
            <ChevronLeft size={18} /> Back
          </button>

          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
            Your daily movers
          </div>
          <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 18, lineHeight: 1.5 }}>
            Eat, Move and Mind this week — and what Kaira makes of each.
          </div>

          {[
            {
              p: "Eat", c: GREEN, pts: "0,95 50,80 100,70 150,62 200,55 250,48 300,40",
              stat: "72% avg sufficiency", delta: "↑ 11%",
              read: "Your most consistent week yet. Protein was short on six of seven days — your best days all had a protein anchor at lunch. Start there rather than changing dinner.",
            },
            {
              p: "Move", c: "#3B82C4", pts: "0,70 50,72 100,60 150,66 200,58 250,50 300,62",
              stat: "6,200 steps / day", delta: "↑ 700",
              read: "You moved more on the days you ate better — those two travel together for you. Three workouts logged, all before 9am, which seems to be when it actually happens.",
            },
            {
              p: "Mind", c: "#8B6FC4", pts: "0,60 50,60 100,60 150,60 200,60 250,60 300,60",
              stat: "1 night logged", delta: "—",
              read: "This line is mostly blank because sleep went unlogged. Log even three nights and I can tell you whether short sleep is what's driving your protein-poor days.",
            },
          ].map((g) => (
            <div
              key={g.p}
              style={{
                background: BG, border: "1px solid " + BORDER, borderRadius: 18,
                padding: 16, marginBottom: 14,
                boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 16, height: 3, borderRadius: 2, background: g.c }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, flex: 1 }}>{g.p}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT }}>{g.stat}</span>
                <span style={{ fontSize: 11.5, color: g.delta === "—" ? MUTED : GREEN }}>{g.delta}</span>
              </div>
              <svg viewBox="0 0 300 100" style={{ width: "100%", height: "auto" }}>
                {[0, 33, 66, 99].map((y, i) => (
                  <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#EEF0F3" strokeWidth="1" />
                ))}
                <polyline
                  fill="none" stroke={g.c} strokeWidth="2.5"
                  strokeDasharray={g.p === "Mind" ? "5 5" : "0"}
                  strokeLinecap="round" strokeLinejoin="round" points={g.pts}
                />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0 12px" }}>
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i} style={{ fontSize: 10, color: MUTED }}>{d}</span>
                ))}
              </div>
              <div
                style={{
                  background: "linear-gradient(135deg,#EAF6EF,#F5FAF7)",
                  border: "1px solid #CDE9D9", borderRadius: 14, padding: 12,
                  display: "flex", gap: 10,
                }}
              >
                <div
                  style={{
                    width: 22, height: 22, flexShrink: 0, borderRadius: "50%",
                    background: GREEN, display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >K</div>
                <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>{g.read}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ---------- A1 main ---------- */
        <>
          {/* 1 — Range chips */}
          <div
            style={{
              display: "flex", gap: 6, background: BG_ALT,
              border: "1px solid " + BORDER, borderRadius: 999,
              padding: 4, marginBottom: 16,
            }}
          >
            {[
              { id: "week", label: "This week" },
              { id: "month", label: "This month" },
              { id: "custom", label: "Custom" },
            ].map((r) => {
              const active = msRange === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setMsRange(r.id)}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 4, fontSize: 12, fontWeight: active ? 700 : 500, padding: "7px 0",
                    borderRadius: 999, border: "none",
                    background: active ? BG : "transparent",
                    color: active ? TEXT : MUTED, cursor: "pointer",
                    boxShadow: active ? "0 1px 4px rgba(52,64,84,0.12)" : "none",
                  }}
                >
                  {r.id === "custom" && <Calendar size={12} color={active ? GREEN : MUTED} />}
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* 2 — Kaira's summary of the week */}
          <div
            style={{
              background: "linear-gradient(135deg,#EAF6EF,#F7FBF9)",
              border: "1px solid #CDE9D9", borderRadius: 18,
              padding: 16, marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div
                style={{
                  width: 26, height: 26, borderRadius: "50%", background: GREEN,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >K</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your week, read by Kaira</div>
            </div>

            <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.6, marginBottom: 14 }}>
              You logged 19 meals — your most consistent week yet, and sufficiency
              held above 70% on five days. But protein came up short six days
              running, and that's the thread running through everything else: your
              two lowest-energy days both followed your two lowest-protein days.
            </div>

            {/* Correlation chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {["Why protein matters for you", "Food vs. energy", "What changed from last week"].map((c) => (
                <button
                  key={c}
                  style={{
                    fontSize: 11.5, fontWeight: 600, padding: "7px 12px",
                    borderRadius: 999, border: "1px solid " + GREEN,
                    background: BG, color: GREEN, cursor: "pointer",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Capability gap inside the summary */}
            <div
              style={{
                background: BG, border: "1px solid " + BORDER,
                borderRadius: 14, padding: 12,
              }}
            >
              <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5, marginBottom: 10 }}>
                Six weeks of the same protein gap is a pattern worth a human eye.
              </div>
              <button
                style={{
                  width: "100%", background: GREEN, border: "none", borderRadius: 10,
                  padding: "10px 0", color: "#fff", fontSize: 12.5, fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Book a free consultation →
              </button>
            </div>
          </div>

          {/* 3 — Daily movers, combined graph */}
          <div
            onClick={() => setA1Detail("movers")}
            style={{
              background: BG, border: "1px solid " + BORDER, borderRadius: 18,
              padding: 16, marginBottom: 20, cursor: "pointer",
              boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your daily movers</div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Eat, Move and Mind this week</div>
              </div>
              <ChevronRight size={18} color={MUTED} />
            </div>

            <div style={{ display: "flex", gap: 14, marginBottom: 12 }}>
              {[
                { l: "Eat", c: GREEN, d: "↑" },
                { l: "Move", c: "#3B82C4", d: "↑" },
                { l: "Mind", c: "#8B6FC4", d: "—" },
              ].map((p) => (
                <div key={p.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 18, height: 3, borderRadius: 2, background: p.c }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{p.l}</span>
                  <span style={{ fontSize: 11, color: p.d === "↑" ? GREEN : MUTED }}>{p.d}</span>
                </div>
              ))}
            </div>

            <svg viewBox="0 0 300 130" style={{ width: "100%", height: "auto" }}>
              {[0, 32.5, 65, 97.5, 130].map((y, i) => (
                <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="#EEF0F3" strokeWidth="1" />
              ))}
              <polyline fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                points="0,95 50,80 100,70 150,62 200,55 250,48 300,40" />
              <polyline fill="none" stroke="#3B82C4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                points="0,70 50,72 100,60 150,66 200,58 250,50 300,62" />
              <polyline fill="none" stroke="#8B6FC4" strokeWidth="2.5" strokeDasharray="5 5"
                strokeLinecap="round" strokeLinejoin="round"
                points="0,84 50,84 100,84 150,84 200,84 250,84 300,84" />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0 12px" }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} style={{ fontSize: 10, color: MUTED }}>{d}</span>
              ))}
            </div>

            <div
              style={{
                background: "linear-gradient(135deg,#EAF6EF,#F5FAF7)",
                border: "1px solid #CDE9D9", borderRadius: 14, padding: 12,
                display: "flex", gap: 10,
              }}
            >
              <div
                style={{
                  width: 22, height: 22, flexShrink: 0, borderRadius: "50%", background: GREEN,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 11, fontWeight: 700,
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >K</div>
              <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>
                Eat and Move climbed together — they usually do for you. Mind is the
                dotted line: you logged sleep once, so there's little to read. Log
                even three nights and I can tell you whether short sleep is driving
                your protein-poor days.
              </div>
            </div>
          </div>

          {/* 4 — Nudge cards: make Kaira's insights richer */}
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
            Make your insights richer
          </div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, marginBottom: 12 }}>
            Each of these gives Kaira something new to work with.
          </div>

          {[
            {
              icon: "hex",
              h: "Get your metabolic scorecard",
              s: "A full read of where your metabolism stands today — built from your habits and anything you've measured. Kaira uses it as the baseline for everything else.",
              cta: "Get your scorecard",
            },
            {
              icon: "vial",
              h: "Add your lab report",
              s: "Your logs show what you eat. A lab report shows what your body is doing with it — and lets Kaira connect the two.",
              cta: "Upload a report",
            },
            {
              icon: "cgm",
              h: "See your sugar spikes",
              s: "Most of what you logged this week digests fast. A CGM shows what that actually does to you, so swaps become obvious instead of theoretical.",
              cta: "Explore CGM",
            },
            {
              icon: "scale",
              h: "Know what you're losing",
              s: "Weight alone can't tell you whether you're losing fat or muscle. A smart scale can.",
              cta: "Explore smart scale",
            },
            {
              icon: "ring",
              h: "Let sleep track itself",
              s: "Sleep is the hardest thing to log and the easiest to measure. The ring fills your Mind line without you doing anything.",
              cta: "Explore ring",
            },
          ].map((c) => (
            <div
              key={c.h}
              style={{
                background: BG, border: "1px solid " + BORDER, borderRadius: 18,
                padding: 16, marginBottom: 12,
                boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div
                  style={{
                    width: 44, height: 44, flexShrink: 0, borderRadius: 12,
                    background: BG_ALT, border: "1px solid " + BORDER,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {c.icon === "hex" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.8">
                      <path d="M12 2l8 4.6v9.2L12 22l-8-4.6V6.6L12 2z" />
                    </svg>
                  ) : c.icon === "vial" ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.8">
                      <path d="M9 2h6M10 2v13a2 2 0 0 0 4 0V2" />
                    </svg>
                  ) : c.icon === "ring" ? (
                    <div style={{ width: 22, height: 22, borderRadius: "50%", border: "4px solid #C6CDD6" }} />
                  ) : c.icon === "scale" ? (
                    <div style={{ width: 22, height: 22, borderRadius: 5, border: "2px solid #C6CDD6" }} />
                  ) : (
                    <div style={{ width: 22, height: 18, borderRadius: 9, border: "2px solid #C6CDD6" }} />
                  )}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.3 }}>{c.h}</div>
              </div>
              <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55, marginBottom: 14 }}>{c.s}</div>
              <button
                style={{
                  width: "100%", background: GREEN, border: "none", borderRadius: 12,
                  padding: "11px 0", color: "#fff", fontSize: 13, fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {c.cta} →
              </button>
            </div>
          ))}

          {/* 5 — Vitals library, deliberately lighter */}
          <div
            style={{
              background: BG, border: "1px solid " + BORDER, borderRadius: 14,
              padding: "14px 16px", marginTop: 8,
              boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
              display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            }}
          >
            <Heart size={18} color={MUTED} strokeWidth={1.8} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>See your body vitals</div>
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>
                Every measurement we hold for you, in one place.
              </div>
            </div>
            <ChevronRight size={18} color={MUTED} />
          </div>
        </>
      )}
    </div>
  );

  const msa2Page = (
    <div style={{ padding: "16px 22px 28px" }}>
      {msa2Detail === "score" ? (
        /* ---------- Detail: MET score (empty for now) ---------- */
        <div>
          <button
            onClick={() => setMsa2Detail(null)}
            style={{
              display: "flex", alignItems: "center", gap: 6, background: "none",
              border: "none", padding: 0, marginBottom: 16, color: TEXT,
              fontSize: 13.5, fontWeight: 600, cursor: "pointer",
            }}
          >
            <ChevronLeft size={18} /> Back
          </button>
          <div
            style={{
              background: BG,
              border: "1px dashed #D4DAE2",
              borderRadius: 18,
              padding: "60px 20px",
              textAlign: "center",
              color: MUTED,
              fontSize: 12.5,
              lineHeight: 1.5,
            }}
          >
            MET Score detail page — to be defined.
          </div>
        </div>
      ) : (
      <>
      {/* 1 — Range tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          background: BG_ALT,
          border: "1px solid " + BORDER,
          borderRadius: 999,
          padding: 4,
          marginBottom: 16,
        }}
      >
        {[
          { id: "week", label: "Weekly" },
          { id: "month", label: "Monthly" },
          { id: "custom", label: "Custom" },
        ].map((r) => {
          const active = msRange === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setMsRange(r.id)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                padding: "7px 0",
                borderRadius: 999,
                border: "none",
                background: active ? BG : "transparent",
                color: active ? TEXT : MUTED,
                cursor: "pointer",
                boxShadow: active ? "0 1px 4px rgba(52,64,84,0.12)" : "none",
              }}
            >
              {r.id === "custom" && <Calendar size={12} color={active ? GREEN : MUTED} />}
              {r.label}
            </button>
          );
        })}
      </div>

      {/* 2 — Your MET Score this week */}
      <div
        onClick={() => setMsa2Detail("score")}
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 18,
          padding: "14px 16px",
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: MUTED,
              letterSpacing: 0.6,
            }}
          >
            YOUR MET SCORE THIS WEEK
          </span>
          <Info size={13} color={MUTED} strokeWidth={2} />
          <div style={{ flex: 1 }} />
          <ChevronRight size={18} color={MUTED} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginBottom: 12,
          }}
        >
          <TrendingUp size={15} color={GREEN} strokeWidth={2.4} />
          <span style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>+4</span>
          <span style={{ fontSize: 11, color: MUTED }}>vs last week</span>
        </div>

        {/* Score ring */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ position: "relative", width: 108, height: 108 }}>
            <svg width="108" height="108" viewBox="0 0 108 108">
              <circle cx="54" cy="54" r="45" fill="none" stroke="#EEF0F3" strokeWidth="10" />
              <circle
                cx="54"
                cy="54"
                r="45"
                fill="none"
                stroke={GREEN}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset="91"
                transform="rotate(-90 54 54)"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: TEXT, lineHeight: 1 }}>68</div>
              <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>out of 100</div>
            </div>
          </div>
        </div>

        {/* Three component tiles */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { l: "Eat", v: "72", c: GREEN },
            { l: "Move", v: "64", c: "#3B82C4" },
            { l: "Mind", v: "58", c: "#8B6FC4" },
          ].map((p) => (
            <div
              key={p.l}
              style={{
                flex: 1,
                background: BG_ALT,
                border: "1px solid " + BORDER,
                borderRadius: 12,
                padding: "10px 4px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginBottom: 2 }}>{p.v}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: MUTED }}>{p.l}</div>
              <div style={{ height: 3, borderRadius: 2, background: p.c, marginTop: 6 }} />
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, marginTop: 10 }}>
          Eat, Move and Mind move your score weekly.
        </div>
      </div>

      {/* 2 — Lab report nudge */}
      <div
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 16,
          padding: "13px 14px",
          marginTop: 12,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: 10,
            background: BG_ALT,
            border: "1px solid " + BORDER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.8">
            <path d="M9 2h6M10 2v13a2 2 0 0 0 4 0V2" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.45, marginBottom: 9 }}>
            Add your lab report to make your MET Score more insightful.
          </div>
          <button
            style={{
              background: GREEN,
              border: "none",
              borderRadius: 10,
              padding: "8px 14px",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Upload your lab report →
          </button>
        </div>
      </div>

      {/* 4 — Kaira's weekly summary */}
      <div
        style={{
          background: "linear-gradient(135deg,#EAF6EF,#F7FBF9)",
          border: "1px solid #CDE9D9",
          borderRadius: 18,
          padding: 16,
          marginTop: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            K
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your week, read by Kaira</div>
        </div>

        <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.55, marginBottom: 12 }}>
          19 meals logged, sufficiency above 70% on five days — Eat is your
          strongest at 72. Move followed at 6,200 steps a day. Mind is the drag
          at 58: you logged sleep once, so it's unmeasured more than it's poor.
        </div>

        {/* Suggestion chips — horizontal scroll */}
        <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 0.5, marginBottom: 8 }}>
          TO MOVE YOUR SCORE NEXT WEEK
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            paddingBottom: 2,
            marginBottom: 12,
            scrollbarWidth: "none",
          }}
        >
          {[
            { t: "Log 3 nights of sleep", g: "Mind +6" },
            { t: "Protein anchor at lunch", g: "Eat +3" },
            { t: "Close step goal 5 days", g: "Move +4" },
          ].map((c) => (
            <button
              key={c.t}
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11.5,
                fontWeight: 600,
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid " + GREEN,
                background: BG,
                color: TEXT,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {c.t}
              <span style={{ color: GREEN, fontWeight: 700 }}>{c.g}</span>
            </button>
          ))}
        </div>

        {/* Capability gap — text then slim button below */}
        <div
          style={{
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 12,
            padding: "12px 14px",
          }}
        >
          <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.5, marginBottom: 10 }}>
            Three weeks of the same protein gap — a pattern worth a human eye.
          </div>
          <button
            style={{
              background: GREEN,
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              color: "#fff",
              fontSize: 11.5,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Book a free consultation →
          </button>
        </div>
      </div>
      </>
      )}
    </div>
  );

  const trackPage = (
    (() => {
      // No-data vs has-data across the whole Today page, driven by dailyState.
      const nodata = dailyState === "empty";
      const mealsDone = dailyState === "done" ? 3 : dailyState === "partial" ? 3 : nodata ? 0 : 1;
      const suff = nodata ? 0 : 53;
      const steps = nodata ? 0 : 5008;
      return (
    <div style={{ padding: "14px 22px 28px" }}>
      {/* Top row: streak + date nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: TEXT,
            border: "1px solid " + BORDER,
            borderRadius: 999,
            padding: "5px 12px",
            background: BG,
          }}
        >
          ◆ 320
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 13,
            fontWeight: 600,
            color: TEXT,
            border: "1px solid " + BORDER,
            borderRadius: 999,
            padding: "5px 14px",
            background: BG,
          }}
        >
          ‹ Today ›
        </div>
        <div style={{ width: 44 }} />
      </div>

      {/* Daily summary — horizontal scroll */}
      <div
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          scrollbarWidth: "none",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            flex: "0 0 100%",
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 20,
            padding: 18,
            boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 14 }}>
            Your daily summary
          </div>
          {dailyState === "empty" ? (
            <div style={{ paddingTop: 2 }}>
              {/* Ghost rings — the three parts that will fill in */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, padding: "8px 0 18px" }}>
                {[
                  { l: "Sufficiency", Icon: Utensils },
                  { l: "Movement", Icon: Activity },
                  { l: "Mind", Icon: Moon },
                ].map((g) => (
                  <div key={g.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 58, height: 58, borderRadius: "50%",
                        border: "2px dashed #D5DBE2",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: BG_ALT,
                      }}
                    >
                      <g.Icon size={20} color="#C6CDD6" strokeWidth={1.8} />
                    </div>
                    <span style={{ fontSize: 10.5, color: MUTED, fontWeight: 600 }}>{g.l}</span>
                    <span style={{ fontSize: 10, color: "#C6CDD6" }}>— —</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: BG_ALT, border: "1px solid " + BORDER, borderRadius: 14, padding: "12px 14px" }}>
                <span
                  style={{
                    width: 22, height: 22, flexShrink: 0, marginTop: 1,
                    background: GREEN,
                    clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  K
                </span>
                <div style={{ fontSize: 12, color: TEXT, lineHeight: 1.5 }}>
                  Log your first task and I'll start reading your day back to you, right here.
                </div>
              </div>
            </div>
          ) : (
          <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div
              style={{
                width: 130,
                height: 130,
                borderRadius: "50%",
                background: "#F2F4F6",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 12, color: MUTED }}>Eaten</span>
              <span style={{ fontSize: 30, fontWeight: 700, color: TEXT }}>
                1040
              </span>
              <span style={{ fontSize: 11, color: MUTED }}>of 1885 Kcal</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: "50%",
                  background: "#EEF0F3",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 11, color: MUTED }}>TDEE</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: TEXT }}>
                  2400
                </span>
              </div>
              <div
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: "50%",
                  background: "#F2F4F6",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "flex-end",
                }}
              >
                <span style={{ fontSize: 10, color: MUTED }}>Deficit</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
                  −515
                </span>
              </div>
            </div>
          </div>
          {/* Kaira read */}
          <div
            style={{
              marginTop: 16,
              background: BG_ALT,
              border: "1px solid " + BORDER,
              borderRadius: 14,
              padding: 14,
              display: "flex",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: GREEN,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              K
            </div>
            <div style={{ fontSize: 12.5, color: TEXT, lineHeight: 1.5 }}>
              Your lunch was heavy on rice and roti but light on{" "}
              <strong>fibre</strong>, the part of food that keeps you full and
              your energy steady. Without much of it, you may feel hungry again
              before long.
            </div>
          </div>
          </>
          )}
        </div>

        {/* Second card — nutrition sufficiency placeholder */}
        <div
          style={{
            flex: "0 0 100%",
            background: BG,
            border: "1px dashed #D4DAE2",
            borderRadius: 20,
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            textAlign: "center",
            color: MUTED,
            fontSize: 12.5,
            lineHeight: 1.5,
            boxSizing: "border-box",
          }}
        >
          Nutrition sufficiency data will come over here.
        </div>
      </div>

      {/* carousel dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "10px 0 20px" }}>
        <div style={{ width: 18, height: 6, borderRadius: 3, background: TEXT }} />
        <div style={{ width: 6, height: 6, borderRadius: 3, background: BORDER }} />
      </div>

      {/* Section label */}
      <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1, marginBottom: 14 }}>
        YOUR TODAY'S TASK
      </div>

      {/* ===== EAT ===== */}
      <div
        onClick={() => setEatDetail(true)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Utensils size={18} color={TEXT} />
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 600, color: TEXT }}>Eat</span>
        </div>
        <ChevronRight size={18} color={MUTED} />
      </div>

      {/* Eat task 1 — log 3 meals (action) */}
      <div
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 16,
          padding: 14,
          marginBottom: 10,
          boxShadow: "0 2px 8px rgba(52,64,84,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>Log your 3 main meals</span>
          <div
            onClick={() => setEatDetail(true)}
            style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: GREEN, borderRadius: 999, padding: "5px 12px", cursor: "pointer" }}
          >
            Log →
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {[0, 1, 2].map((i) => {
            const done = i < mealsDone;
            return (
            <div
              key={i}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: "1.5px solid " + (done ? TEXT : BORDER),
                background: done ? TEXT : BG,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {done && <Check size={16} color="#fff" strokeWidth={3} />}
            </div>
            );
          })}
        </div>
      </div>

      {/* Eat task 2 — sufficiency (progress) */}
      <div
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 16,
          padding: 14,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(52,64,84,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>Reach 80% sufficiency today</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{suff}<span style={{ color: MUTED, fontWeight: 500 }}>/80%</span></span>
        </div>
        <div style={{ height: 8, background: BG_ALT, borderRadius: 4, marginTop: 12, overflow: "hidden", border: "1px solid " + BORDER }}>
          <div style={{ width: (suff / 80 * 100) + "%", height: "100%", background: TEXT }} />
        </div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.4 }}>
          {nodata ? "Log your first meal and your score starts here." : "Keep logging your meals through the day and your score will update."}
        </div>
      </div>

      {/* ===== MOVE ===== */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp size={18} color={TEXT} />
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 600, color: TEXT }}>Move</span>
        </div>
        <ChevronRight size={18} color={MUTED} />
      </div>

      {/* Move task 1 — log activity (action) */}
      <div
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 16,
          padding: 14,
          marginBottom: 10,
          boxShadow: "0 2px 8px rgba(52,64,84,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT, lineHeight: 1.4 }}>
            Log an activity, a brisk walk or workout, at least 30 min
          </span>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: GREEN, borderRadius: 999, padding: "5px 12px", cursor: "pointer", flexShrink: 0 }}>
            Log →
          </div>
        </div>
      </div>

      {/* Move task 2 — steps (progress) */}
      <div
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 16,
          padding: 14,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(52,64,84,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>Hit your step goal</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{steps.toLocaleString()} <span style={{ color: MUTED, fontWeight: 500 }}>/ 8,000</span></span>
        </div>
        <div style={{ height: 8, background: BG_ALT, borderRadius: 4, marginTop: 12, overflow: "hidden", border: "1px solid " + BORDER }}>
          <div style={{ width: Math.round(steps / 8000 * 100) + "%", height: "100%", background: TEXT }} />
        </div>
      </div>

      {/* ===== MIND ===== */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Moon size={18} color={TEXT} />
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 600, color: TEXT }}>Mind</span>
        </div>
        <ChevronRight size={18} color={MUTED} />
      </div>

      {/* Mind task 1 — sleep (last night + tonight target, connected state) */}
      <div
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 16,
          padding: 14,
          marginBottom: 10,
          boxShadow: "0 2px 8px rgba(52,64,84,0.04)",
        }}
      >
        <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>
          Aim for at least 6h 40m of sleep tonight
        </div>
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 6, lineHeight: 1.45 }}>
          Last night you slept 5h 20m. A little more tonight will help your recovery.
        </div>
      </div>

      {/* Mind task 2 — breathing (action) */}
      <div
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 16,
          padding: 14,
          marginBottom: 20,
          boxShadow: "0 2px 8px rgba(52,64,84,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>Take a 5-min breathing reset</span>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: GREEN, borderRadius: 999, padding: "5px 12px", cursor: "pointer" }}>
            Start →
          </div>
        </div>
      </div>

      {/* Quick values */}
      <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1, marginBottom: 12 }}>
        QUICK VALUES
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { v: "74.2", u: "kg", l: "WEIGHT", plus: true },
          { v: "3", u: "/8", l: "WATER", plus: true },
        ].map((q) => (
          <div
            key={q.l}
            style={{
              flex: 1,
              background: BG,
              border: "1px solid " + BORDER,
              borderRadius: 14,
              padding: 12,
              boxShadow: "0 2px 8px rgba(52,64,84,0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: BG_ALT,
                  border: "1px solid " + BORDER,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  color: GREEN,
                  fontWeight: 700,
                }}
              >
                {q.plus ? "+" : "›"}
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
                {q.v}
              </span>
              <span style={{ fontSize: 11, color: MUTED }}>{q.u}</span>
            </div>
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: 0.5, marginTop: 2 }}>{q.l}</div>
          </div>
        ))}
      </div>
    </div>
      );
    })()
  );

  const morePage = (
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
              background: "#F2F4F6",
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
  );

  const carePage = (
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
              background: "#F2F4F6",
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
          boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
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
          boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
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
          boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
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
  );

  const smartDevicesBlock = (
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
                          ? "4px solid #C6CDD6"
                          : "1px solid #C6CDD6",
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
                          color: "#1A2233",
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
                  View Details →
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
                          ? "6px solid #C6CDD6"
                          : "1px solid #C6CDD6",
                      background:
                        deviceTabConnected === "ring"
                          ? "transparent"
                          : "#F0F2F5",
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
                      color: "#1A2233",
                    }}
                  >
                    {deviceTabConnected === "bpm"
                      ? "Track blood pressure with GoodFlip Monitor"
                      : "Listen to your body signals with GoodFlip Ring"}
                  </div>
                ) : (
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 13, width: "88%", background: "#E8EBEE", borderRadius: 6, marginBottom: 8 }} />
                    <div style={{ height: 13, width: "70%", background: "#E8EBEE", borderRadius: 6, marginBottom: 8 }} />
                    <div style={{ height: 13, width: "45%", background: "#F0F2F5", borderRadius: 6 }} />
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
                    : "BCA"}{" "}
                  →
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
                        ? "4px solid #C6CDD6"
                        : "1px solid #C6CDD6",
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
                    ? "6px solid #C6CDD6"
                    : "1px solid #C6CDD6",
                background: deviceTab === "ring" ? "transparent" : "#F0F2F5",
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
                color: "#1A2233",
              }}
            >
              {deviceTab === "bpm"
                ? "Track blood pressure with GoodFlip Monitor"
                : "Listen to your body signals with GoodFlip Ring"}
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              {/* Headline placeholder for CGM / BCA */}
              <div style={{ height: 13, width: "88%", background: "#E8EBEE", borderRadius: 6, marginBottom: 8 }} />
              <div style={{ height: 13, width: "70%", background: "#E8EBEE", borderRadius: 6, marginBottom: 8 }} />
              <div style={{ height: 13, width: "45%", background: "#F0F2F5", borderRadius: 6 }} />
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
              : "BCA"}{" "}
            →
          </button>
        </div>
      </div>
      )}
    </div>
  );

  /* Home top bar — hamburger left, three actions right. Home only.
     Paid users also get a Flipcoins pill and a notification count. */
  const homeTopBar = (
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
              border: "1px solid " + BORDER,
              background: BG_ALT,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                flexShrink: 0,
                background: "#E4E8ED",
                clipPath:
                  "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: TEXT,
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
  );

  /* ===========================================================
     PAID PROGRAM USER
     =========================================================== */

  const sectionLabel = (text) => (
    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 10 }}>{text}</div>
  );

  const coachAvatar = (size) => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#E4E8ED",
        border: "1px solid " + BORDER,
        flexShrink: 0,
      }}
    />
  );

  /* ---------- First week setup (FTUX) ----------
     Sits above the MET Score card while the score is still locked.
     The three tasks are the first log of each pillar; the score card
     directly below is the fourth step, so the sequence reads
     meal, movement, breathing, then score. */
  const setupTasks = [
    { id: "meal", label: "Log your first meal", sub: "Takes about 30 seconds" },
    { id: "move", label: "Log your first workout", sub: "A walk counts" },
    { id: "mind", label: "Log your first breathing", sub: "Two minutes, guided" },
  ].map((t, i) => ({
    ...t,
    done: setupState === "done" || (setupState === "partial" && i === 0),
  }));
  const setupDoneCount = setupTasks.filter((t) => t.done).length;

  const firstWeekSetup = (
    <div style={{ padding: "4px 22px 18px" }}>
      <div
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 22,
          padding: "16px",
          boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Header row — Kaira on the left, figure on the right */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                style={{
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                  background: GREEN,
                  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                K
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>
                Your journey starts here
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5, lineHeight: 1.4 }}>
              {setupDoneCount === 0
                ? "Start with three small logs."
                : setupDoneCount < setupTasks.length
                ? setupDoneCount + " of " + setupTasks.length + " done."
                : "All three done."}
            </div>
          </div>

          {/* Figure, sitting in a soft disc */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: BG_ALT,
              border: "1px solid " + BORDER,
              flexShrink: 0,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <svg width="46" height="56" viewBox="0 0 86 96" fill="none">
              <circle cx="43" cy="17" r="11" fill="#DDE3E9" />
              <path
                d="M43 30c-9 0-15 5-16 13l-2 16c-.4 3.2 1.6 5.4 4.4 5.4 2.4 0 4.2-1.6 4.6-4l1.4-9v14l-3 22c-.5 3.4 1.6 5.8 4.8 5.8 2.8 0 4.6-1.8 5-4.6l2.8-19 2.8 19c.4 2.8 2.2 4.6 5 4.6 3.2 0 5.3-2.4 4.8-5.8l-3-22V51l1.4 9c.4 2.4 2.2 4 4.6 4 2.8 0 4.8-2.2 4.4-5.4l-2-16c-1-8-7-13-16-13z"
                fill="#DDE3E9"
              />
            </svg>
          </div>
        </div>

        {/* Checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
          {setupTasks.map((t, i) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                background: BG_ALT,
                border: "1px solid " + BORDER,
                borderRadius: 13,
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  flexShrink: 0,
                  border: "1.5px solid " + (t.done ? GREEN : "#D5DBE2"),
                  background: t.done ? GREEN : BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: t.done ? "#fff" : MUTED,
                }}
              >
                {t.done ? <Check size={12} color="#fff" strokeWidth={3} /> : i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT }}>{t.label}</div>
                <div style={{ fontSize: 10.5, color: MUTED, marginTop: 1 }}>{t.sub}</div>
              </div>
              <ChevronRight size={16} color={MUTED} />
            </div>
          ))}
        </div>

        {/* Connector into the score card sitting directly below */}
        <div
          style={{
            width: 1,
            height: 14,
            background: BORDER,
            margin: "14px auto 0",
          }}
        />
      </div>
    </div>
  );

  /* ---------- FTUX explainer (first-time users) ----------
     Three creative ways to teach that Eat, Move, Mind and Measure are the
     four pillars of metabolism. All share the same pillar data, the same
     illustration placeholder, and the same "Let's start" CTA that kicks
     off goal-setting. */
  const metPillars = [
    { id: "eat", label: "Eat", Icon: Utensils, note: "Fuel", color: GREEN },
    { id: "move", label: "Move", Icon: Activity, note: "Burn", color: "#3B82C4" },
    { id: "mind", label: "Mind", Icon: Moon, note: "Calm", color: "#8B6FC4" },
    { id: "measure", label: "Measure", Icon: BarChart3, note: "Know", color: TEXT },
  ];

  const illustration = (size) => (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: BG_ALT,
        border: "1px dashed #CBD3DC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.5} height={size * 0.6} viewBox="0 0 86 96" fill="none">
        <circle cx="43" cy="17" r="11" fill="#D3DAE1" />
        <path
          d="M43 30c-9 0-15 5-16 13l-2 16c-.4 3.2 1.6 5.4 4.4 5.4 2.4 0 4.2-1.6 4.6-4l1.4-9v14l-3 22c-.5 3.4 1.6 5.8 4.8 5.8 2.8 0 4.6-1.8 5-4.6l2.8-19 2.8 19c.4 2.8 2.2 4.6 5 4.6 3.2 0 5.3-2.4 4.8-5.8l-3-22V51l1.4 9c.4 2.4 2.2 4 4.6 4 2.8 0 4.8-2.2 4.4-5.4l-2-16c-1-8-7-13-16-13z"
          fill="#D3DAE1"
        />
      </svg>
    </div>
  );

  const startCta = (
    <button
      onClick={() => {
        setOnboardingStep(0);
        setOnboardingOpen(true);
      }}
      style={{
        width: "100%",
        marginTop: 16,
        background: GREEN,
        border: "none",
        borderRadius: 12,
        padding: "13px 0",
        color: "#fff",
        fontSize: 14.5,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Let's start →
    </button>
  );

  const ftuxShell = (children) => (
    <div style={{ padding: "4px 22px 18px" }}>
      <div
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 20,
          padding: 16,
          boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
        }}
      >
        {children}
      </div>
    </div>
  );

  const ftuxExplainer = ftuxShell(
    <>
      {/* Figure left, headline + subtext right */}
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        {illustration(76)}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <span
              style={{
                width: 18,
                height: 18,
                flexShrink: 0,
                background: GREEN,
                clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              K
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: TEXT, lineHeight: 1.2 }}>
              The four pillars of metabolism
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.45 }}>
            Your metabolism is built on these four. Small daily habits in each let you see it and shift it.
          </div>
        </div>
      </div>

      {/* Four pillars in soft mono squares */}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {metPillars.map((p) => (
          <div
            key={p.id}
            style={{
              flex: 1,
              background: BG_ALT,
              border: "1px solid " + BORDER,
              borderRadius: 12,
              padding: "11px 4px 9px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <p.Icon size={18} color={TEXT} strokeWidth={1.8} />
            <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{p.label}</span>
          </div>
        ))}
      </div>

      {startCta}
    </>
  );

  // Streak flame glyph, shared by the strip, leaderboard and done card.
  const flame = (size, on) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2c1 3.5-1.5 4.5-1.5 7 0 1.4 1 2.5 1.5 3 .5-.6 1-1.2 1-2 1.2 1 2 2.5 2 4.2A5 5 0 0 1 7 14.4C7 10 11 8 12 2z"
        fill={on ? GREEN : "#D5DBE2"}
      />
    </svg>
  );

  /* ---------- Today's tasks (daily engine) ----------
     A short swipeable stack of three pillar cards, one goal each. A card
     with all its checks filled reads as done and drops to the back, so a
     finished day empties the stack. Framed as "today", not a fragile
     day-streak — the forgiving week streak lives separately.
     dailyState drives which checks are filled and whether the Eat card
     reveals its nutrition sufficiency score. */
  const dailyPillars = [
    {
      id: "eat",
      Icon: Utensils,
      title: "Log your 3 main meals",
      checks: 3,
      // filled checks by state
      fill: { ftux: 0, empty: 0, partial: 3, done: 3 },
      hint: "Check protein and fibre. Log all three for your score.",
      reward: "72% sufficient",
      coins: 4,
    },
    {
      id: "move",
      Icon: Activity,
      title: "Move for 20 minutes",
      checks: 1,
      fill: { ftux: 0, empty: 0, partial: 0, done: 1 },
      hint: "Any movement counts. Tells us your energy burnt today.",
      coins: 2,
    },
    {
      id: "mind",
      Icon: Moon,
      title: "Take a breathing break",
      checks: 1,
      fill: { ftux: 0, empty: 0, partial: 0, done: 1 },
      hint: "A short breather to lower stress. Calm counts too.",
      coins: 2,
    },
    {
      id: "measure",
      Icon: BarChart3,
      title: "Take your metabolic score",
      checks: 1,
      fill: { ftux: 0, empty: 0, partial: 0, done: 1 },
      hint: "One number for your metabolic health. Sets your baseline.",
    },
  ];

  // Only the three repeating pillars count toward "today". Measure is a
  // one-time task that rides in the same row.
  const dailyRepeating = dailyPillars.filter((p) =>
    ["eat", "move", "mind"].includes(p.id)
  );
  const dailyDoneCount = dailyRepeating.filter(
    (p) => p.fill[dailyState] >= p.checks
  ).length;

  const dailyTaskCard = (p, fullWidth) => {
    const filled = p.fill[dailyState];
    const isDone = filled >= p.checks;
    const showReward = p.id === "eat" && isDone && p.reward;
    return (
      <div
        key={p.id}
        style={{
          width: fullWidth ? "100%" : CARD_W,
          flexShrink: 0,
          scrollSnapAlign: "center",
          background: BG,
          border: "1px solid " + (isDone ? GREEN : BORDER),
          borderRadius: 16,
          padding: "13px 14px",
          boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
          opacity: isDone ? 0.85 : 1,
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              flexShrink: 0,
              background: isDone ? GREEN : BG_ALT,
              border: "1px solid " + (isDone ? GREEN : BORDER),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isDone ? (
              <Check size={17} color="#fff" strokeWidth={3} />
            ) : (
              <p.Icon size={17} color={TEXT} />
            )}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{p.title}</div>
            <div style={{ fontSize: 10.5, color: MUTED, marginTop: 2, lineHeight: 1.4 }}>
              {showReward ? p.reward : isDone ? "Done for today" : p.hint}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {!isDone && p.coins && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  background: BG_ALT,
                  border: "1px solid " + BORDER,
                  borderRadius: 999,
                  padding: "3px 8px 3px 6px",
                }}
              >
                <span
                  style={{
                    width: 13,
                    height: 13,
                    background: GREEN,
                    clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>+{p.coins}</span>
              </span>
            )}
            {!isDone && <ChevronRight size={16} color={MUTED} />}
          </div>
        </div>

        {/* check pips — one per required log */}
        <div style={{ display: "flex", gap: 5, marginTop: 11 }}>
          {Array.from({ length: p.checks }).map((_, i) => (
            <span
              key={i}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                background: i < filled ? GREEN : "#EAEDF1",
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const dailyTasksSection =
    dailyState === "ftux" ? (
      ftuxExplainer
    ) : (
    <div style={{ padding: "4px 0 18px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 22px", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
          Today's focus
        </span>
        <span style={{ fontSize: 11, color: MUTED }}>
          {dailyState === "done"
            ? "All done"
            : dailyDoneCount + " of " + dailyRepeating.length}
        </span>
      </div>

      {/* Coach-mark tour — pops in after onboarding, walks the reward idea */}
      {tourStep !== null && dailyState === "empty" && (
        <div style={{ padding: "0 22px 12px" }}>
          <div
            style={{
              background: TEXT,
              borderRadius: 14,
              padding: "13px 15px",
              boxShadow: "0 6px 20px rgba(52,64,84,0.18)",
              animation: "tourpop .3s ease both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span
                style={{
                  width: 18,
                  height: 18,
                  background: GREEN,
                  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  flexShrink: 0,
                }}
              >
                K
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#fff" }}>
              {["Your day, by pillar", "Earn as you go", "Save what you earn"][tourStep]}
              </span>
            </div>
            <div style={{ fontSize: 11.5, color: "#D5DBE2", lineHeight: 1.45 }}>
              {[
                "Each card is one pillar. Clear the three and today's done.",
                "Logging your meals, moves and mind pays Flipcoins. See the badge on each card.",
                "Spend your Flipcoins on lab tests, consults and program fees.",
              ][tourStep]}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <div style={{ display: "flex", gap: 5 }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: i === tourStep ? "#fff" : "rgba(255,255,255,0.35)",
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setTourStep(tourStep >= 2 ? null : tourStep + 1)}
                style={{
                  background: "#fff",
                  border: "none",
                  borderRadius: 999,
                  padding: "6px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: TEXT,
                  cursor: "pointer",
                }}
              >
                {tourStep >= 2 ? "Got it" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {dailyState === "done" ? (
        /* Done state — the row collapses to proof + the week streak, no empty carousel */
        <div style={{ padding: "0 22px" }}>
          <div
            style={{
              background: BG,
              border: "1px solid " + GREEN,
              borderRadius: 16,
              padding: "16px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: GREEN,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Check size={19} color="#fff" strokeWidth={3} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>
                Today is done. Nice work.
              </div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                {flame(14, true)}
                <span>{streakDays + 1} day streak · come back tomorrow</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
            style={{
              display: "flex",
              gap: CARD_GAP,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              paddingLeft: CARD_PAD,
              paddingRight: CARD_TAIL,
              scrollbarWidth: "none",
            }}
          >
            {/* Ordering: paid users lead with the metabolic score (program
                users need it first). Then done cards fall to the back. */}
            {[...dailyPillars]
              .sort((a, b) => {
                // 1. done cards always sink
                const ad = a.fill[dailyState] >= a.checks ? 1 : 0;
                const bd = b.fill[dailyState] >= b.checks ? 1 : 0;
                if (ad !== bd) return ad - bd;
                // 2. paid: measure floats to the front among open cards
                if (isPaid) {
                  const ar = a.id === "measure" ? 0 : 1;
                  const br = b.id === "measure" ? 0 : 1;
                  if (ar !== br) return ar - br;
                }
                return 0;
              })
              .map((p) => dailyTaskCard(p))}
          </div>
      )}
    </div>
    );

  /* ---------- Onboarding takeover ----------
     Launched from "Let's start". A Kaira + pillars intro, then four
     personalization questions, then a short "building your plan" beat,
     then it closes back to Home in the new-day state with the tour running.
     Monochrome throughout except the primary CTA. */
  const TOTAL_Q = 4;

  const onbNext = () => {
    if (onboardingStep >= 5) {
      // finish: close, switch to daily row, start the coach-mark tour
      setOnboardingOpen(false);
      setDailyState("empty");
      setTodayOnboarded(true);
      setTourStep(0);
    } else {
      setOnboardingStep(onboardingStep + 1);
    }
  };
  const onbBack = () => {
    if (onboardingStep === 0) setOnboardingOpen(false);
    else setOnboardingStep(onboardingStep - 1);
  };

  const onbField = (label, value, unit) => (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: TEXT, marginBottom: 7 }}>{label}</div>
      <div
        style={{
          border: "1px solid " + BORDER,
          borderRadius: 12,
          padding: "13px 14px",
          fontSize: 16,
          color: TEXT,
          fontWeight: 600,
          display: "flex",
          alignItems: "baseline",
          gap: 5,
        }}
      >
        {value}
        {unit && <span style={{ fontSize: 12, color: MUTED, fontWeight: 500 }}>{unit}</span>}
      </div>
    </div>
  );

  const pillarExplain = [
    { id: "eat", Icon: Utensils, label: "Eat", line: "Log meals to see if you're eating enough of the right things." },
    { id: "move", Icon: Activity, label: "Move", line: "Track movement so your energy out is counted, not guessed." },
    { id: "mind", Icon: Moon, label: "Mind", line: "Note rest and calm, the part of metabolism that's easy to miss." },
    { id: "measure", Icon: BarChart3, label: "Measure", line: "Your score pulls the three together so you can watch it shift." },
  ];

  const onbQuestionHead = (title, sub) => (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 23,
          fontWeight: 600,
          color: TEXT,
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13, color: MUTED, marginTop: 8, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );

  // The "building your plan" beat auto-advances into Home after a moment.
  useEffect(() => {
    if (onboardingOpen && onboardingStep === 5) {
      const t = setTimeout(() => {
        setOnboardingOpen(false);
        setDailyState("empty");
        setTodayOnboarded(true);
        setTourStep(0);
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [onboardingOpen, onboardingStep]);

  const onboardingPage = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      {/* Header: back + progress */}
      <div style={{ padding: "8px 22px 0", flexShrink: 0 }}>
        <button
          onClick={onbBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "transparent",
            padding: "4px 0",
            fontSize: 15,
            fontWeight: 600,
            color: TEXT,
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={20} color={TEXT} /> Back
        </button>

        {onboardingStep >= 1 && onboardingStep <= 4 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12.5, color: MUTED, marginBottom: 7 }}>
              Step <span style={{ color: GREEN, fontWeight: 700 }}>{onboardingStep}</span> of{" "}
              <span style={{ color: GREEN, fontWeight: 700 }}>{TOTAL_Q}</span>
            </div>
            <div style={{ height: 5, background: "#EAEDF1", borderRadius: 3, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: (onboardingStep / TOTAL_Q) * 100 + "%",
                  background: GREEN,
                  borderRadius: 3,
                  transition: "width .35s cubic-bezier(.4,0,.2,1)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px 0", minHeight: 0 }}>
        {onboardingStep === 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
              <span
                style={{
                  width: 56,
                  height: 56,
                  background: GREEN,
                  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                K
              </span>
            </div>
            <div
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 24,
                fontWeight: 600,
                color: TEXT,
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              Hi, I'm Kaira
            </div>
            <div
              style={{
                fontSize: 13,
                color: MUTED,
                textAlign: "center",
                lineHeight: 1.5,
                margin: "10px auto 22px",
                maxWidth: 300,
              }}
            >
              Your health companion. I'll look after the whole picture and keep it simple. It all runs on four things.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pillarExplain.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: BG_ALT,
                    border: "1px solid " + BORDER,
                    borderRadius: 14,
                    padding: "12px 14px",
                  }}
                >
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      flexShrink: 0,
                      background: BG,
                      border: "1px solid " + BORDER,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <p.Icon size={18} color={TEXT} strokeWidth={1.9} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{p.label}</div>
                    <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.4, marginTop: 1 }}>
                      {p.line}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11.5, color: MUTED, textAlign: "center", margin: "18px 0 4px", lineHeight: 1.5 }}>
              First, four quick questions so I can tailor your targets.
            </div>
          </div>
        )}

        {onboardingStep === 1 && (
          <>
            {onbQuestionHead("How old are you?", "Your age helps me tailor your targets to you.")}
            <div style={{ maxWidth: 200 }}>{onbField("Age (years)", "28")}</div>
          </>
        )}

        {onboardingStep === 2 && (
          <>
            {onbQuestionHead("What's your biological sex?", "This helps me read your health data in the right context.")}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Male", "Female"].map((opt, i) => {
                const sel = i === 0;
                return (
                  <div
                    key={opt}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      border: "1px solid " + (sel ? TEXT : BORDER),
                      background: sel ? BG_ALT : BG,
                      borderRadius: 14,
                      padding: "15px 16px",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "2px solid " + (sel ? TEXT : "#CBD3DC"),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {sel && <span style={{ width: 10, height: 10, borderRadius: "50%", background: TEXT }} />}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{opt}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {onboardingStep === 3 && (
          <>
            {onbQuestionHead("How tall are you?", "Used to calculate body metrics like your BMI.")}
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT, background: BG_ALT, border: "1px solid " + BORDER, borderRadius: 999, padding: "6px 14px" }}>
                Feet
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: MUTED, padding: "6px 6px" }}>
                Cm: 178
              </span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              {onbField("Feet (ft)", "5")}
              {onbField("Inches (in)", "10")}
            </div>
          </>
        )}

        {onboardingStep === 4 && (
          <>
            {onbQuestionHead("What's your current weight?", "Sets your starting baseline so I can track progress over time.")}
            {onbField("Weight (kg)", "80")}
          </>
        )}

        {onboardingStep === 5 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
            <div style={{ position: "relative", width: 80, height: 80, marginBottom: 20 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "3px solid #EAEDF1",
                  borderTopColor: GREEN,
                  animation: "onbspin 0.9s linear infinite",
                }}
              />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    background: GREEN,
                    clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  K
                </span>
              </div>
            </div>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 20, fontWeight: 600, color: TEXT }}>
              Building your plan
            </div>
            <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8, maxWidth: 260, lineHeight: 1.5 }}>
              Setting your daily targets from what you told me.
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {onboardingStep !== 5 && (
        <div style={{ flexShrink: 0, padding: "12px 22px", borderTop: "1px solid " + BORDER, background: BG }}>
          <button
            onClick={onbNext}
            style={{
              width: "100%",
              background: GREEN,
              border: "none",
              borderRadius: 14,
              padding: "15px 0",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {onboardingStep === 0 ? "Let's begin →" : onboardingStep === 4 ? "Finish" : "Continue"}
          </button>
        </div>
      )}
    </div>
  );

  /* ---------- Paid Home ---------- */
  /* ---------- Today tab ----------
     First open: a full-screen FTUX (pillar explainer + onboarding questions).
     Once onboarded: a daily summary card that forms as tasks complete, then
     the Eat/Move/Mind task cards in their current state. The Home four-pillar
     card is the mirror/summary of this tab. */
  const todayFtux = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px 0" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <span
            style={{
              width: 52, height: 52, background: GREEN,
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            K
          </span>
        </div>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 23, fontWeight: 600, color: TEXT, textAlign: "center", lineHeight: 1.2 }}>
          Welcome to your day
        </div>
        <div style={{ fontSize: 12.5, color: MUTED, textAlign: "center", lineHeight: 1.5, margin: "10px auto 20px", maxWidth: 300 }}>
          Your metabolism runs on four things. Here's what each one does, then a few quick questions to set your targets.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {pillarExplain.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, background: BG_ALT, border: "1px solid " + BORDER, borderRadius: 14, padding: "12px 14px" }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, background: BG, border: "1px solid " + BORDER, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p.Icon size={18} color={TEXT} strokeWidth={1.9} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{p.label}</div>
                <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.4, marginTop: 1 }}>{p.line}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flexShrink: 0, padding: "12px 22px", borderTop: "1px solid " + BORDER, background: BG }}>
        <button
          onClick={() => {
            setOnboardingStep(1);
            setOnboardingOpen(true);
          }}
          style={{ width: "100%", background: GREEN, border: "none", borderRadius: 14, padding: "15px 0", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
        >
          Set up my day →
        </button>
      </div>
    </div>
  );

  const todayDailyView = trackPage;


  /* ---------- Day-streak strip + leaderboard ----------
     A slim strip above the program tabs: current day streak on the left,
     a peek at your leaderboard rank on the right. Tapping opens the full
     ranking. A silent weekly freeze sits in reserve so one missed day
     doesn't wipe the run. */
  const streakStrip = (
    <div style={{ padding: "10px 22px 0" }}>
      <button
        onClick={() => {
          if (streakState === "new") return;
          if (streakState === "broken") setFreezeInfoOpen(true);
          else setLeaderboardOpen(true);
        }}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 12,
          padding: "9px 12px",
          cursor: streakState === "new" ? "default" : "pointer",
          boxShadow: "0 1px 3px rgba(52,64,84,0.04)",
        }}
      >
        {streakState === "new" ? (
          /* Day 0 — invitation, not a scoreboard */
          <>
            <span style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
              {flame(18, false)}
            </span>
            <span style={{ fontSize: 12.5, color: TEXT, fontWeight: 600 }}>
              Start your streak
            </span>
            <span style={{ fontSize: 11.5, color: MUTED, marginLeft: "auto" }}>
              Finish today's 3 tasks
            </span>
          </>
        ) : streakState === "broken" ? (
          /* Missed a day — offer a revive, never auto-charge */
          <>
            <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {flame(18, false)}
              <span style={{ fontSize: 12.5, color: MUTED, fontWeight: 600 }}>Streak lost</span>
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                setFreezeInfoOpen(true);
              }}
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: GREEN,
                borderRadius: 999,
                padding: "5px 11px",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: "#fff",
                  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                Revive for {REVIVE_COST}
              </span>
            </span>
          </>
        ) : (
          <>
            <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {flame(18, true)}
              <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{streakDays}</span>
              <span style={{ fontSize: 12, color: MUTED }}>day streak</span>
            </span>

            {/* last 5 days — filled = completed, hollow = today still open */}
            <span style={{ display: "flex", gap: 4, marginLeft: 4 }}>
              {[1, 1, 1, 1, 0].map((d, i) => (
                <span
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: d ? GREEN : "transparent",
                    border: d ? "none" : "1.5px solid #D5DBE2",
                  }}
                />
              ))}
            </span>

            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11.5, color: MUTED }}>
                {streakState === "nofriends" ? "Invite friends" : "#3 this week"}
              </span>
              <ChevronRight size={15} color={MUTED} />
            </span>
          </>
        )}
      </button>
    </div>
  );

  const leaderRows = [
    { rank: 1, name: "Aditi R.", days: 12, you: false },
    { rank: 2, name: "Rohan M.", days: 9, you: false },
    { rank: 3, name: "You", days: streakDays, you: true, tie: "Reached 5 first" },
    { rank: 4, name: "Kabir S.", days: 5, you: false, tie: "Reached 5 later" },
    { rank: 5, name: "Meera J.", days: 4, you: false },
    { rank: 6, name: "Tara V.", days: 3, you: false },
  ];

  const podiumPerson = (r, place) => {
    const heights = { 1: 74, 2: 54, 3: 44 };
    const sizes = { 1: 56, 2: 46, 3: 46 };
    const mine = r.you;
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <span
            style={{
              width: sizes[place],
              height: sizes[place],
              borderRadius: "50%",
              background: "#E4E8ED",
              border: mine ? "2px solid " + GREEN : place === 1 ? "2px solid " + TEXT : "1px solid " + BORDER,
              display: "block",
              boxShadow: mine ? "0 0 0 3px rgba(41,157,107,0.15)" : "none",
            }}
          />
          <span
            style={{
              position: "absolute",
              bottom: -4,
              left: "50%",
              transform: "translateX(-50%)",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: mine ? GREEN : TEXT,
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid " + BG,
            }}
          >
            {place}
          </span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: mine ? GREEN : TEXT, marginBottom: 2 }}>
          {mine ? "You" : r.name.split(" ")[0]}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 8 }}>
          {flame(12, true)}
          <span style={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{r.days}</span>
        </div>
        <div
          style={{
            width: "78%",
            height: heights[place],
            background: place === 1 ? GREEN : mine ? "rgba(41,157,107,0.08)" : BG_ALT,
            border: place === 1 ? "none" : mine ? "1px solid " + GREEN : "1px solid " + BORDER,
            borderRadius: "10px 10px 0 0",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 8,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: place === 1 ? "#fff" : mine ? GREEN : MUTED, fontFamily: "'Playfair Display', Georgia, serif" }}>
            {place}
          </span>
        </div>
      </div>
    );
  };

  const leaderboardPage = (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: BG, minHeight: 0 }}>
      {/* Header */}
      <div style={{ padding: "8px 22px 6px", flexShrink: 0 }}>
        <button
          onClick={() => setLeaderboardOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: "none",
            background: "transparent",
            padding: "4px 0",
            fontSize: 15,
            fontWeight: 600,
            color: TEXT,
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={20} color={TEXT} /> Leaderboard
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
        {/* Podium — top three */}
        <div style={{ padding: "10px 22px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
            {podiumPerson(leaderRows[1], 2)}
            {podiumPerson(leaderRows[0], 1)}
            {podiumPerson(leaderRows[2], 3)}
          </div>
          <div style={{ height: 1, background: BORDER }} />
          <div style={{ fontSize: 10.5, color: MUTED, textAlign: "center", marginTop: 10 }}>
            Ranked by current streak · refreshes weekly
          </div>
        </div>

        {/* The rest */}
        <div style={{ padding: "14px 22px 0" }}>
          {leaderRows.slice(3).map((r) => (
            <div
              key={r.rank}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 12px",
                marginBottom: r.you ? 2 : 0,
                borderRadius: r.you ? 12 : 0,
                background: r.you ? "rgba(41,157,107,0.06)" : "transparent",
                border: r.you ? "1px solid " + GREEN : "none",
                borderBottom: r.you ? "1px solid " + GREEN : "1px solid " + BORDER,
              }}
            >
              <span style={{ width: 20, fontSize: 13, fontWeight: 700, color: r.you ? GREEN : MUTED, textAlign: "center", flexShrink: 0 }}>
                {r.rank}
              </span>
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#E4E8ED",
                  border: r.you ? "2px solid " + GREEN : "1px solid " + BORDER,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: 13.5, fontWeight: r.you ? 700 : 600, color: r.you ? GREEN : TEXT }}>
                  {r.you ? "You" : r.name}
                </span>
                {r.tie && <span style={{ display: "block", fontSize: 10, color: MUTED, marginTop: 1 }}>{r.tie}</span>}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                {flame(15, true)}
                <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{r.days}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Your standing — sticky bottom bar, lifted as its own surface */}
      <div
        style={{
          flexShrink: 0,
          borderTop: "1px solid " + BORDER,
          background: BG,
          padding: "10px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: BG_ALT,
            border: "1px solid " + (streakState === "broken" ? GREEN : BORDER),
            borderRadius: 14,
            padding: "11px 14px",
            boxShadow: "0 2px 8px rgba(52,64,84,0.06)",
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#E4E8ED",
              border: "2px solid " + GREEN,
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
              You · #3 this week
            </div>
            <div style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", gap: 4, marginTop: 1 }}>
              {flame(12, streakState !== "broken")}
              <span>
                {streakState === "broken"
                  ? "Streak lost — revive to keep it"
                  : streakDays + " day streak"}
              </span>
            </div>
          </div>
          {streakState === "broken" && (
            <button
              onClick={() => setFreezeInfoOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                background: GREEN,
                border: "none",
                borderRadius: 999,
                padding: "8px 14px",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: "#fff",
                  clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Revive {REVIVE_COST}</span>
            </button>
          )}
        </div>
      </div>

      {/* Freeze explainer — bottom sheet, opened from the freeze chip */}
      {freezeInfoOpen && (
        <div
          onClick={() => setFreezeInfoOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(52,64,84,0.35)",
            display: "flex",
            alignItems: "flex-end",
            zIndex: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              background: BG,
              borderRadius: "20px 20px 0 0",
              padding: "20px 22px 24px",
              animation: "tourpop .28s ease both",
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 2, background: "#E4E8ED", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: BG_ALT,
                  border: "1px solid " + BORDER,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {flame(20, false)}
              </span>
              <div style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Revive your streak</div>
            </div>
            <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.55, marginBottom: 14 }}>
              You missed a day, so your {streakDays}-day streak has paused. Spend {REVIVE_COST} Flipcoins to bring it back, or start fresh from today.
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: BG_ALT,
                border: "1px solid " + BORDER,
                borderRadius: 12,
                padding: "11px 14px",
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 12.5, color: MUTED }}>Your balance</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    background: GREEN,
                    clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                    display: "inline-block",
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{flipcoins}</span>
              </span>
            </div>

            {flipcoins >= REVIVE_COST ? (
              <button
                onClick={() => {
                  setStreakState("active");
                  setFreezeInfoOpen(false);
                }}
                style={{
                  width: "100%",
                  background: GREEN,
                  border: "none",
                  borderRadius: 12,
                  padding: "13px 0",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    background: "#fff",
                    clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
                    display: "inline-block",
                  }}
                />
                Revive for {REVIVE_COST} Flipcoins
              </button>
            ) : (
              <div style={{ fontSize: 12, color: MUTED, textAlign: "center", marginBottom: 4 }}>
                You need {REVIVE_COST} Flipcoins to revive. Keep logging to earn more.
              </div>
            )}

            <button
              onClick={() => {
                setStreakDays(0);
                setStreakState("new");
                setFreezeInfoOpen(false);
              }}
              style={{
                width: "100%",
                marginTop: 10,
                background: "transparent",
                border: "none",
                padding: "10px 0",
                color: MUTED,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start fresh from today
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const paidHomePage = (
    <>
      {homeTopBar}

      {/* Day-streak strip, taps through to the leaderboard */}
      {streakStrip}

      {/* Program / Sessions switch — hidden behind SHOW_PROGRAM_TABS */}
      {SHOW_PROGRAM_TABS && (
      <div style={{ display: "flex", gap: 8, padding: "14px 22px 0" }}>
        {[
          { id: "program", label: "Your Program" },
          { id: "sessions", label: "Upcoming Session(s)" },
        ].map((t) => {
          const active = homeProgramTab === t.id;
          const badge = t.id === "sessions" && sessionState === "booked" ? "1" : null;
          return (
            <button
              key={t.id}
              onClick={() => setHomeProgramTab(t.id)}
              style={{
                position: "relative",
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 13px",
                borderRadius: 999,
                border: "1px solid " + (active ? TEXT : BORDER),
                background: active ? BG : BG_ALT,
                color: active ? TEXT : MUTED,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
              {badge && (
                <span
                  style={{
                    position: "absolute",
                    top: -7,
                    right: -5,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 999,
                    background: TEXT,
                    color: "#fff",
                    fontSize: 9.5,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 4px",
                  }}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
      )}

      {/* Carousel — cards keep their order; the tab slides the rail */}
      <div
        ref={carouselRef}
        onScroll={handleCarouselScroll}
        style={{
          display: "flex",
          gap: CARD_GAP,
          overflowX: "auto",
          scrollbarWidth: "none",
          scrollSnapType: "x mandatory",
          scrollPaddingLeft: CARD_PAD,
          paddingLeft: CARD_PAD,
          paddingRight: CARD_TAIL,
          paddingTop: 14,
          paddingBottom: 20,
        }}
      >
        {["program", "sessions"].map((card) =>
          card === "program" ? (
            <div
              key="program"
              onClick={() => setProgramDetail(true)}
              style={{
                width: CARD_W,
                height: CARD_H,
                boxSizing: "border-box",
                flexShrink: 0,
                scrollSnapAlign: "start",
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
              }}
            >
              <div style={{ padding: "14px 16px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: TEXT }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{program.status}</span>
                  </div>
                  <ChevronRight size={18} color={MUTED} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 7,
                      background: BG_ALT,
                      border: "1px solid " + BORDER,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <program.icon size={14} color={TEXT} />
                  </span>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: TEXT,
                    }}
                  >
                    {program.name}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>
                  {program.duration} · {program.category}
                </div>
              </div>
            </div>
          ) : (
            <div
              key="sessions"
              style={{
                width: CARD_W,
                height: CARD_H,
                boxSizing: "border-box",
                flexShrink: 0,
                scrollSnapAlign: "start",
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 18,
                padding: 14,
                boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {sessionState === "booked" ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {coachAvatar(30)}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10.5, color: MUTED }}>{bookedSession.role}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginTop: 1 }}>
                        {bookedSession.coach}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      marginTop: 8,
                      padding: "5px 9px",
                      background: BG_ALT,
                      border: "1px solid " + BORDER,
                      borderRadius: 9,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Calendar size={13} color={MUTED} />
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: TEXT }}>
                        {bookedSession.date}
                      </span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Hourglass size={13} color={MUTED} />
                      <span style={{ fontSize: 11.5, fontWeight: 600, color: TEXT }}>
                        {bookedSession.time}
                      </span>
                    </span>
                  </div>
                  <button
                    style={{
                      marginTop: "auto",
                      alignSelf: "flex-start",
                      fontSize: 11.5,
                      fontWeight: 600,
                      padding: "6px 13px",
                      borderRadius: 999,
                      border: "none",
                      background: GREEN,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {bookedSession.cta} →
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: "flex" }}>
                      {[0, 1, 2].map((i) => (
                        <div key={i} style={{ marginLeft: i === 0 ? 0 : -11 }}>
                          {coachAvatar(32)}
                        </div>
                      ))}
                    </div>
                    <button
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "8px 14px",
                        borderRadius: 999,
                        border: "none",
                        background: GREEN,
                        color: "#fff",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      Book now →
                    </button>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>No upcoming sessions</div>
                  <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5, lineHeight: 1.4 }}>
                    Connect with your coaches every 15 days for your assessments.
                  </div>
                </>
              )}
            </div>
          )
        )}
      </div>

      {/* Today's tasks — the daily engine, replaces the one-time setup card */}
      {dailyTasksSection}

      {/* Smart Devices — shared with free Home, same block */}
      {smartDevicesBlock}

      {/* MET Score */}
      <div style={{ padding: "20px 22px 0" }}>
        <div
          onClick={() => setActiveTab("med")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 18,
            padding: 13,
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.6">
                <path d="M12 2l8.66 5v10L12 22l-8.66-5V7z" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Your metabolic score</span>
            </div>
            {scoreState === "locked" ? (
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5, lineHeight: 1.4 }}>
                Start understanding your metabolic health
              </div>
            ) : scoreState === "first" ? (
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 5, lineHeight: 1.4 }}>
                Your score indicates{" "}
                <span style={{ fontWeight: 700, color: TEXT }}>moderate metabolic risk</span>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 7 }}>
                <span style={{ fontSize: 11.5, color: MUTED }}>
                  {scoreState === "up"
                    ? "Improved by"
                    : scoreState === "down"
                    ? "Reduced by"
                    : "No recent changes"}
                </span>
                {scoreState !== "flat" && (
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: TEXT,
                      background: BG_ALT,
                      border: "1px solid " + BORDER,
                      borderRadius: 6,
                      padding: "3px 7px",
                    }}
                  >
                    {scoreState === "up" ? "+4 points" : "−6 points"}
                  </span>
                )}
              </div>
            )}
            {scoreState !== "locked" && scoreState !== "first" && (
              <div style={{ fontSize: 10.5, color: MUTED, marginTop: 4 }}>Last updated · 11 Aug</div>
            )}
          </div>
          <div style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
            <svg width="64" height="64" viewBox="0 0 84 84">
              <circle cx="42" cy="42" r="35" fill="none" stroke="#EEF0F3" strokeWidth="7" />
              {scoreState !== "locked" && (
                <circle
                  cx="42"
                  cy="42"
                  r="35"
                  fill="none"
                  stroke={TEXT}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray="220"
                  strokeDashoffset="70"
                  transform="rotate(-90 42 42)"
                />
              )}
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {scoreState === "locked" ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="1.8">
                  <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
                  <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
                </svg>
              ) : (
                <>
                  <span style={{ fontSize: 18, fontWeight: 800, color: TEXT, lineHeight: 1 }}>68</span>
                  <span style={{ fontSize: 8, color: MUTED, marginTop: 1 }}>out of 100</span>
                </>
              )}
            </div>
          </div>
          <ChevronRight size={18} color={MUTED} />
        </div>
      </div>


      {/* GoodFlip Services — two square tiles plus a wide promo tile */}
      <div style={{ padding: "22px 22px 0" }}>
        {sectionLabel("GoodFlip Services")}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          {["Programs", "Shop"].map((l) => (
            <div key={l} style={{ width: 66, textAlign: "center", cursor: "pointer" }}>
              <div
                style={{
                  height: 66,
                  borderRadius: 16,
                  background: BG,
                  border: "1px solid " + BORDER,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 7,
                }}
              >
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "#E4E8ED" }} />
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>{l}</div>
            </div>
          ))}

          <div style={{ flex: 1, minWidth: 0, textAlign: "center", cursor: "pointer" }}>
            <div
              style={{
                height: 66,
                borderRadius: 16,
                background: BG,
                border: "1px solid " + BORDER,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 12px",
                marginBottom: 7,
                overflow: "hidden",
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "#E4E8ED", flexShrink: 0 }} />
              <div style={{ fontSize: 11, color: MUTED, textAlign: "left", lineHeight: 1.35 }}>
                Get discounts on lab tests upto{" "}
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 10,
                    fontWeight: 700,
                    color: TEXT,
                    background: BG_ALT,
                    border: "1px solid " + BORDER,
                    borderRadius: 4,
                    padding: "1px 5px",
                  }}
                >
                  50% OFF
                </span>
              </div>
            </div>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: TEXT, lineHeight: 1.3 }}>
              Book Lab Tests
            </div>
          </div>
        </div>
      </div>

      {/* Health trackers */}
      <div style={{ padding: "22px 22px 0" }}>
        {sectionLabel("Your health trackers")}
        <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
          {[
            { l: "Sugar Levels", s: "Connect with your glucose monitor" },
            { l: "Weight", s: "Connect with a GoodFlip Smart BCA" },
          ].map((t) => (
            <div
              key={t.l}
              style={{
                width: 210,
                flexShrink: 0,
                background: BG,
                border: "1px solid " + BORDER,
                borderRadius: 16,
                padding: 14,
                boxShadow: "0 2px 8px rgba(52,64,84,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: "#E4E8ED" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{t.l}</span>
                </div>
                <ChevronRight size={16} color={MUTED} />
              </div>
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 8, lineHeight: 1.45 }}>{t.s}</div>
              <div style={{ height: 54, borderRadius: 10, background: BG_ALT, marginTop: 12 }} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 24 }} />
    </>
  );

  /* ---------- Program: weekly consistency + progress ---------- */
  const programProgressPage = (
    <div style={{ padding: "4px 22px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Your weekly consistency score</span>
        <Info size={14} color={MUTED} strokeWidth={2} />
      </div>
      <div style={{ fontSize: 11, color: MUTED, marginBottom: 14 }}>Since last week</div>

      <div
        style={{
          background: BG,
          border: "1px solid " + BORDER,
          borderRadius: 18,
          padding: "22px 16px",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 132, height: 132 }}>
            <svg width="132" height="132" viewBox="0 0 132 132">
              <circle
                cx="66"
                cy="66"
                r="55"
                fill="none"
                stroke="#E8EBEE"
                strokeWidth="12"
                strokeDasharray="4 7"
                strokeLinecap="round"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                color: MUTED,
              }}
            >
              Needs attention
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: TEXT, marginTop: 10 }}>10 Aug – 16 Aug</div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.5 }}>
          Based on how consistently you're following your nutrition, movement and habit routines this week.
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        {sectionLabel("Your program")}
        {[
          { l: "Coach sessions", v: "0 sessions completed", r: "Recommended: 1 session every 15 days" },
          { l: "Periodic health checks", v: "0 tests completed", r: "Recommended: a test every 90 days" },
        ].map((r) => (
          <div
            key={r.l}
            style={{
              background: BG_ALT,
              border: "1px solid " + BORDER,
              borderRadius: 14,
              padding: 14,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: "#E4E8ED" }} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: MUTED }}>{r.l}</span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: TEXT, marginTop: 8 }}>{r.v}</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{r.r}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        {sectionLabel("Your metabolic progress")}
        <div
          style={{
            background: BG,
            border: "1px solid " + BORDER,
            borderRadius: 18,
            padding: "20px 16px",
            textAlign: "center",
            boxShadow: "0 2px 10px rgba(52,64,84,0.05)",
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 800, color: TEXT, lineHeight: 1 }}>68</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>11 Aug 2026</div>
          <div style={{ height: 1, background: BORDER, margin: "14px 30px" }} />
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>
            Attend one more coach session to start receiving insights.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        {sectionLabel("Visible changes so far")}
        <div
          style={{
            background: BG_ALT,
            border: "1px solid " + BORDER,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 12 }}>Weight</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10.5, color: MUTED }}>Initial weight</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginTop: 4 }}>No data</div>
            </div>
            <span style={{ fontSize: 16, color: MUTED }}>→</span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10.5, color: MUTED }}>Latest weight</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginTop: 4 }}>No data</div>
            </div>
          </div>
          <div style={{ fontSize: 10.5, color: MUTED, marginTop: 14, lineHeight: 1.45 }}>
            Log your weight after your program starts to see changes.
          </div>
        </div>
      </div>
    </div>
  );

  /* ---------- Program detail (full-screen takeover) ---------- */
  const programDetailPage = (
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
          programProgressPage
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
                Program information →
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
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: "#E4E8ED" }} />
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

              {[
                { role: "Your nutritionist", name: "Sahana Chandra" },
                { role: "Your physiotherapist", name: "Sahana Physio" },
                { role: "Your success coach", name: "Manya Jain" },
              ].map((c) => (
                <div
                  key={c.name}
                  style={{
                    background: BG,
                    border: "1px solid " + BORDER,
                    borderRadius: 16,
                    overflow: "hidden",
                    marginBottom: 12,
                    boxShadow: "0 2px 8px rgba(52,64,84,0.04)",
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
                      boxShadow: "0 2px 8px rgba(52,64,84,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 16, height: 16, borderRadius: 5, background: "#E4E8ED" }} />
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
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "#E4E8ED", flexShrink: 0 }} />
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
                background: t.active ? "rgba(41,157,107,0.08)" : BG,
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
  );

  /* ---------- Chats (full-screen takeover) ---------- */
  const chatsPage = (
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
  );

  /* ===========================================================
     Wireframe control panel — demo scaffolding, sits OUTSIDE the
     phone frame. Nothing here is part of the product UI.
     =========================================================== */

  // Which group is currently driving what's on screen
  // Which collapsed rail groups the user has opened by hand.
  const [openGroups, setOpenGroups] = useState([]);

  // One line summary shown on a collapsed group header.
  const groupValue = {
    plan: isPaid ? "Paid" : "Free",
    home: userState,
    eat: eatState.toUpperCase(),
    measure: measureApproach.toUpperCase(),
    sessions: sessionState === "booked" ? "Booked" : "No sessions",
    score: scoreState,
    daily: dailyState,
    streak: streakState,
  };

  const liveGroup =
    chatsOpen || programDetail
      ? "plan"
      : eatDetail
      ? "eat"
      : activeTab === "home"
      ? isPaid
        ? "plan"
        : "home"
      : activeTab === "med"
      ? "measure"
      : null;

  const panelChip = (label, active, onClick, title, expanded) => (
    <button
      key={label}
      onClick={onClick}
      title={title}
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "6px 11px",
        borderRadius: 999,
        border: "1px solid " + (active ? GREEN : "#D9DEE5"),
        background: active ? GREEN : "#FFFFFF",
        color: active ? "#fff" : "#5B6472",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {active && expanded ? (
        <>
          {label}
          <span style={{ opacity: 0.55, margin: "0 5px" }}>·</span>
          <span style={{ fontWeight: 500 }}>{expanded}</span>
        </>
      ) : (
        label
      )}
    </button>
  );

  const panelGroup = (id, title, appliesTo, chips, caption) => {
    const live = liveGroup === id;
    // Groups collapse so the rail stays short. The live group is always open,
    // and openGroups holds anything the user has opened by hand.
    const open = live || openGroups.includes(id);
    return (
      <div
        style={{
          borderTop: "1px solid #E2E7ED",
          padding: open ? "14px 0 4px" : "10px 0",
          opacity: live ? 1 : 0.62,
        }}
      >
        <button
          onClick={() =>
            setOpenGroups(
              openGroups.includes(id)
                ? openGroups.filter((g) => g !== id)
                : openGroups.concat(id)
            )
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: live ? GREEN : "#C6CDD6",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#3B434F", letterSpacing: 0.3 }}>
            {title}
          </span>
          <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            {!open && (
              <span style={{ fontSize: 10, color: "#8A94A6" }}>{groupValue[id] || ""}</span>
            )}
            <span
              style={{
                fontSize: 9,
                color: "#8A94A6",
                transform: open ? "rotate(90deg)" : "none",
                transition: "transform .15s",
              }}
            >
              ▶
            </span>
          </span>
        </button>
        {!open ? null : (
        <>
        <div style={{ fontSize: 10, color: "#8A94A6", margin: "2px 0 9px", paddingLeft: 12 }}>
          {live ? "showing now" : appliesTo}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{chips}</div>
        {caption && (
          <div
            style={{
              fontSize: 10,
              lineHeight: 1.5,
              color: "#6B7482",
              marginTop: 9,
              paddingLeft: 10,
              borderLeft: "2px solid " + (live ? GREEN : "#D9DEE5"),
            }}
          >
            {caption}
          </div>
        )}
        </>
        )}
      </div>
    );
  };

  const nowShowing = chatsOpen
    ? "Chats"
    : programDetail
    ? programSub === "progress"
      ? "Program · Progress"
      : "Program detail"
    : eatDetail
    ? "Eat detail · " +
      eatTab +
      " · " +
      eatState.toUpperCase() +
      " " +
      ({
        ft: "First time",
        fad: "First activity done",
        kg: "Knowledge gap",
        wc: "Week completed",
        w2: "Week two",
        cg: "Capability gap",
      }[eatState] || "")
    : activeTab === "home"
    ? isPaid
      ? "Home · Program user · " +
        (sessionState === "booked" ? "Session booked" : "No sessions")
      : "Home · " + userState
    : activeTab === "med"
    ? "Measure · " +
      measureApproach.toUpperCase() +
      " " +
      ({
        a0: "Achieve",
        ms: "Metabolic score",
        a1: "Reflection first",
        msa2: "Refined score",
      }[measureApproach] || "")
    : TABS.find((t) => t.id === activeTab)?.label;

  const controlPanel = (
    <aside
      style={{
        width: 236,
        flexShrink: 0,
        position: "sticky",
        top: 24,
        background: "#F7F9FB",
        border: "1px solid #E2E7ED",
        borderRadius: 16,
        padding: "16px 16px 14px",
        fontFamily: "Roboto, system-ui, sans-serif",
        boxShadow: "0 6px 20px rgba(52,64,84,0.06)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "#3B434F", letterSpacing: 0.3 }}>
        Wireframe controls
      </div>
      <div style={{ fontSize: 10.5, color: "#8A94A6", marginTop: 3, lineHeight: 1.45 }}>
        Demo scaffolding. Not part of the product.
      </div>

      <div
        style={{
          marginTop: 12,
          background: "#FFFFFF",
          border: "1px solid #E2E7ED",
          borderRadius: 10,
          padding: "8px 10px",
        }}
      >
        <div style={{ fontSize: 9.5, color: "#8A94A6", letterSpacing: 0.6, fontWeight: 700 }}>
          NOW SHOWING
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginTop: 2 }}>{nowShowing}</div>
      </div>

      {(() => {
        const plans = [
          {
            id: "free",
            label: "Free",
            full: "Free user",
            desc: "No program. Home shows the pillar cards, campaign hooks and Smart Devices.",
          },
          {
            id: "paid",
            label: "Paid",
            full: "Program user",
            desc: "Enrolled in Diabetes Management. Home leads with the program carousel; program detail, coach chat and consistency score unlock.",
          },
        ];
        const current = plans.find((p) => p.id === plan);
        return panelGroup(
          "plan",
          "Plan",
          "applies everywhere",
          plans.map((p) =>
            panelChip(
              p.label,
              plan === p.id,
              () => {
                setPlan(p.id);
                setEatDetail(false);
                setProgramDetail(false);
                setProgramSub(null);
                setChatsOpen(false);
                setActiveTab("home");
              },
              p.full + " — " + p.desc,
              p.full
            )
          ),
          current && current.desc
        );
      })()}

      {isPaid && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
          {[
            {
              l: programDetail ? "Close program" : "Open program",
              on: () => {
                setProgramDetail(!programDetail);
                setProgramSub(null);
                setChatsOpen(false);
              },
            },
            {
              l: chatsOpen ? "Close chats" : "Open chats",
              on: () => setChatsOpen(!chatsOpen),
            },
          ].map((b) => (
            <button
              key={b.l}
              onClick={b.on}
              style={{
                flex: 1,
                fontSize: 11,
                fontWeight: 600,
                padding: "7px 0",
                borderRadius: 8,
                border: "1px solid #D9DEE5",
                background: "#FFFFFF",
                color: "#5B6472",
                cursor: "pointer",
              }}
            >
              {b.l}
            </button>
          ))}
        </div>
      )}

      {panelGroup(
        "streak",
        "Streak strip",
        "above the program tabs",
        [
          { id: "new", label: "Day 0", full: "No streak yet" },
          { id: "active", label: "Running", full: "Active streak, has friends" },
          { id: "nofriends", label: "No friends", full: "Streak but no friend group" },
          { id: "broken", label: "Missed", full: "Day missed, revivable for 10" },
        ].map((v) =>
          panelChip(v.label, streakState === v.id, () => setStreakState(v.id), v.full, v.full)
        ),
        {
          new: "Invitation, not a scoreboard. Hollow flame, no rank, not tappable.",
          active: "Full strip: streak count, last 5 days, rank. Taps to leaderboard.",
          nofriends: "Streak shows, rank half becomes Invite friends.",
          broken: "Streak lost. Strip shows a Revive for 10 action; opens the revive sheet.",
        }[streakState]
      )}

      {panelGroup(
        "daily",
        "Today's tasks / data",
        "Home row + Today tab",
        [
          { id: "ftux", label: "First day", full: "First day, teaching state" },
          { id: "empty", label: "No data", full: "Onboarded, nothing logged yet" },
          { id: "partial", label: "In progress", full: "Some logged today" },
          { id: "done", label: "All done", full: "All cleared" },
        ].map((v) =>
          panelChip(v.label, dailyState === v.id, () => setDailyState(v.id), v.full, v.full)
        ),
        {
          ftux: "Home: teaching carousel. Today tab: FTUX pillar explainer + onboarding.",
          empty: "No-data state. Today summary reads 'forming'; meals/sufficiency/steps all zero.",
          partial: "Meals logged, sufficiency 53%, steps in. Eat done and sinks back.",
          done: "All cleared. Summary sums the day up.",
        }[dailyState]
      )}

      {panelGroup(
        "score",
        "MET Score card",
        "Home, both plans",
        [
          { id: "locked", label: "Locked", full: "No score yet" },
          { id: "first", label: "First score", full: "First score, risk band" },
          { id: "up", label: "Improved", full: "Score went up" },
          { id: "flat", label: "No change", full: "Score held flat" },
          { id: "down", label: "Reduced", full: "Score went down" },
        ].map((v) =>
          panelChip(v.label, scoreState === v.id, () => setScoreState(v.id), v.full, v.full)
        ),
        {
          locked: "Ring shows a lock, no number, no last updated date.",
          first: "Ring shows the score. Reads as a risk band, no delta yet.",
          up: "Ring plus an increase and the last updated date.",
          flat: "Ring plus no recent changes and the last updated date.",
          down: "Ring plus a decrease and the last updated date.",
        }[scoreState]
      )}

      {isPaid &&
        panelGroup(
          "sessions",
          "Session state",
          "paid Home, second card",
          [
            { id: "none", label: "No sessions", full: "No upcoming sessions" },
            { id: "booked", label: "Booked", full: "Session booked" },
          ].map((s) =>
            panelChip(
              s.label,
              sessionState === s.id,
              () => setSessionState(s.id),
              s.full,
              s.full
            )
          ),
          sessionState === "booked"
            ? "Second card shows the coach, the slot and a join button."
            : "Second card shows the empty state with a book action."
        )}

      {panelGroup(
        "home",
        "Home state",
        "free Home only",
        [
          { id: "free", label: "Free" },
          { id: "returning", label: "Returning" },
          { id: "device", label: "Device" },
          { id: "deviceReturning", label: "Device Returning" },
        ].map((s) =>
          panelChip(s.label, userState === s.id, () => {
            setUserState(s.id);
            setEatDetail(false);
            setActiveTab("home");
          })
        )
      )}

      {(() => {
        const eatStages = [
          {
            id: "ft",
            label: "FT",
            full: "First time",
            desc: "Journey not set up. One start banner — no ring, no logs, no hook card. Trend is empty.",
          },
          {
            id: "fad",
            label: "FAD",
            full: "First activity done",
            desc: "Day 1 of 7. Ring and sufficiency card appear; insight is still building. Trend is empty.",
          },
          {
            id: "kg",
            label: "KG",
            full: "Knowledge gap",
            desc: "Day 3 of 7. Adds a Kaira help card and an article on the protein gap. Trend is empty.",
          },
          {
            id: "wc",
            label: "WC",
            full: "Week completed",
            desc: "First weekly insight unlocked. Trend now has the full report — graph, gap, averages.",
          },
          {
            id: "w2",
            label: "W2",
            full: "Week two",
            desc: "Day 2 of a second week. Everything reads as a comparison against last week.",
          },
          {
            id: "cg",
            label: "CG",
            full: "Capability gap",
            desc: "Protein flat across two weeks. Trend adds a free-consult card — the hand-off to a coach.",
          },
        ];
        const current = eatStages.find((s) => s.id === eatState);
        return panelGroup(
          "eat",
          "Eat stage",
          "applies in Eat detail",
          eatStages.map((s) =>
            panelChip(
              s.label,
              eatState === s.id,
              () => {
                setEatState(s.id);
                setEatDetail(true);
              },
              s.full + " — " + s.desc,
              s.full
            )
          ),
          current && current.desc
        );
      })()}

      <button
        onClick={() => {
          setDailyState("ftux");
          setTourStep(null);
          setOnboardingStep(0);
          setOnboardingOpen(true);
        }}
        style={{
          width: "100%",
          marginTop: 9,
          fontSize: 11,
          fontWeight: 600,
          padding: "7px 0",
          borderRadius: 8,
          border: "1px solid #D9DEE5",
          background: "#FFFFFF",
          color: "#5B6472",
          cursor: "pointer",
        }}
      >
        Run onboarding flow
      </button>

      <button
        onClick={() => {
          setTodayOnboarded(false);
          setActiveTab("track");
        }}
        style={{
          width: "100%",
          marginTop: 9,
          fontSize: 11,
          fontWeight: 600,
          padding: "7px 0",
          borderRadius: 8,
          border: "1px solid #D9DEE5",
          background: "#FFFFFF",
          color: "#5B6472",
          cursor: "pointer",
        }}
      >
        Reset Today FTUX
      </button>

      <button
        onClick={() => setLeaderboardOpen(true)}
        style={{
          width: "100%",
          marginTop: 9,
          fontSize: 11,
          fontWeight: 600,
          padding: "7px 0",
          borderRadius: 8,
          border: "1px solid #D9DEE5",
          background: "#FFFFFF",
          color: "#5B6472",
          cursor: "pointer",
        }}
      >
        Open leaderboard
      </button>

      <button
        onClick={() => setEatDetail(!eatDetail)}
        style={{
          width: "100%",
          marginTop: 9,
          fontSize: 11,
          fontWeight: 600,
          padding: "7px 0",
          borderRadius: 8,
          border: "1px solid #D9DEE5",
          background: "#FFFFFF",
          color: "#5B6472",
          cursor: "pointer",
        }}
      >
        {eatDetail ? "Close Eat detail" : "Open Eat detail"}
      </button>

      {(() => {
        const approaches = [
          {
            id: "a0",
            label: "A0",
            full: "Achieve",
            desc: "The existing layout. Achieve tab is built; MET Score and Vitals are placeholders.",
          },
          {
            id: "ms",
            label: "MS",
            full: "Metabolic score",
            desc: "Score-anchored. Four components including a locked Body, plus two detail pages.",
          },
          {
            id: "a1",
            label: "A1",
            full: "Reflection first",
            desc: "Kaira's read leads. Mind is a dotted line — unmeasured, not failed. Five nudge cards.",
          },
          {
            id: "msa2",
            label: "MSA2",
            full: "Refined score",
            desc: "Current direction. Score card, lab nudge, Kaira summary. Detail page still to be defined.",
          },
        ];
        const current = approaches.find((a) => a.id === measureApproach);
        return panelGroup(
          "measure",
          "Measure approach",
          "applies on Measure",
          approaches.map((a) =>
            panelChip(
              a.label,
              measureApproach === a.id,
              () => {
                setMeasureApproach(a.id);
                setMsDetail(null);
                setA1Detail(null);
                setMsa2Detail(null);
                setEatDetail(false);
                setActiveTab("med");
              },
              a.full + " — " + a.desc,
              a.full
            )
          ),
          current && current.desc
        );
      })()}
    </aside>
  );

  return (
    <>
    {/* Playfair Display was referenced everywhere but never loaded, so every
        headline was falling back to Georgia. 400/500/600 cover the headings. */}
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Roboto:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>{`
      @keyframes onbspin { to { transform: rotate(360deg); } }
      @keyframes tourpop { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
    `}</style>
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 24,
        background: "#EEF1F4",
        fontFamily: "Roboto, system-ui, sans-serif",
        padding: 24,
      }}
    >
      {/* Mobile frame */}
      <div
        style={{
          width: 390,
          height: 844,
          background: BG,
          borderRadius: 44,
          boxShadow: "0 24px 60px rgba(52,64,84,0.18)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          border: "1px solid " + BORDER,
        }}
      >
        {/* Status bar */}
        <div
          style={{
            height: 44,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 26px",
            fontSize: 14,
            fontWeight: 600,
            color: TEXT,
          }}
        >
          <span>9:41</span>
          <span style={{ letterSpacing: 2 }}>•••</span>
        </div>

        {leaderboardOpen ? (
          leaderboardPage
        ) : onboardingOpen ? (
          onboardingPage
        ) : chatsOpen ? (
          chatsPage
        ) : programDetail ? (
          programDetailPage
        ) : eatDetail ? (
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
            {eatDetailPage}
          </div>
        ) : (
        <>
        {/* Scrollable content area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: BG_ALT,
          }}
        >
          {activeTab === "track" && (todayOnboarded ? todayDailyView : todayFtux)}

          {activeTab === "med" &&
            (measureApproach === "ms"
              ? msPage
              : measureApproach === "a1"
              ? a1Page
              : measureApproach === "msa2"
              ? msa2Page
              : progressPage)}

          {activeTab === "care" && carePage}

          {activeTab === "more" && morePage}

          {activeTab === "home" && isPaid && paidHomePage}

          {activeTab === "home" && !isPaid && (
          <>
          {homeTopBar}

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
                    boxShadow: "0 2px 8px rgba(52,64,84,0.04)",
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
                    boxShadow: "0 2px 8px rgba(52,64,84,0.04)",
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
          {isDevice && smartDevicesBlock}

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
                    Log today's meals — 3 more days to your first weekly
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
                          background: d <= 4 ? "#344054" : "#E8EBEE",
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
                  <Utensils size={20} color="#C6CDD6" strokeWidth={1.6} />
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
                  <Activity size={20} color="#C6CDD6" strokeWidth={1.6} />
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
          {!isDevice && smartDevicesBlock}

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
                stroke="#8A94A6"
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
                  border: "2px dotted #C6CDD6",
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
                  stroke="#8A94A6"
                  strokeWidth="1.8"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2.5" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <circle cx="12" cy="15.5" r="1.4" fill="#8A94A6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Next Home sections will be appended here */}
          <div style={{ padding: "0 22px 24px" }} />
          </>
          )}
        </div>

        {/* Kaira FAB — pinned above bottom nav */}
        <button
          style={{
            position: "absolute",
            right: 18,
            bottom: 92,
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: GREEN,
            border: "none",
            color: "#fff",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 18,
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(41,157,107,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          K
        </button>

        {/* Bottom navigation */}
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
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 0",
                }}
              >
                <Icon
                  size={22}
                  color={active ? GREEN : MUTED}
                  strokeWidth={active ? 2.4 : 1.8}
                />
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: active ? 600 : 500,
                    color: active ? GREEN : MUTED,
                    letterSpacing: 0.1,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        </>
        )}
      </div>

      {controlPanel}
    </div>
    </>
  );
}
