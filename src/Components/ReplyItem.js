// src/Components/ReplyItem.js
// import React, { useState } from "react";
// import { ThumbsUp } from "lucide-react";
// import Like from "./Like";
// import "./Comment.css";

// export default function ReplyItem({ reply, API_BASE = "", onReplyLike }) {
//   const [likeCount, setLikeCount] = useState(Number(reply.like_count || 0));
//   const [likedByMe, setLikedByMe] = useState(!!reply.liked_by_me);

//   function onLikeToggled(liked, newCount) {
//     setLikedByMe(Boolean(liked));
//     setLikeCount(Number(newCount || 0));
//   }

//   async function toggleLike() {
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${reply.id}/like`, {
//         method: "POST",
//         credentials: "include",
//       });
//       if (r.ok && onReplyLike) onReplyLike();
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   return (
//     <div className="comment-item">
//       <img
//         src={
//           reply.avatar_url
//             ? `${window.location.protocol}//${window.location.hostname}:4000${reply.avatar_url}`
//             : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//         }
//         className="comment-avatar"
//       />

//       <div className="comment-body">
//         <div className="comment-author">{reply.user_name}</div>
//         <div className="comment-text">{reply.content}</div>

//         <div className="comment-meta" style={{ display: "flex", gap: 12 }}>
//           <button className="action-btn" onClick={toggleLike}>
//             <ThumbsUp size={14} /> {likeCount}{" "}
//             {likeCount === 1 ? "Like" : "Likes"} Like
//           </button>

//           <Like
//             API_BASE={API_BASE}
//             postId={reply.id}
//             initialLiked={likedByMe}
//             initialCount={likeCount}
//             onToggle={onLikeToggled}
//           />

//           <span>{new Date(reply.created_at).toLocaleString()}</span>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/Components/ReplyItem.js
import React, { useState } from "react";
import { ThumbsUp } from "lucide-react";
import "./Comment.css";

export default function ReplyItem({
  reply,
  API_BASE = "",
  currentUser,
  onReplyLike,
}) {
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(Boolean(reply.liked_by_me));
  const [likeCount, setLikeCount] = useState(Number(reply.like_count || 0));

  async function toggleLike() {
    if (loading) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/comments/${reply.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (r.ok) {
        const b = await r.json();
        setLiked(Boolean(b.liked));
        setLikeCount(Number(b.count || 0));
        if (onReplyLike) onReplyLike();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reply-row">
      <img
        src={
          reply.avatar_url
            ? `${window.location.protocol}//${window.location.hostname}:4000${reply.avatar_url}`
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }
        className="comment-avatar"
        alt={reply.user_name}
      />

      <div className="reply-main">
        <div className="reply-card">
          <div className="comment-author">
            {reply.user_name}
            {/* <button>
              {currentUser && currentUser.id === reply.user_id ? "(You)" : ""}
              <Ellipsis size={14} coluro="black"  />
            </button> */}
          </div>
          <div className="comment-text">{reply.content}</div>
        </div>

        <div className="comment-actions-row reply-actions">
          <button
            className={`action-btn like-btn ${liked ? "liked" : ""}`}
            onClick={toggleLike}
            disabled={loading}
          >
            <ThumbsUp size={14} />
            <span className="action-text">
              {likeCount > 0 ? likeCount : "Like"}
            </span>
          </button>

          <div className="action-meta">
            <span className="comment-time">
              {new Date(reply.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
