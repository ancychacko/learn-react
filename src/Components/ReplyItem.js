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
// //import ReplyItem from "./ReplyItem"; // recursive import

// export default function ReplyItem({
//   reply,
//   API_BASE = "",
//   currentUser,
//   onReplyLike,
//   openReplyFor,
//   setOpenReplyFor,
//   rootId,
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

//   useEffect(() => {
//     function onKey(e) {
//       if (e.key === "Escape") setMenuOpen(false);
//     }
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   const isOpen = openReplyFor === reply.id;

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
//         if (onReplyLike) onReplyLike(reply.id);
//       } else {
//         toast.addToast("Failed to toggle like", { type: "error" });
//       }
//     } catch (err) {
//       toast.addToast("Network error", { type: "error" });
//     }

//     setLoading(false);
//   }

//   function copyLink() {
//     const link = `${window.location.origin}/post/${reply.post_id}#comment-${reply.id}`;
//     navigator.clipboard
//       .writeText(link)
//       .then(() => toast.addToast("Reply link copied", { type: "success" }))
//       .catch(() => toast.addToast("Failed to copy", { type: "error" }));
//     setMenuOpen(false);
//   }

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
//       }
//     } catch (err) {
//       toast.addToast("Network error", { type: "error" });
//     }

//     setProcessingFollow(false);
//     setMenuOpen(false);
//   }

//   async function reportReply() {
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${reply.id}/report`, {
//         method: "POST",
//         credentials: "include",
//       });

//       if (r.ok) toast.addToast("Reported — thank you", { type: "success" });
//       else toast.addToast("Failed to report", { type: "error" });
//     } catch (err) {
//       toast.addToast("Network error", { type: "error" });
//     }

//     setMenuOpen(false);
//   }

//   async function confirmDelete() {
//     try {
//       const r = await fetch(`${API_BASE}/api/comments/${reply.id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });

//       if (r.ok) {
//         toast.addToast("Reply deleted", { type: "success" });
//         if (onReplyAdded) onReplyAdded(rootId, null);
//       } else {
//         toast.addToast("Failed to delete", { type: "error" });
//       }
//     } catch (err) {
//       toast.addToast("Network error", { type: "error" });
//     }

//     setMenuOpen(false);
//     setDeleteConfirm(false);
//   }

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
//         if (onReplyAdded) onReplyAdded(rootId, null);
//         setMenuOpen(false);
//         setEditing(false);
//       } else {
//         const b = await r.json().catch(() => ({}));
//         toast.addToast(b.error || "Failed to edit", { type: "error" });
//       }
//     } catch (err) {
//       toast.addToast("Network error", { type: "error" });
//     }
//   }

//   // When clicking reply on a nested reply:
//   function handleToggleReplyEditor() {
//     // ensure top-level thread is open, and set this reply's editor open (toggle)
//     setOpenReplyFor((cur) => (cur === reply.id ? null : reply.id));
//     // root remains open in parent (parent passes rootId)
//     // Note: parent should already have opened the thread when user clicked reply on ancestor.
//   }

//   return (
//     <div className="comment-item" style={{ marginBottom: 8 }}>
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
//                 />
//                 <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
//                   <button className="save-btn" onClick={submitEdit}>
//                     <CheckCircle size={16} /> Save
//                   </button>
//                   <button
//                     className="cancel-btn"
//                     onClick={() => {
//                       setEditing(false);
//                       setEditedText(reply.content);
//                     }}
//                   >
//                     <XCircle size={16} /> Cancel
//                   </button>
//                 </div>
//               </div>
//             )}

//             <div className="comment-meta-row">
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

//               {/* Reply button for nested reply */}
//               <button onClick={handleToggleReplyEditor} className="meta-btn">
//                 <CornerDownLeft size={15} /> Reply
//               </button>

//               <div className="date-text">
//                 {new Date(reply.created_at).toLocaleString()}
//               </div>
//             </div>
//           </div>

//           <div style={{ marginLeft: 8, position: "relative" }} ref={menuRef}>
//             <button
//               className="menu-trigger-btn"
//               onClick={() => setMenuOpen((s) => !s)}
//             >
//               <MoreHorizontal size={16} />
//             </button>

//             {menuOpen && (
//               <div className="linked-dropdown">
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
//                         toast.addToast("Hide reply — not implemented", {
//                           type: "info",
//                         });
//                         setMenuOpen(false);
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

//         {/* Reply input for this nested reply (open only when this reply's editor is open) */}
//         {isOpen && (
//           <div style={{ marginLeft: 48 }}>
//             <CommentInput
//               API_BASE={API_BASE}
//               postId={reply.post_id}
//               currentUser={currentUser}
//               parentId={reply.id}
//               mentionName={reply.user_name}
//               onPosted={(created) => {
//                 // refresh thread and keep root open; collapse editor
//                 if (onReplyAdded) onReplyAdded(rootId, null);
//                 setOpenReplyFor(null);
//               }}
//             />
//           </div>
//         )}

