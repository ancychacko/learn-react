// src/Components/ImagePreviewModal.js
// import React, { useEffect, useState, useRef } from "react";
// import ReactDOM from "react-dom";
// import "./ImagePreviewModal.css";
// import {
//   X,
//   MessageCircle,
//   Repeat2,
//   Send as SendIcon,
//   Edit3,
// } from "lucide-react";

// import Like from "./Like";
// import Comment from "./Comment";
// import SendModal from "./SendModal";
// import RepostModal from "./RepostModal";
// import useClickOutside from "../Hooks/useClickOutside";

// export default function ImagePreviewModal({
//   open,
//   onClose,
//   post,
//   API_BASE = "",
//   currentUser,
//   refresh,
// }) {
//   const [likeCount, setLikeCount] = useState(post?.like_count || 0);
//   const [likedByMe, setLikedByMe] = useState(post?.liked_by_me || false);
//   const [commentCount, setCommentCount] = useState(post?.comment_count || 0);

//   const [openComment, setOpenComment] = useState(false);
//   const [openRepostModal, setOpenRepostModal] = useState(false);
//   const [openSendModal, setOpenSendModal] = useState(false);
//   const [repostMenuOpen, setRepostMenuOpen] = useState(false);

//   const modalRef = useRef();
//   const contentRef = useRef();

//   const [shouldStickActionBar, setShouldStickActionBar] = useState(false);

//   /** Close modal on outside click */
//   useClickOutside(modalRef, () => {
//     if (open) onClose();
//   });

//   /** Sync counts with parent */
//   useEffect(() => {
//     setLikeCount(post?.like_count ?? 0);
//     setLikedByMe(post?.liked_by_me ?? false);
//     setCommentCount(post?.comment_count ?? 0);
//   }, [post]);

//   /** Lock page scroll */
//   useEffect(() => {
//     if (!open) return;
//     const scrollY = window.scrollY;

//     document.body.style.position = "fixed";
//     document.body.style.top = `-${scrollY}px`;

//     return () => {
//       const y = Math.abs(parseInt(document.body.style.top || "0"));
//       document.body.style.position = "";
//       document.body.style.top = "";
//       window.scrollTo(0, y);
//     };
//   }, [open]);

//   /** Determine sticky bar behavior */
//   useEffect(() => {
//     if (!contentRef.current) return;

//     const contentHeight = contentRef.current.scrollHeight;
//     const visibleHeight = contentRef.current.clientHeight;

//     setShouldStickActionBar(contentHeight > visibleHeight + 20);
//   }, [post, openComment]);

//   if (!open) return null;

//   const stop = (e) => e.stopPropagation();

//   const mediaUrl = (path) =>
//     path
//       ? `${window.location.protocol}//${window.location.hostname}:4000${path}`
//       : null;

//   return ReactDOM.createPortal(
//     <div className="img-modal-overlay" onClick={onClose}>
//       <div className="img-modal" ref={modalRef} onClick={stop}>
//         {/* LEFT IMAGE */}
//         <div className="img-left">
//           <img
//             src={mediaUrl(post.media_url)}
//             className="img-preview"
//             draggable={false}
//             alt=""
//           />
//         </div>

//         {/* RIGHT SIDE */}
//         <div className="img-right">
//           {/* HEADER */}
//           <div className="img-right-header">
//             <div className="img-header-user">
//               <img
//                 src={
//                   post.avatar_url
//                     ? mediaUrl(post.avatar_url)
//                     : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                 }
//                 className="img-header-avatar"
//                 alt=""
//               />
//               <div>
//                 <div className="img-header-name">{post.user_name}</div>
//                 <div className="img-header-meta">
//                   {new Date(post.created_at).toLocaleString()}
//                 </div>
//               </div>
//             </div>

//             <button
//               className="img-close-btn"
//               style={{ width: "50px" }}
//               onClick={onClose}
//             >
//               <X size={26} color="black" />
//             </button>
//           </div>

//           {/* CONTENT */}
//           <div className="img-right-body" ref={contentRef}>
//             <div className="img-post-content">
//               {(post.content || "").split("\n").map((line, i) => (
//                 <p key={i}>{line}</p>
//               ))}
//             </div>
//           </div>

