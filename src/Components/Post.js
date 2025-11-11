// src/Components/Post.js
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Ellipsis,
//   Pencil,
//   Trash,
//   Flag,
//   Globe2,
//   Users,
//   Lock,
//   Eye,
//   Forward,
//   BookMarked,
//   ThumbsUp,
// } from "lucide-react";

// import Like from "./Like";
// import Comment from "./Comment";
// import Share from "./Share";
// import EditPostModal from "./EditPostModal";
// import "./Post.css";

// export default function Post({
//   post,
//   API_BASE = "",
//   currentUserName = "",
//   refresh, // function to refresh feed from parent
//   currentUser, // object { id, name, avatar_url } optional
// }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);

//   // counts / states kept in Post so they display consistently
//   const [likeCount, setLikeCount] = useState(Number(post.like_count || 0));
//   const [likedByMe, setLikedByMe] = useState(!!post.liked_by_me);
//   const [shareCount, setShareCount] = useState(Number(post.share_count || 0));

//   const ref = useRef();

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
//     }
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   // Build full URL for media / avatars served from backend
//   function mediaUrl(path) {
//     if (!path) return null;
//     // ensure correct host and backend port; change port if your backend runs somewhere else
//     const host = window.location.hostname;
//     const protocol = window.location.protocol;
//     return `${protocol}//${host}:4000${path}`;
//   }

//   // Delete post
//   async function handleDelete() {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this post?"
//     );
//     if (!confirmDelete) return;
//     try {
//       const r = await fetch(`${API_BASE}/api/posts/${post.id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (r.ok) {
//         // Ask parent to refresh feed
//         if (typeof refresh === "function") refresh();
//       } else {
//         const b = await r.json();
//         alert(b.error || "Delete failed");
//       }
//     } catch (err) {
//       console.error("delete error", err);
//       alert("Network error");
//     }
//   }

//   // Visibility display helper
//   function renderVisibility() {
//     switch (post.visibility || "Anyone") {
//       case "Connections":
//         return (
//           <>
//             <Users size={14} color="blue" /> Connections only
//           </>
//         );
//       case "Private":
//         return (
//           <>
//             <Lock size={14} color="blue" /> Only you
//           </>
//         );
//       default:
//         return (
//           <>
//             <Globe2 size={14} color="blue" /> Anyone
//           </>
//         );
//     }
//   }

//   // Ownership check: compare names (case-insensitive, trimmed)
//   const isMyPost =
//     String(post.user_name || "")
//       .trim()
//       .toLowerCase() ===
//     String(currentUserName || "")
//       .trim()
//       .toLowerCase();

//   // Called by Like component when toggled
//   function onLikeToggled(liked, newCount) {
//     setLikedByMe(Boolean(liked));
//     setLikeCount(Number(newCount || 0));
//   }

//   // Called by Send/Share component when share happens
//   function onShared(newCount) {
//     setShareCount(Number(newCount || 0));
//   }

//   return (
//     <article className="post-card" aria-labelledby={`post-${post.id}`}>
//       {/* ===== Header ===== */}
//       <div className="post-header">
//         <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//           <img
//             src={
//               post.avatar_url
//                 ? mediaUrl(post.avatar_url)
//                 : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//             }
//             className="avatar-sm"
//             alt={`${post.user_name || "User"} avatar`}
//           />
//           <div>
//             <div id={`post-${post.id}`} className="post-author">
//               {post.user_name}
//             </div>
//             <div className="post-meta">
//               {post.created_at
//                 ? new Date(post.created_at).toLocaleString()
//                 : ""}
//               {" • "}
//               <span className="post-visibility">{renderVisibility()}</span>
//             </div>
//           </div>
//         </div>

//         {/* ===== 3-dot menu ===== */}
//         <div ref={ref} style={{ position: "relative" }}>
//           <button
//             className="dots-btn"
//             aria-haspopup="true"
//             aria-expanded={menuOpen}
//             onClick={() => setMenuOpen((p) => !p)}
//             title="More options"
//           >
//             <Ellipsis size={20} color="black" />
//           </button>

