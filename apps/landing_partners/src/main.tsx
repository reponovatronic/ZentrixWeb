import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/presentation/app/app";
import "@/presentation/styles/global.css";
import "@/presentation/styles/landing.css";
import "@/presentation/styles/partners.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
