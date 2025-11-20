// src/Components/CommentItem.js
// import React, { useState, useRef, useEffect } from "react";
// import { ThumbsUp, CornerDownLeft, MoreHorizontal } from "lucide-react";
// import ReplyItem from "./ReplyItem";
// import CommentInput from "./CommentInput";
// import CommentMenu from "./CommentMenu";
// import "./Comment.css";

// export default function CommentItem({
//   comment,
//   API_BASE = "",
//   currentUser,
//   openReplyFor,
//   setOpenReplyFor,
//   onReplyAdded,
//   onToggleLike,
// }) {
//   const [likeLoading, setLikeLoading] = useState(false);
//   const [liked, setLiked] = useState(Boolean(comment.liked_by_me));
//   const [likeCount, setLikeCount] = useState(Number(comment.like_count || 0));

//   const isOpen = openReplyFor === comment.id;

//   const [editing, setEditing] = useState(false);
//   const [editedText, setEditedText] = useState(comment.content);

//   // menu open state
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuBtnRef = useRef(null);

//   useEffect(() => {
//     function onClose() {
//       setMenuOpen(false);
//     }
//     window.addEventListener("closeCommentMenus", onClose);
//     return () => window.removeEventListener("closeCommentMenus", onClose);
//   }, []);

//   async function toggleLike() {
//     if (likeLoading) return;
//     setLikeLoading(true);
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${comment.id}/like`, {
//         method: "POST",
//         credentials: "include",
//       });
//       if (r.ok) {
//         const b = await r.json();
//         setLiked(Boolean(b.liked));
//         setLikeCount(Number(b.count || 0));
//         if (onToggleLike) onToggleLike();
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLikeLoading(false);
//     }
//   }

//   function onReplyClick() {
//     setOpenReplyFor((cur) => (cur === comment.id ? null : comment.id));
//   }

//   // menu callbacks
//   function handleEdit() {
//     setMenuOpen(false);
//     setEditing(true);
//   }
//   async function handleDelete() {
//     setMenuOpen(false);
//     const confirmDelete = window.confirm("Delete this comment? This action cannot be undone.");
//     if (!confirmDelete) return;
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${comment.id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (r.ok) {
//         if (onReplyAdded) onReplyAdded(); // reload list
//       } else {
//         const b = await r.json().catch(() => ({}));
//         alert(b.error || "Failed to delete");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }
//   function handleWhoCanSee() {
//     setMenuOpen(false);
//     if (typeof onReplyAdded === "function") {
//       // placeholder: open a UI in future
//       alert("Who can see this — this is a placeholder.");
//     }
//   }
//   async function handleReport() {
//     setMenuOpen(false);
//     const reason = prompt("Why are you reporting this comment? (optional)");
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${comment.id}/report`, {
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
//     // placeholder: implement preference on backend if desired
//     alert("We will hide similar content (placeholder).");
//   }
//   async function handleFollow(username) {
//     setMenuOpen(false);
//     // we need the user's id — backend follow endpoint expects user id. We have only username.
//     // Best to fetch the user by name endpoint if you have. For demo, we attempt to find user id via API:
//     try {
//       const lookup = await fetch(`${API_BASE}/api/suggestions`); // fallback - uses suggestions list
//       if (lookup.ok) {
//         const list = await lookup.json();
//         const u = list.find((x) => x.name === username);
//         if (!u) {
//           alert("Unable to find user to follow.");
//           return;
//         }
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
//       } else {
//         alert("Unable to follow user (lookup failed).");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   async function submitEdit() {
//     if (!editedText.trim()) return alert("Content required");
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${comment.id}`, {
//         method: "PUT",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content: editedText }),
//       });
//       if (r.ok) {
//         setEditing(false);
//         if (onReplyAdded) onReplyAdded(); // reload
//       } else {
//         const b = await r.json().catch(() => ({}));
//         alert(b.error || "Failed to edit");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   return (
//     <div className="linkedin-comment-row">
//       <img
//         src={
//           comment.avatar_url
//             ? `${window.location.protocol}//${window.location.hostname}:4000${comment.avatar_url}`
//             : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//         }
//         className="comment-avatar"
//         alt={comment.user_name}
//       />

//       <div className="comment-main">
//         <div className="comment-card" style={{ position: "relative" }}>
//           {/* ellipsis menu button (top-right) */}
//           <div
//             className="comment-ellipsis"
//             style={{ position: "absolute", top: 8, right: 8 }}
//           >
//             <button
//               ref={menuBtnRef}
//               className="action-btn"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 // close other menus globally first
//                 window.dispatchEvent(new CustomEvent("closeCommentMenus"));
//                 setMenuOpen((s) => !s);
//               }}
//               aria-haspopup="true"
//               aria-expanded={menuOpen}
//             >
//               <MoreHorizontal size={16} />
//             </button>

//             {menuOpen && (
//               <CommentMenu
//                 isOwner={comment.is_owner}
//                 onEdit={handleEdit}
//                 onDelete={handleDelete}
//                 onWhoCanSee={handleWhoCanSee}
//                 onReport={handleReport}
//                 onDontWantToSee={handleDontWantToSee}
//                 onFollow={handleFollow}
//                 username={comment.user_name}
//               />
//             )}
//           </div>

//           <div className="comment-card-top">
//             <div className="comment-author">{comment.user_name}</div>
//           </div>

//           {!editing && <div className="comment-text">{comment.content}</div>}

//           {editing && (
//             <div style={{ marginTop: 8 }}>
//               <textarea
//                 value={editedText}
//                 onChange={(e) => setEditedText(e.target.value)}
//                 style={{ width: "100%", minHeight: 80 }}
//               />
//               <div style={{ marginTop: 6, display: "flex", gap: 8 }}>
//                 <button
//                   className="comment-post-btn"
//                   onClick={() => submitEdit()}
//                 >
//                   Save
//                 </button>
//                 <button
//                   className="action-btn"
//                   onClick={() => {
//                     setEditing(false);
//                     setEditedText(comment.content);
//                   }}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Actions row */}
//         <div className="comment-actions-row">
//           <button
//             className={`action-btn like-btn ${liked ? "liked" : ""}`}
//             onClick={toggleLike}
//             disabled={likeLoading}
//             aria-pressed={liked}
//           >
//             <ThumbsUp size={14} />
//             <span className="action-text">
//               {likeCount > 0 ? likeCount : "Like"}
//             </span>
//           </button>

//           <button className="action-btn reply-btn" onClick={onReplyClick}>
//             <CornerDownLeft size={14} />
//             <span className="action-text">Reply</span>
//           </button>

//           <div className="action-meta">
//             <span className="comment-time">
//               {new Date(comment.created_at).toLocaleString()}
//             </span>
//             {typeof comment.reply_count === "number" &&
//               comment.reply_count > 0 && (
//                 <button
//                   className="action-btn replies-count-btn"
//                   onClick={onReplyClick}
//                 >
//                   {comment.reply_count}{" "}
//                   {comment.reply_count === 1 ? "reply" : "replies"}
//                 </button>
//               )}
//           </div>
//         </div>

//         {/* Reply input & replies */}
//         {isOpen && (
//           <div className="comment-replies-area">
//             <CommentInput
//               API_BASE={API_BASE}
//               postId={comment.post_id || comment.postId || null}
//               currentUser={currentUser}
//               parentId={comment.id}
//               mentionName={comment.user_name}
//               onPosted={() => {
//                 if (onReplyAdded) onReplyAdded();
//               }}
//             />

//             <div className="replies-list">
//               {comment.replies &&
//                 comment.replies.map((r) => (
//                   <ReplyItem
//                     key={r.id}
//                     reply={r}
//                     API_BASE={API_BASE}
//                     currentUser={currentUser}
//                     onReplyLike={onToggleLike}
//                   />
//                 ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// src/Components/CommentItem.js
import React, { useState } from "react";
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

export default function CommentItem({
  comment,
  API_BASE = "",
  currentUser,
  openReplyFor,
  setOpenReplyFor,
  onReplyAdded,
  onToggleLike,
}) {
  const [likeLoading, setLikeLoading] = useState(false);
  const [liked, setLiked] = useState(Boolean(comment.liked_by_me));
  const [likeCount, setLikeCount] = useState(Number(comment.like_count || 0));
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.content);
  const [processingFollow, setProcessingFollow] = useState(false);
  const [isFollowing, setIsFollowing] = useState(Boolean(comment.is_following));
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const isOpen = openReplyFor === comment.id;

  // toggle comment like
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
      }
    } catch (err) {
      console.error(err);
    }
    setLikeLoading(false);
  }

  function toggleReply() {
    setOpenReplyFor((cur) => (cur === comment.id ? null : comment.id));
  }

  function copyLink() {
    const link = `${window.location.origin}/post/${comment.post_id}#comment-${comment.id}`;
    navigator.clipboard.writeText(link).then(() => {
      // small feedback
      // you could show a toast here; using alert minimal
      alert("Comment link copied");
    });
    setMenuOpen(false);
  }

  // follow/unfollow toggle (POST toggles)
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
      } else {
        console.warn("Follow toggle failed");
      }
    } catch (err) {
      console.error(err);
    }
    setProcessingFollow(false);
    setMenuOpen(false);
  }

  // report
  async function reportComment() {
    try {
      await fetch(`${API_BASE}/api/comments/${comment.id}/report`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Reported from UI" }),
      });
      alert("Reported — thank you");
    } catch (err) {
      console.error(err);
    }
    setMenuOpen(false);
  }

  // delete (no window.confirm) - confirmation shown inside menu
  async function confirmDelete() {
    try {
      const r = await fetch(`${API_BASE}/api/comments/${comment.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (r.ok) {
        if (onReplyAdded) onReplyAdded();
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

  // edit
  async function submitEdit() {
    if (!editedText.trim()) return alert("Content required");
    try {
      const r = await fetch(`${API_BASE}/api/comments/${comment.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedText }),
      });
      if (r.ok) {
        setEditing(false);
        setMenuOpen(false);
        if (onReplyAdded) onReplyAdded();
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

            <div style={{ marginLeft: 8, position: "relative" }}>
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
                  {/* Copy Link */}
                  <button
                    className="menu-item-btn"
                    onClick={copyLink}
                    role="menuitem"
                  >
                    <LinkIcon size={16} />
                    <span>Copy link to comment</span>
                  </button>

                  {/* Follow / Unfollow OR Owner options */}
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

                      <div style={{ padding: "6px" }}>
                        {!deleteConfirm ? (
                          <button
                            className="menu-item-btn delete"
                            onClick={() => setDeleteConfirm(true)}
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        ) : (
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
                        )}
                      </div>

                      <button
                        className="menu-item-btn"
                        onClick={() => {
                          setMenuOpen(false);
                          alert("Who can see this — not implemented");
                        }}
                      >
                        <Eye size={16} />
                        <span>Who can see this</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Follow/Unfollow toggle */}
                      <button
                        className="menu-item-btn"
                        onClick={() => toggleFollow()}
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
                          alert("I don't want to see this — implement hide");
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

          {/* Meta row */}
          <div className="comment-meta-row">
            <button onClick={toggleLike} className="meta-btn">
              <ThumbsUp size={15} /> {likeCount > 0 ? likeCount : "Like"}
            </button>

            <button onClick={toggleReply} className="meta-btn">
              <CornerDownLeft size={15} /> Reply
            </button>

            <span className="date-text">
              {new Date(comment.created_at).toLocaleString()}
            </span>

            {comment.reply_count > 0 && (
              <button onClick={toggleReply} className="meta-btn muted-btn">
                {comment.reply_count} replies
              </button>
            )}
          </div>
        </div>

        {/* Reply input */}
        {isOpen && (
          <div style={{ marginLeft: 48 }}>
            <CommentInput
              API_BASE={API_BASE}
              postId={comment.post_id}
              currentUser={currentUser}
              parentId={comment.id}
              mentionName={comment.user_name}
              onPosted={() => onReplyAdded()}
            />
          </div>
        )}

        {/* Replies */}
        {isOpen &&
          comment.replies?.length > 0 &&
          comment.replies.map((reply) => (
            <div key={reply.id} style={{ marginLeft: 48 }}>
              <ReplyItem
                reply={reply}
                API_BASE={API_BASE}
                currentUser={currentUser}
                onReplyLike={onToggleLike}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