//           {menuOpen && (
//             <div className="post-menu" role="menu" aria-label="Post options">
//               {isMyPost ? (
//                 <>
//                   <button
//                     onClick={() => {
//                       setShowEditModal(true);
//                       setMenuOpen(false);
//                     }}
//                   >
//                     <Pencil size={16} /> Edit Post
//                   </button>
//                   <button
//                     onClick={() => {
//                       setMenuOpen(false);
//                       handleDelete();
//                     }}
//                   >
//                     <Trash size={16} /> Delete
//                   </button>
//                   <button
//                     onClick={() => {
//                       setMenuOpen(false);
//                       alert(
//                         "Visibility editing will be available in settings (demo)."
//                       );
//                     }}
//                   >
//                     <Eye size={16} /> Who can see this post?
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <button
//                     onClick={() => {
//                       setMenuOpen(false);
//                       alert("Report feature coming soon (demo).");
//                     }}
//                   >
//                     <Flag size={16} /> Report Post
//                   </button>
//                 </>
//               )}

//               <button
//                 onClick={() => {
//                   setMenuOpen(false);
//                   alert("Save post feature coming soon (demo).");
//                 }}
//               >
//                 <BookMarked size={16} /> Save Post
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ===== Body ===== */}
//       <div className="post-body" gap={12}>
//         <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{post.content}</p>

//         {post.media_url && post.media_type === "image" && (
//           <img
//             className="post-media"
//             src={mediaUrl(post.media_url)}
//             alt="Post media"
//           />
//         )}

//         {post.media_url && post.media_type === "video" && (
//           <video controls className="post-media">
//             <source src={mediaUrl(post.media_url)} />
//           </video>
//         )}
//       </div>

//       {/* ===== Action buttons row =====
//             Buttons are separate components; they call callbacks when counts change. */}
//       <div className="post-actions" role="toolbar" aria-label="Post actions">
//         <Like
//           API_BASE={API_BASE}
//           postId={post.id}
//           initialLiked={likedByMe}
//           initialCount={likeCount}
//           onToggle={onLikeToggled}
//         />

//         <Comment
//           API_BASE={API_BASE}
//           postId={post.id}
//           currentUser={currentUser}
//         />

//         <Share API_BASE={API_BASE} postId={post.id} onShare={onShared} />
//       </div>

//       {/* ===== small summary of counts (likes/shares) ===== */}
//       <div className="post-stats" aria-hidden={false}>
//         {likeCount > 0 && (
//           <span className="stats-item" style={{ marginRight: 12 }}>
//             <ThumbsUp size={14} /> {likeCount}{" "}
//             {likeCount === 1 ? "Like" : "Likes"}
//           </span>
//         )}
//         {shareCount > 0 && (
//           <span className="stats-item">
//             <Forward size={14} /> {shareCount}{" "}
//             {shareCount === 1 ? "Share" : "Shares"}
//           </span>
//         )}
//       </div>

//       {/* ===== Edit modal (if owner) ===== */}
//       {showEditModal && (
//         <EditPostModal
//           API_BASE={API_BASE}
//           post={post}
//           onClose={() => setShowEditModal(false)}
//           onSaveSuccess={() => {
//             setShowEditModal(false);
//             // refresh parent feed if provided
//             if (typeof refresh === "function") refresh();
//           }}
//           currentUser={{ name: post.user_name, avatar_url: post.avatar_url }}
//         />
//       )}
//     </article>
//   );
// }

