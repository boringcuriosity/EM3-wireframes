import React from "react";
import { createRoot } from "react-dom/client";
import { WFProvider } from "./state";
import App from "./App";
import "./index.css";

/* Direct links to a state (24 Nov 2026). Any WFProvider state can be set by name, ?dailyState=empty&streakDays=2.
   ?focus= picks a Today's focus preset, ftux (Habits explainer) or empty (Nothing ticked), and opens Home signed in
   with the care plan assigned, what the Care plan switch sets. Anything else in the URL still wins.
   ponytail: the ticked presets need their seeded logs, add them when a link needs one */
const q = new URLSearchParams(location.search);
const val = (v) => (v === "true" ? true : v === "false" ? false : v === "null" ? null : /^-?\d+(\.\d+)?$/.test(v) ? +v : v);
const f = q.get("focus");
const initial = f === "ftux" || f === "empty"
  ? { authStep: null, activeTab: "home", kcalSource: "coach", movePlan: "assigned", mindPlan: "assigned", dailyState: f, todayOnboarded: f === "empty" }
  : {};
q.forEach((v, k) => { if (k !== "focus") initial[k] = val(v); });

createRoot(document.getElementById("root")).render(
  <WFProvider initial={initial}>
    <App />
  </WFProvider>
);
