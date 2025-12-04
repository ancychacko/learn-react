import React from "react";
import "../../Pages/Messaging.css";

export default function MessageBubble({ msg, currentUser }) {
  const isMine = msg.sender_id === currentUser?.id;

  return (
    <div className={`bubble-wrapper ${isMine ? "mine" : "theirs"}`}>
      {/* TEXT */}
      {msg.message_text && (
        <div className="bubble-text">{msg.message_text}</div>
      )}

      {/* ATTACHMENT PREVIEW */}
      {msg.attachment_url && (
        <div className="bubble-attachment">
          {msg.attachment_type === "image" && (
            <img
              src={`${window.location.protocol}//${window.location.hostname}:4000${msg.attachment_url}`}
              className="bubble-image"
              alt=""
            />
          )}

          {msg.attachment_type === "video" && (
            <video
              controls
              className="bubble-video"
              src={`${window.location.protocol}//${window.location.hostname}:4000${msg.attachment_url}`}
            />
          )}

          {msg.attachment_type === "file" && (
            <a
              href={`${window.location.protocol}//${window.location.hostname}:4000${msg.attachment_url}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              📎 Download file
            </a>
          )}
        </div>
      )}

      {/* SHARED POST PREVIEW */}
      {msg.post_id && (
        <div className="bubble-post-card">
          <div className="bubble-post-title">Shared a post</div>
          <a href={`/Post/${msg.post_id}`} className="bubble-post-link">
            View Post → #{msg.post_id}
          </a>
        </div>
      )}
    </div>
  );
}
