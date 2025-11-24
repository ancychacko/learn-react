// src/Components/NotificationsPanel.js
import React, { useEffect, useState, useRef } from "react";
import "./Share.css"; // reuse some base styles or create a Notifications.css
import { Bell } from "lucide-react";

export default function NotificationsPanel({ API_BASE = "" }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`${API_BASE}/api/Notifications`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setNotes(data || []))
      .catch((err) => {
        console.error("load notes", err);
        setNotes([]);
      })
      .finally(() => setLoading(false));
  }, [open, API_BASE]);

  function markRead(id) {
    fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: "POST",
      credentials: "include",
    })
      .then(() =>
        setNotes((s) =>
          s.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        )
      )
      .catch((err) => console.error(err));
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={ref}>
      <button className="menu-trigger-btn" onClick={() => setOpen((o) => !o)}>
        <Bell size={18} />
      </button>

      {open && (
        <div
          className="linked-dropdown"
          style={{ minWidth: 320, maxHeight: 360, overflow: "auto" }}
        >
          <div
            style={{
              padding: 8,
              borderBottom: "1px solid #eee",
              fontWeight: 600,
            }}
          >
            Notifications
          </div>
          {loading && (
            <div style={{ padding: 10 }} className="muted">
              Loading...
            </div>
          )}
          {!loading && notes.length === 0 && (
            <div style={{ padding: 10 }} className="muted">
              No notifications
            </div>
          )}
          {!loading &&
            notes.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: 10,
                  display: "flex",
                  gap: 8,
                  alignItems: "start",
                  background: n.is_read ? "white" : "#f7fbff",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{n.message}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {new Date(n.created_at).toLocaleString()}
                  </div>
                </div>
                {!n.is_read && (
                  <button className="save-btn" onClick={() => markRead(n.id)}>
                    Mark read
                  </button>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
