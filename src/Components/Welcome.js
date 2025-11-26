// src/Components/Welcome.js
import React, { useEffect, useState } from "react";
import Header from "./Header";
import PostField from "./PostField";
import RightSidebar from "./RightSidebar";
import "./Welcome.css";
import ProfileHeaderCard from "./ProfileSidebar/ProfileHeaderCard";
import AnalyticsCard from "./ProfileSidebar/AnalyticsCard";
import LinksCard from "./ProfileSidebar/LinksCard";
import PremiumCard from "./ProfileSidebar/PremiumCard";

export default function Welcome() {
  const API_BASE =
    process.env.REACT_APP_API_BASE ||
    `${window.location.protocol}//${window.location.hostname}:4000`;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the current user (session-based)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
        if (r.status === 401) {
          // not logged in
          window.location.href = "/Login";
          return;
        }
        const body = await r.json();
        if (mounted) setUser(body);
      } catch (e) {
        console.error("Failed fetching /api/me:", e);
        window.location.href = "/Login";
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [API_BASE]);

  // Handler passed to ProfileCard so it can update the user in the parent:
  function handleProfileUpdate(updatedFields) {
    // updatedFields is expected to contain new avatar_url and/or about/name
    setUser((prev) => ({ ...prev, ...(prev ? updatedFields : {}) }));
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return null;

  return (
    <>
      {/* pass user so Header can show avatar immediately */}
      <Header API_BASE={API_BASE} user={user} />

      <div className="home-grid">
        <aside className="left-col">
          <ProfileHeaderCard
            user={user}
            API_BASE={API_BASE}
            onUpdate={handleProfileUpdate}
          />
          <AnalyticsCard />
          <PremiumCard />
          <LinksCard />
        </aside>

        <main className="center-col">
          {/* <PostField API_BASE={API_BASE} currentUserId={user.id} /> */}
          <PostField
            API_BASE={API_BASE}
            currentUserId={user.name}
            currentUser={user}
          />
        </main>

        <aside className="right-col">
          <RightSidebar API_BASE={API_BASE} />
        </aside>
      </div>
    </>
  );
}
