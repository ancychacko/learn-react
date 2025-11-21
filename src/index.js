import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./App.css";
import { ToastProvider } from "./Contexts/ToastContext";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
