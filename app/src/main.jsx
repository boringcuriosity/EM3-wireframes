import React from "react";
import { createRoot } from "react-dom/client";
import { WFProvider } from "./state";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <WFProvider>
    <App />
  </WFProvider>
);
