import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  // ponytail: pin to IPv4 — the default binds [::1] only and browsers that
  // resolve localhost to 127.0.0.1 get a connection refused.
  server: { host: "127.0.0.1", port: 5180 },
  /* Two pages, one build. The wireframe is the app; /play is a sandbox for
     trying the bubble rule out by hand. Keeping it as a second entry rather
     than a route means it shares the tokens and the fonts and stays out of
     the product's own bundle. */
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        play: resolve(__dirname, "play/index.html"),
      },
    },
  },
});
