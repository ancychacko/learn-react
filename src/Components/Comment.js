//src/Components/Comment.js
import React, { useEffect, useState, useRef } from "react";
import { Smile, Image as ImageIcon } from "lucide-react";
import "./Comment.css";

export default function Comment({
  API_BASE = "",
  postId,
  currentUser,
  onCountChange,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newText, setNewText] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const photoInputRef = useRef(null);
  const textareaRef = useRef(null);

  async function fetchComments() {
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        credentials: "include",
      });
      if (r.ok) {
        const data = await r.json();
        setComments(data);
        if (onCountChange) onCountChange(data.length);
      }
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  }

  useEffect(() => {
    fetchComments();
  }, []);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newText.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newText }),
      });
      if (r.ok) {
        const created = await r.json();
        setComments((s) => [created, ...s]);
        setNewText("");
        if (onCountChange) onCountChange(comments.length + 1);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function handleTextChange(e) {
    setNewText(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  return (
    <div className="comment-section">
      <form onSubmit={handleAddComment} className="comment-input-row">
        <img
          src={
            currentUser?.avatar_url
              ? `${window.location.protocol}//${window.location.hostname}:4000${currentUser.avatar_url}`
              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          className="comment-avatar current-user"
          alt="Your avatar"
        />

        <div
          className={`comment-input-container ${
            newText.length > 0 ? "expanded" : ""
          }`}
        >
          <textarea
            ref={textareaRef}
            placeholder="Add a comment..."
            value={newText}
            onChange={handleTextChange}
            disabled={loading}
            rows={1}
            className="comment-textarea"
          />
          <div className="comment-icons">
            <Smile size={18} className="icon" />
            <ImageIcon
              size={18}
              className="icon"
              onClick={() => photoInputRef.current?.click()}
            />
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: "none" }}
            />
          </div>
          {newText.trim().length > 0 && (
            <button
              type="submit"
              className="comment-post-btn"
              disabled={loading}
            >
              Comment
            </button>
          )}
        </div>
      </form>

      {previewUrl && (
        <div className="comment-media-preview">
          <img src={previewUrl} alt="Preview" />
        </div>
      )}

      <div className="comments-list">
        {comments.length === 0 && <div className="muted">No comments yet</div>}
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <img
              src={
                c.avatar_url
                  ? `${window.location.protocol}//${window.location.hostname}:4000${c.avatar_url}`
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="comment-avatar"
              alt={c.user_name}
            />
            <div className="comment-body">
              <div className="comment-author">{c.user_name}</div>
              <div className="comment-text">{c.content}</div>
              <div className="comment-meta">
                {new Date(c.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
