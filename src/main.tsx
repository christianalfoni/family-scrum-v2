import { createRoot } from "react-dom/client";
import "./index.css";

// @ts-expect-error
import "swiper/css";

import Session from "./components/Session";

import { Environment } from "./environment";
import { BrowserRouter } from "react-router";
import { SessionState } from "./state/SessionState";

const env = Environment();
const session = SessionState({ env });

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Session session={session} />
  </BrowserRouter>
);
