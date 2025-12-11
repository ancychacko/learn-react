// src/Components/RepostModal.js
import React, { useState, useRef, useEffect } from "react";
import "./RepostModal.css";
import { X, Globe2, Users } from "lucide-react";
import useClickOutside from "../Hooks/useClickOutside";
import SharedPost from "./SharedPost";

export default function RepostModal({
  open,
  onClose,
  currentUser,
  originalPost,
  API_BASE,
  onSuccess,
}) {
  const modalRef = useRef();

  const [visibility, setVisibility] = useState("Anyone");
  const [thoughts, setThoughts] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  /* -----------------------------------------
     RESET MODAL
  ----------------------------------------- */
  function resetModal() {
    setThoughts("");
    setVisibility("Anyone");
    setError("");
  }

  /* -----------------------------------------
     CLOSE WHEN CLICK OUTSIDE
  ----------------------------------------- */
  useClickOutside(modalRef, () => {
    resetModal();
    onClose();
  });

  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
  }, [open]);

  if (!open) return null;

  function mediaUrl(path) {
    if (!path) return null;
    return `${window.location.protocol}//${window.location.hostname}:4000${path}`;
  }

  /* -----------------------------------------
     HANDLE POST (REPOST)
  ----------------------------------------- */
  async function handlePost() {
    if (posting) return;

    if (!thoughts.trim()) {
      setError("Please enter your thoughts before reposting.");
      return;
    }

    setPosting(true);

    const url = `${API_BASE}/api/posts/${Number(originalPost?.id)}/share`;

    const body = {
      recipients: [],
      share_to_feed: true,
      comment: thoughts.trim(),
      visibility,
    };

    const r = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setPosting(false);

    if (r.ok) {
      onSuccess(); // triggers feed refresh instantly
      resetModal();
      onClose();
    }
  }

  return (
    <div className="repost-modal-overlay">
      {/* MODAL (scrollable body added) */}
      <div className="repost-modal" ref={modalRef}>
        {/* HEADER (fixed) */}
        <div className="repost-header">
          <h3>Share post</h3>
          <button
            className="close-btn"
            style={{ width: "50px" }}
            onClick={() => {
              resetModal();
              onClose();
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* SCROLLABLE BODY WRAPPER */}
        <div className="repost-scroll-body">
          {/* USER ROW */}
          <div className="repost-user-row">
            <img
              className="repost-avatar"
              src={
                currentUser?.avatar_url
                  ? mediaUrl(currentUser.avatar_url)
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt=""
            />
            <div>
              <div className="repost-username">{currentUser?.name}</div>

              <select
                className="visibility-dropdown"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="Anyone">
                  <Globe2 size={14} /> Anyone
                </option>
                <option value="Connections">
                  <Users size={14} /> Connections
                </option>
              </select>
            </div>
          </div>

          {/* TEXTAREA */}
          <textarea
            className="repost-textarea"
            placeholder="Start writing or use @ to mention people…"
            value={thoughts}
            onChange={(e) => {
              setThoughts(e.target.value);
              if (error) setError("");
            }}
          />

          {error && <div className="repost-error-message">{error}</div>}

          {/* ORIGINAL POST PREVIEW */}
          <div className="repost-original">
            <SharedPost original={originalPost} />
          </div>
        </div>

        {/* FOOTER (fixed) */}
        <div className="repost-footer">
          <button
            className="repost-submit-btn"
            disabled={posting || !thoughts.trim()}
            onClick={handlePost}
          >
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

