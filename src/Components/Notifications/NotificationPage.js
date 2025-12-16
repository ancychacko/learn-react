// src/Components/NotificationPage.js
// import React, { useEffect, useState } from "react";
// import NotificationItem from "./NotificationItem";
// import ProfileCard from "../ProfileSidebar/ProfileHeaderCard";
// import "./Notifications.css";

// export default function NotificationsPage({ API_BASE = "" }) {
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("all");
//   const [me, setMe] = useState(null);
//   const [authChecked, setAuthChecked] = useState(false);

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   async function checkAuth() {
//     try {
//       const r = await fetch(`${API_BASE}/api/me`, {
//         credentials: "include",
//       });

//       if (!r.ok) {
//         alert("Please login to access notifications.");
//         window.location.href = "/Login";
//         return;
//       }

//       const user = await r.json();
//       setMe(user);

//       // Load notifications only after authenticated
//       loadNotifications();
//       setAuthChecked(true);
//     } catch (e) {
//       console.error("Auth check failed:", e);
//       alert("Please login to access notifications.");
//       window.location.href = "/Login";
//     }
//   }

//   async function loadNotifications() {
//     setLoading(true);
//     try {
//       const r = await fetch(`${API_BASE}/api/notifications`, {
//         credentials: "include",
//       });

//       if (r.status === 401) {
//         alert("Please login to access notifications.");
//         window.location.href = "/Login";
//         return;
//       }

//       if (r.ok) setItems(await r.json());
//     } catch (e) {
//       console.error("Failed to load notifications:", e);
//     }
//     setLoading(false);
//   }

//   function handleDelete(id) {
//     setItems((prev) => prev.filter((n) => n.id !== id));
//   }

//   function handleMute(actorId) {
//     setItems((prev) => prev.filter((n) => n.actor_id !== actorId));
//   }

//   async function markAllRead() {
//     try {
//       await Promise.all(
//         items.map((n) =>
//           fetch(`${API_BASE}/api/notifications/${n.id}/read`, {
//             method: "POST",
//             credentials: "include",
//           })
//         )
//       );

//       setItems((p) => p.map((n) => ({ ...n, is_read: true })));
//     } catch (e) {
//       console.error(e);
//     }
//   }

//   // Don't render until authentication check completes
//   if (!authChecked) return null;

//   const filteredItems =
//     filter === "all" ? items : items.filter((i) => i.type === filter);

//   return (
//     <div className="ln-notifications-page">
//       {/* LEFT SIDEBAR */}
//       <div className="ln-left">
//         {me && <ProfileCard user={me} API_BASE={API_BASE} />}
//       </div>

//       {/* RIGHT SECTION */}
//       <div className="ln-right">
//         <h1 className="ln-title">Notifications</h1>

//         {/* FILTER TABS */}
//         <div className="ln-filters">
//           <button
//             className={filter === "all" ? "active" : ""}
//             onClick={() => setFilter("all")}
//           >
//             All
//           </button>

//           <button
//             className={filter === "comment" ? "active" : ""}
//             onClick={() => setFilter("comment")}
//           >
//             Comments
//           </button>

//           <button
//             className={filter === "like" ? "active" : ""}
//             onClick={() => setFilter("like")}
//           >
//             Likes
//           </button>

//           <button
//             className={filter === "share" ? "active" : ""}
//             onClick={() => setFilter("share")}
//           >
//             Shares
//           </button>
//         </div>

//         {items.some((x) => !x.is_read) && (
//           <button className="ln-mark-all" onClick={markAllRead}>
//             Mark all as read
//           </button>
//         )}

//         {/* NOTIFICATIONS FEED */}
//         <div className="ln-feed">
//           {loading && <p className="ln-loading">Loading…</p>}

//           {!loading && filteredItems.length === 0 && (
//             <p className="ln-no-items">No notifications</p>
//           )}

//           {filteredItems.map((note) => (
//             <NotificationItem
//               key={note.id}
//               note={note}
//               API_BASE={API_BASE}
//               onRead={(id) =>
//                 setItems((p) =>
//                   p.map((n) => (n.id === id ? { ...n, is_read: true } : n))
//                 )
//               }
//               onDelete={handleDelete}
//               onMute={handleMute}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// src/Components/NotificationPage.js
import React, { useEffect, useState, useRef } from "react";
import NotificationItem from "./NotificationItem";
import ProfileCard from "../ProfileSidebar/ProfileHeaderCard";
import { ChevronDown } from "lucide-react";
import useClickOutside from "../../Hooks/useClickOutside";
import "./Notifications.css";

export default function NotificationsPage({ API_BASE = "" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [myPostsDropdownOpen, setMyPostsDropdownOpen] = useState(false);
  const [me, setMe] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const dropdownRef = useRef();
  useClickOutside(dropdownRef, () => setMyPostsDropdownOpen(false));

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const r = await fetch(`${API_BASE}/api/me`, {
        credentials: "include",
      });

      if (!r.ok) {
        alert("Please login to access notifications.");
        window.location.href = "/Login";
        return;
      }

      const user = await r.json();
      setMe(user);

      // Load notifications only after authenticated
      loadNotifications();
      setAuthChecked(true);
    } catch (e) {
      console.error("Auth check failed:", e);
      alert("Please login to access notifications.");
      window.location.href = "/Login";
    }
  }

  async function loadNotifications() {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/notifications`, {
        credentials: "include",
      });

      if (r.status === 401) {
        alert("Please login to access notifications.");
        window.location.href = "/Login";
        return;
      }

      if (r.ok) setItems(await r.json());
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
    setLoading(false);
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  function handleMute(actorId) {
    setItems((prev) => prev.filter((n) => n.actor_id !== actorId));
  }

  function handleAcceptConnection(id) {
    // Remove the connection request notification after accepting
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  function handleRejectConnection(id) {
    // Remove the connection request notification after rejecting
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  async function markAllRead() {
    try {
      await Promise.all(
        items.map((n) =>
          fetch(`${API_BASE}/api/notifications/${n.id}/read`, {
            method: "POST",
            credentials: "include",
          })
        )
      );

      setItems((p) => p.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  }

  // Don't render until authentication check completes
  if (!authChecked) return null;

  // Filter logic
  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "jobs") return item.type === "job"; // For future job notifications
    if (filter === "mentions") return item.type === "mention"; // For future mention notifications
    if (filter === "my-posts")
      return ["like", "comment", "share"].includes(item.type);
    if (filter === "like") return item.type === "like";
    if (filter === "comment") return item.type === "comment";
    if (filter === "share") return item.type === "share";
    return true;
  });

  function getMyPostsLabel() {
    if (filter === "like") return "My posts: Reactions";
    if (filter === "comment") return "My posts: Comments";
    if (filter === "share") return "My posts: Reposts";
    if (filter === "my-posts") return "My posts";
    return "My posts";
  }

  return (
    <div className="ln-notifications-page">
      {/* LEFT SIDEBAR */}
      <div className="ln-left">
        {me && <ProfileCard user={me} API_BASE={API_BASE} />}
      </div>

      {/* RIGHT SECTION */}
      <div className="ln-right">
        <h1 className="ln-title">Notifications</h1>

        {/* FILTER TABS - LinkedIn Style */}
        <div className="ln-filters-new">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => {
              setFilter("all");
              setMyPostsDropdownOpen(false);
            }}
          >
            All
          </button>

          <button
            className={`filter-tab ${filter === "jobs" ? "active" : ""}`}
            onClick={() => {
              setFilter("jobs");
              setMyPostsDropdownOpen(false);
            }}
          >
            Jobs
          </button>

          {/* My posts with dropdown */}
          <div className="filter-dropdown" ref={dropdownRef}>
            <button
              className={`filter-tab ${
                ["my-posts", "like", "comment", "share"].includes(filter)
                  ? "active"
                  : ""
              }`}
              onClick={() => setMyPostsDropdownOpen(!myPostsDropdownOpen)}
            >
              {getMyPostsLabel()} <ChevronDown size={16} />
            </button>

            {myPostsDropdownOpen && (
              <div className="filter-dropdown-menu">
                <div
                  className="filter-dropdown-item"
                  onClick={() => {
                    setFilter("my-posts");
                    setMyPostsDropdownOpen(false);
                  }}
                >
                  All
                </div>
                <div
                  className="filter-dropdown-item"
                  onClick={() => {
                    setFilter("like");
                    setMyPostsDropdownOpen(false);
                  }}
                >
                  Reactions
                </div>
                <div
                  className="filter-dropdown-item"
                  onClick={() => {
                    setFilter("comment");
                    setMyPostsDropdownOpen(false);
                  }}
                >
                  Comments
                </div>
                <div
                  className="filter-dropdown-item"
                  onClick={() => {
                    setFilter("share");
                    setMyPostsDropdownOpen(false);
                  }}
                >
                  Reposts
                </div>
              </div>
            )}
          </div>

          <button
            className={`filter-tab ${filter === "mentions" ? "active" : ""}`}
            onClick={() => {
              setFilter("mentions");
              setMyPostsDropdownOpen(false);
            }}
          >
            Mentions
          </button>
        </div>

        {items.some((x) => !x.is_read) && (
          <button className="ln-mark-all" onClick={markAllRead}>
            Mark all as read
          </button>
        )}

        {/* NOTIFICATIONS FEED */}
        <div className="ln-feed">
          {loading && <p className="ln-loading">Loading…</p>}

          {!loading && filteredItems.length === 0 && (
            <p className="ln-no-items">No notifications</p>
          )}

          {filteredItems.map((note) => (
            <NotificationItem
              key={note.id}
              note={note}
              API_BASE={API_BASE}
              onRead={(id) =>
                setItems((p) =>
                  p.map((n) => (n.id === id ? { ...n, is_read: true } : n))
                )
              }
              onDelete={handleDelete}
              onMute={handleMute}
              onAcceptConnection={handleAcceptConnection}
              onRejectConnection={handleRejectConnection}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
