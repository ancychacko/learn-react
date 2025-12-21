// src/Components/Network/Connections.js
// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { Search, Ellipsis } from "lucide-react";
// import { useToast } from "../../Contexts/ToastContext";
// import useClickOutside from "../../Hooks/useClickOutside";
// import MessageModal from "./MessageModal";
// import "./Connections.css";

// export default function Connections({ API_BASE }) {
//   const navigate = useNavigate();
//   const { addToast } = useToast();
//   const [connections, setConnections] = useState([]);
//   const [filteredConnections, setFilteredConnections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [authChecked, setAuthChecked] = useState(false);
//   const [sortBy, setSortBy] = useState("recently_added");
//   const [searchQuery, setSearchQuery] = useState("");

//   // ⭐ NEW: Message modal state
//   const [messageModalOpen, setMessageModalOpen] = useState(false);
//   const [selectedUserForMessage, setSelectedUserForMessage] = useState(null);

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   useEffect(() => {
//     if (authChecked) {
//       fetchConnections();
//     }
//   }, [authChecked]);

//   useEffect(() => {
//     handleSort();
//   }, [sortBy, connections]);

//   useEffect(() => {
//     handleSearch();
//   }, [searchQuery, connections]);

//   async function checkAuth() {
//     try {
//       const r = await fetch(`${API_BASE}/api/me`, {
//         credentials: "include",
//       });

//       if (!r.ok) {
//         addToast("Please login to access connections", { type: "error" });
//         navigate("/Login");
//         return;
//       }

//       setAuthChecked(true);
//     } catch (err) {
//       console.error("Auth check failed:", err);
//       addToast("Please login to continue", { type: "error" });
//       navigate("/Login");
//     }
//   }

//   async function fetchConnections() {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/api/network/connections`, {
//         credentials: "include",
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setConnections(data.connections || []);
//         setFilteredConnections(data.connections || []);
//       }
//     } catch (err) {
//       console.error("Failed to fetch connections:", err);
//       addToast("Failed to load connections", { type: "error" });
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleSort() {
//     let sorted = [...connections];

//     switch (sortBy) {
//       case "recently_added":
//         sorted.sort(
//           (a, b) => new Date(b.connected_at) - new Date(a.connected_at)
//         );
//         break;
//       case "first_name":
//         sorted.sort((a, b) => a.name.localeCompare(b.name));
//         break;
//       case "last_name":
//         sorted.sort((a, b) => {
//           const aLast = a.name.split(" ").pop();
//           const bLast = b.name.split(" ").pop();
//           return aLast.localeCompare(bLast);
//         });
//         break;
//       default:
//         break;
//     }

//     setFilteredConnections(sorted);
//   }

//   function handleSearch() {
//     if (!searchQuery.trim()) {
//       setFilteredConnections(connections);
//       return;
//     }

//     const filtered = connections.filter((conn) =>
//       conn.name.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//     setFilteredConnections(filtered);
//   }

//   async function handleRemoveConnection(connectionId) {
//     try {
//       const res = await fetch(`${API_BASE}/api/network/remove`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ connectionId }),
//       });

//       if (res.ok) {
//         addToast("Connection removed successfully", { type: "success" });
//         setConnections((prev) => prev.filter((c) => c.id !== connectionId));
//         setFilteredConnections((prev) =>
//           prev.filter((c) => c.id !== connectionId)
//         );
//       } else {
//         const error = await res.json();
//         addToast(error.error || "Failed to remove connection", {
//           type: "error",
//         });
//       }
//     } catch (err) {
//       console.error("Failed to remove connection:", err);
//       addToast("An error occurred", { type: "error" });
//     }
//   }

//   async function handleBlockUser(userId, isBlocked) {
//     try {
//       const endpoint = isBlocked ? "unblock" : "block";
//       const res = await fetch(`${API_BASE}/api/network/${endpoint}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ userId }),
//       });

//       if (res.ok) {
//         const message = isBlocked
//           ? "User unblocked successfully"
//           : "User blocked successfully";
//         addToast(message, { type: "success" });

//         // Update the connection's blocked status
//         setConnections((prev) =>
//           prev.map((c) =>
//             c.id === userId ? { ...c, is_blocked: !isBlocked } : c
//           )
//         );
//         setFilteredConnections((prev) =>
//           prev.map((c) =>
//             c.id === userId ? { ...c, is_blocked: !isBlocked } : c
//           )
//         );
//       } else {
//         const error = await res.json();
//         addToast(error.error || "Failed to update block status", {
//           type: "error",
//         });
//       }
//     } catch (err) {
//       console.error("Failed to update block status:", err);
//       addToast("An error occurred", { type: "error" });
//     }
//   }

//   // ⭐ NEW: Report user
//   async function handleReportUser(userId, userName) {
//     try {
//       const res = await fetch(`${API_BASE}/api/network/report`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ userId }),
//       });

//       if (res.ok) {
//         addToast(`${userName} has been reported`, { type: "success" });
//       } else {
//         const error = await res.json();
//         addToast(error.error || "Failed to report user", { type: "error" });
//       }
//     } catch (err) {
//       console.error("Failed to report user:", err);
//       addToast("An error occurred", { type: "error" });
//     }
//   }

//   // ⭐ NEW: Open message modal
//   function handleOpenMessage(user) {
//     setSelectedUserForMessage(user);
//     setMessageModalOpen(true);
//   }
//   if (!authChecked) return null;

//   return (
//     <div className="connections-page">
//       <div className="connections-container">
//         {/* Header */}
//         <div className="connections-header">
//           <h1 className="connections-count">
//             {connections.length} connection{connections.length !== 1 ? "s" : ""}
//           </h1>

//           {/* Controls Row */}
//           <div className="connections-controls">
//             {/* Sort Dropdown */}
//             <div className="sort-control">
//               <label htmlFor="sort-by">Sort by:</label>
//               <select
//                 id="sort-by"
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="sort-select"
//               >
//                 <option value="recently_added">Recently added</option>
//                 <option value="first_name">First name</option>
//                 <option value="last_name">Last name</option>
//               </select>
//             </div>

//             {/* Search and Filters */}
//             <div className="search-controls">
//               <div className="search-input-wrapper">
//                 <Search size={18} className="search-icon" />
//                 <input
//                   type="text"
//                   placeholder="Search by name"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="search-input"
//                 />
//               </div>
//               <button className="search-filters-btn">
//                 Search with filters
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Connections List */}
//         <div className="connections-list">
//           {loading ? (
//             <div className="connections-loading">Loading connections...</div>
//           ) : filteredConnections.length === 0 ? (
//             <div className="connections-empty">
//               {searchQuery
//                 ? "No connections found matching your search"
//                 : "No connections yet"}
//             </div>
//           ) : (
//             filteredConnections.map((connection) => (
//               <ConnectionCard
//                 key={connection.id}
//                 connection={connection}
//                 API_BASE={API_BASE}
//                 onRemove={handleRemoveConnection}
//                 onBlock={handleBlockUser}
//                 onReport={handleReportUser}
//                 onMessage={handleOpenMessage}
//               />
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//      {/* ⭐ NEW: Message Modal */}
//       <MessageModal
//         isOpen={messageModalOpen}
//         onClose={() => {
//           setMessageModalOpen(false);
//           setSelectedUserForMessage(null);
//         }}
//         preselectedUser={selectedUserForMessage}
//         API_BASE={API_BASE}
//       />
//     </>
//   );
// }

// // Connection Card Component
// function ConnectionCard({ connection, API_BASE, onRemove, onBlock }) {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuRef = useRef(null);

//   // Close menu when clicking outside
//   useClickOutside(menuRef, () => setMenuOpen(false));

//   const avatar = connection.avatar_url
//     ? `${API_BASE}${connection.avatar_url}`
//     : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

//   const connectedDate = new Date(connection.connected_at).toLocaleDateString(
//     "en-US",
//     {
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     }
//   );

//   function handleRemoveClick() {
//     if (window.confirm(`Remove ${connection.name} from your connections?`)) {
//       onRemove(connection.id);
//       setMenuOpen(false);
//     }
//   }

//   function handleBlockClick() {
//     const action = connection.is_blocked ? "unblock" : "block";
//     const message = connection.is_blocked
//       ? `Unblock ${connection.name}?`
//       : `Block ${connection.name}? They won't be able to see your profile or contact you.`;

//     if (window.confirm(message)) {
//       onBlock(connection.id, connection.is_blocked);
//       setMenuOpen(false);
//     }
//   }

//   return (
//     <div className="connection-card">
//       <img src={avatar} alt={connection.name} className="connection-avatar" />

//       <div className="connection-info">
//         <h3 className="connection-name">{connection.name}</h3>
//         <p className="connection-title">{connection.title || "Professional"}</p>
//         <p className="connection-date">Connected on {connectedDate}</p>
//         {connection.is_blocked && <p className="connection-blocked">Blocked</p>}
//       </div>

//       <div className="connection-actions">
//         <button className="message-btn" disabled={connection.is_blocked}>
//           Message
//         </button>
//         <button
//           className="more-btn"
//           onClick={() => setMenuOpen(!menuOpen)}
//           aria-label="More options"
//         >
//           <Ellipsis size={40} color="black" />
//         </button>

//         {menuOpen && (
//           <div className="connection-menu" ref={menuRef}>
//             <div className="menu-item" onClick={handleRemoveClick}>
//               Remove connection
//             </div>
//             <div className="menu-item" onClick={handleBlockClick}>
//               {connection.is_blocked ? "Unblock" : "Block"}
//             </div>
//             <div className="menu-item">Report</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// src/Components/Network/Connections.js - Key updates
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Ellipsis } from "lucide-react";
import { useToast } from "../../Contexts/ToastContext";
import useClickOutside from "../../Hooks/useClickOutside";
import MessageModal from "./MessageModal";
import "./Connections.css";

