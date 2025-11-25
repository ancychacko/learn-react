// src/Components/Header.js
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@mui/material";
import {
  Home,
  Users2,
  Briefcase,
  MessageSquare,
  Bell,
  Grid,
  Search,
  ChevronDown,
  Handshake,
} from "lucide-react";
import "./Header.css";

export default function Header({ API_BASE = "", user }) {
  const [me, setMe] = useState(user || null);
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const navigate = useNavigate();

  // Avatar URL builder
  function avatarUrl(u) {
    if (!u) return null;
    return `${window.location.protocol}//${window.location.hostname}:4000${u}`;
  }

  // Fetch logged-in user if not provided
  useEffect(() => {
    if (user) {
      setMe(user);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/me`, {
          credentials: "include",
        });
        if (res.ok && mounted) setMe(await res.json());
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    })();
    return () => (mounted = false);
  }, [API_BASE, user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Logout
  async function handleSignOut() {
    try {
      await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
      navigate("/Login", { replace: true });
    } catch (e) {
      console.error("Logout error:", e);
    }
  }

  const encodedName = encodeURIComponent(me?.name || "");

  return (
    <header className="linkedin-header">
      {/* LEFT: Logo + Search */}
      <div className="header-left">
        <div className="linkedin-logo" onClick={() => navigate("/Home")}>
          <Handshake size={100} />
          Network
        </div>
        <div className="header-search">
          <Search size={18} color="#111010ff" />
          <input type="text" placeholder="Search" />
        </div>
      </div>

      {/* CENTER: Navigation Icons */}
      <nav className="header-nav">
        <div className="nav-item" onClick={() => navigate("/Home")}>
          <Home />
          <span>Home</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/MyNetwork")}>
          <Users2 />
          <span>My Network</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/Jobs")}>
          <Briefcase />
          <span>Jobs</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/Messaging")}>
          <MessageSquare />
          <span>Messaging</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/Notifications")}>
          <Bell />
          <span>Notifications</span>
        </div>

        {/* “Me” Section */}
        <div
          className="nav-item me-item"
          ref={ref}
          onClick={() => setOpen((o) => !o)}
        >
          {me?.avatar_url ? (
            <Avatar
              src={avatarUrl(me.avatar_url)}
              sx={{ width: 28, height: 28 }}
            />
          ) : (
            <Avatar sx={{ width: 28, height: 28, bgcolor: "#0a66c2" }}>
              {me?.name ? me.name.charAt(0).toUpperCase() : "?"}
            </Avatar>
          )}
          <span className="me-label">
            <strong>Me </strong> <ChevronDown size={10} color="black" />
          </span>

          {open && (
            <div className="me-dropdown">
              <div className="me-card">
                <div className="me-card-left">
                  {me?.avatar_url ? (
                    <img
                      src={avatarUrl(me.avatar_url)}
                      alt="avatar"
                      className="me-card-avatar"
                    />
                  ) : (
                    <Avatar sx={{ width: 64, height: 64, bgcolor: "#0a66c2" }}>
                      {me?.name ? me.name.charAt(0).toUpperCase() : "?"}
                    </Avatar>
                  )}
                </div>
                <div className="me-card-right">
                  <div className="me-name">{me?.name}</div>
                  <div className="me-role">
                    {me?.about
                      ? me.about.split("\n")[0]
                      : "Full Stack Developer"}
                  </div>
                  <button
                    className="btn-view-profile"
                    onClick={() => navigate(`/Profile/${encodedName}`)}
                  >
                    View profile
                  </button>
                </div>
              </div>

              <div className="me-section">
                <div className="me-section-title">Account</div>
                <button onClick={() => navigate("/Settings")}>
                  Settings & Privacy
                </button>
                <button onClick={() => navigate("/Help")}>Help</button>
                <button onClick={() => navigate("/Language")}>Language</button>
              </div>

              <div className="me-section">
                <div className="me-section-title">Manage</div>
                <button onClick={() => navigate(`/Activity/${encodedName}`)}>
                  Posts & Activity
                </button>
                <button onClick={() => navigate("/job-posting")}>
                  Job Posting Account
                </button>
              </div>

              <div className="me-divider" />
              <button className="me-signout" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          )}
        </div>

        <div className="nav-item">
          <Grid size={22} />
          <span>
            For Business
            <ChevronDown size={10} color="black" />
          </span>
        </div>
      </nav>

      {/* RIGHT: Premium */}
      <div className="header-right">
        <a href="#" className="premium-link">
          Reactivate Premium: <span>50% Off</span>
        </a>
      </div>
    </header>
  );
}
