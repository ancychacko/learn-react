// src/Components/CommentItem.js
import React, { useState, useRef, useEffect } from "react";
import {
  ThumbsUp,
  CornerDownLeft,
  MoreHorizontal,
  Link as LinkIcon,
  UserPlus,
  Flag,
  EyeOff,
  Edit,
  Trash2,
  Eye,
  XCircle,
  CheckCircle,
} from "lucide-react";

import ReplyItem from "./ReplyItem";
import CommentInput from "./CommentInput";
import "./Comment.css";
import useClickOutside from "../Hooks/useClickOutside";
import { useToast } from "../Contexts/ToastContext";

export default function CommentItem({
  comment,
  API_BASE = "",
  currentUser,
  rootId, // top-level root id (for nested replies cohesion)
  openThreadFor,
  setOpenThreadFor,
  openReplyFor,
  setOpenReplyFor,
  onReplyAdded,
  onToggleLike,
}) {
  const toast = useToast();
  const [likeLoading, setLikeLoading] = useState(false);
  const [liked, setLiked] = useState(Boolean(comment.liked_by_me));
  const [likeCount, setLikeCount] = useState(Number(comment.like_count || 0));
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.content);
  const [processingFollow, setProcessingFollow] = useState(false);
  const [isFollowing, setIsFollowing] = useState(Boolean(comment.is_following));
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  // whether this top-level thread's replies are visible
  const threadOpen = openThreadFor === rootId;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function toggleLike() {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/comments/${comment.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (r.ok) {
        const b = await r.json();
        setLiked(Boolean(b.liked));
        setLikeCount(Number(b.count || 0));
        if (onToggleLike) onToggleLike();
      } else {
        toast.addToast("Failed to toggle like", { type: "error" });
      }
    } catch (err) {
      console.error(err);
      toast.addToast("Network error while liking", { type: "error" });
    }
    setLikeLoading(false);
  }

  // toggle reply editor for this comment - ensure its top-level thread opens
  function toggleReply() {
    setOpenThreadFor((cur) => (cur === rootId ? null : rootId)); // open this root
    setOpenReplyFor((cur) => (cur === comment.id ? null : comment.id)); // toggle editor for this id
  }

  function copyLink() {
    const link = `${window.location.origin}/post/${comment.post_id}#comment-${comment.id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => toast.addToast("Comment link copied", { type: "success" }))
      .catch(() => toast.addToast("Failed to copy link", { type: "error" }));
    setMenuOpen(false);
  }

  async function toggleFollow() {
    if (processingFollow) return;
    setProcessingFollow(true);
    try {
      const r = await fetch(`${API_BASE}/api/users/${comment.user_id}/follow`, {
        method: "POST",
        credentials: "include",
      });
      if (r.ok) {
        const body = await r.json();
        setIsFollowing(Boolean(body.following));
        toast.addToast(
          body.following
            ? `Following ${comment.user_name}`
            : `Unfollowed ${comment.user_name}`,
          { type: "success" }
        );
      } else {
        toast.addToast("Failed to toggle follow", { type: "error" });
      }
    } catch (err) {
      console.error(err);
      toast.addToast("Network error", { type: "error" });
    } finally {
      setProcessingFollow(false);
      setMenuOpen(false);
    }
  }

  async function reportComment() {
    try {
      const r = await fetch(`${API_BASE}/api/comments/${comment.id}/report`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Reported from UI" }),
      });
      if (r.ok) toast.addToast("Reported — thank you", { type: "success" });
      else toast.addToast("Failed to report", { type: "error" });
    } catch (err) {
      console.error(err);
      toast.addToast("Network error", { type: "error" });
    }
    setMenuOpen(false);
  }

  async function confirmDelete() {
    try {
      const r = await fetch(`${API_BASE}/api/comments/${comment.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (r.ok) {
        toast.addToast("Comment deleted", { type: "success" });
        if (onReplyAdded) onReplyAdded(rootId, null);
      } else {
        const b = await r.json().catch(() => ({}));
        toast.addToast(b.error || "Failed to delete", { type: "error" });
      }
    } catch (err) {
      console.error(err);
      toast.addToast("Network error", { type: "error" });
    } finally {
      setMenuOpen(false);
      setDeleteConfirm(false);
    }
  }

  async function submitEdit() {
    if (!editedText.trim()) {
      toast.addToast("Content required", { type: "error" });
      return;
    }
    try {
      const r = await fetch(`${API_BASE}/api/comments/${comment.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedText }),
      });
      if (r.ok) {
        toast.addToast("Comment updated", { type: "success" });
        setEditing(false);
        setMenuOpen(false);
        if (onReplyAdded) onReplyAdded(rootId, comment.id);
      } else {
        const b = await r.json().catch(() => ({}));
        toast.addToast(b.error || "Failed to edit", { type: "error" });
      }
    } catch (err) {
      console.error(err);
      toast.addToast("Network error", { type: "error" });
    }
  }

  return (
    <div className="comment-item" style={{ marginBottom: 8 }}>
      <img
        src={
          comment.avatar_url
            ? `${window.location.protocol}//${window.location.hostname}:4000${comment.avatar_url}`
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }
        className="comment-avatar"
        alt={comment.user_name}
      />

      <div style={{ flex: 1 }}>
        <div className="comment-body" style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <div style={{ width: "100%" }}>
              <div className="comment-author">{comment.user_name}</div>

              {!editing ? (
                <div className="comment-text">{comment.content}</div>
              ) : (
                <div style={{ marginTop: 6 }}>
                  <textarea
                    className="edit-textarea"
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: 70,
                      padding: 8,
                      borderRadius: 6,
                    }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="save-btn" onClick={submitEdit}>
                      <CheckCircle size={16} style={{ marginRight: 6 }} /> Save
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setEditing(false);
                        setEditedText(comment.content);
                      }}
                    >
                      <XCircle size={16} style={{ marginRight: 6 }} /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginLeft: 8, position: "relative" }} ref={menuRef}>
              <button
                className="menu-trigger-btn"
                onClick={() => setMenuOpen((s) => !s)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                <MoreHorizontal size={18} />
              </button>

              {menuOpen && (
                <div className="linked-dropdown" role="menu">
                  <button
                    className="menu-item-btn"
                    onClick={() => {
                      copyLink();
                    }}
                  >
                    <LinkIcon size={16} />
                    <span>Copy link to comment</span>
                  </button>

                  {comment.is_owner ? (
                    <>
                      <button
                        className="menu-item-btn"
                        onClick={() => {
                          setEditing(true);
                          setMenuOpen(false);
                        }}
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>

                      {!deleteConfirm ? (
                        <button
                          className="menu-item-btn delete"
                          onClick={() => setDeleteConfirm(true)}
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <div style={{ padding: 6 }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="delete-confirm-btn"
                              onClick={confirmDelete}
                            >
                              <Trash2 size={14} /> Yes, delete
                            </button>
                            <button
                              className="delete-cancel-btn"
                              onClick={() => setDeleteConfirm(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <button
                        className="menu-item-btn"
                        onClick={() => {
                          setMenuOpen(false);
                          toast.addToast("Who can see this — not implemented", {
                            type: "info",
                          });
                        }}
                      >
                        <Eye size={16} />
                        <span>Who can see this</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="menu-item-btn"
                        onClick={toggleFollow}
                        disabled={processingFollow}
                      >
                        <UserPlus size={16} />
                        <span>
                          {isFollowing
                            ? `Unfollow ${comment.user_name}`
                            : `Follow ${comment.user_name}`}
                        </span>
                      </button>

                      <button className="menu-item-btn" onClick={reportComment}>
                        <Flag size={16} />
                        <span>Report</span>
                      </button>

                      <button
                        className="menu-item-btn"
                        onClick={() => {
                          setMenuOpen(false);
                          toast.addToast("Hide comment — not implemented", {
                            type: "info",
                          });
                        }}
                      >
                        <EyeOff size={16} />
                        <span>I don’t want to see this</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="comment-meta-row">
            <button
              onClick={toggleLike}
              className="meta-btn"
              style={{ color: liked ? "#0a66c2" : undefined }}
              aria-pressed={liked}
            >
              <ThumbsUp
                size={15}
                style={{ color: liked ? "#0a66c2" : undefined }}
              />
              <span>{likeCount > 0 ? likeCount : "Like"}</span>
            </button>

            <button onClick={toggleReply} className="meta-btn">
              <CornerDownLeft size={15} /> Reply
            </button>

            <span className="date-text">
              {new Date(comment.created_at).toLocaleString()}
            </span>

            {comment.reply_count > 0 && (
              <span className="reply-count-text muted-btn">
                {comment.reply_count}{" "}
                {comment.reply_count === 1 ? "reply" : "replies"}
              </span>
            )}
          </div>
        </div>

        {/* Reply input (only when a reply editor open inside this thread AND threadOpen) */}
        {threadOpen && openReplyFor === comment.id && (
          <div style={{ marginLeft: 48 }}>
            <CommentInput
              API_BASE={API_BASE}
              postId={comment.post_id}
              currentUser={currentUser}
              parentId={comment.id}
              mentionName={comment.user_name}
              onPosted={(created) => {
                // reload and keep thread + the newly posted reply's editor closed
                if (onReplyAdded) onReplyAdded(rootId, null);
                // Keep thread open (rootId) but do not leave reply editor open
                setOpenThreadFor(rootId);
                setOpenReplyFor(null);
              }}
            />
          </div>
        )}

        {/* Replies list shown only when threadOpen */}
        {threadOpen && comment.replies && comment.replies.length > 0 && (
          <div style={{ marginLeft: 48, marginTop: 8 }}>
            {comment.replies.map((r) => (
              <ReplyItem
                key={r.id}
                reply={r}
                API_BASE={API_BASE}
                currentUser={currentUser}
                onReplyLike={() => {
                  if (onToggleLike) onToggleLike();
                }}
                openReplyFor={openReplyFor}
                setOpenReplyFor={setOpenReplyFor}
                rootId={rootId}
                onReplyAdded={(keepRootId = rootId, keepReplyId = null) => {
                  if (onReplyAdded) onReplyAdded(keepRootId, keepReplyId);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
