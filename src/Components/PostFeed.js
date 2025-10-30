import React, { useEffect, useState } from "react";
import Post from "./Post";
import "./Welcome.css";

export default function PostFeed({ API_BASE }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");

  async function fetchPosts() {
    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  async function handlePostSubmit(e) {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      const res = await fetch(`${API_BASE}/api/createPost`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost }),
      });
      if (res.ok) {
        setNewPost("");
        fetchPosts();
      }
    } catch (err) {
      console.error("Create post failed:", err);
    }
  }

  return (
    <div className="feed-container">
      <form onSubmit={handlePostSubmit} className="create-post">
        <textarea
          placeholder="Start a post..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button type="submit">Post</button>
      </form>

      <div className="posts-list">
        {posts.map((p) => (
          <Post key={p.id} post={p} />
        ))}
      </div>
    </div>
  );
}
