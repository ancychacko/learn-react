// src/Components/ProfileSidebar/AnalyticsCard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileCard.css";

export default function AnalyticsCard() {
  const navigate = useNavigate();

  return (
    <div className="profilecard-container">
      <div
        className="profilecard-stat"
        onClick={() => navigate("/ProfileViews")}
        role="button"
      >
        <span>Profile viewers</span>
        <strong>7</strong>
      </div>

      <div
        className="profilecard-stat"
        onClick={() => navigate("/ProfileAnalytics")}
        role="button"
      >
        <span>View all analytics</span>
      </div>
    </div>
  );
}
