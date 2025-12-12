// src/Components/Jobs/Job.js
import React, { useEffect, useState } from "react";
import "./Job.css";
import { useToast } from "../../Contexts/ToastContext";
import ProfileHeaderCard from "../ProfileSidebar/ProfileHeaderCard";
import JobsSidebarCard from "./JobsSidebarCard";

export default function Job({ API_BASE }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

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
        addToast("Please login to view Jobs", { type: "error" });
        window.location.href = "/Login";
        return;
      }

      const me = await r.json();
      setUser(me);

      setAuthChecked(true);
    } catch (err) {
      console.error("Auth error:", err);
      addToast("Please login to continue", { type: "error" });
      window.location.href = "/Login";
    }
  }

  if (!authChecked) return null;

  return (
    <div className="jobs-page">
      {/* LEFT SIDEBAR */}
      <div className="jobs-left">
        {/* existing profile card */}
        {user && <ProfileHeaderCard user={user} />}

        {/* new preferences/my jobs/post job card */}
        <JobsSidebarCard />
      </div>

      {/* RIGHT SECTION */}
      <div className="jobs-right">
        {/* TOP PICKS */}
        <div className="jobs-box">
          <h2>Top job picks for you</h2>
          <p className="jobs-subtitle">
            Based on your profile, preferences, activity, and searches
          </p>

          <div className="job-item">
            <div className="job-logo"></div>
            <div className="job-info">
              <h4>EDS-Talent-Associate</h4>
              <p>EY • Trivandrum (On-site)</p>
              <p className="job-muted">Promoted</p>
            </div>
          </div>

          <div className="job-item">
            <div className="job-logo"></div>
            <div className="job-info">
              <h4>Associate Web Developer</h4>
              <p>ASSA ABLOY Group • Chennai</p>
              <p className="job-muted">Promoted</p>
            </div>
          </div>

          <div className="job-item">
            <div className="job-logo"></div>
            <div className="job-info">
              <h4>Software Engineer (Graduate 2026)</h4>
              <p>Google • Bengaluru</p>
              <p className="job-muted">Promoted</p>
            </div>
          </div>

          <div className="show-all">Show all →</div>
        </div>

        {/* RECENT SEARCHES */}
        <div className="jobs-box">
          <h2>Recent job searches</h2>

          <div className="recent-search">
            <p>software developer</p>
            <span>India</span>
          </div>

          <div className="recent-search">
            <p>software developer</p>
            <span>India</span>
          </div>
        </div>
      </div>
    </div>
  );
}
