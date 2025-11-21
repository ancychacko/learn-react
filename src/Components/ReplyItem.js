//src/Components/ReplyItem.js

// import React, { useState, useRef, useEffect } from "react";
// import {
//   ThumbsUp,
//   MoreHorizontal,
//   Link as LinkIcon,
//   UserPlus,
//   Flag,
//   EyeOff,
//   Edit,
//   Trash2,
//   XCircle,
//   CheckCircle,
//   CornerDownLeft,
// } from "lucide-react";
// import "./Comment.css";
// import useClickOutside from "../Hooks/useClickOutside";
// import { useToast } from "../Contexts/ToastContext";
// import CommentInput from "./CommentInput";

// export default function ReplyItem({
//   reply,
//   API_BASE = "",
//   currentUser,
//   onReplyLike,
//   openReplyFor,
//   setOpenReplyFor,
//   onReplyAdded,
// }) {
//   const toast = useToast();

//   const [liked, setLiked] = useState(Boolean(reply.liked_by_me));
//   const [likeCount, setLikeCount] = useState(Number(reply.like_count || 0));
//   const [loading, setLoading] = useState(false);

//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef(null);
//   useClickOutside(menuRef, () => setMenuOpen(false));

//   const [editing, setEditing] = useState(false);
//   const [editedText, setEditedText] = useState(reply.content);

//   const [processingFollow, setProcessingFollow] = useState(false);
//   const [isFollowing, setIsFollowing] = useState(Boolean(reply.is_following));

//   const [deleteConfirm, setDeleteConfirm] = useState(false);

//   const isOpen = openReplyFor === reply.id;

//   // ESC to close menu
//   useEffect(() => {
//     function onKey(e) {
//       if (e.key === "Escape") setMenuOpen(false);
//     }
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   // -----------------------------
//   // LIKE
//   // -----------------------------
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
//       } else {
//         toast.addToast("Failed to toggle like", { type: "error" });
//       }
//     } catch (err) {
//       toast.addToast("Network error", { type: "error" });
//     }

//     setLoading(false);
//   }

//   // -----------------------------
//   // COPY LINK
//   // -----------------------------
//   function copyLink() {
//     const link = `${window.location.origin}/post/${reply.post_id}#comment-${reply.id}`;
//     navigator.clipboard
//       .writeText(link)
//       .then(() => toast.addToast("Reply link copied", { type: "success" }))
//       .catch(() => toast.addToast("Failed to copy link", { type: "error" }));

//     setMenuOpen(false);
//   }

//   // -----------------------------
//   // FOLLOW / UNFOLLOW
//   // -----------------------------
//   async function toggleFollow() {
//     if (processingFollow) return;

//     setProcessingFollow(true);
//     try {
//       const r = await fetch(`${API_BASE}/api/users/${reply.user_id}/follow`, {
//         method: "POST",
//         credentials: "include",
//       });

//       if (r.ok) {
//         const b = await r.json();
//         setIsFollowing(Boolean(b.following));
//         toast.addToast(
//           b.following
//             ? `Following ${reply.user_name}`
//             : `Unfollowed ${reply.user_name}`,
//           { type: "success" }
//         );
//       } else {
//         toast.addToast("Failed to toggle follow", { type: "error" });
//       }
//     } catch (err) {
//       toast.addToast("Network error", { type: "error" });
//     }

//     setProcessingFollow(false);
//     setMenuOpen(false);
//   }

