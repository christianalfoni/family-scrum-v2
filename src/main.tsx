import { createRoot } from "react-dom/client";
import "./index.css";

// @ts-expect-error
import "swiper/css";

import Session from "./components/Session";
import * as state from "./state";
import { BrowserEnvironment } from "./environment/Browser";
import { BrowserRouter } from "react-router";

const env = BrowserEnvironment();
const session = state.Session({ env });

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Session session={session} />
  </BrowserRouter>
);
