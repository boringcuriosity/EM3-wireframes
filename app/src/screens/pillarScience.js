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

     The sub says what the score is rather than listing its inputs. It used to
     name three things it "adds up", which was wrong twice over: Momentum
     multiplies rather than adds, and the three it named stopped being the
     three the moment the small movements became assigned work rather than
     tips. What survives a change of plan is the shape of the thing, so that is
     what the sub carries. */
  move: {
    tagline: "Keep moving, a little through the whole day.",
    lede: "Movement spread across your day",
    ledeAccent: "does more than the same effort in one block.",
    sub: "Momentum is how much of your coach's plan you did, multiplied by how much of the day you did it across. Finish the plan and it is 100, whatever the plan asks for.",
    points: [
      { t: "Steadier blood sugar", b: "Breaking up long sitting lowers the spike after a meal." },
      { t: "Little and often wins", b: "The same minutes spread across the day are worth more than the same minutes in one block." },
      { t: "Any movement counts", b: "Your workout is scored on minutes, so a swim of your own earns it as surely as the routine your coach wrote." },
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
