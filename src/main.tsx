import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// @ts-expect-error
import "swiper/css";
// @ts-expect-error
import "swiper/css/navigation";
// @ts-expect-error
import "swiper/css/pagination";
// @ts-expect-error
import "swiper/css/scrollbar";

import Session from "./components/Session";
import * as state from "./state";
import { BrowserEnvironment } from "./environments/Browser";
import { BrowserRouter } from "react-router";

const env = BrowserEnvironment();
const session = state.Session({ env });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Session session={session} />
    </BrowserRouter>
  </StrictMode>
);
