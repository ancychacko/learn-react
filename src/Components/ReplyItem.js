// src/Components/ReplyItem.js
// import React, { useState, useEffect } from "react";
// import { ThumbsUp, MoreHorizontal } from "lucide-react";
// import CommentMenu from "./CommentMenu";
// import "./Comment.css";

// export default function ReplyItem({
//   reply,
//   API_BASE = "",
//   currentUser,
//   onReplyLike,
// }) {
//   const [loading, setLoading] = useState(false);
//   const [liked, setLiked] = useState(Boolean(reply.liked_by_me));
//   const [likeCount, setLikeCount] = useState(Number(reply.like_count || 0));

//   const [menuOpen, setMenuOpen] = useState(false);
//   useEffect(() => {
//     function onClose() {
//       setMenuOpen(false);
//     }
//     window.addEventListener("closeCommentMenus", onClose);
//     return () => window.removeEventListener("closeCommentMenus", onClose);
//   }, []);

//   async function toggleLike() {
//     if (loading) return;
//     setLoading(true);
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${reply.id}/like`, {
//         method: "POST",
//         credentials: "include",
//       });
//       if (r.ok) {
//         const b = await r.json();
//         setLiked(Boolean(b.liked));
//         setLikeCount(Number(b.count || 0));
//         if (onReplyLike) onReplyLike();
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleDelete() {
//     setMenuOpen(false);
//     const confirmDelete = window.confirm(
//       "Delete this reply? This action cannot be undone."
//     );
//     if (!confirmDelete) return;
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${reply.id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (r.ok) {
//         if (onReplyLike) onReplyLike();
//       } else {
//         const b = await r.json().catch(() => ({}));
//         alert(b.error || "Failed to delete");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   async function handleEdit() {
//     setMenuOpen(false);
//     const newText = prompt("Edit reply", reply.content);
//     if (newText === null) return;
//     if (!newText.trim()) return alert("Content required");
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${reply.id}`, {
//         method: "PUT",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content: newText }),
//       });
//       if (r.ok) {
//         if (onReplyLike) onReplyLike();
//       } else {
//         const b = await r.json().catch(() => ({}));
//         alert(b.error || "Failed to edit");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   async function handleReport() {
//     setMenuOpen(false);
//     const reason = prompt("Why are you reporting this reply? (optional)");
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${reply.id}/report`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ reason }),
//       });
//       if (r.ok) {
//         alert("Reported — thank you.");
//       } else {
//         const b = await r.json().catch(() => ({}));
//         alert(b.error || "Failed to report");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   async function handleDontWantToSee() {
//     setMenuOpen(false);
//     alert("We will hide similar content (placeholder).");
//   }

//   async function handleFollow(username) {
//     setMenuOpen(false);
//     try {
//       const lookup = await fetch(`${API_BASE}/api/suggestions`);
//       if (lookup.ok) {
//         const list = await lookup.json();
//         const u = list.find((x) => x.name === username);
//         if (!u) return alert("Unable to find user to follow.");
//         const r = await fetch(`${API_BASE}/api/users/${u.id}/follow`, {
//           method: "POST",
//           credentials: "include",
//         });
//         if (r.ok) {
//           alert(`You followed ${username}`);
//         } else {
//           const b = await r.json().catch(() => ({}));
//           alert(b.error || "Failed to follow");
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   return (
//     <div className="reply-row">
//       <img
//         src={
//           reply.avatar_url
//             ? `${window.location.protocol}//${window.location.hostname}:4000${reply.avatar_url}`
//             : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//         }
//         className="comment-avatar"
//         alt={reply.user_name}
//       />

//       <div className="reply-main" style={{ position: "relative" }}>
//         <div className="reply-card">
//           <div style={{ position: "absolute", top: 6, right: 6 }}>
//             <button
//               className="action-btn"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 window.dispatchEvent(new CustomEvent("closeCommentMenus"));
//                 setMenuOpen((s) => !s);
//               }}
//             >
//               <MoreHorizontal size={14} />
//             </button>
//             {menuOpen && (
//               <CommentMenu
//                 isOwner={reply.is_owner}
//                 onEdit={handleEdit}
//                 onDelete={handleDelete}
//                 onWhoCanSee={() => alert("Who can see this (placeholder)")}
//                 onReport={handleReport}
//                 onDontWantToSee={handleDontWantToSee}
//                 onFollow={handleFollow}
//                 username={reply.user_name}
//               />
//             )}
//           </div>

//           <div className="comment-author">{reply.user_name}</div>
//           <div className="comment-text">{reply.content}</div>
//         </div>

//         <div className="comment-actions-row reply-actions">
//           <button
//             className={`action-btn like-btn ${liked ? "liked" : ""}`}
//             onClick={toggleLike}
//             disabled={loading}
//           >
//             <ThumbsUp size={14} />
//             <span className="action-text">
//               {likeCount > 0 ? likeCount : "Like"}
//             </span>
//           </button>

//           <div className="action-meta">
//             <span className="comment-time">
//               {new Date(reply.created_at).toLocaleString()}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/Components/ReplyItem.js
import React, { useState } from "react";
import {
  ThumbsUp,
  MoreHorizontal,
  Link as LinkIcon,
  UserPlus,
  Flag,
  EyeOff,
  Edit,
  Trash2,
  XCircle,
  CheckCircle,
} from "lucide-react";
import "./Comment.css";

export default function ReplyItem({
  reply,
  API_BASE = "",
  currentUser,
  onReplyLike,
}) {
  const [liked, setLiked] = useState(Boolean(reply.liked_by_me));
  const [likeCount, setLikeCount] = useState(Number(reply.like_count || 0));
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(reply.content);
  const [processingFollow, setProcessingFollow] = useState(false);
  const [isFollowing, setIsFollowing] = useState(Boolean(reply.is_following));
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  async function toggleLike() {
    if (loading) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/comments/${reply.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (r.ok) {
        const b = await r.json();
        setLiked(Boolean(b.liked));
        setLikeCount(Number(b.count || 0));
        if (onReplyLike) onReplyLike();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function copyLink() {
    const link = `${window.location.origin}/post/${reply.post_id}#comment-${reply.id}`;
    navigator.clipboard.writeText(link).then(() => alert("Reply link copied"));
    setMenuOpen(false);
  }

  async function toggleFollow() {
    if (processingFollow) return;
    setProcessingFollow(true);
    try {
      const r = await fetch(`${API_BASE}/api/users/${reply.user_id}/follow`, {
        method: "POST",
        credentials: "include",
      });
      if (r.ok) {
        const body = await r.json();
        setIsFollowing(Boolean(body.following));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingFollow(false);
      setMenuOpen(false);
    }
  }

  async function reportReply() {
    try {
      await fetch(`${API_BASE}/api/comments/${reply.id}/report`, {
        method: "POST",
        credentials: "include",
      });
      alert("Reported — thank you");
    } catch (err) {
      console.error(err);
    } finally {
      setMenuOpen(false);
    }
  }

  async function confirmDelete() {
    try {
      const r = await fetch(`${API_BASE}/api/comments/${reply.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (r.ok) {
        if (onReplyLike) onReplyLike();
      } else {
        const b = await r.json().catch(() => ({}));
        alert(b.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMenuOpen(false);
      setDeleteConfirm(false);
    }
  }

  async function submitEdit() {
    if (!editedText.trim()) return alert("Content required");
    try {
      const r = await fetch(`${API_BASE}/api/comments/${reply.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedText }),
      });
      if (r.ok) {
        setEditing(false);
        setMenuOpen(false);
        if (onReplyLike) onReplyLike();
      } else {
        const b = await r.json().catch(() => ({}));
        alert(b.error || "Failed to edit");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="comment-item" style={{ marginBottom: 8 }}>
      <img
        src={
          reply.avatar_url
            ? `${window.location.protocol}//${window.location.hostname}:4000${reply.avatar_url}`
            : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
        }
        className="comment-avatar"
        alt={reply.user_name}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <div style={{ width: "100%" }}>
            <div className="comment-author">{reply.user_name}</div>

            {!editing ? (
              <div className="comment-text">{reply.content}</div>
            ) : (
              <div>
                <textarea
                  className="edit-textarea"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 60,
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
                      setEditedText(reply.content);
                    }}
                  >
                    <XCircle size={16} style={{ marginRight: 6 }} /> Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="comment-meta-row" style={{ marginTop: 8 }}>
              <button onClick={toggleLike} className="meta-btn">
                <ThumbsUp size={15} /> {likeCount > 0 ? likeCount : "Like"}
              </button>

              <div className="date-text">
                {new Date(reply.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ marginLeft: 8, position: "relative" }}>
            <button
              className="menu-trigger-btn"
              onClick={() => setMenuOpen((s) => !s)}
            >
              <MoreHorizontal size={16} />
            </button>

            {menuOpen && (
              <div className="linked-dropdown" role="menu">
                <button className="menu-item-btn" onClick={copyLink}>
                  <LinkIcon size={16} />
                  <span>Copy link to comment</span>
                </button>

                {reply.is_owner ? (
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
                      <div style={{ display: "flex", gap: 6, padding: 6 }}>
                        <button
                          className="delete-confirm-btn"
                          onClick={confirmDelete}
                        >
                          <Trash2 size={14} /> Yes
                        </button>
                        <button
                          className="delete-cancel-btn"
                          onClick={() => setDeleteConfirm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
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
                          ? `Unfollow ${reply.user_name}`
                          : `Follow ${reply.user_name}`}
                      </span>
                    </button>
                    <button className="menu-item-btn" onClick={reportReply}>
                      <Flag size={16} />
                      <span>Report</span>
                    </button>
                    <button
                      className="menu-item-btn"
                      onClick={() => {
                        setMenuOpen(false);
                        alert("I don't want to see this (implement hide)");
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
      </div>
    </div>
  );
}