//           {/* COMMENT SECTION — always directly above action bar */}
//           {openComment && (
//             <div className="img-comment-container">
//               <Comment
//                 API_BASE={API_BASE}
//                 postId={post.id}
//                 currentUser={currentUser}
//                 onCountChange={(count) => {
//                   setCommentCount(count);
//                   refresh?.();
//                 }}
//               />
//             </div>
//           )}

//           {/* ACTION BAR */}
//           <div
//             className={
//               shouldStickActionBar
//                 ? "img-right-actions-fixed stick"
//                 : "img-right-actions-fixed no-stick"
//             }
//           >
//             <Like
//               API_BASE={API_BASE}
//               postId={post.id}
//               initialLiked={likedByMe}
//               initialCount={likeCount}
//               onToggle={(liked, count) => {
//                 setLikedByMe(liked);
//                 setLikeCount(count);
//                 refresh?.();
//               }}
//             />

//             <button
//               className="action-btn"
//               onClick={() => setOpenComment((s) => !s)}
//             >
//               <MessageCircle size={18} />
//               Comment
//             </button>

//             {/* REPOST */}
//             <div className="repost-wrapper">
//               <button
//                 className="action-btn"
//                 onClick={() => setRepostMenuOpen((s) => !s)}
//               >
//                 <Repeat2 size={18} />
//                 Repost
//               </button>

//               {repostMenuOpen && (
//                 <div className="repost-menu">
//                   <button
//                     onClick={() => {
//                       setRepostMenuOpen(false);
//                       setOpenRepostModal(true);
//                     }}
//                   >
//                     <Edit3 size={17} /> Repost with thoughts
//                   </button>

//                   <button
//                     onClick={async () => {
//                       setRepostMenuOpen(false);
//                       try {
//                         const r = await fetch(
//                           `${API_BASE}/api/posts/${post.id}/share`,
//                           {
//                             method: "POST",
//                             credentials: "include",
//                             headers: { "Content-Type": "application/json" },
//                             body: JSON.stringify({
//                               recipients: [],
//                               share_to_feed: true,
//                               comment: null,
//                               visibility: "Anyone",
//                             }),
//                           }
//                         );

//                         if (r.ok) refresh?.();
//                       } catch (err) {}
//                     }}
//                   >
//                     <Repeat2 size={17} /> Repost instantly
//                   </button>
//                 </div>
//               )}
//             </div>

//             <button
//               className="action-btn"
//               onClick={() => setOpenSendModal(true)}
//             >
//               <SendIcon size={20} /> Send
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* REPOST MODAL */}
//       {openRepostModal && (
//         <div onClick={stop}>
//           <RepostModal
//             open={openRepostModal}
//             onClose={() => setOpenRepostModal(false)}
//             currentUser={currentUser}
//             originalPost={post}
//             API_BASE={API_BASE}
//             onSuccess={() => {
//               setOpenRepostModal(false);
//               refresh?.();
//             }}
//           />
//         </div>
//       )}

//       {/* SEND MODAL */}
//       {openSendModal && (
//         <div onClick={stop}>
//           <SendModal
//             open={openSendModal}
//             onClose={() => setOpenSendModal(false)}
//             postId={post.id}
//             API_BASE={API_BASE}
//             posterName={post.user_name}
//             onSent={() => setOpenSendModal(false)}
//           />
//         </div>
//       )}
//     </div>,
//     document.body
//   );
// }

// src/Components/ImagePreviewModal.js
import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import "./ImagePreviewModal.css";
import {
  X,
  MessageCircle,
  Repeat2,
  Send as SendIcon,
  Edit3,
} from "lucide-react";

import Like from "./Like";
import Comment from "./Comment";
import SendModal from "./SendModal";
import RepostModal from "./RepostModal";
import useClickOutside from "../Hooks/useClickOutside";

