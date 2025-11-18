//src/Components/CommentItem.js
import React, { useRef, useState } from "react";
import {
  ThumbsUp,
  CornerDownLeft,
  Ellipsis,
  Eye,
  Flag,
  Pencil,
  Trash,
} from "lucide-react";
import ReplyItem from "./ReplyItem";
import CommentInput from "./CommentInput";
import "./Comment.css";

export default function CommentItem({
  comment,
  API_BASE = "",
  currentUser,
  openReplyFor,
  setOpenReplyFor,
  onReplyAdded,
  onToggleLike,
  refresh,
}) {
  const isOpen = openReplyFor === comment.id;
  const ref = useRef();
  const [menuOpen, setMenuOpen] = useState(false);

  async function toggleLike() {
    try {
      const r = await fetch(`${API_BASE}/api/comments/${comment.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (r.ok && onToggleLike) onToggleLike();
    } catch (e) {
      console.error(e);
    }
  }

  function toggleReply() {
    setOpenReplyFor((cur) => (cur === comment.id ? null : comment.id));
  }
  const isMyComment =
    String(comment.user_name || "")
      .trim()
      .toLowerCase() ===
    String(currentUser || "")
      .trim()
      .toLowerCase();

  // async function handleDelete() {
  //   const confirmDelete = window.confirm(
  //     "Are you sure you want to delete this post?"
  //   );
  //   if (!confirmDelete) return;
  //   try {
  //     const r = await fetch(`${API_BASE}/api/comments/${comment.id}`, {
  //       method: "DELETE",
  //       credentials: "include",
  //     });
  //     if (r.ok && typeof refresh === "function") refresh();
  //     else {
  //       const b = await r.json();
  //       alert(b.error || "Delete failed");
  //     }
  //   } catch (err) {
  //     console.error("delete error", err);
  //   }
  // }

  return (
    <div className="comment-item">
      <img
        src={
          comment.avatar_url
            ? `${window.location.protocol}//${window.location.hostname}:4000${comment.avatar_url}`
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }
        className="comment-avatar"
      />

      <div style={{ flex: 1 }}>
        <div className="comment-body">
          <div ref={ref} style={{ position: "right" }}>
            <button className="dots-btn" onClick={() => setMenuOpen((p) => !p)}>
              <Ellipsis size={20} color="black" />
            </button>
          </div>
          <div className="comment-author">{comment.user_name}</div>

          <div className="comment-text">{comment.content}</div>

          <div className="comment-meta" style={{ display: "flex", gap: 12 }}>
            <button className="action-btn" onClick={toggleLike}>
              <ThumbsUp size={14} /> Like
            </button>

            <button className="action-btn" onClick={toggleReply}>
              <CornerDownLeft size={14} /> Reply
            </button>

            <span>{new Date(comment.created_at).toLocaleString()}</span>

            {comment.replies?.length > 0 && (
              <button className="action-btn" onClick={toggleReply}>
                {comment.replies.length}{" "}
                {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>
        </div>
        {/* {menuOpen && (
          <div className="comment-menu">
            {isMyComment ? (
              <>
                <button
                  onClick={() => {
                    alert("Delete functionality not implemented yet.");
                    setMenuOpen(false);
                  }}
                >
                  <Pencil size={16} /> Edit Post
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleDelete();
                  }}
                >
                  <Trash size={16} /> Delete
                </button>
                <button
                  disabled
                  onClick={() => {
                    setMenuOpen(false);
                    alert("Coming Soon.");
                  }}
                >
                  <Eye size={16} /> Who can see this post?
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    alert("Report feature coming soon.");
                  }}
                >
                  <Flag size={16} /> Report Post
                </button>
              </>
            )}
          </div>
        )} */}

        {/* Reply Input (only one open at a time!) */}
        {isOpen && (
          <div style={{ marginLeft: 48, marginTop: 8 }}>
            <CommentInput
              API_BASE={API_BASE}
              postId={comment.post_id}
              currentUser={currentUser}
              parentId={comment.id}
              mentionName={comment.user_name}
              onPosted={() => {
                onReplyAdded();
              }}
            />
          </div>
        )}

        {/* Replies */}
        {isOpen &&
          comment.replies &&
          comment.replies.map((r) => (
            <div key={r.id} style={{ marginLeft: 48, marginTop: 8 }}>
              <ReplyItem
                reply={r}
                API_BASE={API_BASE}
                currentUser={currentUser}
                onReplyLike={onToggleLike}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
