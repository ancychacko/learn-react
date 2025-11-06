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
// } from "lucide-react";
// import EditPostModal from "./EditPostModal";

// export default function Post({ post, API_BASE, currentUserId, refresh }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [editing, setEditing] = useState(false);
//   const [text, setText] = useState(post.content);
//   const [file, setFile] = useState(null);
//   const [saving, setSaving] = useState(false);
//   const ref = useRef();

//   // 🔹 Close dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (ref.current && !ref.current.contains(e.target)) {
//         setMenuOpen(false);
//       }
//     }
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   // 🔹 Helper to generate media URL
//   function mediaUrl(p) {
//     return p
//       ? `${window.location.protocol}//${window.location.hostname}:4000${p}`
//       : null;
//   }

//   // 🔹 Save edited post
//   async function handleSave(e) {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const fd = new FormData();
//       fd.append("content", text);
//       if (file) fd.append("media", file);

//       const r = await fetch(`${API_BASE}/api/posts/${post.id}`, {
//         method: "PUT",
//         body: fd,
//         credentials: "include",
//       });

//       if (!r.ok) {
//         const b = await r.json();
//         alert(b.error || "Update failed");
//       } else {
//         setEditing(false);
//         refresh();
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Network error");
//     } finally {
//       setSaving(false);
//     }
//   }

//   // 🔹 Delete post with confirmation
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
//         refresh();
//       } else {
//         const b = await r.json();
//         alert(b.error || "Delete failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Network error");
//     }
//   }

//   return (
//     <article className="post-card">
//       {/* 🔹 Post Header with Avatar and Menu */}
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
//               {new Date(post.created_at).toLocaleString()}
//             </div>
//           </div>
//         </div>

//         <div ref={ref} style={{ position: "relative" }}>
//           {/* <button
//             className="dots-btn"
//             onClick={() => setMenuOpen((s) => !s)}
//             aria-haspopup="true"
//           >
//             ⋯
//           </button> */}
//           <button
//             className="dots-btn"
//             onClick={() => setMenuOpen((prev) => !prev)}
//             title="More options"
//           >
//             <Ellipsis size="20px" color="black" />
//           </button>

//           {menuOpen && (
//             <div className="post-menu">
//               {post.user_name === currentUserId && (
//                 <>
//                   <button
//                     onClick={() => {
//                       setEditing(true);
//                       setMenuOpen(false);
//                     }}
//                   >
//                     <Pencil size="16px" />
//                     Edit Post
//                   </button>
//                   <button
//                     onClick={() => {
//                       setMenuOpen(false);
//                       handleDelete();
//                     }}
//                   >
//                     <Trash size="16px" />
//                     Delete Post
//                   </button>
//                 </>
//               )}
//               <button
//                 onClick={() => {
//                   setMenuOpen(false);
//                   alert("Send feature not implemented yet");
//                 }}
//               >
//                 <Forward size="16px" /> Send
//               </button>

//               <button
//                 onClick={() => {
//                   setMenuOpen(false);
//                   alert("Report feature not implemented yet");
//                 }}
//               >
//                 <Flag size="16px" />
//                 Report Post
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 🔹 Post Content */}
//       {!editing && (
//         <div className="post-body">
//           <p>{post.content}</p>
//           {post.media_url && post.media_type === "image" && (
//             <img
//               className="post-media"
//               src={mediaUrl(post.media_url)}
//               alt="post media"
//             />
//           )}
//           {post.media_url && post.media_type === "video" && (
//             <video controls className="post-media">
//               <source src={mediaUrl(post.media_url)} />
//             </video>
//           )}
//         </div>
//       )}

//       {/* 🔹 Edit Post Form */}
//       {editing && (
//         <form onSubmit={handleSave} className="edit-form">
//           <textarea
//             value={text}
//             onChange={(e) => setText(e.target.value)}
//             placeholder="Edit your post..."
//           />
//           <input
//             type="file"
//             accept="image/*,video/*"
//             onChange={(e) => setFile(e.target.files[0])}
//           />
//           <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
//             <button type="submit" className="btn" disabled={saving}>
//               {saving ? "Saving..." : "Save"}
//             </button>
//             <button
//               type="button"
//               className="btn-outline"
//               onClick={() => setEditing(false)}
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       )}

//       {/* 🔹 Action Buttons */}
//       <div className="post-actions">
//         <button className="action-btn">
//           {" "}
//           <ThumbsUp size="20px" color="blue" /> Like
//         </button>
//         <button className="action-btn">
//           <MessageCircle size="20px" color="blue" /> Comment
//         </button>
//         <button className="action-btn">
//           <Send size="20px" color="blue" /> Share
//         </button>
//       </div>
//     </article>
//   );
// }