export default function ImagePreviewModal({
  open,
  onClose,
  post,
  API_BASE = "",
  currentUser,
  refresh,
}) {
  const [likeCount, setLikeCount] = useState(post?.like_count || 0);
  const [likedByMe, setLikedByMe] = useState(post?.liked_by_me || false);
  const [commentCount, setCommentCount] = useState(post?.comment_count || 0);

  const [openComment, setOpenComment] = useState(false);
  const [openRepostModal, setOpenRepostModal] = useState(false);
  const [openSendModal, setOpenSendModal] = useState(false);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);

  const modalRef = useRef(null);
  const contentRef = useRef(null); // content block (not scroll container)
  const rightPanelRef = useRef(null); // the right panel that scrolls
  const repostBtnRef = useRef(null);
  const commentContainerRef = useRef(null);

  const [shouldStickActionBar, setShouldStickActionBar] = useState(false);

  // Portal menu position
  const [menuPos, setMenuPos] = useState(null); // { top, left }

  // Close modal on outside click
  useClickOutside(modalRef, () => {
    if (open) onClose();
  });

  // sync counts
  useEffect(() => {
    setLikeCount(post?.like_count ?? 0);
    setLikedByMe(post?.liked_by_me ?? false);
    setCommentCount(post?.comment_count ?? 0);
  }, [post]);

  // lock scroll
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    return () => {
      const top = document.body.style.top || "0px";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      const scrollTo = Math.abs(parseInt(top || "0", 10));
      window.scrollTo(0, scrollTo);
    };
  }, [open]);

  // detect long content for sticky action bar:
  useLayoutEffect(() => {
    // measure using the visible area of right panel (not whole modal)
    const rightPanel = rightPanelRef.current;
    const contentBlock = contentRef.current;
    if (!rightPanel || !contentBlock) return;

    // available height inside right panel excluding header & potential action area
    const headerEl = rightPanel.querySelector(".img-right-header");
    const actionBarEl = rightPanel.querySelector(".img-right-actions-fixed");
    const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const actionH = actionBarEl
      ? actionBarEl.getBoundingClientRect().height
      : 90;

    const available = rightPanel.clientHeight - headerH - actionH;
    const contentHeight = contentBlock.scrollHeight;

    setShouldStickActionBar(contentHeight > available + 20);
  }, [post, openComment, open, repostMenuOpen]);

  // compute repost menu position (portal) whenever it opens
  useLayoutEffect(() => {
    if (!repostMenuOpen) {
      setMenuPos(null);
      return;
    }
    const btn = repostBtnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();

    // default put menu below button
    const defaultTop = rect.top + rect.height + 6; // small gap
    const left = Math.max(8, rect.left); // keep inside left edge

    // clamp to viewport so menu stays visible
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // approximate menu height & width (we can adjust after render but simple clamp is ok)
    const menuW = 260;
    const menuH = 180;

    let top = defaultTop;
    // if menu would overflow bottom, position above button
    if (top + menuH > vh - 8) {
      top = rect.top - menuH - 6;
    }
    // clamp top to viewport
    top = Math.max(8, Math.min(top, vh - menuH - 8));

    // clamp left so menu not overflow right
    let leftClamped = left;
    if (leftClamped + menuW > vw - 8) {
      leftClamped = Math.max(8, vw - menuW - 8);
    }

    setMenuPos({ top: Math.round(top), left: Math.round(leftClamped) });
  }, [repostMenuOpen]);

  // When comment opens, scroll rightPanel to ensure comment container is visible just above action bar
  useEffect(() => {
    if (!openComment) return;
    const rightPanel = rightPanelRef.current;
    const commentEl = commentContainerRef.current;
    if (!rightPanel || !commentEl) return;

    // compute desired scrollTop so comment is visible and sits above action bar
    const headerEl = rightPanel.querySelector(".img-right-header");
    const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0;
    const actionBarEl = rightPanel.querySelector(".img-right-actions-fixed");
    const actionH = actionBarEl
      ? actionBarEl.getBoundingClientRect().height
      : 90;

    // commentEl.offsetTop is relative to rightPanel's content flow
    // we want scrollTop so that commentEl's bottom is visible above the action bar
    const commentBottom = commentEl.offsetTop + commentEl.offsetHeight;
    const targetScroll = Math.max(
      0,
      commentBottom - (rightPanel.clientHeight - actionH - 8)
    );

    rightPanel.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, [openComment]);

  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  function mediaUrl(path) {
    if (!path) return null;
    return `${window.location.protocol}//${window.location.hostname}:4000${path}`;
  }

  // helper to render repost menu into portal (fixed positioned)
  const RepostMenuPortal = ({ children }) => {
    if (!menuPos) return null;
    return ReactDOM.createPortal(
      <div
        className="repost-menu-portal"
        style={{
          position: "fixed",
          top: `${menuPos.top}px`,
          left: `${menuPos.left}px`,
          zIndex: 30050,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>,
      document.body
    );
  };

  return ReactDOM.createPortal(
    <div className="img-modal-overlay" onClick={onClose}>
      <div className="img-modal" ref={modalRef} onClick={stop}>
        {/* LEFT IMAGE */}
        <div className="img-left">
          <img
            src={mediaUrl(post.media_url)}
            alt={post.content ? post.content.slice(0, 120) : "preview"}
            className="img-preview"
            draggable={false}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="img-right" ref={rightPanelRef}>
          {/* HEADER (sticky) */}
          <div className="img-right-header">
            <div className="img-header-user">
              <img
                src={
                  post.avatar_url
                    ? mediaUrl(post.avatar_url)
                    : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                className="img-header-avatar"
                alt=""
              />
              <div>
                <div className="img-header-name">{post.user_name}</div>
                <div className="img-header-meta">
                  {new Date(post.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <button
              className="img-close-btn"
              style={{ width: "50px" }}
              onClick={onClose}
              aria-label="Close preview"
            >
              <X size={26} color="black" />
            </button>
          </div>

          {/* CONTENT block (not the scroll container) */}
          <div className="img-right-body" ref={contentRef}>
            <div className="img-post-content">
              {(post.content || "").split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>

          {/* Comment container - sits above action bar so toggling comment will show here */}
          {openComment && (
            <div
              className="img-comment-container"
              ref={commentContainerRef}
              onClick={(e) => e.stopPropagation()}
            >
              <Comment
                API_BASE={API_BASE}
                postId={post.id}
                currentUser={currentUser}
                onCountChange={(count) => {
                  setCommentCount(count);
                  refresh?.();
                }}
              />
            </div>
          )}

          {/* ACTION BAR */}
          <div
            className={
              shouldStickActionBar
                ? "img-right-actions-fixed stick"
                : "img-right-actions-fixed no-stick"
            }
          >
            <Like
              API_BASE={API_BASE}
              postId={post.id}
              initialLiked={likedByMe}
              initialCount={likeCount}
              onToggle={(liked, count) => {
                setLikedByMe(liked);
                setLikeCount(count);
                refresh?.();
              }}
            />

            <button
              className="action-btn"
              onClick={() => setOpenComment((s) => !s)}
              aria-expanded={openComment}
            >
              <MessageCircle size={18} /> Comment
            </button>

            {/* REPOST BUTTON (we measure this btn and show menu with portal) */}
            <div className="repost-wrapper" style={{ position: "relative" }}>
              <button
                ref={repostBtnRef}
                className="action-btn"
                onClick={(e) => {
                  setRepostMenuOpen((s) => !s);
                }}
                aria-expanded={repostMenuOpen}
              >
                <Repeat2 size={18} /> Repost
              </button>

              {/* Portal-mounted repost menu (fixed) */}
              {repostMenuOpen && (
                <RepostMenuPortal>
                  <div className="repost-menu" role="menu">
                    <button
                      onClick={() => {
                        setRepostMenuOpen(false);
                        setOpenRepostModal(true);
                      }}
                    >
                      <Edit3 size={17} /> Repost with thoughts
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
                          if (r.ok) refresh?.();
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    >
                      <Repeat2 size={17} /> Repost instantly
                    </button>
                  </div>
                </RepostMenuPortal>
              )}
            </div>

            <button
              className="action-btn"
              onClick={() => setOpenSendModal(true)}
            >
              <SendIcon size={20} /> Send
            </button>
          </div>
        </div>
      </div>

      {/* Child modals: RepostModal & SendModal */}
      {openRepostModal && (
        <div onClick={stop}>
          <RepostModal
            open={openRepostModal}
            onClose={() => setOpenRepostModal(false)}
            currentUser={currentUser}
            originalPost={post}
            API_BASE={API_BASE}
            onSuccess={() => {
              setOpenRepostModal(false);
              refresh?.();
            }}
          />
        </div>
      )}

      {openSendModal && (
        <div onClick={stop}>
          <SendModal
            open={openSendModal}
            onClose={() => setOpenSendModal(false)}
            postId={post.id}
            API_BASE={API_BASE}
            posterName={post.user_name}
            onSent={() => setOpenSendModal(false)}
          />
        </div>
      )}
    </div>,
    document.body
  );
}
