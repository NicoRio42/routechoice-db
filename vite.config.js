/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  resolve: {
    alias: {
      "@src": resolve(__dirname, "./src"),
      "@shared": resolve(__dirname, "./shared"),
      "@course": resolve(__dirname, "./course"),
    },
  },
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        courses: resolve(__dirname, "courses/index.html"),
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
