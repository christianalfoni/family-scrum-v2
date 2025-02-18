import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createApp } from "./state";
import { context } from "./context";
import Session from "./components/Session";

const app = createApp(context);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Session session={app.session} />
  </StrictMode>
);
