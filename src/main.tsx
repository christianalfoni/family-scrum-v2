import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Session from "./components/Session";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Session />
  </StrictMode>
);
