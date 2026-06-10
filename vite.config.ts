import { defineConfig } from "vite";

export default defineConfig({
  // custom domain at the root, so the default base of "/" is correct
  build: {
    target: "es2022",
  },
});
