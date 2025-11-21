// src/Contexts/ToastContext.js
import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, opts = {}) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 9);
    const toast = {
      id,
      message,
      type: opts.type || "info", // info | success | error
      duration: typeof opts.duration === "number" ? opts.duration : 3500,
    };
    setToasts((t) => [toast, ...t]);
    if (toast.duration > 0) {
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, toast.duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999 }}
      >
        {/* Toast stack (bottom-right) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          {toasts.map((to) => (
            <div
              key={to.id}
              className={`app-toast ${to.type}`}
              role="status"
              style={{
                minWidth: 220,
                maxWidth: 380,
                background: "#111",
                color: "#fff",
                padding: "10px 12px",
                borderRadius: 8,
                boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                fontSize: 13,
                opacity: 0.98,
              }}
            >
              {to.message}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
