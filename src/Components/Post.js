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
//   Edit3,
//   Repeat2,
// } from "lucide-react";
// import Like from "./Like";
// import Comment from "./Comment";
// import Send from "./Send";
// import EditPostModal from "./EditPostModal";
// import SharedPost from "./SharedPost";
// import useClickOutside from "../Hooks/useClickOutside";
// import RepostModal from "./RepostModal";
// import ImagePreviewModal from "./ImagePreviewModal";
// import "./Post.css";

// export default function Post({
//   post,
//   API_BASE = "",
//   currentUserName = "",
//   refresh,
//   currentUser,
// }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [repostMenuOpen, setRepostMenuOpen] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);

//   const [likeCount, setLikeCount] = useState(Number(post.like_count || 0));
//   const [likedByMe, setLikedByMe] = useState(Boolean(post.liked_by_me));
//   const [shareCount, setShareCount] = useState(Number(post.share_count || 0));
//   const [commentCount, setCommentCount] = useState(
//     Number(post.comment_count || 0)
//   );
//   const [openComment, setOpenComment] = useState(false);
//   const [openRepostModal, setOpenRepostModal] = useState(false);
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [modalImageUrl, setModalImageUrl] = useState(null);

//   const contentRef = useRef(null);
//   const [showMoreLink, setShowMoreLink] = useState(false);
//   const [expandedInFeed, setExpandedInFeed] = useState(false);

//   const menuRef = useRef();
//   const repostRef = useRef();

//   const isShared = post.is_share === true && post.original_post;

//   function mediaUrl(path) {
//     if (!path) return null;
//     return `${window.location.protocol}//${window.location.hostname}:4000${path}`;
//   }

//   /* CLOSE 3-DOTS MENU ON OUTSIDE CLICK */
//   useEffect(() => {
//     function handleOutside(e) {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setMenuOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleOutside);
//     return () => document.removeEventListener("mousedown", handleOutside);
//   }, []);

//   /* CLOSE REPOST MENU ON OUTSIDE CLICK USING HOOK */
//   useClickOutside(repostRef, () => setRepostMenuOpen(false));

//   const isMyPost =
//     post.user_name?.trim().toLowerCase() ===
//     currentUserName?.trim().toLowerCase();

//   async function handleDelete() {
//     if (!window.confirm("Delete post?")) return;

//     const r = await fetch(`${API_BASE}/api/posts/${post.id}`, {
//       method: "DELETE",
//       credentials: "include",
//     });

//     if (r.ok && typeof refresh === "function") refresh();
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

//   /* --- Truncation detection for feed (3 lines) --- */
//   useEffect(() => {
//     const el = contentRef.current;
//     if (!el) return;
//     const isOverflowing = el.scrollHeight > el.clientHeight + 1;
//     setShowMoreLink(isOverflowing);
//   }, [post.content]);

//   return (
//     <article className="post-card">
//       {/* POST HEADER */}
//       <div className="post-header">
//         <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//           <img
//             src={
//               post.avatar_url
//                 ? mediaUrl(post.avatar_url)
//                 : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//             }
//             className="avatar-sm"
//             alt=""
//           />
//           <div>
//             <div className="post-author">{post.user_name}</div>
//             <div className="post-meta">
//               {new Date(post.created_at).toLocaleString()} •{" "}
//               <span className="post-visibility">{renderVisibility()}</span>
//             </div>
//           </div>
//         </div>

//         {/* POST MENU */}
//         <div ref={menuRef} style={{ position: "relative" }}>
//           <button className="dots-btn" onClick={() => setMenuOpen(!menuOpen)}>
//             <Ellipsis size={20} />
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

//                   <button disabled>
//                     <Eye size={16} /> Who can see this post?
//                   </button>
//                 </>
//               ) : (
//                 <button>
//                   <Flag size={16} /> Report Post
//                 </button>
//               )}

//               <button>
//                 <BookMarked size={16} /> Save
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* SHARED COMMENT */}
//       {isShared && post.share_comment && (
//         <div className="post-body">
//           <p>{post.share_comment}</p>
//         </div>
//       )}

