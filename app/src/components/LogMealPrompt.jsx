import React from "react";
import { Camera, Mic } from "lucide-react";
import LogPrompt from "./LogPrompt";

/* Eat's way in: a photo or a sentence, whichever is less effort in the moment. */
export default function LogMealPrompt({ onLog, lit }) {
  return (
    <LogPrompt
      lit={lit}
      line="Time to log your meal. Snap a photo or just say it out loud, whichever is easier."
      actions={[
        { label: "Snap", Icon: Camera, onClick: onLog },
        { label: "Voice", Icon: Mic, onClick: onLog },
      ]}
    />
  );
}
