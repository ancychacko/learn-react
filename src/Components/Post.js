import React, { useEffect, useRef, useState } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Send,
  Forward,
  Pencil,
  Trash,
  Flag,
  Ellipsis,
} from "lucide-react";

export default function Post({ post, API_BASE, currentUserId, refresh }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(post.content);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const ref = useRef();

  // 🔹 Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // 🔹 Helper to generate media URL
  function mediaUrl(p) {
    return p
      ? `${window.location.protocol}//${window.location.hostname}:4000${p}`
      : null;
  }

  // 🔹 Save edited post
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("content", text);
      if (file) fd.append("media", file);

      const r = await fetch(`${API_BASE}/api/posts/${post.id}`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });

      if (!r.ok) {
        const b = await r.json();
        alert(b.error || "Update failed");
      } else {
        setEditing(false);
        refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setSaving(false);
    }
  }

  // 🔹 Delete post with confirmation
  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) return;

    try {
      const r = await fetch(`${API_BASE}/api/posts/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (r.ok) {
        refresh();
      } else {
        const b = await r.json();
        alert(b.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  }

  return (
    <article className="post-card">
      {/* 🔹 Post Header with Avatar and Menu */}
      <div className="post-header">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img
            src={
              post.avatar_url
                ? mediaUrl(post.avatar_url)
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="avatar-sm"
            alt="avatar"
          />
          <div>
            <div className="post-author">{post.user_name}</div>
            <div className="post-meta">
              {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        <div ref={ref} style={{ position: "relative" }}>
          {/* <button
            className="dots-btn"
            onClick={() => setMenuOpen((s) => !s)}
            aria-haspopup="true"
          >
            ⋯
          </button> */}
          <button
            className="dots-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            title="More options"
          >
            <Ellipsis size="20px" color="black" />
          </button>

          {menuOpen && (
            <div className="post-menu">
              {post.user_name === currentUserId && (
                <>
                  <button
                    onClick={() => {
                      setEditing(true);
                      setMenuOpen(false);
                    }}
                  >
                    <Pencil size="16px" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleDelete();
                    }}
                  >
                    <Trash size="16px" />
                    Delete Post
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  alert("Send feature not implemented yet");
                }}
              >
                <Forward size="16px" /> Send
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  alert("Report feature not implemented yet");
                }}
              >
                <Flag size="16px" />
                Report Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Post Content */}
      {!editing && (
        <div className="post-body">
          <p>{post.content}</p>
          {post.media_url && post.media_type === "image" && (
            <img
              className="post-media"
              src={mediaUrl(post.media_url)}
              alt="post media"
            />
          )}
          {post.media_url && post.media_type === "video" && (
            <video controls className="post-media">
              <source src={mediaUrl(post.media_url)} />
            </video>
          )}
        </div>
      )}

      {/* 🔹 Edit Post Form */}
      {editing && (
        <form onSubmit={handleSave} className="edit-form">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Edit your post..."
          />
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* 🔹 Action Buttons */}
      <div className="post-actions">
        <button className="action-btn">
          {" "}
          <ThumbsUp size="20px" color="blue" /> Like
        </button>
        <button className="action-btn">
          <MessageCircle size="20px" color="blue" /> Comment
        </button>
        <button className="action-btn">
          <Send size="20px" color="blue" /> Share
        </button>
      </div>
    </article>
  );
}
