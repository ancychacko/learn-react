// src/Components/Messaging/MessageInput.js
import React, { useState } from "react";
import { Send, Paperclip } from "lucide-react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  function handleSubmit() {
    if (!text.trim() && !file) return;

    onSend(text, file);
    setText("");
    setFile(null);
  }

  return (
    <div className="message-input">
      <input
        type="text"
        placeholder="Write a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="message-input-icons">
        <label className="file-icon">
          <Paperclip size={20} />
          <input
            type="file"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>
      </div>

      <button
        onClick={handleSubmit}
        className="send-btn"
        style={{ width: "50px" }}
      >
        <Send size={18} />
      </button>
    </div>
  );
}