// // src/Components/Post.js
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
// } from "lucide-react";
// import EditPostModal from "./EditPostModal"; // ✅ import the new modal

// export default function Post({ post, API_BASE, currentUserId, refresh }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const ref = useRef();

//   // close dropdown when clicking outside
//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
//     }
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   // helper for media url
//   function mediaUrl(p) {
//     return p
//       ? `${window.location.protocol}//${window.location.hostname}:4000${p}`
//       : null;
//   }

//   // delete post
//   async function handleDelete() {
//     const confirmDelete = window.confirm("Delete this post?");
//     if (!confirmDelete) return;

//     try {
//       const r = await fetch(`${API_BASE}/api/posts/${post.id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       if (r.ok) refresh();
//       else {
//         const b = await r.json();
//         alert(b.error || "Delete failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Network error");
//     }
//   }

//   // visibility rendering
//   function renderVisibility() {
//     switch (post.visibility || "Anyone") {
//       case "Connections":
//         return (
//           <>
//             <Users size={14} /> Connections only
//           </>
//         );
//       case "Private":
//         return (
//           <>
//             <Lock size={14} /> Only you
//           </>
//         );
//       default:
//         return (
//           <>
//             <Globe2 size={14} /> Anyone
//           </>
//         );
//     }
//   }

//   // ✅ fix logic: compare user_id not name
//   const isMyPost = String(post.user_id) === String(currentUserId);

//   return (
//     <article className="post-card">
//       {/* Header */}
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

//         <div ref={ref} style={{ position: "relative" }}>
//           <button
//             className="dots-btn"
//             onClick={() => setMenuOpen((p) => !p)}
//             title="More options"
//           >
//             <Ellipsis size="20px" color="black" />
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
//                     <Pencil size={16} /> Edit
//                   </button>
//                   <button
//                     onClick={() => {
//                       setMenuOpen(false);
//                       handleDelete();
//                     }}
//                   >
//                     <Trash size={16} /> Delete
//                   </button>
//                   <button disabled style={{ color: "#555", opacity: 0.7 }}>
//                     {renderVisibility()}
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <button
//                     onClick={() => {
//                       setMenuOpen(false);
//                       alert("Send feature not implemented yet");
//                     }}
//                   >
//                     <Forward size={16} /> Send
//                   </button>
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
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Body */}
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

//       {/* Actions */}
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

//       {/* Edit Modal */}
//       {showEditModal && (
//         <EditPostModal
//           API_BASE={API_BASE}
//           post={post}
//           onClose={() => setShowEditModal(false)}
//           onSaveSuccess={refresh}
//         />
//       )}
//     </article>
//   );
// }

// src/Components/Post.js
import React, { useEffect, useRef, useState } from "react";
import {
  ThumbsUp,
  MessageCircle,
  Send,
  Forward,
  Pencil,
  Trash,
  Flag,
  Ellipsis,
  Globe2,
  Users,
  Lock,
  Eye,
  BookMarked,
} from "lucide-react";
import EditPostModal from "./EditPostModal"; // ✅ import edit modal

export default function Post({ post, API_BASE, currentUserName, refresh }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const ref = useRef();

  // ✅ Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ Helper for media URLs
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
        refresh(); // reload posts after delete
      } else {
        const body = await response.json();
        alert(body.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  }

  // ✅ Visibility icons
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

  // ✅ Key fix: Compare user_name with logged-in username
  const isMyPost =
    String(post.user_name).trim().toLowerCase() ===
    String(currentUserName).trim().toLowerCase();

  // ✅ Main JSX
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

        {/* ===== 3 DOT MENU ===== */}
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
              {/* ✅ Show only if the logged-in user owns the post */}
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
                      alert("Visibility feature not implemented yet");
                    }}
                  >
                    <Eye size={16} /> Who can see this post?
                  </button>

                  {/* <button disabled style={{ color: "#555", opacity: 0.7 }}>
                    {renderVisibility()}
                  </button> */}
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      alert("Report feature not implemented yet");
                    }}
                  >
                    <Flag size={16} /> Report Post
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  alert("Send feature not implemented yet");
                }}
              >
                <Forward size={16} /> Send
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  alert("Save feature not implemented yet");
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
        <button className="action-btn">
          <ThumbsUp size={20} color="blue" /> Like
        </button>
        <button className="action-btn">
          <MessageCircle size={20} color="blue" /> Comment
        </button>
        <button className="action-btn">
          <Send size={20} color="blue" /> Share
        </button>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && (
        <EditPostModal
          API_BASE={API_BASE}
          post={post}
          onClose={() => setShowEditModal(false)}
          onSaveSuccess={refresh}
          currentUser={{ name: post.user_name, avatar_url: post.avatar_url }} // ✅ pass user info
        />
      )}
    </article>
  );
}
