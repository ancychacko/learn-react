// src/Hooks/useClickOutside.js
import { useEffect } from "react";

export default function useClickOutside(ref, handler) {
  useEffect(() => {
    function handle(e) {
      if (!ref.current) return;
      if (ref.current.contains(e.target)) return;
      handler(e);
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [ref, handler]);
}
