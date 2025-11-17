// src/Components/ReplyItem.js
// import React, { useState } from "react";
// import { ThumbsUp } from "lucide-react";
// import "./Comment.css";

// export default function ReplyItem({
//   reply,
//   API_BASE = "",
//   currentUser,
//   onReplyLike,
// }) {
//   const [liked, setLiked] = useState(Boolean(reply.liked_by_me));
//   const [likeCount, setLikeCount] = useState(Number(reply.like_count || 0));
//   const [loading, setLoading] = useState(false);

//   async function toggleLike() {
//     if (loading) return;
//     setLoading(true);
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${reply.id}/like`, {
//         method: "POST",
//         credentials: "include",
//       });
//       if (r.ok) {
//         const b = await r.json();
//         setLiked(Boolean(b.liked));
//         setLikeCount(Number(b.count || 0));
//         if (onReplyLike) onReplyLike();
//       }
//     } catch (err) {
//       console.error(err);
//     }
//     setLoading(false);
//   }

//   return (
//     <div className="comment-item" style={{ marginBottom: 8 }}>
//       <img
//         src={
//           reply.avatar_url
//             ? `${window.location.protocol}//${window.location.hostname}:4000${reply.avatar_url}`
//             : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//         }
//         className="comment-avatar"
//         alt={reply.user_name}
//       />
//       <div style={{ flex: 1 }}>
//         <div className="comment-body">
//           <div className="comment-author">{reply.user_name}</div>
//           <div className="comment-text">{reply.content}</div>
//           <div
//             className="comment-meta"
//             style={{
//               display: "flex",
//               gap: 12,
//               alignItems: "center",
//               marginTop: 8,
//             }}
//           >
//             <button
//               onClick={toggleLike}
//               className="action-btn"
//               style={{ padding: "4px 8px" }}
//             >
//               <ThumbsUp size={14} />{" "}
//               <span style={{ marginLeft: 6 }}>
//                 {likeCount > 0 ? `${likeCount}` : `Like`}
//               </span>
//             </button>
//             <div style={{ color: "#6b7280", fontSize: 13 }}>
//               {new Date(reply.created_at).toLocaleString()}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/Components/ReplyItem.js
import React from "react";
import { ThumbsUp } from "lucide-react";
import "./Comment.css";

export default function ReplyItem({
  reply,
  API_BASE = "",
  onReplyLike,
}) {
  async function toggleLike() {
    try {
      const r = await fetch(`${API_BASE}/api/comments/${reply.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (r.ok && onReplyLike) onReplyLike();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="comment-item">
      <img
        src={
          reply.avatar_url
            ? `${window.location.protocol}//${window.location.hostname}:4000${reply.avatar_url}`
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }
        className="comment-avatar"
      />

      <div className="comment-body">
        <div className="comment-author">{reply.user_name}</div>
        <div className="comment-text">{reply.content}</div>

        <div className="comment-meta" style={{ display: "flex", gap: 12 }}>
          <button className="action-btn" onClick={toggleLike}>
            <ThumbsUp size={14} /> Like
          </button>

          <span>{new Date(reply.created_at).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
