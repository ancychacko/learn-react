// src/Components/ShareModal.js
// import React, { useEffect, useState } from "react";
// import "./Share.css";
// import { X } from "lucide-react";

// export default function ShareModal({
//   open,
//   onClose,
//   postId,
//   API_BASE = "",
//   onSent,
//   posterName = "Post",
// }) {
//   const [followers, setFollowers] = useState([]);
//   const [loadingFollowers, setLoadingFollowers] = useState(false);
//   const [selected, setSelected] = useState(new Set());
//   const [query, setQuery] = useState("");
//   const [sending, setSending] = useState(false);

//   // Reload each time modal opens
//   useEffect(() => {
//     if (!open) return;

//     async function load() {
//       setLoadingFollowers(true);

//       try {
//         const r = await fetch(`${API_BASE}/api/following`, {
//           credentials: "include",
//         });

//         if (r.ok) {
//           setFollowers(await r.json());
//         } else {
//           setFollowers([]);
//         }
//       } catch (err) {
//         console.error("Follower load failed:", err);
//         setFollowers([]);
//       } finally {
//         setLoadingFollowers(false);
//       }
//     }

//     load();
//     setSelected(new Set());
//     setQuery("");
//   }, [open, API_BASE]);

//   function toggleSelect(id) {
//     setSelected((old) => {
//       const c = new Set(old);
//       if (c.has(id)) c.delete(id);
//       else c.add(id);
//       return c;
//     });
//   }

//   const filtered = followers.filter((f) =>
//     (f.name || "").toLowerCase().includes(query.toLowerCase())
//   );

//   async function handleSend() {
//     if (sending) return;

//     setSending(true);

//     try {
//       const r = await fetch(`${API_BASE}/api/posts/${postId}/share`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           recipients: Array.from(selected), // LinkedIn-style "send to people you follow"
//         }),
//       });

//       if (r.ok) {
//         const body = await r.json();
//         if (typeof onSent === "function") onSent(body.count);
//         onClose();
//       } else {
//         console.error("Share failed", await r.json());
//       }
//     } catch (err) {
//       console.error("Share network error", err);
//     } finally {
//       setSending(false);
//     }
//   }

//   if (!open) return null;

//   return (
//     <div className="modal-overlay" role="dialog" aria-modal="true">
//       <div className="share-modal">
//         {/* HEADER */}
//         <div className="share-modal-header">
//           <div style={{ fontWeight: 600 }}>Send {posterName}'s post</div>

//           <button
//             className="icon-btn"
//             style={{ width: "50px", marginBottom: "5px" }}
//             onClick={onClose}
//             aria-label="Close"
//           >
//             <X size={20} color="black" />
//           </button>
//         </div>

//         {/* SEARCH BAR */}
//         <div style={{ padding: "8px 12px" }}>
//           <input
//             placeholder="Type a name"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="share-search"
//           />
//         </div>

//         {/* LIST */}
//         <div
//           className="share-list"
//           style={{ maxHeight: 320, overflow: "auto" }}
//         >
//           {loadingFollowers && (
//             <div className="muted" style={{ padding: 12 }}>
//               Loading...
//             </div>
//           )}

//           {!loadingFollowers && filtered.length === 0 && (
//             <div className="muted" style={{ padding: 12 }}>
//               No people to show
//             </div>
//           )}

//           {filtered.map((f) => (
//             <label key={f.id} className="share-list-item">
//               <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
//                 <img
//                   src={
//                     f.avatar_url
//                       ? `${window.location.protocol}//${window.location.hostname}:4000${f.avatar_url}`
//                       : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                   }
//                   alt={f.name}
//                   style={{
//                     width: 44,
//                     height: 44,
//                     borderRadius: "50%",
//                     objectFit: "cover",
//                   }}
//                 />

//                 <div style={{ flex: 1 }}>
//                   <div style={{ fontWeight: 600 }}>{f.name}</div>
//                   <div style={{ fontSize: 13, color: "#6b7280" }}>
//                     {f.title || ""}
//                   </div>
//                 </div>
//               </div>

