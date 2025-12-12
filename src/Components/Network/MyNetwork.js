// src/Components/Network/MyNetwork.js
import React, { useEffect, useState } from "react";
import "./MyNetwork.css";
import { useToast } from "../../Contexts/ToastContext";
import MyNetworkCard from "./MyNetworkCard";
import InvitationsCard from "./InvitationsCard";
import GamesCard from "./GamesCard";
import HiringCard from "./HiringCard";
import PeopleSuggestionsCard from "./PeopleSuggestionsCard";

export default function MyNetwork({ API_BASE }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("grow");
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

      const me = await r.json();
      setUser(me);
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
      {/* LEFT SIDEBAR */}
      <div className="mynetwork-left">
        <MyNetworkCard />
      </div>

      {/* CENTER CONTENT */}
      <div className="mynetwork-center">
        {/* Tabs */}
        <div className="mynetwork-tabs">
          <div
            className={`tab ${activeTab === "grow" ? "active" : ""}`}
            onClick={() => setActiveTab("grow")}
          >
            Grow
          </div>
          <div
            className={`tab ${activeTab === "catchup" ? "active" : ""}`}
            onClick={() => setActiveTab("catchup")}
          >
            Catch up
          </div>
        </div>

        {/* Invitations Box */}
        <InvitationsCard API_BASE={API_BASE} />

        {/* Games Section */}
        <GamesCard />

        {/* Hiring Section */}
        <HiringCard />

        {/* People You May Know */}
        <PeopleSuggestionsCard
          API_BASE={API_BASE}
          user={user}
          addToast={addToast}
        />
      </div>
    </div>
  );
}
