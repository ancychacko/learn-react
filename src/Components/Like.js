// src/Components/Like.js
// import React, { useState } from "react";
// import { ThumbsUp } from "lucide-react";

// export default function Like({
//   API_BASE = "",
//   postId,
//   initialLiked = false,
//   initialCount = 0,
// }) {
//   const [liked, setLiked] = useState(initialLiked);
//   const [count, setCount] = useState(initialCount);
//   const [loading, setLoading] = useState(false);

//   async function toggleLike() {
//     if (loading) return;
//     setLoading(true);
//     try {
//       const r = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
//         method: "POST",
//         credentials: "include",
//       });
//       if (r.ok) {
//         const body = await r.json(); // { liked: boolean, count: number }
//         setLiked(!!body.liked);
//         setCount(Number(body.count || 0));
//       } else {
//         console.warn("Like toggle failed");
//       }
//     } catch (err) {
//       console.error("Like error", err);
//     }
//     setLoading(false);
//   }

//   return (
//     <button
//       className={`action-btn like-btn ${liked ? "liked" : ""}`}
//       onClick={toggleLike}
//       aria-pressed={liked}
//       title={liked ? "Unlike" : "Like"}
//       disabled={loading}
//       style={{ minWidth: 90 }}
//     >
//       <ThumbsUp size={18} className="icon" />
//       <span>{count > 0 ? `Like${count ? ` · ${count}` : ""}` : "Like"}</span>
//     </button>
//   );
// }

import React, { useState } from "react";
import { ThumbsUp } from "lucide-react";

export default function Like({
  API_BASE = "",
  postId,
  initialLiked = false,
  initialCount = 0,
  onToggle,
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    if (loading) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (r.ok) {
        const body = await r.json(); // { liked: boolean, count: number }
        setLiked(!!body.liked);
        setCount(Number(body.count || 0));
        if (onToggle) onToggle(body.liked, body.count);
      } else {
        console.warn("Like toggle failed");
      }
    } catch (err) {
      console.error("Like error", err);
    }
    setLoading(false);
  }

  return (
    <button
      className={`action-btn like-btn ${liked ? "liked" : ""}`}
      onClick={toggleLike}
      aria-pressed={liked}
      title={liked ? "Unlike" : "Like"}
      disabled={loading}
      style={{ minWidth: 90 }}
    >
      <ThumbsUp size={18} className="icon" />
      <span>Like </span>
    </button>
  );
}
