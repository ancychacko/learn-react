// src/Components/CommentMenu.js
import React, { useEffect, useRef } from "react";
import "./Comment.css";

export default function CommentMenu({
  isOwner,
  onEdit,
  onDelete,
  onWhoCanSee,
  onReport,
  onDontWantToSee,
  onFollow,
  username,
}) {
  const ref = useRef();

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        // close via custom event
        const ev = new CustomEvent("closeCommentMenus");
        window.dispatchEvent(ev);
      }
    }
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);

  return (
    <div className="comment-menu" ref={ref}>
      {isOwner ? (
        <ul className="menu-list">
          <li className="menu-item" onClick={onEdit}>
            Edit
          </li>
          <li className="menu-item" onClick={onDelete}>
            Delete
          </li>
          <li className="menu-item" onClick={onWhoCanSee}>
            Who can see this?
          </li>
        </ul>
      ) : (
        <ul className="menu-list">
          <li className="menu-item" onClick={onReport}>
            Report
          </li>
          <li className="menu-item" onClick={onDontWantToSee}>
            I don't want to see this
          </li>
          <li
            className="menu-item"
            onClick={() => onFollow && onFollow(username)}
          >
            Follow {username}
          </li>
        </ul>
      )}
    </div>
  );
}
