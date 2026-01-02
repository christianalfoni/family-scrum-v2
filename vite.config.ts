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
    proxy: {
      "/api/version": {
        target: "http://localhost:3000",
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Intercept and respond directly with version
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ version: packageJson.version }));
          });
        },
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
