// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Add base path for GitHub Pages deployment (we'll discuss this later)
  base: "/drone-show/", // Replace with your GitHub repo name
});
