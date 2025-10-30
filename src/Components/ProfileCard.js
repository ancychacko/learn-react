// src/Components/ProfileCard.js
import React from "react";
import "./Welcome.css";

export default function ProfileCard({ user }) {
  return (
    <div className="profile-card">
      <div className="profile-header">
        <img
          src={
            user.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt="Profile"
          className="profile-img"
        />
        <h3>{user.name}</h3>
        <p className="profile-email">{user.email}</p>
      </div>
      <div className="profile-summary">
        <p>Full Stack Developer || Data Analyst. 🚀</p>
      </div>
    </div>
  );
}
