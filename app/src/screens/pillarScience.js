/* The science behind each pillar, cut to what a person will actually read in a
   sheet: the claim, one sentence of context, and three things it buys you.
   `tagline` is the shorter line the pillar screens carry
   in their header strip. Kept out of the component so the copy can change
   without touching layout. */

export const PILLAR_SCIENCE = {
  eat: {
    tagline: "Fuel your body right each day.",
    lede: "Getting enough of each nutrient",
    ledeAccent: "matters more than counting calories.",
    sub: "We score your day on four things: protein, carbs, fats and fibre. The score is how close your meals came to giving you enough of each.",
    points: [
      { t: "Steady energy", b: "Fewer crashes and less random snacking." },
      { t: "Nothing to cut", b: "Keep your poha, dal and biryani. Small add-ons close the gaps." },
      { t: "Weight that holds", b: "Fullness that comes from real food, not willpower." },
    ],
  },

  move: {
    tagline: "Burn what you take in, a little all day.",
    lede: "Most of what you burn each day",
    ledeAccent: "comes from moving around, not from the gym.",
    sub: "Walking, stairs, standing and chores all count, not just workouts. Doctors call this NEAT, and it is the biggest part of your daily burn.",
    points: [
      { t: "More energy spent", b: "The largest part of your daily burn you can actually change." },
      { t: "Steadier blood sugar", b: "Breaking up long sitting lowers the spike after meals." },
      { t: "Sitting undoes a workout", b: "An hour at the gym does not buy back nine hours in a chair." },
    ],
  },

  mind: {
    tagline: "Rest is when your body repairs itself.",
    lede: "Keeping sleep and meal times regular",
    ledeAccent: "helps your body handle food better.",
    sub: "Sleep, daylight and meal times are what set your body clock. It runs on repetition, so roughly the same each day beats one perfect night.",
    points: [
      { t: "Better glucose control", b: "A disrupted clock worsens blood sugar whatever you eat." },
      { t: "Fewer cravings", b: "Short sleep pushes hunger up and fullness down the next day." },
      { t: "Timing beats effort", b: "A wake-up time you keep every day beats one early night." },
    ],
  },

  measure: {
    tagline: "See where you stand and what is changing.",
    lede: "Tracking your numbers over time",
    ledeAccent: "shows change before you can feel it.",
    sub: "Labs, device readings and your logs come together in one number. Watching it over weeks shows whether things are getting better or worse.",
    points: [
      { t: "Early warning", b: "Trouble builds for years inside normal ranges." },
      { t: "Proof it is working", b: "You see a habit pay off weeks before you feel it." },
      { t: "One shared view", b: "You and your care team read the same picture." },
    ],
  },
};
