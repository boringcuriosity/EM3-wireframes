import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // ponytail: pin to IPv4 — the default binds [::1] only and browsers that
  // resolve localhost to 127.0.0.1 get a connection refused.
  server: { host: "127.0.0.1", port: 5180 },
});
