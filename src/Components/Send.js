// src/Components/Send.js
import React, { useState } from "react";
import { Send as SendIcon } from "lucide-react";
import SendModal from "./SendModal";
import { useToast } from "../Contexts/ToastContext";

export default function Send({
  API_BASE = "",
  postId,
  onShared,
  posterName = "Post",
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();

  function handleSent(newCount) {
    if (typeof onShared === "function") onShared(newCount);
    toast.addToast("Message sent successfully.", { type: "success" });
  }

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "10px 12px",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#5f6368",
          minWidth: "110px",
          transition: "background 0.15s, color 0.15s",
        }}
      >
        <SendIcon size={18} />
        <span>Send</span>
      </button>

      <SendModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        postId={postId}
        API_BASE={API_BASE}
        posterName={posterName}
        onSent={(count) => {
          try {
            handleSent(count);
          } finally {
            setModalOpen(false);
          }
        }}
      />
    </>
  );
}
