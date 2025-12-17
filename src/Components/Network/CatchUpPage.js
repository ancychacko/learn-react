// src/Components/Network/CatchUp.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyNetwork.css";
import { useToast } from "../../Contexts/ToastContext";
import MyNetworkCard from "./MyNetworkCard";
import GamesCard from "./GamesCard";
import CatchUpCard from "./CatchUpCard";

export default function CatchUp({ API_BASE }) {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { addToast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const r = await fetch(`${API_BASE}/api/me`, {
        credentials: "include",
      });

      if (!r.ok) {
        addToast("Please login to access My Network", { type: "error" });
        window.location.href = "/Login";
        return;
      }

      setAuthChecked(true);
    } catch (err) {
      console.error(err);
      addToast("Please login to continue", { type: "error" });
      window.location.href = "/Login";
    }
  }

  if (!authChecked) return null;

  return (
    <div className="mynetwork-page">
      {/* LEFT SIDEBAR - Always visible */}
      <div className="mynetwork-left">
        <MyNetworkCard API_BASE={API_BASE} refreshTrigger={refreshCounter} />
      </div>

      {/* CENTER CONTENT */}
      <div className="mynetwork-center">
        {/* Tabs */}
        <div className="mynetwork-tabs">
          <div className="tab" onClick={() => navigate("/MyNetwork")}>
            Grow
          </div>
          <div
            className="tab active"
            onClick={() => navigate("/MyNetwork/catchup")}
          >
            Catch up
          </div>
        </div>

        {/* Catch Up Content */}
        <CatchUpCard API_BASE={API_BASE} />

        {/* Games Section */}
        <GamesCard />
      </div>
    </div>
  );
}
