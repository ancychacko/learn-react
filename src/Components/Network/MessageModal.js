// src/Components/Network/MessageModal.js
import React, { useState, useEffect, useRef } from "react";
import { X, Minimize2, Image, Paperclip, Smile } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useClickOutside from "../../Hooks/useClickOutside";
import "./MessageModal.css";

export default function NewMessageModal({
  isOpen,
  onClose,
  preselectedUser,
  API_BASE,
}) {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const modalRef = useRef(null);
  const searchInputRef = useRef(null);
  const modalContentRef = useRef(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Focus search input when modal opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Set preselected user if provided
  useEffect(() => {
    if (preselectedUser && isOpen) {
      setSelectedUsers([preselectedUser]);
      setSearchQuery("");
    }
  }, [preselectedUser, isOpen]);

  // Search connections
  useEffect(() => {
    if (searchQuery.trim()) {
      searchConnections();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  async function searchConnections() {
    setIsSearching(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/network/connections/search?query=${encodeURIComponent(
          searchQuery
        )}`,
        { credentials: "include" }
      );

      if (res.ok) {
        const data = await res.json();
        // Filter out already selected users
        const filtered = data.filter(
          (user) => !selectedUsers.some((selected) => selected.id === user.id)
        );
        setSearchResults(filtered);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSelectUser(user) {
    setSelectedUsers((prev) => [...prev, user]);
    setSearchQuery("");
    setSearchResults([]);
    searchInputRef.current?.focus();
  }

  function handleRemoveUser(userId) {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
    searchInputRef.current?.focus();
  }

  async function handleSendMessage() {
    if (!message.trim() || selectedUsers.length === 0 || sending) return;

    setSending(true);
    try {
      // Send message to each selected user
      const promises = selectedUsers.map((user) =>
        fetch(`${API_BASE}/api/messages/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            receiverId: user.id,
            content: message.trim(),
          }),
        })
      );

      const results = await Promise.all(promises);

      if (results.every((res) => res.ok)) {
        // Navigate to messaging page
        if (selectedUsers.length === 1) {
          navigate(`/messaging/${selectedUsers[0].id}`);
        } else {
          navigate("/messaging");
        }
        handleClose();
      }
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setSelectedUsers([]);
    setSearchQuery("");
    setSearchResults([]);
    setMessage("");
    onClose();
  }

  function handleKeyDown(e) {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }

    // Remove last chip on Backspace when input is empty
    if (e.key === "Backspace" && !searchQuery && selectedUsers.length > 0) {
      handleRemoveUser(selectedUsers[selectedUsers.length - 1].id);
    }
  }

  if (!isOpen) return null;

  const showSearch = selectedUsers.length === 0 || searchQuery.length > 0;

  return (
    <div className="message-modal-overlay">
      <div className="message-modal" ref={modalRef}>
        {/* Header */}
        <div className="message-modal-header">
          <h2>New message</h2>
          <div className="message-modal-actions">
            <button className="icon-btn" onClick={handleClose}>
              <Minimize2 size={20} />
            </button>
            <button className="icon-btn" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Recipients Section */}
        <div className="message-modal-recipients">
          <div className="recipients-input-wrapper">
            {selectedUsers.map((user) => (
              <UserChip key={user.id} user={user} onRemove={handleRemoveUser} />
            ))}

            <input
              ref={searchInputRef}
              type="text"
              placeholder={
                selectedUsers.length === 0
                  ? "Type a name or multiple names"
                  : ""
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="recipients-input"
            />
          </div>

          {/* Search Results */}
          {showSearch && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((user) => (
                <SearchResultItem
                  key={user.id}
                  user={user}
                  onSelect={handleSelectUser}
                  API_BASE={API_BASE}
                />
              ))}
            </div>
          )}

          {showSearch &&
            searchQuery &&
            searchResults.length === 0 &&
            !isSearching && (
              <div className="no-results">No connections found</div>
            )}
        </div>

        {/* User Info (when user is selected) */}
        {selectedUsers.length > 0 && !searchQuery && (
          <div className="selected-user-info" ref={modalContentRef}>
            {selectedUsers.map((user) => (
              <div key={user.id} className="user-info-card">
                <img
                  src={
                    user.avatar_url
                      ? `${API_BASE}${user.avatar_url}`
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={user.name}
                  className="user-info-avatar"
                />
                <div className="user-info-details">
                  <h3 className="user-info-name">
                    {user.name} <span className="user-pronouns">(He/Him)</span>{" "}
                    <span className="user-degree">• 1st</span>
                  </h3>
                  <p className="user-info-title">
                    {user.title || "Professional"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message Input */}
        <div className="message-modal-body">
          <textarea
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="message-textarea"
            disabled={selectedUsers.length === 0}
          />
        </div>

        {/* Footer */}
        <div className="message-modal-footer">
          <div className="message-tools">
            <button className="tool-btn" title="Attach image">
              <Image size={20} />
            </button>
            <button className="tool-btn" title="Attach file">
              <Paperclip size={20} />
            </button>
            <button className="tool-btn" title="GIF">
              GIF
            </button>
            <button className="tool-btn" title="Emoji">
              <Smile size={20} />
            </button>
          </div>
          <div className="message-actions">
            <button className="more-btn">•••</button>
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={
                !message.trim() || selectedUsers.length === 0 || sending
              }
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// User Chip Component
function UserChip({ user, onRemove }) {
  return (
    <div className="user-chip">
      <span className="chip-name">{user.name}</span>
      <button
        className="chip-remove"
        onClick={() => onRemove(user.id)}
        aria-label="Remove"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// Search Result Item Component
function SearchResultItem({ user, onSelect, API_BASE }) {
  const avatar = user.avatar_url
    ? `${API_BASE}${user.avatar_url}`
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <div className="search-result-item" onClick={() => onSelect(user)}>
      <img src={avatar} alt={user.name} className="result-avatar" />
      <div className="result-info">
        <p className="result-name">{user.name}</p>
        <p className="result-title">{user.title || "Professional"}</p>
      </div>
    </div>
  );
}
