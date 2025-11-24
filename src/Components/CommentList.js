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
//   const [comments, setComments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [sort, setSort] = useState("recent");
//   const [openReplyFor, setOpenReplyFor] = useState(null);

//   async function loadComments() {
//     setLoading(true);
//     try {
//       const r = await fetch(
//         `${API_BASE}/api/posts/${postId}/comments?sort=${sort}`,
//         { credentials: "include" }
//       );

//       if (r.ok) {
//         const data = await r.json();
//         setComments(data || []);

//         if (onCountChange) {
//           let total = 0;
//           data.forEach((c) => {
//             total += 1 + (c.replies ? c.replies.length : 0);
//           });
//           onCountChange(total);
//         }
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadComments();
//   }, [sort]);

//   function handleNewTopComment(created) {
//     setComments((s) => [{ ...created, replies: [] }, ...s]);
//     if (onCountChange) onCountChange((prev) => (prev || 0) + 1);
//   }

//   async function reload(keepOpenId = null) {
//     await loadComments();
//     setOpenReplyFor(keepOpenId || null);
//   }

//   return (
//     <div className="linkedin-comments">
//       <div className="comments-header">
//         <strong>Comments</strong>
//       </div>

//       <div className="comment-input-area">
//         <CommentInput
//           API_BASE={API_BASE}
//           postId={postId}
//           currentUser={currentUser}
//           onPosted={(c) => handleNewTopComment(c)}
//         />

//         <div className="comments-sort-row">
//           <label className="sort-label">Sort</label>
//           <select
//             className="sort-select"
//             value={sort}
//             onChange={(e) => setSort(e.target.value)}
//           >
//             <option value="relevant">Most relevant</option>
//             <option value="recent">Newest</option>
//             <option value="oldest">Oldest</option>
//           </select>
//         </div>
//       </div>

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
//             onReplyAdded={(id) => reload(id)} // FIXED
//             onToggleLike={(id) => reload(openReplyFor)} // FIXED
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// src/Components/CommentList.js
import React, { useEffect, useState, useCallback } from "react";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import "./Comment.css";

export default function CommentList({
  API_BASE = "",
  postId,
  currentUser,
  onCountChange,
}) {
  const [comments, setComments] = useState([]); // nested tree
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("recent"); // recent | oldest | relevant

  // Which top-level comment's replies are visible (only that root shows replies)
  const [openThreadFor, setOpenThreadFor] = useState(null);

  // Which specific comment/reply has an open reply editor (single at a time)
  const [openReplyFor, setOpenReplyFor] = useState(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(
        `${API_BASE}/api/posts/${postId}/comments?sort=${encodeURIComponent(
          sort
        )}`,
        { credentials: "include" }
      );
      if (r.ok) {
        const data = await r.json();
        setComments(data || []);
        if (onCountChange) {
          // compute total comments count (including replies)
          let total = 0;
          (data || []).forEach((c) => {
            function countAll(node) {
              let t = 1;
              if (node.replies && node.replies.length) {
                node.replies.forEach((r) => (t += countAll(r)));
              }
              return t;
            }
            total += countAll(c);
          });
          onCountChange(total);
        }
      } else {
        console.warn("Failed loading comments");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, postId, sort, onCountChange]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // reload while optionally keeping a thread open and editor open
  async function reload(keepThreadId = null, keepReplyId = null) {
    await loadComments();
    setOpenThreadFor(keepThreadId || null);
    setOpenReplyFor(keepReplyId || null);
  }

  function handleNewTopComment(created) {
    setComments((s) => [{ ...created, replies: [] }, ...s]);
    if (onCountChange) onCountChange((prev) => (prev || 0) + 1);
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
          onPosted={(c) => {
            // add top-level comment locally
            handleNewTopComment(c);
          }}
        />

        <div className="comments-sort-row">
          <div className="sort-placeholder" />
          <div className="sort-control">
            <label className="sort-label">Sort</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="sort-select"
            >
              <option value="relevant">Most relevant</option>
              <option value="recent">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
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
            // rootId = this top-level id
            rootId={c.id}
            openThreadFor={openThreadFor}
            setOpenThreadFor={setOpenThreadFor}
            openReplyFor={openReplyFor}
            setOpenReplyFor={setOpenReplyFor}
            // onReplyAdded: reload while keeping thread/reply open
            onReplyAdded={(keepRootId = null, keepReplyId = null) =>
              reload(keepRootId ?? openThreadFor, keepReplyId ?? openReplyFor)
            }
            onToggleLike={() =>
              // reload and keep whatever thread/editor open
              reload(openThreadFor, openReplyFor)
            }
          />
        ))}
      </div>
    </div>
  );
}