import React, { useEffect, useRef, useState } from "react";
import {
  Ellipsis,
  Pencil,
  Trash,
  Flag,
  Globe2,
  Users,
  Lock,
  Eye,
  Forward,
  BookMarked,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";

import Like from "./Like";
import Comment from "./Comment";
import Share from "./Share";
import EditPostModal from "./EditPostModal";
import "./Post.css";

export default function Post({
  post,
  API_BASE = "",
  currentUserName = "",
  refresh,
  currentUser,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [likeCount, setLikeCount] = useState(Number(post.like_count || 0));
  const [likedByMe, setLikedByMe] = useState(!!post.liked_by_me);
  const [shareCount, setShareCount] = useState(Number(post.share_count || 0));
  const [commentCount, setCommentCount] = useState(
    Number(post.comment_count || 0)
  );

  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function mediaUrl(path) {
    if (!path) return null;
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    return `${protocol}//${host}:4000${path}`;
  }

  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) return;
    try {
      const r = await fetch(`${API_BASE}/api/posts/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (r.ok && typeof refresh === "function") refresh();
      else {
        const b = await r.json();
        alert(b.error || "Delete failed");
      }
    } catch (err) {
      console.error("delete error", err);
    }
  }

  function renderVisibility() {
    switch (post.visibility || "Anyone") {
      case "Connections":
        return (
          <>
            <Users size={14} color="blue" /> Connections only
          </>
        );
      case "Private":
        return (
          <>
            <Lock size={14} color="blue" /> Only you
          </>
        );
      default:
        return (
          <>
            <Globe2 size={14} color="blue" /> Anyone
          </>
        );
    }
  }

  const isMyPost =
    String(post.user_name || "")
      .trim()
      .toLowerCase() ===
    String(currentUserName || "")
      .trim()
      .toLowerCase();

  function onLikeToggled(liked, newCount) {
    setLikedByMe(Boolean(liked));
    setLikeCount(Number(newCount || 0));
  }

  function onShared(newCount) {
    setShareCount(Number(newCount || 0));
  }

  return (
    <article className="post-card">
      {/* HEADER */}
      <div className="post-header">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img
            src={
              post.avatar_url
                ? mediaUrl(post.avatar_url)
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="avatar-sm"
            alt="avatar"
          />
          <div>
            <div className="post-author">{post.user_name}</div>
            <div className="post-meta">
              {new Date(post.created_at).toLocaleString()} •{" "}
              <span className="post-visibility">{renderVisibility()}</span>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div ref={ref} style={{ position: "relative" }}>
          <button className="dots-btn" onClick={() => setMenuOpen((p) => !p)}>
            <Ellipsis size={20} color="black" />
          </button>

          {menuOpen && (
            <div className="post-menu">
              {isMyPost ? (
                <>
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setMenuOpen(false);
                    }}
                  >
                    <Pencil size={16} /> Edit Post
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleDelete();
                    }}
                  >
                    <Trash size={16} /> Delete
                  </button>
                  <button
                    disabled
                    onClick={() => {
                      setMenuOpen(false);
                      alert("Coming Soon.");
                    }}
                  >
                    <Eye size={16} /> Who can see this post?
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      alert("Report feature coming soon.");
                    }}
                  >
                    <Flag size={16} /> Report Post
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  alert("Save Post feature coming soon.");
                }}
              >
                <BookMarked size={16} /> Save Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="post-body">
        <p>{post.content}</p>
        {post.media_url && post.media_type === "image" && (
          <img
            className="post-media"
            src={mediaUrl(post.media_url)}
            alt="post"
          />
        )}
        {post.media_url && post.media_type === "video" && (
          <video controls className="post-media">
            <source src={mediaUrl(post.media_url)} />
          </video>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="post-actions">
        <Like
          API_BASE={API_BASE}
          postId={post.id}
          initialLiked={likedByMe}
          initialCount={likeCount}
          onToggle={onLikeToggled}
        />
        <Comment
          API_BASE={API_BASE}
          postId={post.id}
          currentUser={currentUser}
          onCountChange={(count) => setCommentCount(count)}
        />
        <Share API_BASE={API_BASE} postId={post.id} onShared={onShared} />
      </div>

      {/* COUNTS */}
      <div className="post-stats">
        <span className="stats-item">
          <ThumbsUp size={14} /> {likeCount}{" "}
          {likeCount === 1 ? "Like" : "Likes"}
        </span>
        <span className="stats-item">
          <MessageCircle size={14} /> {commentCount}{" "}
          {commentCount === 1 ? "Comment" : "Comments"}
        </span>
        <span className="stats-item">
          <Forward size={14} /> {shareCount}{" "}
          {shareCount === 1 ? "Share" : "Shares"}
        </span>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <EditPostModal
          API_BASE={API_BASE}
          post={post}
          onClose={() => setShowEditModal(false)}
          onSaveSuccess={() => {
            setShowEditModal(false);
            if (typeof refresh === "function") refresh();
          }}
          currentUser={{ name: post.user_name, avatar_url: post.avatar_url }}
        />
      )}
    </article>
  );
}
