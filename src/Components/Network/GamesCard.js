// src/Components/Network/GamesCard.js
import React from "react";

export default function GamesCard() {
  const games = [
    { title: "Tango #430", subtitle: "2 connections played" },
    { title: "Crossclimb #590", subtitle: "1 connection played" },
    { title: "Pinpoint #590", subtitle: "1-day streak" },
  ];

  return (
    <div className="mynetwork-box">
      <p className="mynetwork-section-title">
        7 connections proved their puzzle skills. Join in.
      </p>

      <div className="mynetwork-games">
        {games.map((game, idx) => (
          <GameItem key={idx} title={game.title} subtitle={game.subtitle} />
        ))}
      </div>
    </div>
  );
}

function GameItem({ title, subtitle }) {
  return (
    <div className="game-item">
      <div className="game-icon" />
      <div className="game-info">
        <p className="game-title">{title}</p>
        <p className="game-subtitle">{subtitle}</p>
      </div>
      <button className="solve-btn">Solve</button>
    </div>
  );
}
