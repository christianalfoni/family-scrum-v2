import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import packageJson from "./package.json";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  define: {
    // Make env vars available as process.env for compatibility
    "process.env.SANDBOX": JSON.stringify(process.env.SANDBOX),
    // Inject version from package.json at build time
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },

  server: {
    port: 3000,
  },

  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
