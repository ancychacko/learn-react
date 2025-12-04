// src/Components/ShareModal.js
import React, { useEffect, useState } from "react";
import "./Send.css";
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

  // ⭐ NEW: Thoughts for sharing
  const [thoughts, setThoughts] = useState("");

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
    setThoughts(""); // reset textbox
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

  // async function handleSend() {
  //   if (sending) return;
  //   setSending(true);

  //   try {
  //     const r = await fetch(`${API_BASE}/api/posts/${postId}/share`, {
  //       method: "POST",
  //       credentials: "include",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         recipients: Array.from(selected),
  //         share_to_feed: Boolean(shareToFeed),
  //         comment: thoughts.trim() || null, // ⭐ NEW: sending comment to backend
  //       }),
  //     });

  //     if (r.ok) {
  //       const body = await r.json();
  //       if (typeof onSent === "function") onSent(body.count);
  //       onClose();
  //     } else {
  //       const b = await r.json().catch(() => ({}));
  //       console.error("share error", b);
  //     }
  //   } catch (err) {
  //     console.error("share network", err);
  //   } finally {
  //     setSending(false);
  //   }
  // }
  async function handleSend() {
    if (sending) return;
    setSending(true);

    try {
      for (let receiver_id of Array.from(selected)) {
        await fetch(`${API_BASE}/api/messages/send`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiver_id,
            text: thoughts.trim() || "",
            post_id: postId, // 🔥 The attached post
          }),
        });
      }

      onClose();
      onSent(); // toast
    } catch (err) {
      console.error("send error", err);
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="share-modal animate-pop">
        {/* HEADER */}
        <div className="share-modal-header">
          <div style={{ fontWeight: 600 }}>Send {posterName}'s post</div>
          <button
            className="icon-btn"
            style={{ width: 50, marginBottom: "5px" }}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} color="black" />
          </button>
        </div>

        {/* ⭐ NEW: Thoughts box */}
        <div style={{ padding: "12px 16px" }}>
          <textarea
            placeholder="Write a message..."
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            className="share-thoughts-box"
            rows={3}
            style={{
              width: "100%",
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "10px",
              resize: "none",
              fontSize: "14px",
            }}
          />
        </div>

        {/* SEARCH BOX */}
        <div style={{ padding: "8px 12px" }}>
          <input
            placeholder="Type a name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="share-search"
          />
        </div>

        {/* FOLLOWERS LIST */}
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

        {/* SHARE TO FEED CHECKBOX */}
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

        {/* FOOTER BUTTONS */}
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
