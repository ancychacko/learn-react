import React, { useState } from "react";
import { Send } from "lucide-react";

/**
 * Props:
 *  - API_BASE
 *  - postId
 */
export default function SendButton({ API_BASE, postId }) {
  const [busy, setBusy] = useState(false);
  const [sharedCount, setSharedCount] = useState(null);

  async function handleShare() {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/share`, {
        method: "POST",
        credentials: "include",
      });
      if (r.ok) {
        const body = await r.json();
        setSharedCount(body.count);
        alert("Post shared");
      } else {
        const b = await r.json();
        alert(b.error || "Share failed");
      }
    } catch (err) {
      console.error("share err", err);
      alert("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="send-btn" onClick={handleShare} disabled={busy}>
      <Send size={18}  />
      <span>{sharedCount ? `Share (${sharedCount})` : "Share"}</span>
    </button>
  );
}