//       {/* SHARED ORIGINAL POST */}
//       {isShared && (
//         <SharedPost
//           original={post.original_post}
//           missing={post.original_missing}
//         />
//       )}

//       {/* NORMAL POST */}
//       {!isShared && (
//         <div className="post-body">
//           {/* CONTENT: clamp to 3 lines unless expandedInFeed */}
//           <div
//             ref={contentRef}
//             className={`post-content-clamp ${expandedInFeed ? "expanded" : ""}`}
//             aria-expanded={expandedInFeed}
//           >
//             <p>
//               {post.content}
//               {/* Inline "more..." link */}
//               {showMoreLink && !expandedInFeed && (
//                 <button
//                   className="more-link-inline"
//                   onClick={() => setExpandedInFeed(true)}
//                 >
//                   ...more
//                 </button>
//               )}
//             </p>
//           </div>

//           {post.media_url && post.media_type === "image" && (
//             <img
//               className="post-media"
//               src={mediaUrl(post.media_url)}
//               alt=""
//               style={{ cursor: "pointer" }}
//               onClick={() => {
//                 setModalImageUrl(mediaUrl(post.media_url));
//                 setShowImageModal(true);
//               }}
//             />
//           )}

//           {post.media_url && post.media_type === "video" && (
//             <video controls className="post-media">
//               <source src={mediaUrl(post.media_url)} />
//             </video>
//           )}
//         </div>
//       )}

//       {/* POST STATS */}
//       <div className="post-stats">
//         <span className="stats-item">
//           <ThumbsUp size={14} /> {likeCount}
//         </span>
//         <span className="stats-item">
//           <MessageCircle size={14} /> {commentCount}
//         </span>
//         <span className="stats-item">
//           <Forward size={14} /> {shareCount}
//         </span>
//       </div>

//       {/* ACTION BAR */}
//       <div className="post-actions">
//         <Like
//           API_BASE={API_BASE}
//           postId={post.id}
//           initialLiked={likedByMe}
//           initialCount={likeCount}
//           onToggle={(liked, count) => {
//             setLikedByMe(liked);
//             setLikeCount(count);
//           }}
//         />

//         <button
//           className="action-btn"
//           onClick={() => setOpenComment(!openComment)}
//         >
//           <MessageCircle size={18} /> Comment
//         </button>

//         {/* REPOST */}
//         <div className="repost-wrapper" ref={repostRef}>
//           <button
//             className="action-btn"
//             onClick={() => setRepostMenuOpen(!repostMenuOpen)}
//           >
//             <Repeat2 size={18} /> Repost
//           </button>

//           {repostMenuOpen && (
//             <div className="repost-menu">
//               <button
//                 onClick={() => {
//                   setRepostMenuOpen(false);
//                   setOpenRepostModal(true);
//                 }}
//               >
//                 <Edit3 size={17} />
//                 Repost with your thoughts
//               </button>

//               <button
//                 onClick={async () => {
//                   setRepostMenuOpen(false);
//                   try {
//                     const r = await fetch(
//                       `${API_BASE}/api/posts/${post.id}/share`,
//                       {
//                         method: "POST",
//                         credentials: "include",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({
//                           recipients: [],
//                           share_to_feed: true,
//                           comment: null,
//                           visibility: "Anyone",
//                         }),
//                       }
//                     );
//                     if (r.ok) {
//                       setShareCount((s) => s + 1);
//                       refresh?.();
//                     }
//                   } catch (err) {
//                     console.error(err);
//                   }
//                 }}
//               >
//                 <Repeat2 size={17} />
//                 Repost instantly
//               </button>
//             </div>
//           )}
//         </div>

//         <Send
//           API_BASE={API_BASE}
//           postId={post.id}
//           onShared={setShareCount}
//           posterName={post.user_name}
//         />
//       </div>

//       {openComment && (
//         <Comment
//           API_BASE={API_BASE}
//           postId={post.id}
//           currentUser={currentUser}
//           onCountChange={(count) => setCommentCount(count)}
//         />
//       )}

//       {showEditModal && (
//         <EditPostModal
//           API_BASE={API_BASE}
//           post={post}
//           onClose={() => setShowEditModal(false)}
//           onSaveSuccess={() => {
//             setShowEditModal(false);
//             refresh();
//           }}
//           currentUser={{ name: post.user_name, avatar_url: post.avatar_url }}
//         />
//       )}

