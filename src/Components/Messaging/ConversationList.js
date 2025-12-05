//src/Components/Messaging/ConversationList.js
import React from "react";

export default function ConversationList({
  conversations,
  activeUser,
  onSelect,
}) {
  return (
    <div className="conversation-list">
      {conversations.length === 0 && (
        <div className="muted">No conversations yet</div>
      )}

      {conversations.map((c) => (
        <div
          key={c.user_id}
          className={`conversation-item ${
            activeUser?.id === c.user_id ? "active" : ""
          }`}
          onClick={() =>
            onSelect({
              id: c.user_id,
              name: c.name,
              avatar_url: c.avatar_url,
            })
          }
        >
          <img
            src={
              c.avatar_url
                ? `${window.location.protocol}//${window.location.hostname}:4000${c.avatar_url}`
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="conversation-avatar"
            alt=""
          />

          <div className="conversation-meta">
            <div className="conversation-name">{c.name}</div>

            <div className="conversation-last">
              {c.last_message
                ? c.last_message
                : c.last_message_post
                ? "Shared a post"
                : "No messages yet"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
