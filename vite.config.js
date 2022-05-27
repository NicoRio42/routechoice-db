import { defineConfig } from "vite";
import { resolve } from "path";

import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        courses: resolve(__dirname, "courses/index.html"),
      },
    },
  },
});
