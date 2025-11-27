// src/Components/PostView.js
import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import Post from "./Post";

export default function PostView({ API_BASE = "" }) {
  const { id } = useParams();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);

  const commentRef = useRef(null);

  const commentId = location.state?.commentId || null;

  useEffect(() => {
    loadMe();
    loadPost();
  }, []);

  async function loadMe() {
    const r = await fetch(`${API_BASE}/api/me`, { credentials: "include" });
    if (r.ok) setUser(await r.json());
  }

  async function loadPost() {
    const r = await fetch(`${API_BASE}/api/posts/${id}`, {
      credentials: "include",
    });
    if (r.ok) {
      const data = await r.json();
      setPost(data);

      // scroll to comment if present
      setTimeout(() => {
        if (commentId) {
          const el = document.getElementById(`comment-${commentId}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }

  if (!post) return <div style={{ padding: 40 }}>Loading post…</div>;

  return (
    <div style={{ maxWidth: 700, margin: "90px auto" }}>
      <Post
        post={post}
        API_BASE={API_BASE}
        currentUser={user}
        currentUserName={user?.name}
        refresh={loadPost}
      />
    </div>
  );
}