export default function Connections({ API_BASE }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [sortBy, setSortBy] = useState("recently_added");
  const [searchQuery, setSearchQuery] = useState("");

  // ⭐ NEW: Message modal state
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedUserForMessage, setSelectedUserForMessage] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authChecked) {
      fetchConnections();
    }
  }, [authChecked]);

  useEffect(() => {
    handleSort();
  }, [sortBy, connections]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, connections]);

  async function checkAuth() {
    try {
      const r = await fetch(`${API_BASE}/api/me`, {
        credentials: "include",
      });

      if (!r.ok) {
        addToast("Please login to access connections", { type: "error" });
        navigate("/Login");
        return;
      }

      setAuthChecked(true);
    } catch (err) {
      console.error("Auth check failed:", err);
      addToast("Please login to continue", { type: "error" });
      navigate("/Login");
    }
  }

  async function fetchConnections() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/network/connections`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
        setFilteredConnections(data.connections || []);
      }
    } catch (err) {
      console.error("Failed to fetch connections:", err);
      addToast("Failed to load connections", { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  function handleSort() {
    let sorted = [...connections];

    switch (sortBy) {
      case "recently_added":
        sorted.sort(
          (a, b) => new Date(b.connected_at) - new Date(a.connected_at)
        );
        break;
      case "first_name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "last_name":
        sorted.sort((a, b) => {
          const aLast = a.name.split(" ").pop();
          const bLast = b.name.split(" ").pop();
          return aLast.localeCompare(bLast);
        });
        break;
      default:
        break;
    }

    setFilteredConnections(sorted);
  }

  function handleSearch() {
    if (!searchQuery.trim()) {
      setFilteredConnections(connections);
      return;
    }

    const filtered = connections.filter((conn) =>
      conn.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredConnections(filtered);
  }

  async function handleRemoveConnection(connectionId) {
    try {
      const res = await fetch(`${API_BASE}/api/network/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ connectionId }),
      });

      if (res.ok) {
        addToast("Connection removed successfully", { type: "success" });
        setConnections((prev) => prev.filter((c) => c.id !== connectionId));
        setFilteredConnections((prev) =>
          prev.filter((c) => c.id !== connectionId)
        );
      } else {
        const error = await res.json();
        addToast(error.error || "Failed to remove connection", {
          type: "error",
        });
      }
    } catch (err) {
      console.error("Failed to remove connection:", err);
      addToast("An error occurred", { type: "error" });
    }
  }

  async function handleBlockUser(userId, isBlocked) {
    try {
      const endpoint = isBlocked ? "unblock" : "block";
      const res = await fetch(`${API_BASE}/api/network/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const message = isBlocked
          ? "User unblocked successfully"
          : "User blocked successfully";
        addToast(message, { type: "success" });

        setConnections((prev) =>
          prev.map((c) =>
            c.id === userId ? { ...c, is_blocked: !isBlocked } : c
          )
        );
        setFilteredConnections((prev) =>
          prev.map((c) =>
            c.id === userId ? { ...c, is_blocked: !isBlocked } : c
          )
        );
      } else {
        const error = await res.json();
        addToast(error.error || "Failed to update block status", {
          type: "error",
        });
      }
    } catch (err) {
      console.error("Failed to update block status:", err);
      addToast("An error occurred", { type: "error" });
    }
  }

  // ⭐ NEW: Report user
  async function handleReportUser(userId, userName) {
    try {
      const res = await fetch(`${API_BASE}/api/network/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        addToast(`${userName} has been reported`, { type: "success" });
      } else {
        const error = await res.json();
        addToast(error.error || "Failed to report user", { type: "error" });
      }
    } catch (err) {
      console.error("Failed to report user:", err);
      addToast("An error occurred", { type: "error" });
    }
  }

  // ⭐ NEW: Open message modal
  function handleOpenMessage(user) {
    setSelectedUserForMessage(user);
    setMessageModalOpen(true);
  }

  if (!authChecked) return null;

  return (
    <>
      <div className="connections-page">
        <div className="connections-container">
          {/* Header */}
          <div className="connections-header">
            <h1 className="connections-count">
              {connections.length} connection
              {connections.length !== 1 ? "s" : ""}
            </h1>

            {/* Controls Row */}
            <div className="connections-controls">
              {/* Sort Dropdown */}
              <div className="sort-control">
                <label htmlFor="sort-by">Sort by:</label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="recently_added">Recently added</option>
                  <option value="first_name">First name</option>
                  <option value="last_name">Last name</option>
                </select>
              </div>

              {/* Search and Filters */}
              <div className="search-controls">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                <button className="search-filters-btn">
                  Search with filters
                </button>
              </div>
            </div>
          </div>

          {/* Connections List */}
          <div className="connections-list">
            {loading ? (
              <div className="connections-loading">Loading connections...</div>
            ) : filteredConnections.length === 0 ? (
              <div className="connections-empty">
                {searchQuery
                  ? "No connections found matching your search"
                  : "No connections yet"}
              </div>
            ) : (
              filteredConnections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  API_BASE={API_BASE}
                  onRemove={handleRemoveConnection}
                  onBlock={handleBlockUser}
                  onReport={handleReportUser}
                  onMessage={handleOpenMessage}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ⭐ NEW: Message Modal */}
      <MessageModal
        isOpen={messageModalOpen}
        onClose={() => {
          setMessageModalOpen(false);
          setSelectedUserForMessage(null);
        }}
        preselectedUser={selectedUserForMessage}
        API_BASE={API_BASE}
      />
    </>
  );
}

