// src/Components/Network/Connections.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MoreHorizontal } from "lucide-react";
import { useToast } from "../../Contexts/ToastContext";
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
  //   const []

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

  if (!authChecked) return null;

  return (
    <div className="connections-page">
      <div className="connections-container">
        {/* Header */}
        <div className="connections-header">
          <h1 className="connections-count">
            {connections.length} connection{connections.length !== 1 ? "s" : ""}
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
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Connection Card Component
function ConnectionCard({ connection, API_BASE }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
  const navigate = useNavigate();
  function handleMessage(userId) {
    navigate(`/Messaging/${userId}`);
  }
  //   async function handleRemove(connectionId) {
  //   const res = await fetch(`${API_BASE}/api/network/remove`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     credentials: 'include',
  //     body: JSON.stringify({ connectionId })
  //   });

  //   if (res.ok) {
  //     // Remove from list
  //     setConnections(prev => prev.filter(c => c.id !== connectionId));
  //   }
  // }

  return (
    <div className="connection-card">
      <img src={avatar} alt={connection.name} className="connection-avatar" />

      <div className="connection-info">
        <h3 className="connection-name">{connection.name}</h3>
        <p className="connection-title">{connection.title || "Professional"}</p>
        <p className="connection-date">Connected on {connectedDate}</p>
      </div>

      <div className="connection-actions">
        <button
          className="message-btn"
          onClick={() => handleMessage(connection.id)}
        >
          Message
        </button>
        <button
          className="more-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="More options"
        >
          <MoreHorizontal size={30} color="black" />
        </button>

        {menuOpen && (
          <div className="connection-menu">
            <div className="menu-item">Remove connection</div>
            <div className="menu-item">Report / Block</div>
          </div>
        )}
      </div>
    </div>
  );
}
