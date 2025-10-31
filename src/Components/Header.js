// src/components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Welcome.css";

export default function Header({ API_BASE, onLogout }) {
  const [me, setMe] = useState(null);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
        if (r.ok) setMe(await r.json());
      } catch (e) {
        /* ignore */
      }
    })();
  }, [API_BASE]);

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
      console.error(e);
    }
    setOpen(false);
    if (onLogout) onLogout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="logo">MyNetwork</div>
        <div className="top-search">
          <input placeholder="Search" aria-label="Search" />
        </div>
      </div>

      <div className="topbar-right" ref={ref}>
        <button
          className="profile-circle"
          onClick={() => setOpen((s) => !s)}
          aria-haspopup="true"
          aria-expanded={open}
          title={me ? me.name : "Profile"}
        >
          {me && me.avatar_url ? (
            <img
              src={`${window.location.protocol}//${window.location.hostname}:4000${me.avatar_url}`}
              alt="avatar"
            />
          ) : me ? (
            me.name.charAt(0).toUpperCase()
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
                navigate(`/profile/${me?.id}`);
              }}
            >
              View profile
            </button>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/settings");
              }}
            >
              Settings
            </button>
            <button
              onClick={() => {
                setOpen(false);
                navigate("/activity");
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
