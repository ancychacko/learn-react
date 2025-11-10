// src/Components/Post.js
// import React, { useEffect, useRef, useState } from "react";
// import {
//   ThumbsUp,
//   MessageCircle,
//   Send,
//   Forward,
//   Pencil,
//   Trash,
//   Flag,
//   Ellipsis,
//   Globe2,
//   Users,
//   Lock,
//   Eye,
//   BookMarked,
// } from "lucide-react";
// import EditPostModal from "./EditPostModal"; // ✅ import edit modal

// export default function Post({ post, API_BASE, currentUserName, refresh }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const ref = useRef();

//   // ✅ Close dropdown when clicked outside
//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (ref.current && !ref.current.contains(e.target)) {
//         setMenuOpen(false);
//       }
//     }
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   // ✅ Helper for media URLs
//   function mediaUrl(path) {
//     return path
//       ? `${window.location.protocol}//${window.location.hostname}:4000${path}`
//       : null;
//   }

//   // ✅ Delete a post
//   async function handleDelete() {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this post?"
//     );
//     if (!confirmDelete) return;

//     try {
//       const response = await fetch(`${API_BASE}/api/posts/${post.id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (response.ok) {
//         refresh(); // reload posts after delete
//       } else {
//         const body = await response.json();
//         alert(body.error || "Delete failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Network error");
//     }
//   }

//   // ✅ Visibility icons
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

//   // ✅ Key fix: Compare user_name with logged-in username
//   const isMyPost =
//     String(post.user_name).trim().toLowerCase() ===
//     String(currentUserName).trim().toLowerCase();

//   // ✅ Main JSX
//   return (
//     <article className="post-card">
//       {/* ===== HEADER ===== */}
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

//         {/* ===== 3 DOT MENU ===== */}
//         <div ref={ref} style={{ position: "relative" }}>
//           <button
//             className="dots-btn"
//             onClick={() => setMenuOpen((prev) => !prev)}
//             title="More options"
//           >
//             <Ellipsis size={20} color="black" />
//           </button>

//           {menuOpen && (
//             <div className="post-menu">
//               {/* ✅ Show only if the logged-in user owns the post */}
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
//                       alert("Visibility feature not implemented yet");
//                     }}
//                   >
//                     <Eye size={16} /> Who can see this post?
//                   </button>

//                   {/* <button disabled style={{ color: "#555", opacity: 0.7 }}>
//                     {renderVisibility()}
//                   </button> */}
//                 </>
//               ) : (
//                 <>
//                   <button
//                     onClick={() => {
//                       setMenuOpen(false);
//                       alert("Report feature not implemented yet");
//                     }}
//                   >
//                     <Flag size={16} /> Report Post
//                   </button>
//                 </>
//               )}
//               <button
//                 onClick={() => {
//                   setMenuOpen(false);
//                   alert("Send feature not implemented yet");
//                 }}
//               >
//                 <Forward size={16} /> Send
//               </button>
//               <button
//                 onClick={() => {
//                   setMenuOpen(false);
//                   alert("Save feature not implemented yet");
//                 }}
//               >
//                 <BookMarked size={16} /> Save Post
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ===== BODY ===== */}
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

//       {/* ===== ACTION BUTTONS ===== */}
//       <div className="post-actions">
//         <button className="action-btn">
//           <ThumbsUp size={20} color="blue" /> Like
//         </button>
//         <button className="action-btn">
//           <MessageCircle size={20} color="blue" /> Comment
//         </button>
//         <button className="action-btn">
//           <Send size={20} color="blue" /> Share
//         </button>
//       </div>

//       {/* ===== EDIT MODAL ===== */}
//       {showEditModal && (
//         <EditPostModal
//           API_BASE={API_BASE}
//           post={post}
//           onClose={() => setShowEditModal(false)}
//           onSaveSuccess={refresh}
//           currentUser={{ name: post.user_name, avatar_url: post.avatar_url }} // ✅ pass user info
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
} from "lucide-react";

import Like from "./Like";
import Comment from "./Comment";
import SendButton from "./Send";
import EditPostModal from "./EditPostModal";

export default function Post({
  post,
  API_BASE,
  currentUserName,
  refresh,
  currentUser,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [likedByMe, setLikedByMe] = useState(!!post.liked_by_me);
  const [shareCount, setShareCount] = useState(post.share_count || 0);
  const ref = useRef();

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ Helper for building file URLs
  function mediaUrl(path) {
    return path
      ? `${window.location.protocol}//${window.location.hostname}:4000${path}`
      : null;
  }

  // ✅ Delete a post
  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) return;
    try {
      const response = await fetch(`${API_BASE}/api/posts/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        refresh();
      } else {
        const body = await response.json();
        alert(body.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  }

  // ✅ Visibility icon display
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

  // ✅ Check if current user owns the post
  const isMyPost =
    String(post.user_name).trim().toLowerCase() ===
    String(currentUserName).trim().toLowerCase();

  // ✅ Handle share event update
  function handleShareCount(newCount) {
    setShareCount(newCount);
  }

  return (
    <article className="post-card">
      {/* ===== HEADER ===== */}
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

        {/* ===== MENU (3 DOTS) ===== */}
        <div ref={ref} style={{ position: "relative" }}>
          <button
            className="dots-btn"
            onClick={() => setMenuOpen((prev) => !prev)}
            title="More options"
          >
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
                    onClick={() => {
                      setMenuOpen(false);
                      alert("Visibility feature coming soon");
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
                      alert("Report feature coming soon");
                    }}
                  >
                    <Flag size={16} /> Report Post
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  alert("Save feature coming soon");
                }}
              >
                <BookMarked size={16} /> Save Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== BODY ===== */}
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

      {/* ===== ACTION BUTTONS ===== */}
      <div className="post-actions">
        {/* ✅ Like Component */}
        <Like
          API_BASE={API_BASE}
          postId={post.id}
          initialLiked={likedByMe}
          initialCount={likeCount}
          onToggle={(liked, count) => {
            setLikedByMe(liked);
            setLikeCount(count);
          }}
        />

        {/* ✅ Comment Component */}
        <Comment
          API_BASE={API_BASE}
          postId={post.id}
          currentUser={currentUser}
        />

        {/* ✅ Send Component */}
        <SendButton
          API_BASE={API_BASE}
          postId={post.id}
          onShare={(count) => handleShareCount(count)}
        />
      </div>

      {/* ✅ Counts display */}
      <div className="post-stats">
        {likeCount > 0 && (
          <span style={{ marginRight: 10 }}>
            <ThumbsUp size={14} />
            {likeCount} {likeCount === 1 ? "Like" : "Likes"}
          </span>
        )}
        {shareCount > 0 && (
          <span>
            <Forward size={14} />
            {shareCount} {shareCount === 1 ? "Share" : "Shares"}
          </span>
        )}
      </div>

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && (
        <EditPostModal
          API_BASE={API_BASE}
          post={post}
          onClose={() => setShowEditModal(false)}
          onSaveSuccess={refresh}
          currentUser={{
            name: post.user_name,
            avatar_url: post.avatar_url,
          }}
        />
      )}
    </article>
  );
}
