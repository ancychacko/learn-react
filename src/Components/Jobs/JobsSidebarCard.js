// src/Components/Jobs/JobsSidebarCard.js
import React from "react";
import { Bookmark, List, PenSquare } from "lucide-react";
import "./Job.css";

export default function JobsSidebarCard() {
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

      <div className="jobs-sidebar-item link-blue">
        <PenSquare size={18} />
        <span>Post a free job</span>
      </div>
    </div>
  );
}
