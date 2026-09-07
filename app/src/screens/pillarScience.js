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
      /* Sufficiency is not a weight claim. The four things a body needs are
         the same whichever direction somebody is trying to go, and the old
         line made this pillar sound like a diet. */
      { t: "It holds for any goal", b: "Losing weight, holding steady and building muscle all run on the same four. Only the amounts change." },
    ],
  },

  /* Momentum, as the /move deck argues it: the day is the thing that matters,
     not the single session inside it. The sheet said the old NEAT-only story,
     which was a claim about where calories burn rather than an explanation of
     the score the pillar actually shows.

     The sub names the three things the score adds up, the same way Eat's names
     its four, so the two sheets read as one system. The deck's own fourth
     input, the small coach-assigned actions, is out: those are tips, and a tip
     carries no weight anywhere on this pillar now. */
  move: {
    tagline: "Keep moving, a little through the whole day.",
    lede: "Movement spread across your day",
    ledeAccent: "does more than the same effort in one block.",
    sub: "Your Momentum score adds up three things: the session your coach set, the steps your phone counts, and how many parts of the day you moved in at all.",
    points: [
      { t: "Steadier blood sugar", b: "Breaking up long sitting lowers the spike after a meal." },
      { t: "Little and often wins", b: "Moving in three parts of your day earns more than the same minutes in one." },
      { t: "Your coach holds the biggest lever", b: "The session they set is half the score on its own." },
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
