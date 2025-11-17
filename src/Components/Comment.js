//src/Components/Comment.js
import React from "react";
import CommentList from "./CommentList";
import "./Comment.css";

export default function Comment({
  API_BASE = "",
  postId,
  currentUser,
  onCountChange,
}) {
  return (
    <div className="comment-section">
      <CommentList
        API_BASE={API_BASE}
        postId={postId}
        currentUser={currentUser}
        onCountChange={onCountChange}
      />
    </div>
  );
}
