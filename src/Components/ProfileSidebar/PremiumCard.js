// src/Components/ProfileSidebar/PremiumCard.js
import React from "react";
import "../ProfileSidebar/ProfileCard.css";

export default function PremiumCard() {
  return (
    <div className="profilecard-premium">
      <p>
        Reach career heights with <strong>Premium</strong>
      </p>
      <button className="premium-btn">Reactivate Premium: 50% Off</button>
    </div>
  );
}
