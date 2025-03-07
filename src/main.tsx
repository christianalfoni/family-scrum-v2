import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import Session from "./components/Session";
import * as state from "./state";
import { BrowserEnvironment } from "./environments/Browser";

const env = BrowserEnvironment();
const session = state.Session({ env });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Session session={session} />
  </StrictMode>
);
