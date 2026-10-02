import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./App.tsx";
import "./styles/index.css";

// With registerType: "autoUpdate", this reloads the page the moment a newly
// deployed service worker takes over — without it, an already-open install
// keeps running old JS indefinitely and can end up requesting chunk files
// that no longer exist on the server after a new deploy.
registerSW({ immediate: true });

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
