// src/Components/Post.js
import React from "react";
import "./Welcome.css";

export default function Post({ post }) {
  return (
    <div className="post-card">
      <div className="post-header">
        <strong>{post.author}</strong>
        <span className="post-time">{post.time}</span>
      </div>
      <p className="post-content">{post.content}</p>
    </div>
  );
}
