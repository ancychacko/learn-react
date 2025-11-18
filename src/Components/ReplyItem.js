// src/Components/ReplyItem.js
import React from "react";
import { ThumbsUp } from "lucide-react";
import "./Comment.css";

export default function ReplyItem({ reply, API_BASE = "", onReplyLike }) {
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
