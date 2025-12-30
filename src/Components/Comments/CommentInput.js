// src/Components/CommentInput.js
import React, { useRef, useState, useEffect } from "react";
import { Smile, Image as ImageIcon } from "lucide-react";
import "./Comment.css";

export default function CommentInput({
  API_BASE = "",
  postId,
  currentUser,
  parentId = null,
  mentionName = null,
  onPosted = null,
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const photoRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => {
    // If mentionName provided, prefill the textarea with "@Name " when parentId changes
    if (mentionName && parentId) {
      const pre = `@${mentionName} `;
      setText((cur) => (cur.trim().length === 0 ? pre : cur));
      // put cursor at end
      setTimeout(() => {
        if (taRef.current) {
          taRef.current.focus();
          taRef.current.selectionStart = taRef.current.selectionEnd =
            taRef.current.value.length;
        }
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId, mentionName]);

  function handleChange(e) {
    setText(e.target.value);
    const el = taRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }

  function handlePhoto(e) {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setPreviewUrl(URL.createObjectURL(f));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, parent_id: parentId || null }),
      });
      if (r.ok) {
        const created = await r.json();
        setText("");
        setPreviewUrl(null);
        if (onPosted) onPosted(created);
      } else {
        const b = await r.json().catch(() => ({}));
        // fallback: no alerts; component that called this should show toast if desired
        console.warn(b.error || "Failed to post comment");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      if (taRef.current) taRef.current.style.height = "auto";
    }
  }
  
  return (
    <form
      onSubmit={handleSubmit}
      className={`comment-input-row linkedin-input-row`}
      style={{ alignItems: "flex-start" }}
    >
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
          text.length > 0 ? "expanded" : ""
        }`}
      >
        <textarea
          ref={taRef}
          placeholder="Add a comment..."
          value={text}
          onChange={handleChange}
          className="comment-textarea"
          rows={1}
        />
        <div className="comment-icons">
          <Smile size={18} className="icon" />
          <ImageIcon
            size={18}
            className="icon"
            onClick={() => photoRef.current?.click()}
          />
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            style={{ display: "none" }}
          />
        </div>
        {text.trim().length > 0 && (
          <button type="submit" className="comment-post-btn" disabled={loading}>
            {loading ? "Posting..." : "Comment"}
          </button>
        )}
      </div>

      {previewUrl && (
        <div style={{ marginLeft: 56, marginTop: 8 }}>
          <img
            src={previewUrl}
            alt="preview"
            style={{ maxWidth: 120, borderRadius: 8 }}
          />
        </div>
      )}
    </form>
  );
}