//   // -----------------------------
//   // REPORT REPLY
//   // -----------------------------
//   async function reportReply() {
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${reply.id}/report`, {
//         method: "POST",
//         credentials: "include",
//       });

//       if (r.ok) {
//         toast.addToast("Reported — thank you", { type: "success" });
//       } else {
//         toast.addToast("Failed to report", { type: "error" });
//       }
//     } catch (err) {
//       toast.addToast("Network error", { type: "error" });
//     }

//     setMenuOpen(false);
//   }

//   // -----------------------------
//   // DELETE REPLY
//   // -----------------------------
//   async function confirmDelete() {
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${reply.id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });

//       if (r.ok) {
//         toast.addToast("Reply deleted", { type: "success" });
//         if (onReplyAdded) onReplyAdded();
//       } else {
//         const b = await r.json().catch(() => ({}));
//         toast.addToast(b.error || "Failed to delete", { type: "error" });
//       }
//     } catch (err) {
//       toast.addToast("Network error", { type: "error" });
//     }

//     setMenuOpen(false);
//     setDeleteConfirm(false);
//   }

//   // -----------------------------
//   // SUBMIT EDIT
//   // -----------------------------
//   async function submitEdit() {
//     if (!editedText.trim()) {
//       toast.addToast("Content required", { type: "error" });
//       return;
//     }

//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${reply.id}`, {
//         method: "PUT",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content: editedText }),
//       });

//       if (r.ok) {
//         toast.addToast("Reply updated", { type: "success" });
//         setEditing(false);
//         setMenuOpen(false);
//         if (onReplyAdded) onReplyAdded();
//       } else {
//         const b = await r.json().catch(() => ({}));
//         toast.addToast(b.error || "Failed to edit", { type: "error" });
//       }
//     } catch (err) {
//       toast.addToast("Network error", { type: "error" });
//     }
//   }

//   return (
//     <div className="comment-item" style={{ marginBottom: 8 }}>
//       {/* Avatar */}
//       <img
//         src={
//           reply.avatar_url
//             ? `${window.location.protocol}//${window.location.hostname}:4000${reply.avatar_url}`
//             : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//         }
//         className="comment-avatar"
//         alt={reply.user_name}
//       />

//       <div style={{ flex: 1 }}>
//         {/* Row */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "start",
//           }}
//         >
//           <div style={{ width: "100%" }}>
//             <div className="comment-author">{reply.user_name}</div>

//             {!editing ? (
//               <div className="comment-text">{reply.content}</div>
//             ) : (
//               <div>
//                 <textarea
//                   className="edit-textarea"
//                   value={editedText}
//                   onChange={(e) => setEditedText(e.target.value)}
//                   style={{
//                     width: "100%",
//                     minHeight: 60,
//                     padding: 8,
//                     borderRadius: 6,
//                   }}
//                 />
//                 <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
//                   <button className="save-btn" onClick={submitEdit}>
//                     <CheckCircle size={16} style={{ marginRight: 6 }} /> Save
//                   </button>
//                   <button
//                     className="cancel-btn"
//                     onClick={() => {
//                       setEditing(false);
//                       setEditedText(reply.content);
//                     }}
//                   >
//                     <XCircle size={16} style={{ marginRight: 6 }} /> Cancel
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Meta row */}
//             <div className="comment-meta-row" style={{ marginTop: 8 }}>
//               <button
//                 onClick={toggleLike}
//                 className="meta-btn"
//                 style={{ color: liked ? "#0a66c2" : undefined }}
//               >
//                 <ThumbsUp
//                   size={15}
//                   style={{ color: liked ? "#0a66c2" : undefined }}
//                 />
//                 <span>{likeCount > 0 ? likeCount : "Like"}</span>
//               </button>

//               {/* Reply button (nested reply) */}
//               <button
//                 onClick={() =>
//                   setOpenReplyFor((cur) => (cur === reply.id ? null : reply.id))
//                 }
//                 className="meta-btn"
//               >
//                 <CornerDownLeft size={15} /> Reply
//               </button>

//               <div className="date-text">
//                 {new Date(reply.created_at).toLocaleString()}
//               </div>
//             </div>
//           </div>

//           {/* Menu */}
//           <div style={{ marginLeft: 8, position: "relative" }} ref={menuRef}>
//             <button
//               className="menu-trigger-btn"
//               onClick={() => setMenuOpen((s) => !s)}
//             >
//               <MoreHorizontal size={16} />
//             </button>

