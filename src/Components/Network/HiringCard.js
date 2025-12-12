// src/Components/Network/HiringCard.js
import React from "react";

export default function HiringCard() {
  const hiringPeople = [
    {
      name: "LinkedIn Member",
      role: "Operational Support & Deputy ...",
    },
    {
      name: "LinkedIn Member",
      role: "Recruiter, HR, Admin and Training ...",
    },
  ];

  return (
    <div className="mynetwork-box">
      <p className="premium-tag">Premium</p>
      <h3 className="mynetwork-h2">People who are hiring for your role</h3>

      {hiringPeople.map((person, idx) => (
        <HiringPersonCard key={idx} name={person.name} role={person.role} />
      ))}
    </div>
  );
}

function HiringPersonCard({ name, role }) {
  return (
    <div className="hiring-card">
      <div className="hiring-avatar"></div>
      <div>
        <p className="hiring-name">{name}</p>
        <p className="hiring-role">{role}</p>
      </div>
      <button className="view-btn">View profile</button>
    </div>
  );
}
