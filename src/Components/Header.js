// src/Components/Header.js
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";
import { Avatar } from "@mui/material";

export default function Header({ API_BASE, user }) {
  const [me, setMe] = useState(user || null);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  // If parent provides user prop, prefer it; otherwise fetch own copy
  useEffect(() => {
    if (user) {
      setMe(user);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
        if (r.ok && mounted) {
          setMe(await r.json());
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => (mounted = false);
  }, [API_BASE, user]);

  // close dropdown on outside click
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  async function handleSignOut() {
    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("logout error", e);
    }
    navigate("/Login", { replace: true });
  }

  function avatarUrl(u) {
    if (!u) return null;
    return `${window.location.protocol}//${window.location.hostname}:4000${u}`;
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="logo">MyNetwork</div>
        <div className="top-search">
          <input placeholder="Search" aria-label="Search" />
        </div>
      </div>

      <div className="topbar-right" ref={ref} style={{ position: "relative" }}>
        <button
          className="profile-circle"
          onClick={() => setOpen((s) => !s)}
          aria-haspopup="true"
          aria-expanded={open}
          title={me ? me.name : "Profile"}
        >
          {me && me.avatar_url ? (
            // <img src={avatarUrl(me.avatar_url)} alt="avatar" />
            <Avatar src={avatarUrl(me.avatar_url)} />
          ) : me ? (
            <span style={{ fontWeight: 700, color: "#0a66c2" }}>
              {me.name ? me.name.charAt(0).toUpperCase() : "?"}
            </span>
          ) : (
            "?"
          )}
        </button>

        {open && (
          <div className="profile-dropdown" role="menu">
            <div className="profile-dropdown-top">
              <strong>{me?.name}</strong>
              <div className="muted">{me?.email}</div>
            </div>

            <button
              onClick={() => {
                setOpen(false);
                navigate(`/Profile/${me?.name}`);
              }}
            >
              View profile
            </button>
            <button
              onClick={() => {
                setOpen(false);
                navigate(`/Settings/${me?.name}`);
              }}
            >
              Settings
            </button>
            <button
              onClick={() => {
                setOpen(false);
                navigate(`/Activity/${me?.name}`);
              }}
            >
              Posts & Activity
            </button>
            <div className="dropdown-divider" />
            <button onClick={handleSignOut}>Sign out</button>
          </div>
        )}
      </div>
    </div>
  );
}