//             {menuOpen && (
//               <div className="linked-dropdown" role="menu">
//                 <button className="menu-item-btn" onClick={copyLink}>
//                   <LinkIcon size={16} />
//                   <span>Copy link to comment</span>
//                 </button>

//                 {reply.is_owner ? (
//                   <>
//                     <button
//                       className="menu-item-btn"
//                       onClick={() => {
//                         setEditing(true);
//                         setMenuOpen(false);
//                       }}
//                     >
//                       <Edit size={16} />
//                       <span>Edit</span>
//                     </button>

//                     {!deleteConfirm ? (
//                       <button
//                         className="menu-item-btn delete"
//                         onClick={() => setDeleteConfirm(true)}
//                       >
//                         <Trash2 size={16} />
//                         <span>Delete</span>
//                       </button>
//                     ) : (
//                       <div style={{ padding: 6 }}>
//                         <div style={{ display: "flex", gap: 6 }}>
//                           <button
//                             className="delete-confirm-btn"
//                             onClick={confirmDelete}
//                           >
//                             <Trash2 size={14} /> Yes
//                           </button>
//                           <button
//                             className="delete-cancel-btn"
//                             onClick={() => setDeleteConfirm(false)}
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 ) : (
//                   <>
//                     <button
//                       className="menu-item-btn"
//                       onClick={toggleFollow}
//                       disabled={processingFollow}
//                     >
//                       <UserPlus size={16} />
//                       <span>
//                         {isFollowing
//                           ? `Unfollow ${reply.user_name}`
//                           : `Follow ${reply.user_name}`}
//                       </span>
//                     </button>

//                     <button className="menu-item-btn" onClick={reportReply}>
//                       <Flag size={16} />
//                       <span>Report</span>
//                     </button>

//                     <button
//                       className="menu-item-btn"
//                       onClick={() => {
//                         setMenuOpen(false);
//                         toast.addToast("Hide reply — not implemented", {
//                           type: "info",
//                         });
//                       }}
//                     >
//                       <EyeOff size={16} />
//                       <span>I don’t want to see this</span>
//                     </button>
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Reply input for nested reply */}
//         {isOpen && (
//           <div style={{ marginLeft: 48 }}>
//             <CommentInput
//               API_BASE={API_BASE}
//               postId={reply.post_id}
//               currentUser={currentUser}
//               parentId={reply.id}
//               mentionName={reply.user_name}
//               onPosted={() => {
//                 if (onReplyAdded) onReplyAdded();
//                 setOpenReplyFor(reply.id);
//               }}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// src/Components/ReplyItem.js
import React, { useState, useRef, useEffect } from "react";
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
  CornerDownLeft,
} from "lucide-react";

import "./Comment.css";
import useClickOutside from "../Hooks/useClickOutside";
import { useToast } from "../Contexts/ToastContext";
import CommentInput from "./CommentInput";

