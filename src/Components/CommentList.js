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

//   async function loadComments() {
//     setLoading(true);
//     try {
//       const r = await fetch(
//         `${API_BASE}/api/posts/${postId}/comments?sort=${encodeURIComponent(
//           sort
//         )}`,
//         {
//           credentials: "include",
//         }
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
//     // server returns created comment (single comment object)
//     setComments((s) => [{ ...created, replies: [] }, ...s]);
//     if (onCountChange) onCountChange((prev) => (prev || 0) + 1);
//   }

//   // reload full list (useful after reply or like)
//   function reload() {
//     loadComments();
//   }

//   return (
//     <div className="comment-section" role="region" aria-label="Comments">
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           padding: "8px 12px",
//         }}
//       >
//         <div style={{ fontWeight: 600 }}>Comments</div>
//         <div>
//           <label style={{ marginRight: 8, fontSize: 13, color: "#6b7280" }}>
//             Sort
//           </label>
//           <select value={sort} onChange={(e) => setSort(e.target.value)}>
//             <option value="recent">Most recent</option>
//             <option value="relevant">Most relevant</option>
//             <option value="oldest">Oldest</option>
//           </select>
//         </div>
//       </div>

//       <div style={{ padding: "0 12px 8px 12px" }}>
//         <CommentInput
//           API_BASE={API_BASE}
//           postId={postId}
//           currentUser={currentUser}
//           onPosted={(c) => {
//             handleNewTopComment(c);
//           }}
//         />
//       </div>

//       <div className="comments-list">
//         {loading && (
//           <div className="muted" style={{ paddingLeft: 12 }}>
//             Loading...
//           </div>
//         )}
//         {!loading && comments.length === 0 && (
//           <div className="muted">No comments yet</div>
//         )}

//         {comments.map((c) => (
//           <CommentItem
//             key={c.id}
//             comment={c}
//             API_BASE={API_BASE}
//             currentUser={currentUser}
//             onReplyAdded={() => reload()}
//             onToggleLike={() => reload()}
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

  // ⭐ Only ONE comment's reply section open at a time
  const [openReplyFor, setOpenReplyFor] = useState(null);

  async function loadComments() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/posts/${postId}/comments?sort=${sort}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setComments(data);

        if (onCountChange) {
          let total = 0;
          data.forEach((c) => {
            total += 1 + (c.replies ? c.replies.length : 0);
          });
          onCountChange(total);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadComments();
  }, [sort]);

  function handleNewTopComment(created) {
    setComments((s) => [{ ...created, replies: [] }, ...s]);
    if (onCountChange) onCountChange((prev) => prev + 1);
  }

  function reloadComments(keepOpenId = null) {
    loadComments().then(() => {
      setOpenReplyFor(keepOpenId);
    });
  }

  return (
    <div className="comment-section">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 12px",
        }}
      >
        <div style={{ fontWeight: 600 }}>Comments</div>
        <div>
          <label style={{ marginRight: 8, fontSize: 13, color: "#6b7280" }}>
            Sort
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recent">Most recent</option>
            <option value="relevant">Most relevant</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "0 12px 8px 12px" }}>
        <CommentInput
          API_BASE={API_BASE}
          postId={postId}
          currentUser={currentUser}
          onPosted={(c) => handleNewTopComment(c)}
        />
      </div>

      {/* List */}
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
            onReplyAdded={() => reloadComments(c.id)}
            onToggleLike={() => reloadComments(openReplyFor)}
          />
        ))}
      </div>
    </div>
  );
}
