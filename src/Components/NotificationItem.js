// src/Components/NotificationItem.js
import React from "react";
import { MessageSquare, ThumbsUp, Send, User } from "lucide-react";

export default function NotificationItem({ note, API_BASE, onRead }) {
  function icon() {
    switch (note.type) {
      case "comment":
        return <MessageSquare size={20} color="#0a66c2" />;
      case "like":
        return <ThumbsUp size={20} color="#0a66c2" />;
      case "share":
        return <Send size={20} color="#0a66c2" />;
      default:
        return <User size={20} color="#0a66c2" />;
    }
  }

  function formatTime(ts) {
    const date = new Date(ts);
    return date.toLocaleString();
  }

  async function markRead() {
    await fetch(`${API_BASE}/api/notifications/${note.id}/read`, {
      method: "POST",
      credentials: "include",
    });
    onRead(note.id);
  }

  return (
    <div
      className={`notification-item ${note.is_read ? "read" : "unread"}`}
      onClick={markRead}
    >
      <div className="note-icon">{icon()}</div>

      <div className="note-body">
        <div className="note-text">{note.message}</div>
        <div className="note-time">{formatTime(note.created_at)}</div>
      </div>
    </div>
  );
}
