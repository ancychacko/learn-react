// src/Components/CommentList.js
// import React, { useEffect, useState } from "react";
// import CommentItem from "./CommentItem";
// import CommentInput from "./CommentInput";
// import "./Comment.css";

// export default function CommentList({
//   API_BASE = "",
//   postId,
//   currentUser,
//   onCountChange,
// }) {
//   const [comments, setComments] = useState([]); // nested
//   const [loading, setLoading] = useState(false);
//   const [sort, setSort] = useState("recent"); // recent | oldest | relevant

//   // Only one comment's reply section open at a time
//   const [openReplyFor, setOpenReplyFor] = useState(null);

//   async function loadComments() {
//     setLoading(true);
//     try {
//       const r = await fetch(
//         `${API_BASE}/api/posts/${postId}/comments?sort=${encodeURIComponent(
//           sort
//         )}`,
//         { credentials: "include" }
//       );
//       if (r.ok) {
//         const data = await r.json();
//         setComments(data || []);
//         if (onCountChange) {
//           // compute total comments count (including replies)
//           let total = 0;
//           (data || []).forEach((c) => {
//             total += 1 + (c.replies ? c.replies.length : 0);
//           });
//           onCountChange(total);
//         }
//       } else {
//         console.warn("Failed loading comments");
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadComments();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [sort]);

//   // when a new top-level comment is added, insert it at top (recent-first)
//   function handleNewTopComment(created) {
//     setComments((s) => [{ ...created, replies: [] }, ...s]);
//     if (onCountChange) onCountChange((prev) => (prev || 0) + 1);
//   }

//   // reload full list (useful after reply or like)
//   async function reloadComments(keepOpenId = null) {
//     await loadComments();
//     // keep the same reply open if requested; otherwise close
//     setOpenReplyFor(keepOpenId || null);
//   }

//   return (
//     <div className="linkedin-comments">
//       <div className="comments-header">
//         <strong>Comments</strong>
//       </div>

//       {/* Comment input */}
//       <div className="comment-input-area">
//         <CommentInput
//           API_BASE={API_BASE}
//           postId={postId}
//           currentUser={currentUser}
//           onPosted={(c) => {
//             handleNewTopComment(c);
//           }}
//         />

//         {/* Sorting - placed under input, right aligned */}
//         <div className="comments-sort-row">
//           <div className="sort-placeholder" />
//           <div className="sort-control">
//             <label className="sort-label">Sort</label>
//             <select
//               value={sort}
//               onChange={(e) => setSort(e.target.value)}
//               className="sort-select"
//             >
//               <option value="relevant">Most relevant</option>
//               <option value="recent">Newest</option>
//               <option value="oldest">Oldest</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Comments list */}
//       <div className="comments-list">
//         {loading && <div className="muted">Loading...</div>}
//         {!loading && comments.length === 0 && (
//           <div className="muted">No comments yet</div>
//         )}

//         {comments.map((c) => (
//           <CommentItem
//             key={c.id}
//             comment={c}
//             API_BASE={API_BASE}
//             currentUser={currentUser}
//             openReplyFor={openReplyFor}
//             setOpenReplyFor={setOpenReplyFor}
//             onReplyAdded={() => reloadComments(c.id)}
//             onToggleLike={() => reloadComments(openReplyFor)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// src/Components/CommentList.js
import React, { useEffect, useState } from "react";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import "./Comment.css";

export default function CommentList({
  API_BASE = "",
  postId,
  currentUser,
  onCountChange,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("recent");
  const [openReplyFor, setOpenReplyFor] = useState(null);

  async function loadComments() {
    setLoading(true);
    try {
      const r = await fetch(
        `${API_BASE}/api/posts/${postId}/comments?sort=${sort}`,
        { credentials: "include" }
      );

      if (r.ok) {
        const data = await r.json();
        setComments(data || []);

        if (onCountChange) {
          let total = 0;
          data.forEach((c) => {
            total += 1 + (c.replies ? c.replies.length : 0);
          });
          onCountChange(total);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, [sort]);

  function handleNewTopComment(created) {
    setComments((s) => [{ ...created, replies: [] }, ...s]);
    if (onCountChange) onCountChange((prev) => (prev || 0) + 1);
  }

  async function reload(keepOpenId = null) {
    await loadComments();
    setOpenReplyFor(keepOpenId || null);
  }

  return (
    <div className="linkedin-comments">
      <div className="comments-header">
        <strong>Comments</strong>
      </div>

      <div className="comment-input-area">
        <CommentInput
          API_BASE={API_BASE}
          postId={postId}
          currentUser={currentUser}
          onPosted={(c) => handleNewTopComment(c)}
        />

        <div className="comments-sort-row">
          <label className="sort-label">Sort</label>
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="relevant">Most relevant</option>
            <option value="recent">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      <div className="comments-list">
        {loading && <div className="muted">Loading...</div>}
        {!loading && comments.length === 0 && (
          <div className="muted">No comments yet</div>
        )}

        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            API_BASE={API_BASE}
            currentUser={currentUser}
            openReplyFor={openReplyFor}
            setOpenReplyFor={setOpenReplyFor}
            onReplyAdded={(id) => reload(id)} // FIXED
            onToggleLike={(id) => reload(openReplyFor)} // FIXED
          />
        ))}
      </div>
    </div>
  );
}
