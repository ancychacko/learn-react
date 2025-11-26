// src/Components/ProfileSidebar/LinksCard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../ProfileSidebar/ProfileCard.css";

export default function LinksCard() {
  const navigate = useNavigate();

  return (
    <div className="profilecard-links">
        <button onClick={() => navigate("/Saved")}>Saved items</button>
       <button onClick={() => navigate("/Groups")}>Groups</button>
       <button onClick={() => navigate("/Newsletters")}>Newsletters</button>
      <button onClick={() => navigate("/Events")}>Events</button>
     </div>
  );
}