export default function ReplyItem({
  reply,
  API_BASE = "",
  currentUser,
  onReplyLike,
  openReplyFor,
  setOpenReplyFor,
  onReplyAdded,
}) {
  const toast = useToast();

  const [liked, setLiked] = useState(Boolean(reply.liked_by_me));
  const [likeCount, setLikeCount] = useState(Number(reply.like_count || 0));
  const [loading, setLoading] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(reply.content);

  const [processingFollow, setProcessingFollow] = useState(false);
  const [isFollowing, setIsFollowing] = useState(Boolean(reply.is_following));

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isOpen = openReplyFor === reply.id;

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
        if (onReplyLike) onReplyLike(reply.id);
      } else {
        toast.addToast("Failed to toggle like", { type: "error" });
      }
    } catch (err) {
      toast.addToast("Network error", { type: "error" });
    }

    setLoading(false);
  }

  function copyLink() {
    const link = `${window.location.origin}/post/${reply.post_id}#comment-${reply.id}`;
    navigator.clipboard
      .writeText(link)
      .then(() => toast.addToast("Reply link copied", { type: "success" }))
      .catch(() => toast.addToast("Failed to copy", { type: "error" }));
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
        const b = await r.json();
        setIsFollowing(Boolean(b.following));

        toast.addToast(
          b.following
            ? `Following ${reply.user_name}`
            : `Unfollowed ${reply.user_name}`,
          { type: "success" }
        );
      }
    } catch (err) {
      toast.addToast("Network error", { type: "error" });
    }

    setProcessingFollow(false);
    setMenuOpen(false);
  }

  async function reportReply() {
    try {
      const r = await fetch(`${API_BASE}/api/comments/${reply.id}/report`, {
        method: "POST",
        credentials: "include",
      });

      if (r.ok) toast.addToast("Reported — thank you", { type: "success" });
      else toast.addToast("Failed to report", { type: "error" });
    } catch (err) {
      toast.addToast("Network error", { type: "error" });
    }

    setMenuOpen(false);
  }

  async function confirmDelete() {
    try {
      const r = await fetch(`${API_BASE}/api/comments/${reply.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (r.ok) {
        toast.addToast("Reply deleted", { type: "success" });
        if (onReplyAdded) onReplyAdded(reply.id);
      } else {
        toast.addToast("Failed to delete", { type: "error" });
      }
    } catch (err) {
      toast.addToast("Network error", { type: "error" });
    }

    setMenuOpen(false);
    setDeleteConfirm(false);
  }

  async function submitEdit() {
    if (!editedText.trim()) {
      toast.addToast("Content required", { type: "error" });
      return;
    }

    try {
      const r = await fetch(`${API_BASE}/api/comments/${reply.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedText }),
      });

      if (r.ok) {
        toast.addToast("Reply updated", { type: "success" });
        if (onReplyAdded) onReplyAdded(reply.id);
        setMenuOpen(false);
        setEditing(false);
      }
    } catch (err) {
      toast.addToast("Network error", { type: "error" });
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
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button className="save-btn" onClick={submitEdit}>
                    <CheckCircle size={16} /> Save
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setEditing(false);
                      setEditedText(reply.content);
                    }}
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="comment-meta-row">
              <button
                onClick={toggleLike}
                className="meta-btn"
                style={{ color: liked ? "#0a66c2" : undefined }}
              >
                <ThumbsUp
                  size={15}
                  style={{ color: liked ? "#0a66c2" : undefined }}
                />
                <span>{likeCount > 0 ? likeCount : "Like"}</span>
              </button>

              {/* Reply button for nested reply */}
              <button
                onClick={() =>
                  setOpenReplyFor((cur) => (cur === reply.id ? null : reply.id))
                }
                className="meta-btn"
              >
                <CornerDownLeft size={15} /> Reply
              </button>

              <span className="date-text">
                {new Date(reply.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ marginLeft: 8, position: "relative" }} ref={menuRef}>
            <button
              className="menu-trigger-btn"
              onClick={() => setMenuOpen((s) => !s)}
            >
              <MoreHorizontal size={16} />
            </button>

            {menuOpen && (
              <div className="linked-dropdown">
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
                      <div style={{ padding: 6 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="delete-confirm-btn"
                            onClick={confirmDelete}
                          >
                            Yes
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
                        toast.addToast("Hide reply — not implemented", {
                          type: "info",
                        });
                        setMenuOpen(false);
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

        {isOpen && (
          <div style={{ marginLeft: 48 }}>
            <CommentInput
              API_BASE={API_BASE}
              postId={reply.post_id}
              currentUser={currentUser}
              parentId={reply.id}
              mentionName={reply.user_name}
              onPosted={() => {
                if (onReplyAdded) onReplyAdded(reply.id);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
