// src/Components/ProfileSidebar/ProfileHeaderCard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../ProfileSidebar/ProfileCard.css";

export default function ProfileHeaderCard({ user }) {
  const navigate = useNavigate();

  function avatarFull(url) {
    if (!url) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    return `${window.location.protocol}//${window.location.hostname}:4000${url}`;
  }

  return (
    <div className="profilecard-container">
      {/* Cover */}
      <div className="profilecard-cover"></div>

      {/* Avatar */}
      <div
        className="profilecard-avatar"
        onClick={() => navigate(`/Profile/${encodeURIComponent(user.name)}`)}
        role="button"
      >
        <img src={avatarFull(user.avatar_url)} alt={user.name} />
      </div>

      {/* Name */}
      <div
        className="profilecard-name"
        onClick={() => navigate(`/Profile/${encodeURIComponent(user.name)}`)}
        role="button"
      >
        {user.name}
      </div>

      {/* Title */}
      <div
        className="profilecard-title"
        onClick={() => navigate(`/Profile/${encodeURIComponent(user.name)}`)}
        role="button"
      >
        {user.about || "Click to update your summary"}
      </div>

      {/* Meta */}
      <div className="profilecard-meta">
        <p>Delhi, India</p>
        <p className="profilecard-org">
          <span className="dot"></span> Acme Corporation
        </p>
      </div>
    </div>
  );
}
