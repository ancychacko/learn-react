// src/Components/Send.js
import React, { useState } from "react";
import { Send } from "lucide-react";

export default function Share({ API_BASE = "", postId, onShared }) {
  const [loading, setLoading] = useState(false);
  const [sharedCount, setSharedCount] = useState(null);

  async function handleShare() {
    if (loading) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/share`, {
        method: "POST",
        credentials: "include",
      });
      if (r.ok) {
        const body = await r.json(); // { count: number }
        setSharedCount(body.count);
        if (onShared) onShared(body.count);
        alert("Post shared.");
      } else {
        alert("Share failed");
      }
    } catch (err) {
      console.error("Share error", err);
      alert("Network error");
    }
    setLoading(false);
  }

  return (
    <button
      className="action-btn send-btn"
      onClick={handleShare}
      disabled={loading}
      style={{ minWidth: 90 }}
    >
      <Send size={18} className="icon" />
      <span>Share</span>
    </button>
  );
}
