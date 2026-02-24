// src/Components/Jobs/JobsSidebarCard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, List, PenSquare } from "lucide-react";
import "./Job.css";

export default function JobsSidebarCard() {
  const navigate = useNavigate();
  return (
    <div className="jobs-sidebar-card">
      <div className="jobs-sidebar-item">
        <List size={18} />
        <span>Preferences</span>
      </div>

      <div className="jobs-sidebar-item">
        <Bookmark size={18} />
        <span>My jobs</span>
      </div>

      <hr className="jobs-divider" />

      <div
        className="jobs-sidebar-item link-blue"
        onClick={() => navigate("/PostJob")}
      >
        <PenSquare size={18} />
        <span>Post a free job </span>
      </div>
    </div>
  );
}
