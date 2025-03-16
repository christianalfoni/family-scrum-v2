import { createRoot } from "react-dom/client";
import "./index.css";

// @ts-expect-error
import "swiper/css";

import Session from "./components/Session";

import { BrowserEnvironment } from "./environments/Browser";
import { BrowserRouter } from "react-router";
import { EnvProvider } from "./environments";

const env = BrowserEnvironment();

createRoot(document.getElementById("root")!).render(
  <EnvProvider env={env}>
    <BrowserRouter>
      <Session />
    </BrowserRouter>
  </EnvProvider>
);
