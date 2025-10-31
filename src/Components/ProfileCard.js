// src/Components/ProfileCard.js
import React, { useState } from "react";

export default function ProfileCard({ user, API_BASE }) {
  const [editing, setEditing] = useState(false);
  const [about, setAbout] = useState(user.about || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  function avatarFull(url) {
    if (!url) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    return `${window.location.protocol}//${window.location.hostname}:4000${url}`;
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("about", about);
      if (file) fd.append("avatar", file);
      await fetch(`${API_BASE}/api/profile`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      window.location.reload(); // quick and simple
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
    setSaving(false);
  }

  return (
    <div className="profile-card">
      <div className="profile-search"></div>

      <img
        className="profile-avatar-lg"
        src={avatarFull(user.avatar_url)}
        alt="avatar"
      />
      <h3 className="profile-name">{user.name}</h3>
      <p className="profile-about">
        {user.about || "Add a short summary about yourself."}
      </p>

      <button
        className="btn"
        onClick={() => {
          setEditing(!editing);
          setAbout(user.about || "");
        }}
      >
        {editing ? "Cancel" : "Edit profile"}
      </button>

      {editing && (
        <form className="profile-edit-form" onSubmit={save}>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Short summary"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