//               <input
//                 type="checkbox"
//                 checked={selected.has(f.id)}
//                 onChange={() => toggleSelect(f.id)}
//               />
//             </label>
//           ))}
//         </div>

//         {/* FOOTER */}
//         <div
//           style={{
//             padding: 12,
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             gap: 8,
//           }}
//         >
//           <div style={{ color: "#6b7280", fontSize: 13 }}>
//             {selected.size} selected
//           </div>

//           <div style={{ display: "flex", gap: 8 }}>
//             <button className="cancel-btn" onClick={onClose}>
//               Cancel
//             </button>

//             <button
//               className="save-btn"
//               onClick={handleSend}
//               disabled={sending || selected.size === 0}
//             >
//               {sending ? "Sending…" : "Send"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/Components/ShareModal.js
import React, { useEffect, useState } from "react";
import "./Share.css";
import { X } from "lucide-react";

export default function ShareModal({
  open,
  onClose,
  postId,
  API_BASE = "",
  onSent,
  posterName = "Post",
}) {
  const [followers, setFollowers] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [shareToFeed, setShareToFeed] = useState(false);

  useEffect(() => {
    if (!open) return;
    async function load() {
      setLoadingFollowers(true);
      try {
        const r = await fetch(`${API_BASE}/api/following`, {
          credentials: "include",
        });
        if (r.ok) {
          const body = await r.json();
          setFollowers(body || []);
        } else {
          setFollowers([]);
        }
      } catch (err) {
        console.error("failed load followers", err);
        setFollowers([]);
      } finally {
        setLoadingFollowers(false);
      }
    }
    load();
    setSelected(new Set());
    setQuery("");
    setShareToFeed(false);
  }, [open, API_BASE]);

  function toggleSelect(id) {
    setSelected((s) => {
      const copy = new Set(s);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }

  const filtered = followers.filter((f) =>
    `${f.name || ""}`.toLowerCase().includes(query.toLowerCase())
  );

  async function handleSend() {
    if (sending) return;
    setSending(true);
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/share`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: Array.from(selected),
          share_to_feed: Boolean(shareToFeed),
        }),
      });
      if (r.ok) {
        const body = await r.json();
        if (typeof onSent === "function") onSent(body.count);
        onClose();
      } else {
        const b = await r.json().catch(() => ({}));
        console.error("share error", b);
      }
    } catch (err) {
      console.error("share network", err);
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="share-modal animate-pop">
        <div className="share-modal-header">
          <div style={{ fontWeight: 600 }}>Send {posterName}'s post</div>
          <button className="icon-btn" 
          style={{width:50, marginBottom:"5px"}} 
          onClick={onClose} aria-label="Close">
            <X size={20} color="black" />
          </button>
        </div>

        <div style={{ padding: "8px 12px" }}>
          <input
            placeholder="Type a name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="share-search"
          />
        </div>

        <div
          className="share-list"
          style={{ maxHeight: 320, overflow: "auto" }}
        >
          {loadingFollowers && (
            <div className="muted" style={{ padding: 12 }}>
              Loading...
            </div>
          )}
          {!loadingFollowers && filtered.length === 0 && (
            <div className="muted" style={{ padding: 12 }}>
              No people to show
            </div>
          )}

          {filtered.map((f) => (
            <label key={f.id} className="share-list-item">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <img
                  src={
                    f.avatar_url
                      ? `${window.location.protocol}//${window.location.hostname}:4000${f.avatar_url}`
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={f.name}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{f.name}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    {f.title || ""}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selected.has(f.id)}
                onChange={() => toggleSelect(f.id)}
              />
            </label>
          ))}
        </div>

        <div style={{ padding: 12 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={shareToFeed}
              onChange={(e) => setShareToFeed(e.target.checked)}
            />
            <div>
              <div style={{ fontWeight: 600 }}>Share to feed</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Post this to your feed as a shared post
              </div>
            </div>
          </label>
        </div>

        <div
          style={{
            padding: 12,
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            {selected.size} selected
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="save-btn"
              onClick={handleSend}
              disabled={sending || (selected.size === 0 && !shareToFeed)}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
