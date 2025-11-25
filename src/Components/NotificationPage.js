// src/Components/NotificationsPage.js
import React, { useEffect, useState } from "react";
import NotificationItem from "./NotificationItem";
import "./Notifications.css";

export default function NotificationsPage({ API_BASE = "" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | comments | likes | shares

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/notifications`, {
        credentials: "include",
      });

      if (r.ok) {
        const data = await r.json();
        setItems(data);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    }
    setLoading(false);
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

  const filteredItems =
    filter === "all"
      ? items
      : items.filter((i) => i.type.toLowerCase() === filter.toLowerCase());

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications</h2>

        {items.some((x) => !x.is_read) && (
          <button className="mark-all-btn" onClick={markAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter buttons */}
      <div className="notifications-filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={filter === "comment" ? "active" : ""}
          onClick={() => setFilter("comment")}
          style={{ textEmphasisColor: "black" }}
        >
          Comments
        </button>
        <button
          className={filter === "like" ? "active" : ""}
          onClick={() => setFilter("like")}
        >
          Likes
        </button>
        <button
          className={filter === "share" ? "active" : ""}
          onClick={() => setFilter("share")}
        >
          Shares
        </button>
      </div>

      {/* FEED */}
      <div className="notifications-list">
        {loading && <div className="loading">Loading…</div>}

        {!loading && filteredItems.length === 0 && (
          <div className="no-items">No notifications</div>
        )}

        {filteredItems.map((note) => (
          <NotificationItem
            key={note.id}
            note={note}
            API_BASE={API_BASE}
            onRead={(id) =>
              setItems((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
