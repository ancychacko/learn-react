import React, { useEffect, useState } from "react";
import { ThumbsUp } from "lucide-react";

/**
 * Props:
 *  - API_BASE
 *  - postId
 *  - initialLiked (boolean) optional
 *  - initialCount (number) optional
 *  - onToggle (optional) callback when toggled
 */
export default function Like({
  API_BASE,
  postId,
  initialLiked = false,
  initialCount = 0,
  onToggle,
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  // If parent updates initial props later (rare) keep them in sync:
  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  async function toggle() {
    if (busy) return;
    // optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));
    setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) {
        // revert on error
        setLiked(!newLiked);
        setCount((c) => (newLiked ? Math.max(0, c - 1) : c + 1));
      } else {
        const body = await r.json();
        setLiked(body.liked);
        setCount(body.count);
        if (onToggle) onToggle(body.liked, body.count);
      }
    } catch (err) {
      console.error("Like error", err);
      setLiked(!newLiked);
      setCount((c) => (newLiked ? Math.max(0, c - 1) : c + 1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={`like-btn ${liked ? "liked" : ""}`}
      onClick={toggle}
      disabled={busy}
      title={liked ? "Unlike" : "Like"}
    >
      <ThumbsUp size={18} />
      <span>{count > 0 ? `Like ${count}` : "Like"}</span>
    </button>
  );
}
