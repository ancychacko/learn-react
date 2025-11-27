//src/Components/NotificationItem.js
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Bell, Trash2, ThumbsDown } from "lucide-react";
import useClickOutside from "../Hooks/useClickOutside";
import "./Notifications.css";

export default function NotificationItem({
  note,
  API_BASE,
  onRead,
  onDelete,
  onMute,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useClickOutside(menuRef, () => setMenuOpen(false));

  const avatar = note.actor_avatar
    ? `${window.location.protocol}//${window.location.hostname}:4000${note.actor_avatar}`
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  function getActionText() {
    switch (note.type) {
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "share":
        return "shared your post";
      default:
        return "interacted with your post";
    }
  }

  async function goToPost() {
    await fetch(`${API_BASE}/api/notifications/${note.id}/read`, {
      method: "POST",
      credentials: "include",
    });

    onRead(note.id);

    if (note.comment_id)
      navigate(`/Post/${note.post_id}?comment=${note.comment_id}`);
    else navigate(`/Post/${note.post_id}`);
  }

  async function deleteNotification() {
    await fetch(`${API_BASE}/api/notifications/${note.id}/delete`, {
      method: "DELETE",
      credentials: "include",
    });

    setMenuOpen(false);
    onDelete(note.id);
  }

  async function mutePerson() {
    await fetch(`${API_BASE}/api/notifications/mute/${note.actor_id}`, {
      method: "POST",
      credentials: "include",
    });

    setMenuOpen(false);
    onMute(note.actor_id);
  }

  return (
    <div
      className={`ln-card ${note.is_read ? "" : "unread"}`}
      onClick={(e) => {
        if (!menuOpen) goToPost();
      }}
    >
      <img src={avatar} className="ln-avatar" />

      <div className="ln-card-body">
        <div className="ln-card-text">
          <strong>{note.actor_name}</strong> {getActionText()}
          {note.post_content && (
            <span className="ln-preview">
              {" "}
              — {note.post_content.slice(0, 60)}…
            </span>
          )}
        </div>

        {note.comment_content && (
          <div className="ln-comment-preview">
            “{note.comment_content.slice(0, 80)}…”
          </div>
        )}

        <div className="ln-card-time">
          {new Date(note.created_at).toLocaleString()}
        </div>
      </div>

      {/* Menu */}
      <div
        className="ln-card-menu"
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="dots-btn" onClick={() => setMenuOpen((p) => !p)}>
          <MoreHorizontal size={18} />
        </button>

        {menuOpen && (
          <div className="ln-menu-dropdown">
            <div className="ln-menu-item">
              <Bell size={16} /> Change notification preferences
            </div>

            <div className="ln-menu-item" onClick={deleteNotification}>
              <Trash2 size={16} /> Delete notification
            </div>

            <div className="ln-menu-item" onClick={mutePerson}>
              <ThumbsDown size={16} /> Show less like this (Mute)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

