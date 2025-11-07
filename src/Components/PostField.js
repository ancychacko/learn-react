//src/Components/PostField.js
// import React, { useState, useEffect, useRef } from "react";
// import ReactDOM from "react-dom";
// import { Image, Video, FileText, X, Globe2 } from "lucide-react";
// import Post from "./Post";
// import "./PostField.css";

// export default function PostField({ API_BASE, currentUserId, currentUser }) {
//   const [content, setContent] = useState("");
//   const [media, setMedia] = useState(null);
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [visibility, setVisibility] = useState("Anyone");
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const photoInputRef = useRef(null);
//   const videoInputRef = useRef(null);

//   // Fetch posts
//   async function fetchPosts() {
//     try {
//       const r = await fetch(`${API_BASE}/api/posts`, {
//         credentials: "include",
//       });
//       if (r.ok) setPosts(await r.json());
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   useEffect(() => {
//     fetchPosts();
//   }, [API_BASE]);

//   // Handle post submission
//   async function onSubmit(e) {
//     e.preventDefault();
//     if (!content.trim() && !media) return;
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("content", content);
//       fd.append("visibility", visibility);
//       if (media) fd.append("media", media);
//       const r = await fetch(`${API_BASE}/api/createPost`, {
//         method: "POST",
//         body: fd,
//         credentials: "include",
//       });
//       if (r.ok) {
//         setContent("");
//         setMedia(null);
//         setPreviewUrl(null);
//         setShowModal(false);
//         await fetchPosts();
//       } else {
//         const b = await r.json();
//         alert(b.error || "Post failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Network error");
//     }
//     setLoading(false);
//   }

//   // Avatar URL builder
//   function avatarFull(url) {
//     if (!url) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
//     return `${window.location.protocol}//${window.location.hostname}:4000${url}`;
//   }

//   // Media upload handlers
//   function handlePhotoUpload(e) {
//     const file = e.target.files[0];
//     if (file) {
//       setMedia(file);
//       setPreviewUrl(URL.createObjectURL(file));
//       setShowModal(true);
//     }
//   }

//   function handleVideoUpload(e) {
//     const file = e.target.files[0];
//     if (file) {
//       setMedia(file);
//       setPreviewUrl(URL.createObjectURL(file));
//       setShowModal(true);
//     }
//   }

//   return (
//     <div>
//       {/* Compose box */}
//       <div className="compose-card">
//         <div className="compose-top">
//           <img
//             src={avatarFull(currentUser?.avatar_url)}
//             alt="avatar"
//             className="compose-avatar"
//           />
//           <div
//             className="compose-input"
//             onClick={() => setShowModal(true)}
//             role="button"
//           >
//             Start a post
//           </div>
//         </div>

//         <div className="compose-options">
//           <label onClick={() => videoInputRef.current?.click()}>
//             <Video size={20} color="green" />
//             <span>Video</span>
//           </label>
//           <label onClick={() => photoInputRef.current?.click()}>
//             <Image size={20} color="#0a66c2" />
//             <span>Photo</span>
//           </label>
//           <label onClick={() => setShowModal(true)}>
//             <FileText size={20} color="#b24020" />
//             <span>Write article</span>
//           </label>

//           {/* Hidden inputs for file handling */}
//           <input
//             ref={photoInputRef}
//             type="file"
//             accept="image/*"
//             onChange={handlePhotoUpload}
//             style={{ display: "none" }}
//           />
//           <input
//             ref={videoInputRef}
//             type="file"
//             accept="video/*"
//             onChange={handleVideoUpload}
//             style={{ display: "none" }}
//           />
//         </div>
//       </div>

//       {/* Posts Feed */}
//       <div style={{ marginTop: 18 }}>
//         {posts.map((p) => (
//           <Post
//             key={p.id}
//             post={p}
//             API_BASE={API_BASE}
//             currentUserName={currentUser?.name}
//             currentUser={currentUser}
//             refresh={fetchPosts}
//           />
//         ))}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <CreatePostModal
//           currentUser={currentUser}
//           avatarFull={avatarFull}
//           visibility={visibility}
//           setVisibility={setVisibility}
//           content={content}
//           setContent={setContent}
//           onSubmit={onSubmit}
//           loading={loading}
//           media={media}
//           previewUrl={previewUrl}
//           handlePhotoUpload={handlePhotoUpload}
//           handleVideoUpload={handleVideoUpload}
//           setShowModal={setShowModal}
//           setMedia={setMedia}
//           setPreviewUrl={setPreviewUrl}
//         />
//       )}
//     </div>
//   );
// }

// /* ----------------------- Modal Component ----------------------- */
// function CreatePostModal({
//   currentUser,
//   avatarFull,
//   visibility,
//   setVisibility,
//   content,
//   setContent,
//   onSubmit,
//   loading,
//   media,
//   previewUrl,
//   handlePhotoUpload,
//   handleVideoUpload,
//   setShowModal,
//   setMedia,
//   setPreviewUrl,
// }) {
//   const closeButtonForPreview = () => {
//     setMedia(null);
//     setPreviewUrl(null);
//   };
//   return ReactDOM.createPortal(
//     <div className="modal-overlay">
//       <div className="modal-content">
//         {/* Header */}
//         <div className="modal-header">
//           <h3>Create a post</h3>
//           <button
//             className="close-btn"
//             style={{ width: "50px" }}
//             onClick={() => setShowModal(false)}
//           >
//             <X size={22} color="black" />
//           </button>
//         </div>

//         {/* User info */}
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

//         {/* Form */}
//         <form onSubmit={onSubmit}>
//           <textarea
//             className="modal-textarea"
//             placeholder="What do you want to talk about?"
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//           />

//           {/* Preview */}
//           {previewUrl && (
//             <div className="preview-box">
//               {media?.type?.startsWith("image/") ? (
//                 <>
//                   <button
//                     className="remove-media-btn"
//                     type="button"
//                     style={{ width: "50px" }}
//                     onClick={closeButtonForPreview}
//                   >
//                     <X size={16} color="white" />
//                   </button>
//                   <img src={previewUrl} alt="preview" />
//                 </>
//               ) : (
//                 <>
//                   <button
//                     className="remove-media-btn"
//                     type="button"
//                     style={{ width: "50px", marginBottom: "5px" }}
//                     onClick={closeButtonForPreview}
//                   >
//                     <X size={16} color="white" />
//                   </button>
//                   <video controls src={previewUrl} />
//                 </>
//               )}
//             </div>
//           )}

//           {/* Media buttons */}
//           <div className="modal-media">
//             <label>
//               <Image size={20} color="#0a66c2" />
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handlePhotoUpload}
//                 style={{ display: "none" }}
//               />
//             </label>

//             <label>
//               <Video size={20} color="green" />
//               <input
//                 type="file"
//                 accept="video/*"
//                 onChange={handleVideoUpload}
//                 style={{ display: "none" }}
//               />
//             </label>
//             <label>
//               <FileText size={20} color="#b24020" />
//             </label>
//           </div>

//           {/* Submit */}
//           <div className="modal-footer">
//             <button type="submit" className="btn" disabled={loading}>
//               {loading ? "Posting..." : "Post"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>,
//     document.body
//   );
// }

// src/Components/PostField.js
import React, { useState, useEffect, useRef } from "react";
import { Image, Video, FileText } from "lucide-react";
import Post from "./Post";
import PostFieldModal from "./PostFieldModal"; 
import "./PostField.css";

export default function PostField({ API_BASE, currentUserId, currentUser }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [visibility, setVisibility] = useState("Anyone");
  const [previewUrl, setPreviewUrl] = useState(null);

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // ✅ Fetch posts
  async function fetchPosts() {
    try {
      const r = await fetch(`${API_BASE}/api/posts`, {
        credentials: "include",
      });
      if (r.ok) setPosts(await r.json());
    } catch (err) {
      console.error("Fetch posts error:", err);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, [API_BASE]);

  // ✅ Handle post submission
  async function onSubmit(e) {
    e.preventDefault();
    if (!content.trim() && !media) return;
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("content", content);
      fd.append("visibility", visibility);
      if (media) fd.append("media", media);

      const r = await fetch(`${API_BASE}/api/createPost`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      if (r.ok) {
        setContent("");
        setMedia(null);
        setPreviewUrl(null);
        setShowModal(false);
        await fetchPosts();
      } else {
        const b = await r.json();
        alert(b.error || "Post failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Helper: Build avatar URL
  function avatarFull(url) {
    if (!url) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    return `${window.location.protocol}//${window.location.hostname}:4000${url}`;
  }

  // ✅ Photo and video upload handlers
  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowModal(true);
    }
  }

  function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowModal(true);
    }
  }

  return (
    <div>
      {/* ---------------- Compose box ---------------- */}
      <div className="compose-card">
        <div className="compose-top">
          <img
            src={avatarFull(currentUser?.avatar_url)}
            alt="avatar"
            className="compose-avatar"
          />
          <div
            className="compose-input"
            onClick={() => setShowModal(true)}
            role="button"
          >
            Start a post
          </div>
        </div>

        <div className="compose-options">
          <label onClick={() => videoInputRef.current?.click()}>
            <Video size={20} color="green" />
            <span>Video</span>
          </label>

          <label onClick={() => photoInputRef.current?.click()}>
            <Image size={20} color="#0a66c2" />
            <span>Photo</span>
          </label>

          <label onClick={() => setShowModal(true)}>
            <FileText size={20} color="#b24020" />
            <span>Write article</span>
          </label>

          {/* Hidden file inputs */}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: "none" }}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            style={{ display: "none" }}
          />
        </div>
      </div>

      {/* ---------------- Posts Feed ---------------- */}
      <div style={{ marginTop: 18 }}>
        {posts.map((p) => (
          <Post
            key={p.id}
            post={p}
            API_BASE={API_BASE}
            currentUserName={currentUser?.name}
            currentUser={currentUser}
            refresh={fetchPosts}
          />
        ))}
      </div>

      {/* ---------------- Modal ---------------- */}
      {showModal && (
        <PostFieldModal
          currentUser={currentUser}
          avatarFull={avatarFull}
          visibility={visibility}
          setVisibility={setVisibility}
          content={content}
          setContent={setContent}
          onSubmit={onSubmit}
          loading={loading}
          media={media}
          previewUrl={previewUrl}
          handlePhotoUpload={handlePhotoUpload}
          handleVideoUpload={handleVideoUpload}
          setShowModal={setShowModal}
          setMedia={setMedia}
          setPreviewUrl={setPreviewUrl}
        />
      )}
    </div>
  );
}