//         {/* if there are deeper replies, render them recursively.
//             They are only visible if some ancestor thread is open;
//             parent components manage showing the top-level thread. */}
//         {reply.replies && reply.replies.length > 0 && (
//           <div style={{ marginLeft: 48, marginTop: 8 }}>
//             {reply.replies.map((r) => (
//               <ReplyItem
//                 key={r.id}
//                 reply={r}
//                 API_BASE={API_BASE}
//                 currentUser={currentUser}
//                 onReplyLike={onReplyLike}
//                 openReplyFor={openReplyFor}
//                 setOpenReplyFor={setOpenReplyFor}
//                 rootId={rootId}
//                 onReplyAdded={onReplyAdded}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

//src/Components/ReplyItem.js
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
  rootId,
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
    function handleEsc(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const isOpen = openReplyFor === reply.id;

  // ---------------- LIKE ----------------
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
    } catch {
      toast.addToast("Network error", { type: "error" });
    }

    setLoading(false);
  }

  // ---------------- MENU ACTIONS ----------------
  function copyLink() {
    const link = `${window.location.origin}/post/${reply.post_id}#comment-${reply.id}`;

    navigator.clipboard
      .writeText(link)
      .then(() => toast.addToast("Reply link copied", { type: "success" }))
      .catch(() => toast.addToast("Failed to copy link", { type: "error" }));

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
    } catch {
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

      if (r.ok) toast.addToast("Reply reported", { type: "success" });
      else toast.addToast("Failed to report", { type: "error" });
    } catch {
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
        if (onReplyAdded) onReplyAdded(rootId, null);
      } else {
        toast.addToast("Failed to delete reply", { type: "error" });
      }
    } catch {
      toast.addToast("Network error", { type: "error" });
    }

    setDeleteConfirm(false);
    setMenuOpen(false);
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
        setEditing(false);
        setMenuOpen(false);

        if (onReplyAdded) onReplyAdded(rootId, null);
      } else {
        toast.addToast("Failed to update reply", { type: "error" });
      }
    } catch {
      toast.addToast("Network error", { type: "error" });
    }
  }

  // ---------------- REPLY TO THIS REPLY ----------------
  function toggleReplyEditor() {
    setOpenReplyFor((cur) => (cur === reply.id ? null : reply.id));
  }

  return (
    <div className="comment-item" style={{ marginBottom: 8 }}>
      {/* AVATAR */}
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
        {/* BODY */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: "100%" }}>
            <div className="comment-author">{reply.user_name}</div>

            {/* TEXT / EDITING */}
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

            {/* META ROW */}
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

              <button onClick={toggleReplyEditor} className="meta-btn">
                <CornerDownLeft size={15} /> Reply
              </button>

              <span className="date-text">
                {new Date(reply.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          {/* MENU */}
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              className="menu-trigger-btn"
              onClick={() => setMenuOpen((s) => !s)}
            >
              <MoreHorizontal size={16} />
            </button>

            {menuOpen && (
              <div className="linked-dropdown">
                {/* Copy link */}
                <button className="menu-item-btn" onClick={copyLink}>
                  <LinkIcon size={16} />
                  <span>Copy link to reply</span>
                </button>

                {/* Owner options */}
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
                            <Trash2 size={14} /> Yes
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
                    {/* Non-owner options */}
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
                        toast.addToast("Hide reply — not implemented", {
                          type: "info",
                        });
                      }}
                    >
                      <EyeOff size={16} />
                      <span>I don't want to see this</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* REPLY INPUT FOR THIS REPLY */}
        {isOpen && (
          <div style={{ marginLeft: 48 }}>
            <CommentInput
              API_BASE={API_BASE}
              postId={reply.post_id}
              currentUser={currentUser}
              parentId={reply.id}
              mentionName={reply.user_name}
              onPosted={() => {
                if (onReplyAdded) onReplyAdded(rootId, null);
                setOpenReplyFor(null);
              }}
            />
          </div>
        )}

        {/* RECURSIVE CHILDREN */}
        {reply.replies &&
          reply.replies.length > 0 &&
          reply.replies.map((child) => (
            <div key={child.id} style={{ marginLeft: 48, marginTop: 8 }}>
              <ReplyItem
                reply={child}
                API_BASE={API_BASE}
                currentUser={currentUser}
                onReplyLike={onReplyLike}
                openReplyFor={openReplyFor}
                setOpenReplyFor={setOpenReplyFor}
                rootId={rootId}
                onReplyAdded={onReplyAdded}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