// ⭐ UPDATED: Connection Card Component
function ConnectionCard({
  connection,
  API_BASE,
  onRemove,
  onBlock,
  onReport,
  onMessage,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useClickOutside(menuRef, () => setMenuOpen(false));

  const avatar = connection.avatar_url
    ? `${API_BASE}${connection.avatar_url}`
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const connectedDate = new Date(connection.connected_at).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  function handleRemoveClick() {
    if (window.confirm(`Remove ${connection.name} from your connections?`)) {
      onRemove(connection.id);
      setMenuOpen(false);
    }
  }

  function handleBlockClick() {
    const action = connection.is_blocked ? "unblock" : "block";
    const message = connection.is_blocked
      ? `Unblock ${connection.name}?`
      : `Block ${connection.name}? They won't be able to see your profile or contact you.`;

    if (window.confirm(message)) {
      onBlock(connection.id, connection.is_blocked);
      setMenuOpen(false);
    }
  }

  function handleReportClick() {
    if (
      window.confirm(
        `Report ${connection.name}? This will help us take action.`
      )
    ) {
      onReport(connection.id, connection.name);
      setMenuOpen(false);
    }
  }

  function handleMessageClick() {
    onMessage(connection);
  }

  return (
    <div className="connection-card">
      <img src={avatar} alt={connection.name} className="connection-avatar" />

      <div className="connection-info">
        <h3 className="connection-name">{connection.name}</h3>
        <p className="connection-title">{connection.title || "Professional"}</p>
        <p className="connection-date">Connected on {connectedDate}</p>
        {connection.is_blocked && <p className="connection-blocked">Blocked</p>}
      </div>

      <div className="connection-actions">
        <button
          className="message-btn"
          disabled={connection.is_blocked}
          onClick={handleMessageClick}
        >
          Message
        </button>
        <button
          className="more-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="More options"
        >
          <Ellipsis size={40} />
        </button>

        {menuOpen && (
          <div className="connection-menu" ref={menuRef}>
            <div className="menu-item" onClick={handleRemoveClick}>
              Remove connection
            </div>
            <div className="menu-item" onClick={handleBlockClick}>
              {connection.is_blocked ? "Unblock" : "Block"}
            </div>
            <div className="menu-item" onClick={handleReportClick}>
              Report
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
