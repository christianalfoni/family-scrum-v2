import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import reactSignal from "use-react-signal/babel-plugin";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [reactSignal()],
      },
    }),
    tailwindcss(),
  ],
});
