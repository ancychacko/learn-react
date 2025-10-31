// // PostFeed.js
// import React, { useEffect, useState } from "react";
// import Post from "./Post";

// export default function PostFeed({ API_BASE, currentUserId }) {
//   const [posts, setPosts] = useState([]);
//   const [content, setContent] = useState("");
//   const [media, setMedia] = useState(null);
//   const [loading, setLoading] = useState(false);

//   async function fetchPosts() {
//     try {
//       const r = await fetch(`${API_BASE}/api/posts`, {
//         credentials: "include",
//       });
//       if (r.ok) setPosts(await r.json());
//     } catch (e) {
//       console.error(e);
//     }
//   }

//   useEffect(() => {
//     fetchPosts();
//   }, [API_BASE]);

//   async function submit(e) {
//     e.preventDefault();
//     if (!content.trim() && !media) return;
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("content", content);
//       if (media) fd.append("media", media);
//       const r = await fetch(`${API_BASE}/api/createPost`, {
//         method: "POST",
//         credentials: "include",
//         body: fd,
//       });
//       if (r.ok) {
//         setContent("");
//         setMedia(null);
//         fetchPosts();
//       } else {
//         const b = await r.json();
//         alert(b.error || "Post failed");
//       }
//     } catch (e) {
//       console.error(e);
//       alert("Network error");
//     }
//     setLoading(false);
//   }

//   return (
//     <div>
//       <div className="compose-card" style={{ marginTop: 36 }}>
//         <textarea
//           placeholder="Start a post"
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//         />
//         <div className="compose-actions">
//           <label className="icon-btn">
//             📷
//             <input
//               type="file"
//               accept="image/*,video/*"
//               style={{ display: "none" }}
//               onChange={(e) => setMedia(e.target.files[0])}
//             />
//           </label>
//           <div style={{ flex: 1 }} />
//           <button onClick={submit} disabled={loading}>
//             {loading ? "Posting..." : "Post"}
//           </button>
//         </div>
//         {media && <div style={{ marginTop: 8 }}>{media.name}</div>}
//       </div>

//       <div style={{ marginTop: 20 }}>
//         {posts.map((p) => (
//           <Post
//             key={p.id}
//             post={p}
//             API_BASE={API_BASE}
//             currentUserId={currentUserId}
//             refresh={fetchPosts}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// src/Components/PostField.js
import React, { useEffect, useState } from "react";
import Post from "./Post";

export default function PostField({ API_BASE, currentUserId }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  async function fetchPosts() {
    try {
      const r = await fetch(`${API_BASE}/api/posts`, {
        credentials: "include",
      });
      if (r.ok) setPosts(await r.json());
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, [API_BASE]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!content.trim() && !media) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("content", content);
      if (media) fd.append("media", media);
      const r = await fetch(`${API_BASE}/api/createPost`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (r.ok) {
        setContent("");
        setMedia(null);
        await fetchPosts();
      } else {
        const b = await r.json();
        alert(b.error || "Post failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="compose-card">
        <form onSubmit={onSubmit}>
          <textarea
            placeholder="Start a post"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="compose-row">
            <label className="compose-icon" title="Add image or video">
              📷
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setMedia(e.target.files[0])}
                style={{ display: "none" }}
              />
            </label>

            {media && <div className="file-name">{media.name}</div>}

            <div style={{ flex: 1 }} />

            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 18 }}>
        {posts.map((p) => (
          <Post
            key={p.id}
            post={p}
            API_BASE={API_BASE}
            currentUserId={currentUserId}
            refresh={fetchPosts}
          />
        ))}
      </div>
    </div>
  );
}
