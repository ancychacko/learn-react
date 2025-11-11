//src/Components/Comment.js
// import React, { useEffect, useState } from "react";
// import { MessageCircle } from "lucide-react";

// export default function Comment({
//   API_BASE = "",
//   postId,
//   currentUser,
//   onCountChange,
// }) {
//   const [open, setOpen] = useState(false);
//   const [comments, setComments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [newText, setNewText] = useState("");

//   async function fetchComments() {
//     try {
//       const r = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
//         credentials: "include",
//       });
//       if (r.ok) {
//         const data = await r.json();
//         setComments(data);
//         if (onCountChange) onCountChange(data.length);
//       }
//     } catch (err) {
//       console.error("Failed to load comments", err);
//     }
//   }

//   useEffect(() => {
//     if (open) fetchComments();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [open]);

//   async function handleAddComment(e) {
//     e.preventDefault();
//     if (!newText.trim()) return;
//     setLoading(true);
//     try {
//       const r = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ content: newText }),
//       });
//       if (r.ok) {
//         const created = await r.json();
//         setComments((s) => [created, ...s]);
//         setNewText("");
//         if (onCountChange) onCountChange(comments.length + 1);
//       } else {
//         const b = await r.json();
//         alert(b.error || "Comment failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Network error");
//     }
//     setLoading(false);
//   }

//   return (
//     <div className="comment-wrapper">
//       <button
//         className="action-btn comment-btn"
//         onClick={() => setOpen((s) => !s)}
//         title="Toggle comments"
//         style={{ minWidth: 90 }}
//       >
//         <MessageCircle size={18} className="icon" />
//         <span>Comment</span>
//       </button>

//       {open && (
//         <div className="comments-box">
//           <form onSubmit={handleAddComment} className="comment-form">
//             <input
//               type="text"
//               placeholder={
//                 currentUser?.name
//                   ? `Comment as ${currentUser.name}`
//                   : "Write a comment..."
//               }
//               value={newText}
//               onChange={(e) => setNewText(e.target.value)}
//             />
//             <button className="btn" type="submit" disabled={loading}>
//               {loading ? "Posting..." : "Post"}
//             </button>
//           </form>

//           {comments.length === 0 ? (
//             <div className="muted">No comments yet</div>
//           ) : (
//             comments.map((c) => (
//               <div key={c.id} className="comment-item">
//                 <img
//                   src={
//                     c.avatar_url
//                       ? `${window.location.protocol}//${window.location.hostname}:4000${c.avatar_url}`
//                       : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                   }
//                   className="comment-avatar"
//                   alt={c.user_name}
//                 />
//                 <div className="comment-body">
//                   <div className="comment-author">{c.user_name}</div>
//                   <div className="comment-text">{c.content}</div>
//                   <div className="comment-meta">
//                     {new Date(c.created_at).toLocaleString()}
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import { MessageCircle, Smile, Image as ImageIcon } from "lucide-react";

export default function Comment({
  API_BASE = "",
  postId,
  currentUser,
  onCountChange,
}) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newText, setNewText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const photoInputRef = useRef(null);

  async function fetchComments() {
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        credentials: "include",
      });
      if (r.ok) {
        const data = await r.json();
        setComments(data);
        if (onCountChange) onCountChange(data.length);
      }
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  }

  useEffect(() => {
    if (open) fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newText.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newText }),
      });
      if (r.ok) {
        const created = await r.json();
        setComments((s) => [created, ...s]);
        setNewText("");
        if (onCountChange) onCountChange(comments.length + 1);
      } else {
        const b = await r.json();
        alert(b.error || "Comment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
    setLoading(false);
  }
  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  return (
    <div className="comment-wrapper">
      {/* Comment button */}
      <button
        className="action-btn comment-btn"
        onClick={() => setOpen((s) => !s)}
        title="Toggle comments"
        style={{ minWidth: 90 }}
      >
        <MessageCircle size={18} className="icon" />
        <span>Comment </span>
      </button>

      {/* Comment section */}
      {open && (
        <div className="comments-box">
          {/* Input row with user avatar */}
          <form onSubmit={handleAddComment} className="comment-form">
            <img
              src={
                currentUser?.avatar_url
                  ? `${window.location.protocol}//${window.location.hostname}:4000${currentUser.avatar_url}`
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="comment-avatar current-user"
              alt="Your avatar"
            />
            <div className="comment-input-container">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                disabled={loading}
              />
              <div className="comment-icons">
                <Smile size={18} className="icon" />
                <ImageIcon
                  size={18}
                  className="icon"
                  onClick={() => photoInputRef.current?.click()}
                />
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: "none" }}
                />
              </div>
            </div>
          </form>

          {/* Comments list */}
          <div className="comments-list">
            {comments.length === 0 && (
              <div className="muted">No comments yet</div>
            )}
            {comments.map((c) => (
              <div key={c.id} className="comment-item">
                <img
                  src={
                    c.avatar_url
                      ? `${window.location.protocol}//${window.location.hostname}:4000${c.avatar_url}`
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  className="comment-avatar"
                  alt={c.user_name}
                />
                <div className="comment-body">
                  <div className="comment-author">{c.user_name}</div>
                  <div className="comment-text">{c.content}</div>
                  <div className="comment-meta">
                    {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
