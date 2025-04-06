import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mobxLite from "mobx-lite/babel-plugin";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [mobxLite()],
      },
    }),
    tailwindcss(),
  ],
});