//       <RepostModal
//         open={openRepostModal}
//         onClose={() => setOpenRepostModal(false)}
//         currentUser={currentUser}
//         originalPost={post.is_share ? post.original_post : post}
//         API_BASE={API_BASE}
//         onSuccess={() => {
//           if (typeof refresh === "function") refresh();
//         }}
//       />

//       <ImagePreviewModal
//         open={showImageModal}
//         onClose={() => setShowImageModal(false)}
//         post={post}
//         API_BASE={API_BASE}
//         currentUser={currentUser}
//         refresh={refresh}
//       />
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
  Edit3,
  Repeat2,
} from "lucide-react";
import Like from "./Like";
import Comment from "./Comment";
import Send from "./Send";
import EditPostModal from "./EditPostModal";
import SharedPost from "./SharedPost";
import useClickOutside from "../Hooks/useClickOutside";
import RepostModal from "./RepostModal";
import ImagePreviewModal from "./ImagePreviewModal";
import "./Post.css";

export default function Post({
  post,
  API_BASE = "",
  currentUserName = "",
  refresh,
  currentUser,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [likeCount, setLikeCount] = useState(Number(post.like_count || 0));
  const [likedByMe, setLikedByMe] = useState(Boolean(post.liked_by_me));
  const [shareCount, setShareCount] = useState(Number(post.share_count || 0));
  const [commentCount, setCommentCount] = useState(
    Number(post.comment_count || 0)
  );
  const [openComment, setOpenComment] = useState(false);
  const [openRepostModal, setOpenRepostModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState(null);

  // truncation refs / state for feed (3 lines)
  const contentRef = useRef(null);
  const [showMoreLink, setShowMoreLink] = useState(false);
  const [expandedInFeed, setExpandedInFeed] = useState(false);

  const menuRef = useRef();
  const repostRef = useRef();

  const isShared = post.is_share === true && post.original_post;

  function mediaUrl(path) {
    if (!path) return null;
    return `${window.location.protocol}//${window.location.hostname}:4000${path}`;
  }

  /* CLOSE 3-DOTS MENU ON OUTSIDE CLICK */
  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  /* CLOSE REPOST MENU ON OUTSIDE CLICK USING HOOK */
  useClickOutside(repostRef, () => setRepostMenuOpen(false));

  const isMyPost =
    post.user_name?.trim().toLowerCase() ===
    currentUserName?.trim().toLowerCase();

  async function handleDelete() {
    if (!window.confirm("Delete post?")) return;

    const r = await fetch(`${API_BASE}/api/posts/${post.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (r.ok && typeof refresh === "function") refresh();
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

  /* --- Truncation detection for feed (3 lines) --- */
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    // compute whether the text inside the clamp overflows the visible 3-line area
    // Because CSS clamps to 3 lines, compare scrollHeight to clientHeight
    const overflowing = el.scrollHeight > el.clientHeight + 1;
    setShowMoreLink(overflowing);
  }, [post.content]);

  return (
    <article className="post-card">
      {/* POST HEADER */}
      <div className="post-header">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img
            src={
              post.avatar_url
                ? mediaUrl(post.avatar_url)
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="avatar-sm"
            alt=""
          />
          <div>
            <div className="post-author">{post.user_name}</div>
            <div className="post-meta">
              {new Date(post.created_at).toLocaleString()} •{" "}
              <span className="post-visibility">{renderVisibility()}</span>
            </div>
          </div>
        </div>

        {/* POST MENU */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button className="dots-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <Ellipsis size={20} />
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

                  <button disabled>
                    <Eye size={16} /> Who can see this post?
                  </button>
                </>
              ) : (
                <button>
                  <Flag size={16} /> Report Post
                </button>
              )}

              <button>
                <BookMarked size={16} /> Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SHARED COMMENT */}
      {isShared && post.share_comment && (
        <div className="post-body">
          <p>{post.share_comment}</p>
        </div>
      )}

      {/* SHARED ORIGINAL POST */}
      {isShared && (
        <SharedPost
          original={post.original_post}
          missing={post.original_missing}
        />
      )}

      {/* NORMAL POST */}
      {!isShared && (
        <div className="post-body">
          {/* CONTENT WRAPPER with inline "more" */}
          <div className="post-content-wrapper">
            <div
              ref={contentRef}
              className={`post-content-clamp ${
                expandedInFeed ? "expanded" : ""
              }`}
              aria-expanded={expandedInFeed}
            >
              {/* IMPORTANT: keep paragraph markup so SharedPost and other code works */}
              <p>{post.content}</p>
            </div>

            {/* Inline "more..." link positioned immediately after the clipped text */}
            {showMoreLink && !expandedInFeed && (
              <button
                className="more-link-inline"
                onClick={() => setExpandedInFeed(true)}
                aria-label="Expand post"
              >
                ...more
              </button>
            )}
          </div>

          {post.media_url && post.media_type === "image" && (
            <img
              className="post-media"
              src={mediaUrl(post.media_url)}
              alt=""
              style={{ cursor: "pointer" }}
              onClick={() => {
                setModalImageUrl(mediaUrl(post.media_url));
                setShowImageModal(true);
              }}
            />
          )}

          {post.media_url && post.media_type === "video" && (
            <video controls className="post-media">
              <source src={mediaUrl(post.media_url)} />
            </video>
          )}
        </div>
      )}

      {/* POST STATS */}
      <div className="post-stats">
        <span className="stats-item">
          <ThumbsUp size={14} /> {likeCount}
        </span>
        <span className="stats-item">
          <MessageCircle size={14} /> {commentCount}
        </span>
        <span className="stats-item">
          <Forward size={14} /> {shareCount}
        </span>
      </div>

      {/* ACTION BAR */}
      <div className="post-actions">
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

        <button
          className="action-btn"
          onClick={() => setOpenComment(!openComment)}
        >
          <MessageCircle size={18} /> Comment
        </button>

        {/* REPOST */}
        <div className="repost-wrapper" ref={repostRef}>
          <button
            className="action-btn"
            onClick={() => setRepostMenuOpen(!repostMenuOpen)}
          >
            <Repeat2 size={18} /> Repost
          </button>

          {repostMenuOpen && (
            <div className="repost-menu">
              <button
                onClick={() => {
                  setRepostMenuOpen(false);
                  setOpenRepostModal(true);
                }}
              >
                <Edit3 size={17} />
                Repost with your thoughts
              </button>

              <button
                onClick={async () => {
                  setRepostMenuOpen(false);
                  try {
                    const r = await fetch(
                      `${API_BASE}/api/posts/${post.id}/share`,
                      {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          recipients: [],
                          share_to_feed: true,
                          comment: null,
                          visibility: "Anyone",
                        }),
                      }
                    );
                    if (r.ok) {
                      setShareCount((s) => s + 1);
                      refresh?.();
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                <Repeat2 size={17} />
                Repost instantly
              </button>
            </div>
          )}
        </div>

        <Send
          API_BASE={API_BASE}
          postId={post.id}
          onShared={setShareCount}
          posterName={post.user_name}
        />
      </div>

      {openComment && (
        <Comment
          API_BASE={API_BASE}
          postId={post.id}
          currentUser={currentUser}
          onCountChange={(count) => setCommentCount(count)}
        />
      )}

      {showEditModal && (
        <EditPostModal
          API_BASE={API_BASE}
          post={post}
          onClose={() => setShowEditModal(false)}
          onSaveSuccess={() => {
            setShowEditModal(false);
            refresh();
          }}
          currentUser={{ name: post.user_name, avatar_url: post.avatar_url }}
        />
      )}

      <RepostModal
        open={openRepostModal}
        onClose={() => setOpenRepostModal(false)}
        currentUser={currentUser}
        originalPost={post.is_share ? post.original_post : post}
        API_BASE={API_BASE}
        onSuccess={() => {
          if (typeof refresh === "function") refresh();
        }}
      />

      <ImagePreviewModal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        post={post}
        API_BASE={API_BASE}
        currentUser={currentUser}
        refresh={refresh}
      />
    </article>
  );
}
