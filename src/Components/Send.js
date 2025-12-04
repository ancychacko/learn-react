// src/Components/Send.js
import React, { useState } from "react";
import { Send as SendIcon } from "lucide-react";
import ShareModal from "./ShareModal";
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
    toast.addToast("Post sent successfully.", { type: "success" });
  }

  return (
    <>
      <button
        className="action-btn send-btn"
        onClick={() => setModalOpen(true)}
        style={{ minWidth: 90 }}
      >
        <SendIcon size={18} className="icon" />
        <span>Send</span>
      </button>

      <ShareModal
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
