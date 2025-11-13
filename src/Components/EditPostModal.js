// src/Components/EditPostModal.js
// import React, { useState } from "react";
// import ReactDOM from "react-dom";
// import { X, Image, Video, Globe2, FilePlusCorner } from "lucide-react";
// // using Welcome.css
// export default function EditPostModal({
//   API_BASE,
//   post,
//   onClose,
//   onSaveSuccess,
//   currentUser, // ✅ we’ll pass current user to show avatar & name
// }) {
//   const [content, setContent] = useState(post.content || "");
//   const [file, setFile] = useState(null);
//   const [previewUrl, setPreviewUrl] = useState(
//     post.media_url
//       ? `${window.location.protocol}//${window.location.hostname}:4000${post.media_url}`
//       : null
//   );
//   const [saving, setSaving] = useState(false);
//   const [visibility, setVisibility] = useState(post.visibility || "Anyone");

//   // ✅ helper to convert avatar url
//   function avatarFull(url) {
//     if (!url) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
//     return `${window.location.protocol}//${window.location.hostname}:4000${url}`;
//   }

//   // ✅ handle file upload
//   function handleFileChange(e) {
//     const f = e.target.files[0];
//     if (f) {
//       setFile(f);
//       setPreviewUrl(URL.createObjectURL(f));
//     }
//   }

//   // ✅ remove uploaded file
//   function removeMedia() {
//     setFile(null);
//     setPreviewUrl(null);
//   }

//   // ✅ save the edited post
//   async function handleSave(e) {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const fd = new FormData();
//       fd.append("content", content);
//       fd.append("visibility", visibility); // ✅ add visibility to form
//       if (file) fd.append("media", file);

//       const r = await fetch(`${API_BASE}/api/posts/${post.id}`, {
//         method: "PUT",
//         body: fd,
//         credentials: "include",
//       });

//       if (r.ok) {
//         onSaveSuccess();
//         onClose();
//       } else {
//         const b = await r.json().catch(() => ({}));
//         alert(b.error || "Update failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Network error");
//     } finally {
//       setSaving(false);
//     }
//   }

//   // ✅ Render the modal using React portal
//   return ReactDOM.createPortal(
//     <div className="modal-overlay">
//       <div className="modal-content">
//         {/* Header */}
//         <div className="modal-header">
//           <h3>Edit Post</h3>
//           <button
//             className="close-btn"
//             style={{ width: "50px" }}
//             onClick={onClose}
//           >
//             <X size={22} color="black" />
//           </button>
//         </div>

//         {/* User info + visibility */}
//         <div className="modal-user">
//           <img
//             src={avatarFull(currentUser?.avatar_url)}
//             alt="avatar"
//             className="modal-avatar"
//           />
//           <div>
//             <div className="modal-user-name">{currentUser?.name}</div>
//             <div className="modal-user-sub">
//               <Globe2 size={14} color="blue" style={{ marginRight: 4 }} />
//               <select
//                 className="visibility-select"
//                 value={visibility}
//                 onChange={(e) => setVisibility(e.target.value)}
//               >
//                 <option value="Anyone">Post to Everyone</option>
//                 <option value="Connections">Connections only</option>
//                 <option value="Private">Private</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Edit Form */}
//         <form onSubmit={handleSave}>
//           <textarea
//             className="modal-textarea"
//             placeholder="Edit your post..."
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             autoFocus
//           />

//           {/* Preview uploaded media */}
//           {previewUrl && (
//             <div className="preview-box">
//               <button
//                 type="button"
//                 className="remove-media-btn"
//                 style={{ width: "50px" }}
//                 onClick={removeMedia}

//               >
//                 <X size={25} />
//               </button>
//               {file?.type?.startsWith("image/") ||
//               post.media_type === "image" ? (
//                 <img src={previewUrl} alt="preview" />
//               ) : (
//                 <video controls src={previewUrl}></video>
//               )}
//             </div>
//           )}

