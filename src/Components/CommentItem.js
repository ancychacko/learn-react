// src/Components/CommentItem.js
// import React, { useState } from "react";
// import { ThumbsUp, CornerDownLeft } from "lucide-react";
// import ReplyItem from "./ReplyItem";
// import CommentInput from "./CommentInput";
// import "./Comment.css";

// export default function CommentItem({ comment, API_BASE = "", currentUser, onReplyAdded, onToggleLike }) {
//   const [showReplies, setShowReplies] = useState(Boolean(comment.replies && comment.replies.length));
//   const [replyOpen, setReplyOpen] = useState(false);
//   const [likeLoading, setLikeLoading] = useState(false);
//   const [liked, setLiked] = useState(Boolean(comment.liked_by_me));
//   const [likeCount, setLikeCount] = useState(Number(comment.like_count || 0));

//   async function toggleLike() {
//     if (likeLoading) return;
//     setLikeLoading(true);
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${comment.id}/like`, {
//         method: "POST",
//         credentials: "include",
//       });
//       if (r.ok) {
//         const b = await r.json();
//         setLiked(Boolean(b.liked));
//         setLikeCount(Number(b.count || 0));
//         if (onToggleLike) onToggleLike();
//       } else {
//         console.warn("Comment like failed");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//     setLikeLoading(false);
//   }

//   return (
//     <div className="comment-item" style={{ marginBottom: 8 }}>
//       <img
//         src={
//           comment.avatar_url
//             ? `${window.location.protocol}//${window.location.hostname}:4000${comment.avatar_url}`
//             : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//         }
//         className="comment-avatar"
//         alt={comment.user_name}
//       />
//       <div style={{ flex: 1 }}>
//         <div className="comment-body">
//           <div className="comment-author">{comment.user_name}</div>
//           <div className="comment-text">{comment.content}</div>
//           <div className="comment-meta" style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
//             <button onClick={toggleLike} disabled={likeLoading} className={`action-btn`} style={{ padding: "4px 8px" }}>
//               <ThumbsUp size={14} /> <span style={{ marginLeft: 6 }}>{likeCount > 0 ? `${likeCount} Like${likeCount>1?'s':''}` : "Like"}</span>
//             </button>

//             <button onClick={() => { setReplyOpen((s) => !s); setShowReplies(true); }} className="action-btn" style={{ padding: "4px 8px" }}>
//               <CornerDownLeft size={14} /> Reply
//             </button>

//             <div style={{ color: "#6b7280", fontSize: 13 }}>
//               {new Date(comment.created_at).toLocaleString()}
//             </div>

//             {comment.reply_count > 0 && (
//               <button
//                 onClick={() => setShowReplies((s) => !s)}
//                 className="action-btn"
//                 style={{ padding: "4px 8px", color: "#6b7280" }}
//               >
//                 {comment.reply_count} {comment.reply_count === 1 ? "reply" : "replies"}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* reply input */}
//         {replyOpen && (
//           <div style={{ marginLeft: 48, marginTop: 8 }}>
//             <CommentInput
//               API_BASE={API_BASE}
//               postId={comment.post_id || comment.postId || null}
//               currentUser={currentUser}
//               parentId={comment.id}
//               onPosted={() => {
//                 setReplyOpen(false);
//                 if (onReplyAdded) onReplyAdded();
//               }}
//             />
//           </div>
//         )}

//         {/* replies */}
//         {showReplies && comment.replies && comment.replies.length > 0 && (
//           <div style={{ marginLeft: 48, marginTop: 8 }}>
//             {comment.replies.map((r) => (
//               <ReplyItem key={r.id} reply={r} API_BASE={API_BASE} currentUser={currentUser} onReplyLike={onToggleLike} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
// src/Components/CommentItem.js
import React, { useState } from "react";
import { ThumbsUp, CornerDownLeft } from "lucide-react";
import ReplyItem from "./ReplyItem";
import CommentInput from "./CommentInput";
import "./Comment.css";

export default function CommentItem({
  comment,
  API_BASE = "",
  currentUser,
  onReplyAdded,
  onToggleLike,
}) {
  const [showReplies, setShowReplies] = useState(
    Boolean(comment.replies && comment.replies.length)
  );
  const [replyOpen, setReplyOpen] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [liked, setLiked] = useState(Boolean(comment.liked_by_me));
  const [likeCount, setLikeCount] = useState(Number(comment.like_count || 0));

  async function toggleLike() {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/comments/${comment.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (r.ok) {
        const b = await r.json();
        setLiked(Boolean(b.liked));
        setLikeCount(Number(b.count || 0));
        if (onToggleLike) onToggleLike();
      } else {
        console.warn("Comment like failed");
      }
    } catch (err) {
      console.error(err);
    }
    setLikeLoading(false);
  }

  return (
    <div className="comment-item" style={{ marginBottom: 8 }}>
      <img
        src={
          comment.avatar_url
            ? `${window.location.protocol}//${window.location.hostname}:4000${comment.avatar_url}`
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }
        className="comment-avatar"
        alt={comment.user_name}
      />
      <div style={{ flex: 1 }}>
        <div className="comment-body">
          <div className="comment-author">{comment.user_name}</div>
          <div className="comment-text">{comment.content}</div>
          <div
            className="comment-meta"
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <button
              onClick={toggleLike}
              disabled={likeLoading}
              className={`action-btn`}
              style={{ padding: "4px 8px" }}
            >
              <ThumbsUp size={14} />{" "}
              <span style={{ marginLeft: 6 }}>
                {likeCount > 0
                  ? `${likeCount} Like${likeCount > 1 ? "s" : ""}`
                  : "Like"}
              </span>
            </button>

            <button
              onClick={() => {
                setReplyOpen((s) => !s);
                setShowReplies(true);
              }}
              className="action-btn"
              style={{ padding: "4px 8px" }}
            >
              <CornerDownLeft size={14} /> Reply
            </button>

            <div style={{ color: "#6b7280", fontSize: 13 }}>
              {new Date(comment.created_at).toLocaleString()}
            </div>

            {comment.reply_count > 0 && (
              <button
                onClick={() => setShowReplies((s) => !s)}
                className="action-btn"
                style={{ padding: "4px 8px", color: "#6b7280" }}
              >
                {comment.reply_count}{" "}
                {comment.reply_count === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        </div>

        {/* reply input: pass mentionName so input prefills with @username */}
        {replyOpen && (
          <div style={{ marginLeft: 48, marginTop: 8 }}>
            <CommentInput
              API_BASE={API_BASE}
              postId={comment.post_id || comment.postId || null}
              currentUser={currentUser}
              parentId={comment.id}
              mentionName={comment.user_name}
              onPosted={() => {
                setReplyOpen(false);
                if (onReplyAdded) onReplyAdded();
              }}
            />
          </div>
        )}

        {/* replies */}
        {showReplies && comment.replies && comment.replies.length > 0 && (
          <div style={{ marginLeft: 48, marginTop: 8 }}>
            {comment.replies.map((r) => (
              <ReplyItem
                key={r.id}
                reply={r}
                API_BASE={API_BASE}
                currentUser={currentUser}
                onReplyLike={onToggleLike}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
