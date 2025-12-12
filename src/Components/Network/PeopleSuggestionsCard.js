// src/Components/Network/PeopleSuggestionsCard.js
import React, { useEffect, useState } from "react";
import { XCircle } from "lucide-react";

export default function PeopleSuggestionsCard({ API_BASE, user, addToast }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  async function fetchSuggestions() {
    try {
      const res = await fetch(`${API_BASE}/api/network/suggestions`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error("Failed to fetch suggestions:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(userId) {
    try {
      const res = await fetch(`${API_BASE}/api/network/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        addToast("Connection request sent!", { type: "success" });
        setSuggestions((prev) => prev.filter((s) => s.id !== userId));
      } else {
        addToast("Failed to send connection request", { type: "error" });
      }
    } catch (err) {
      console.error("Connect error:", err);
      addToast("An error occurred", { type: "error" });
    }
  }

  function handleDismiss(userId) {
    setSuggestions((prev) => prev.filter((s) => s.id !== userId));
  }

  if (loading) {
    return (
      <div className="mynetwork-box">
        <h3 className="mynetwork-h2">Loading suggestions...</h3>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="mynetwork-box">
        <h3 className="mynetwork-h2">
          People you may know based on your recent activity
        </h3>
        <p className="no-suggestions">No suggestions available at the moment</p>
      </div>
    );
  }

  return (
    <div className="mynetwork-box">
      <h3 className="mynetwork-h2">
        People you may know based on your recent activity
      </h3>

      <div className="mynetwork-people-grid">
        {suggestions.map((person) => (
          <PersonSuggestion
            key={person.id}
            person={person}
            onConnect={handleConnect}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </div>
  );
}

function PersonSuggestion({ person, onConnect, onDismiss }) {
  return (
    <div className="person-card">
      <button
        className="dismiss-btn"
        onClick={() => onDismiss(person.id)}
        aria-label="Dismiss suggestion"
      >
        <XCircle size={18} />
      </button>

      <div className="person-avatar">
        {person.profile_pic ? (
          <img src={person.profile_pic} alt={person.name} />
        ) : (
          <div className="person-avatar-placeholder">
            {person.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>

      <p className="person-name">{person.name || "LinkedIn Member"}</p>
      <p className="person-headline">{person.headline || "Professional"}</p>
      {person.mutual_connections > 0 && (
        <p className="person-mutual">
          {person.mutual_connections} mutual connection
          {person.mutual_connections > 1 ? "s" : ""}
        </p>
      )}

      <button className="connect-btn" onClick={() => onConnect(person.id)}>
        Connect
      </button>
    </div>
  );
}
