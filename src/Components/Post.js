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
//   MessageCircle,
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
//   refresh,
//   currentUser,
// }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [likeCount, setLikeCount] = useState(Number(post.like_count || 0));
//   const [likedByMe, setLikedByMe] = useState(!!post.liked_by_me);
//   const [shareCount, setShareCount] = useState(Number(post.share_count || 0));
//   const [commentCount, setCommentCount] = useState(
//     Number(post.comment_count || 0)
//   );
//   const [openComment, setOpenComment] = useState(false);

//   const ref = useRef();

//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
//     }
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   function mediaUrl(path) {
//     if (!path) return null;
//     const host = window.location.hostname;
//     const protocol = window.location.protocol;
//     return `${protocol}//${host}:4000${path}`;
//   }

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
//       if (r.ok && typeof refresh === "function") refresh();
//       else {
//         const b = await r.json();
//         alert(b.error || "Delete failed");
//       }
//     } catch (err) {
//       console.error("delete error", err);
//     }
//   }

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

//   const isMyPost =
//     String(post.user_name || "")
//       .trim()
//       .toLowerCase() ===
//     String(currentUserName || "")
//       .trim()
//       .toLowerCase();

//   function onLikeToggled(liked, newCount) {
//     setLikedByMe(Boolean(liked));
//     setLikeCount(Number(newCount || 0));
//   }

//   function onShared(newCount) {
//     setShareCount(Number(newCount || 0));
//   }

//   return (
//     <article className="post-card">
//       {/* HEADER */}
//       <div className="post-header">
//         <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//           <img
//             src={
//               post.avatar_url
//                 ? mediaUrl(post.avatar_url)
//                 : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//             }
//             className="avatar-sm"
//             alt="avatar"
//           />
//           <div>
//             <div className="post-author">{post.user_name}</div>
//             <div className="post-meta">
//               {new Date(post.created_at).toLocaleString()} •{" "}
//               <span className="post-visibility">{renderVisibility()}</span>
//             </div>
//           </div>
//         </div>

//         {/* MENU */}
//         <div ref={ref} style={{ position: "relative" }}>
//           <button className="dots-btn" onClick={() => setMenuOpen((p) => !p)}>
//             <Ellipsis size={20} color="black" />
//           </button>

//           {menuOpen && (
//             <div className="post-menu">
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
//                     <Trash size={16} /> Delete Post
//                   </button>
//                   <button
//                     disabled
//                     onClick={() => {
//                       setMenuOpen(false);
//                       alert("Coming Soon.");
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
//                       alert("Report feature coming soon.");
//                     }}
//                   >
//                     <Flag size={16} /> Report Post
//                   </button>
//                 </>
//               )}
//               <button
//                 onClick={() => {
//                   setMenuOpen(false);
//                   alert("Save Post feature coming soon.");
//                 }}
//               >
//                 <BookMarked size={16} /> Save Post
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* BODY */}
//       <div className="post-body">
//         <p>{post.content}</p>
//         {post.media_url && post.media_type === "image" && (
//           <img
//             className="post-media"
//             src={mediaUrl(post.media_url)}
//             alt="post"
//           />
//         )}
//         {post.media_url && post.media_type === "video" && (
//           <video controls className="post-media">
//             <source src={mediaUrl(post.media_url)} />
//           </video>
//         )}
//       </div>

//       {/* STATS */}
//       <div className="post-stats">
//         <span className="stats-item">
//           <ThumbsUp size={14} /> {likeCount}{" "}
//           {likeCount === 1 ? "Like" : "Likes"}
//         </span>
//         <span className="stats-item">
//           <MessageCircle size={14} /> {commentCount}{" "}
//           {commentCount === 1 ? "Comment" : "Comments"}
//         </span>
//         <span className="stats-item">
//           <Forward size={14} /> {shareCount}{" "}
//           {shareCount === 1 ? "Share" : "Shares"}
//         </span>
//       </div>

//       {/* ACTION BUTTONS */}
//       <div className="post-actions">
//         <Like
//           API_BASE={API_BASE}
//           postId={post.id}
//           initialLiked={likedByMe}
//           initialCount={likeCount}
//           onToggle={onLikeToggled}
//         />
//         <button
//           className="action-btn comment-btn"
//           onClick={() => setOpenComment((p) => !p)}
//         >
//           <MessageCircle size={18} className="icon" />
//           <span>Comment</span>
//         </button>
//         <Share API_BASE={API_BASE} postId={post.id} onShared={onShared} />
//       </div>

//       {/* COMMENT SECTION */}
//       {openComment && (
//         <Comment
//           API_BASE={API_BASE}
//           postId={post.id}
//           currentUser={currentUser}
//           onCountChange={(count) => setCommentCount(count)}
//         />
//       )}

//       {/* EDIT MODAL */}
//       {showEditModal && (
//         <EditPostModal
//           API_BASE={API_BASE}
//           post={post}
//           onClose={() => setShowEditModal(false)}
//           onSaveSuccess={() => {
//             setShowEditModal(false);
//             if (typeof refresh === "function") refresh();
//           }}
//           currentUser={{ name: post.user_name, avatar_url: post.avatar_url }}
//         />
//       )}
//     </article>
//   );
// }

// src/Components/Post.js
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
  const [openComment, setOpenComment] = useState(false);

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
                    <Trash size={16} /> Delete Post
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

      {/* STATS */}
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

      {/* ACTION BUTTONS */}
      <div className="post-actions">
        <Like
          API_BASE={API_BASE}
          postId={post.id}
          initialLiked={likedByMe}
          initialCount={likeCount}
          onToggle={onLikeToggled}
        />
        <button
          className="action-btn comment-btn"
          onClick={() => setOpenComment((p) => !p)}
        >
          <MessageCircle size={18} className="icon" />
          <span>Comment</span>
        </button>
        {/* pass posterName so modal title can show "Send {posterName}'s post" */}
        <Share
          API_BASE={API_BASE}
          postId={post.id}
          onShared={onShared}
          posterName={post.user_name}
        />
      </div>

      {/* COMMENT SECTION */}
      {openComment && (
        <Comment
          API_BASE={API_BASE}
          postId={post.id}
          currentUser={currentUser}
          onCountChange={(count) => setCommentCount(count)}
        />
      )}

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