//           {/* Media upload buttons */}
//           <div className="modal-media">
//             <label>
//               <Image size={20} color="#0a66c2" />
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleFileChange}
//                 style={{ display: "none" }}
//               />
//             </label>
//             <label>
//               <Video size={20} color="green" />
//               <input
//                 type="file"
//                 accept="video/*"
//                 onChange={handleFileChange}
//                 style={{ display: "none" }}
//               />
//             </label>
//             <label>
//               <FilePlusCorner size={20} color="green" />
//               <input
//                 type="file"
//                 accept="docs/*, pdf/*, txt/*, rtf/*, ppt/*, docx/*, xlsx/*, pptx/*"
//                 onChange={handleFileChange}
//                 style={{ display: "none" }}
//               />
//             </label>
//           </div>

//           {/* Footer */}
//           <div className="modal-footer">
//             <button type="submit" className="btn" disabled={saving}>
//               {saving ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>,
//     document.body
//   );
// }

//src/Components/EditPostModal.js
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { X, Image, Video, Globe2, FilePlusCorner } from "lucide-react";

export default function EditPostModal({
  API_BASE,
  post,
  onClose,
  onSaveSuccess,
  currentUser,
}) {
  const [content, setContent] = useState(post.content || "");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    post.media_url
      ? `${window.location.protocol}//${window.location.hostname}:4000${post.media_url}`
      : null
  );
  const [saving, setSaving] = useState(false);
  const [visibility, setVisibility] = useState(post.visibility || "Anyone");

  // 🔹 Track whether existing media is removed
  const [removeExisting, setRemoveExisting] = useState(false);

  function avatarFull(url) {
    if (!url) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    return `${window.location.protocol}//${window.location.hostname}:4000${url}`;
  }

  // ✅ handle file upload
  function handleFileChange(e) {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreviewUrl(URL.createObjectURL(f));
      setRemoveExisting(false); // since new file replaces old
    }
  }

  // ✅ remove uploaded file (or existing media)
  function removeMedia() {
    setFile(null);
    setPreviewUrl(null);
    // 🔹 Flag existing media for deletion when saved
    if (post.media_url) setRemoveExisting(true);
  }

  // ✅ save the edited post
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("content", content);
      fd.append("visibility", visibility);

      if (file) {
        // New media selected
        fd.append("media", file);
      } else if (removeExisting) {
        // 🔹 Tell backend to delete old media
        fd.append("remove_media", "true");
      }

      const r = await fetch(`${API_BASE}/api/posts/${post.id}`, {
        method: "PUT",
        body: fd,
        credentials: "include",
      });

      if (r.ok) {
        onSaveSuccess();
        onClose();
      } else {
        const b = await r.json().catch(() => ({}));
        alert(b.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setSaving(false);
    }
  }

  // ✅ React portal for modal
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h3>Edit Post</h3>
          <button
            className="close-btn"
            style={{ width: "50px" }}
            onClick={onClose}
          >
            <X size={22} color="black" />
          </button>
        </div>

        {/* User info + visibility */}
        <div className="modal-user">
          <img
            src={avatarFull(currentUser?.avatar_url)}
            alt="avatar"
            className="modal-avatar"
          />
          <div>
            <div className="modal-user-name">{currentUser?.name}</div>
            <div className="modal-user-sub">
              <Globe2 size={14} color="blue" style={{ marginRight: 4 }} />
              <select
                className="visibility-select"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="Anyone">Post to Everyone</option>
                <option value="Connections">Connections only</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave}>
          <textarea
            className="modal-textarea"
            placeholder="Edit your post..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            autoFocus
          />

          {/* Preview uploaded or existing media */}
          {previewUrl && (
            <div className="preview-box">
              <button
                type="button"
                className="remove-media-btn"
                style={{ width: "50px" }}
                onClick={removeMedia}
              >
                <X size={25} />
              </button>
              {file?.type?.startsWith("image/") ||
              post.media_type === "image" ? (
                <img src={previewUrl} alt="preview" />
              ) : (
                <video controls src={previewUrl}></video>
              )}
            </div>
          )}

          {/* Upload options */}
          <div className="modal-media">
            <label>
              <Image size={20} color="#0a66c2" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
            <label>
              <Video size={20} color="green" />
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
            <label>
              <FilePlusCorner size={20} color="green" />
              <input
                type="file"
                accept="docs/*, pdf/*, txt/*, rtf/*, ppt/*, docx/*, xlsx/*, pptx/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
