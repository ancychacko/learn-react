// src/Components/RepostModal.js
// import React, { useState, useRef } from "react";
// import "./RepostModal.css";
// import { X, Globe2, Users } from "lucide-react";
// import useClickOutside from "../Hooks/useClickOutside";
// import SharedPost from "./SharedPost";

// export default function RepostModal({
//   open,
//   onClose,
//   currentUser,
//   originalPost,
//   API_BASE,
//   onSuccess,
// }) {
//   const modalRef = useRef();
//   useClickOutside(modalRef, onClose);

//   const [visibility, setVisibility] = useState("Anyone");
//   const [thoughts, setThoughts] = useState("");
//   const [posting, setPosting] = useState(false);

//   if (!open) return null;

//   function mediaUrl(path) {
//     if (!path) return null;
//     return `${window.location.protocol}//${window.location.hostname}:4000${path}`;
//   }

//   async function handlePost() {
//     if (posting) return;
//     setPosting(true);

//     const body = {
//       post_id: Number(originalPost?.id),
//       share_comment: thoughts,
//       visibility,
//     };

//     const r = await fetch(`${API_BASE}/api/posts/share`, {
//       method: "POST",
//       credentials: "include",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });

//     setPosting(false);

//     if (r.ok) {
//       onSuccess();
//       onClose();
//     }
//   }

//   return (
//     <div className="repost-modal-overlay">
//       <div className="repost-modal" ref={modalRef}>
//         {/* HEADER */}
//         <div className="repost-header">
//           <h3>Share post</h3>
//           <button
//             className="close-btn"
//             style={{ width: "50px" }}
//             onClick={onClose}
//           >
//             <X size={22} />
//           </button>
//         </div>

//         {/* USER ROW */}
//         <div className="repost-user-row">
//           <img
//             className="repost-avatar"
//             src={
//               currentUser?.avatar_url
//                 ? mediaUrl(currentUser.avatar_url)
//                 : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//             }
//             alt=""
//           />
//           <div>
//             <div className="repost-username">{currentUser?.name}</div>

//             <select
//               className="visibility-dropdown"
//               value={visibility}
//               onChange={(e) => setVisibility(e.target.value)}
//             >
//               <option value="Anyone">
//                 {" "}
//                 <Globe2 size={14} color="blue" />
//                 Anyone
//               </option>
//               <option value="Connections">
//                 <Users size={14} color="blue" /> Connections
//               </option>
//               {/* <option value="Private">Only you 🔒</option> */}
//             </select>
//           </div>
//         </div>

//         {/* TEXTAREA */}
//         <textarea
//           className="repost-textarea"
//           placeholder="Start writing or use @ to mention people…"
//           value={thoughts}
//           onChange={(e) => setThoughts(e.target.value)}
//         />

//         {/* ORIGINAL POST PREVIEW */}
//         <div className="repost-original">
//           <SharedPost original={originalPost} />
//         </div>

//         {/* POST BUTTON */}
//         <div className="repost-footer">
//           <button
//             className="repost-submit-btn"
//             disabled={posting}
//             onClick={handlePost}
//           >
//             {posting ? "Posting…" : "Post"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/Components/RepostModal.js

import React, { useState, useRef } from "react";
import "./RepostModal.css";
import { X, Globe2, Users } from "lucide-react";
import useClickOutside from "../Hooks/useClickOutside";
import SharedPost from "./SharedPost";

export default function RepostModal({
  open,
  onClose,
  currentUser,
  originalPost,
  API_BASE,
  onSuccess,
}) {
  const modalRef = useRef();
  //useClickOutside(modalRef, onClose);

  const [visibility, setVisibility] = useState("Anyone");
  const [thoughts, setThoughts] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  // RESET FUNCTION — Clears textarea, visibility, future media fields
  function resetModal() {
    setThoughts("");
    setVisibility("Anyone");
    // If later you add media support, clear it here too.
  }

  // Close on outside click
  useClickOutside(modalRef, () => {
    resetModal();
    onClose();
  });

  if (!open) return null;

  function mediaUrl(path) {
    if (!path) return null;
    return `${window.location.protocol}//${window.location.hostname}:4000${path}`;
  }

  async function handlePost() {
    if (posting) return;
    // ********** FRONTEND VALIDATION **********
    if (!thoughts.trim()) {
      alert("Please enter your thoughts before reposting.");
      return;
    }
    // *****************************************
    setPosting(true);

    // The correct backend route
    const url = `${API_BASE}/api/posts/${Number(originalPost?.id)}/share`;

    const body = {
      recipients: [],
      share_to_feed: true,
      comment: thoughts.trim(),
      visibility,
    };

    const r = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setPosting(false);

    if (r.ok) {
      onSuccess();
      resetModal();
      onClose();
    }
  }
  return (
    <div className="repost-modal-overlay">
      <div className="repost-modal" ref={modalRef}>
        {/* HEADER */}
        <div className="repost-header">
          <h3>Share post</h3>
          <button
            className="close-btn"
            style={{ width: "50px" }}
            onClick={() => {
              resetModal();
              onClose();
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* USER ROW */}
        <div className="repost-user-row">
          <img
            className="repost-avatar"
            src={
              currentUser?.avatar_url
                ? mediaUrl(currentUser.avatar_url)
                : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt=""
          />
          <div>
            <div className="repost-username">{currentUser?.name}</div>

            <select
              className="visibility-dropdown"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="Anyone">
                <Globe2 size={14} /> Anyone
              </option>
              <option value="Connections">
                <Users size={14} /> Connections
              </option>
            </select>
          </div>
        </div>

        {/* TEXTAREA */}
        <textarea
          className="repost-textarea"
          placeholder="Start writing or use @ to mention people…"
          value={thoughts}
          onChange={(e) => {
            setThoughts(e.target.value);
            if (error) setError(""); // clear error while typing
          }}
        />
        {/* INLINE ERROR */}
        {error && <div className="repost-error-message">{error}</div>}

        {/* ORIGINAL POST PREVIEW */}
        <div className="repost-original">
          <SharedPost original={originalPost} />
        </div>

        {/* POST BUTTON */}
        <div className="repost-footer">
          <button
            className="repost-submit-btn"
            disabled={posting}
            onClick={handlePost}
          >
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
