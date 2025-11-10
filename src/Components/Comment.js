import React, { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

/**
 * Props:
 *  - API_BASE
 *  - postId
 *  - currentUser (optional) { id, name, avatar_url }
 */
export default function Comment({ API_BASE, postId, currentUser }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchComments() {
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        credentials: "include",
      });
      if (r.ok) {
        const data = await r.json();
        setComments(data);
      }
    } catch (err) {
      console.error("fetch comments err", err);
    }
  }

  useEffect(() => {
    if (open) fetchComments();
  }, [open, postId]);

  async function sendComment(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input }),
      });
      if (r.ok) {
        const c = await r.json();
        setComments((list) => [...list, c]);
        setInput("");
      } else {
        const b = await r.json();
        alert(b.error || "Failed to post comment");
      }
    } catch (err) {
      console.error("post comment err", err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="comment-wrapper">
      <button
        className="comment-btn"
        onClick={() => setOpen((o) => !o)}
        title="Comment"
      >
        <MessageCircle size={18} />
        <span>Comment</span>
      </button>

      {open && (
        <div className="comment-panel">
          <div className="comments-list">
            {comments.length === 0 && (
              <div className="muted">No comments yet</div>
            )}
            {comments.map((c) => (
              <div key={c.id} className="comment-row">
                <img
                  className="avatar-sm"
                  src={
                    c.avatar_url
                      ? `${window.location.protocol}//${window.location.hostname}:4000${c.avatar_url}`
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={c.user_name}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{c.user_name}</div>
                  <div style={{ fontSize: 13 }}>{c.content}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={sendComment} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Posting..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
