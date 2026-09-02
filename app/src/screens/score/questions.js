/* The profile questions, and the answers the wireframe stages for them.

   Staged rather than typed: this flow exists to show the shape of the thing,
   and a form that really collected height and weight would move BMR, TDEE, the
   calorie target and every macro under it. Those numbers belong to the coach's
   plan, not to a demo walkthrough.

   One question per screen, because a person answering five at once skims and a
   person answering one reads it. */
export const QUESTIONS = [
  { id: "name",   label: "What is your name?",                 answer: "Shaheer",     kind: "text" },
  { id: "born",   label: "When were you born?",                answer: "23 Nov 2000", kind: "date" },
  { id: "height", label: "How tall are you?",                  answer: "5 ft 7 in",   kind: "text" },
  { id: "weight", label: "What do you weigh?",                 answer: "73 kg",       kind: "text" },
  { id: "family", label: "Does obesity run in your family?",   answer: "No",          kind: "choice", options: ["Yes", "No", "Not sure"] },
];
