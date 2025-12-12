//src/Components/ImagePreviewModal.js
import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import "./ImagePreviewModal.css";
import {
  X,
  MessageCircle,
  Repeat2,
  Send as SendIcon,
  Edit3,
} from "lucide-react";

import Like from "./Like";
import Comment from "./Comment";
import SendModal from "./SendModal";
import RepostModal from "./RepostModal";
import useClickOutside from "../Hooks/useClickOutside";

export default function ImagePreviewModal({
  open,
  onClose,
  post,
  API_BASE = "",
  currentUser,
  refresh,
}) {
  const [likeCount, setLikeCount] = useState(post?.like_count || 0);
  const [likedByMe, setLikedByMe] = useState(post?.liked_by_me || false);
  const [commentCount, setCommentCount] = useState(post?.comment_count || 0);

  const [openComment, setOpenComment] = useState(false);
  const [openRepostModal, setOpenRepostModal] = useState(false);
  const [openSendModal, setOpenSendModal] = useState(false);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);

  const modalRef = useRef(null);
  const rightPanelRef = useRef(null);
  const repostBtnRef = useRef();
  const actionBarRef = useRef(null);

  const [menuPos, setMenuPos] = useState(null);
  const [actionBarSticky, setActionBarSticky] = useState(false);

  // Close modal on outside click
  useClickOutside(modalRef, () => {
    if (open) onClose();
  });

  // sync counts
  useEffect(() => {
    setLikeCount(post?.like_count ?? 0);
    setLikedByMe(post?.liked_by_me ?? false);
    setCommentCount(post?.comment_count ?? 0);
  }, [post]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    return () => {
      const top = document.body.style.top || "0px";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      const scrollTo = Math.abs(parseInt(top || "0", 10));
      window.scrollTo(0, scrollTo);
    };
  }, [open]);

  // Detect if action bar should be sticky
  useEffect(() => {
    const rightPanel = rightPanelRef.current;
    const actionBar = actionBarRef.current;
    if (!rightPanel || !actionBar) return;

    const handleScroll = () => {
      const actionBarRect = actionBar.getBoundingClientRect();
      const rightPanelRect = rightPanel.getBoundingClientRect();

      // Check if action bar would scroll out of view at bottom
      const shouldBeSticky = actionBarRect.bottom > rightPanelRect.bottom;
      setActionBarSticky(shouldBeSticky);
    };

    rightPanel.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => rightPanel.removeEventListener("scroll", handleScroll);
  }, [post, openComment]);

  // compute repost menu position
  useLayoutEffect(() => {
    if (!repostMenuOpen) {
      setMenuPos(null);
      return;
    }
    const btn = repostBtnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const menuW = 260;
    const menuH = 100;

    // Position menu above the button
    let top = rect.top - menuH - 8;
    let left = rect.left;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // If menu would go off top, position below button instead
    if (top < 8) {
      top = rect.bottom + 8;
    }

    // Clamp to viewport
    top = Math.max(8, Math.min(top, vh - menuH - 8));
    left = Math.max(8, Math.min(left, vw - menuW - 8));

    setMenuPos({ top: Math.round(top), left: Math.round(left) });
  }, [repostMenuOpen]);

  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  function mediaUrl(path) {
    if (!path) return null;
    return `${window.location.protocol}//${window.location.hostname}:4000${path}`;
  }

  return ReactDOM.createPortal(
    <div className="img-modal-overlay" onClick={onClose}>
      <div className="img-modal" ref={modalRef} onClick={stop}>
        {/* LEFT IMAGE */}
        <div className="img-left">
          <img
            src={mediaUrl(post.media_url)}
            alt={post.content ? post.content.slice(0, 120) : "preview"}
            className="img-preview"
            draggable={false}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="img-right" ref={rightPanelRef}>
          {/* HEADER (sticky) */}
          <div className="img-right-header">
            <div className="img-header-user">
              <img
                src={
                  post.avatar_url
                    ? mediaUrl(post.avatar_url)
                    : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                className="img-header-avatar"
                alt=""
              />
              <div>
                <div className="img-header-name">{post.user_name}</div>
                <div className="img-header-meta">
                  {new Date(post.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <button
              className="img-close-btn"
              onClick={onClose}
              aria-label="Close preview"
            >
              <X size={26} color="black" />
            </button>
          </div>

          {/* SCROLLABLE CONTENT AREA */}
          <div className="img-right-scrollable">
            {/* POST CONTENT */}
            <div className="img-post-content">
              {(post.content || "").split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            {/* ACTION BAR (positioned right below content, becomes sticky when scrolling) */}
            <div className="action-div">
              <div
                ref={actionBarRef}
                className={`img-right-actions ${
                  actionBarSticky ? "sticky" : ""
                }`}
              >
                <Like
                  API_BASE={API_BASE}
                  postId={post.id}
                  initialLiked={likedByMe}
                  initialCount={likeCount}
                  onToggle={(liked, count) => {
                    setLikedByMe(liked);
                    setLikeCount(count);
                    refresh?.();
                  }}
                />

                <button
                  className="action-btn"
                  onClick={() => setOpenComment((s) => !s)}
                  aria-expanded={openComment}
                >
                  <MessageCircle size={18} /> Comment
                </button>

                {/* REPOST BUTTON */}
                <div style={{ position: "relative" }}>
                  <button
                    ref={repostBtnRef}
                    className="action-btn"
                    onClick={() => {
                      setRepostMenuOpen((s) => !s);
                    }}
                    aria-expanded={repostMenuOpen}
                  >
                    <Repeat2 size={18} /> Repost
                  </button>

                  {/* REPOST MENU VIA PORTAL */}
                  {repostMenuOpen && (
                    <div className="repost-menu">
                      <button
                        className="repost-menu-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRepostMenuOpen(false);
                          setOpenRepostModal(true);
                        }}
                      >
                        <Edit3 size={17} />
                        <span>Repost with thoughts</span>
                      </button>

                      <button
                        className="repost-menu-item"
                        onClick={async (e) => {
                          e.stopPropagation();
                          setRepostMenuOpen(false);
                          try {
                            const r = await fetch(
                              `${API_BASE}/api/posts/${post.id}/share`,
                              {
                                method: "POST",
                                credentials: "include",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  recipients: [],
                                  share_to_feed: true,
                                  comment: null,
                                  visibility: "Anyone",
                                }),
                              }
                            );
                            if (r.ok) refresh?.();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        <Repeat2 size={17} />
                        <span>Repost instantly</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  className="action-btn"
                  onClick={() => setOpenSendModal(true)}
                >
                  <SendIcon size={20} /> Send
                </button>
              </div>

              {/* COMMENT SECTION (below action bar) */}
              <div
                className="img-comment-container"
                style={{ display: openComment ? "block" : "none" }}
              >
                <Comment
                  API_BASE={API_BASE}
                  postId={post.id}
                  currentUser={currentUser}
                  onCountChange={(count) => {
                    setCommentCount(count);
                    refresh?.();
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CHILD MODALS */}
        {openRepostModal && (
          <div ref={repostBtnRef} onClick={stop}>
            <RepostModal
              open={openRepostModal}
              onClose={() => setOpenRepostModal((S) => !S)}
              currentUser={currentUser}
              originalPost={post}
              API_BASE={API_BASE}
              onSuccess={() => {
                setOpenRepostModal(false);
                refresh?.();
              }}
            />
          </div>
        )}

        {openSendModal && (
          <div onClick={stop}>
            <SendModal
              open={openSendModal}
              onClose={() => setOpenSendModal(false)}
              postId={post.id}
              API_BASE={API_BASE}
              posterName={post.user_name}
              onSent={() => setOpenSendModal(false)}
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
