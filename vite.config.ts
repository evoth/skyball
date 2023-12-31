import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), glsl()],
});
