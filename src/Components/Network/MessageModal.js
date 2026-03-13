//src/Components/Network/MessageModal.js
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Image,
  Paperclip,
  Smile,
  Send,
  Plus,
  ChevronDown,
  ChevronUp,
  Ellipsis,
} from "lucide-react";
import "./MessageModal.css";

export default function NewMessageModal({
  isOpen,
  onClose,
  preselectedUser,
  API_BASE,
  currentUserId,
}) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTextareaExpanded, setIsTextareaExpanded] = useState(false);

  const searchInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
   
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (preselectedUser && isOpen) {
      setSelectedUsers([preselectedUser]);
      setSearchQuery("");
      loadChatHistory(preselectedUser.id);
    }
  }, [preselectedUser, isOpen]);

  async function loadChatHistory(userId) {
    try {
      const res = await fetch(`${API_BASE}/api/messages/chat/${userId}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Load chat error:", err);
    }
  }

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
        `${API_BASE}/api/network/connections/search?query=${encodeURIComponent(searchQuery)}`,
        { credentials: "include" },
      );
      if (res.ok) {
        const data = await res.json();
        const filtered = data.filter(
          (user) => !selectedUsers.some((sel) => sel.id === user.id),
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
    const newSelected = [...selectedUsers, user];
    setSelectedUsers(newSelected);
    setSearchQuery("");
    setSearchResults([]);

    if (newSelected.length === 1) {
      loadChatHistory(user.id);
    } else {
      setMessages([]);
    }

    searchInputRef.current?.focus();
  }

  function handleRemoveUser(userId) {
    const remaining = selectedUsers.filter((u) => u.id !== userId);
    setSelectedUsers(remaining);

    if (remaining.length === 0) {
      setMessages([]);
    } else if (remaining.length === 1) {
      loadChatHistory(remaining[0].id);
    }

    searchInputRef.current?.focus();
  }

  async function handleSendMessage(e) {
    e?.preventDefault();
    if (!message.trim() || selectedUsers.length === 0 || sending) return;

    setSending(true);
    const messageText = message.trim();

    try {
      const promises = selectedUsers.map((user) =>
        fetch(`${API_BASE}/api/messages/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ receiver_id: user.id, text: messageText }),
        }),
      );

      const results = await Promise.all(promises);

      if (results.every((res) => res.ok)) {
        if (selectedUsers.length === 1) {
          const data = await results[0].json();
          setMessages((prev) => [
            ...prev,
            {
              id: data.message.id,
              sender_id: data.message.sender_id,
              receiver_id: data.message.receiver_id,
              message_text: messageText,
              created_at: data.message.created_at,
            },
          ]);
        }
        setMessage("");
        textareaRef.current?.focus();
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
    setMessages([]);
    setGroupName("");
    setIsMinimized(false);
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && selectedUsers.length > 0) {
      e.preventDefault();
      handleSendMessage();
    }
    if (e.key === "Backspace" && !searchQuery && selectedUsers.length > 0) {
      handleRemoveUser(selectedUsers[selectedUsers.length - 1].id);
    }
  }

  if (!isOpen) return null;

  const showChat = selectedUsers.length === 1 && !searchQuery;
  const isMultipleUsers = selectedUsers.length > 1;
  const showSearchResults = searchQuery.trim().length > 0;

  return (
    <div className={`mm-modal ${isMinimized ? "mm-minimized" : ""}`}>
      {/* Header */}
      <div
        className="mm-header"
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <div className="mm-header-left">
          {isMinimized && selectedUsers.length > 0 ? (
            <div className="mm-header-avatars">
              {selectedUsers.slice(0, 2).map((u) => (
                <img
                  key={u.id}
                  src={
                    u.avatar_url
                      ? `${API_BASE}${u.avatar_url}`
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={u.name}
                  className="mm-header-avatar"
                />
              ))}
            </div>
          ) : null}
          <span className="mm-header-title">
            {isMinimized && selectedUsers.length > 0
              ? selectedUsers.length === 1
                ? selectedUsers[0].name
                : `${selectedUsers[0].name} & ${selectedUsers.length - 1} more`
              : "New message"}
          </span>
        </div>
        <div className="mm-header-actions" onClick={(e) => e.stopPropagation()}>7
          <button
            className="mm-icon-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button className="mm-icon-btn" onClick={handleClose} title="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {!isMinimized && (
        <>
          {/* Recipients row */}
          <div className="mm-recipients-row">
            <div className="mm-recipients-input-area">
              {selectedUsers.map((user) => (
                <UserChip
                  key={user.id}
                  user={user}
                  onRemove={handleRemoveUser}
                />
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
                className="mm-search-input"
              />
            </div>
            {selectedUsers.length > 0 && (
              <button
                className="mm-add-btn"
                title="Add recipient"
                onClick={() => searchInputRef.current?.focus()}
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          {/* Search dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="mm-search-dropdown">
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
          {showSearchResults && searchResults.length === 0 && !isSearching && (
            <div className="mm-no-results">No connections found</div>
          )}

          {/* Single user profile card */}
          {showChat && (
            <>
              <div className="mm-profile-card">
                <img
                  src={
                    selectedUsers[0].avatar_url
                      ? `${API_BASE}${selectedUsers[0].avatar_url}`
                      : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={selectedUsers[0].name}
                  className="mm-profile-avatar"
                />
                <div className="mm-profile-info">
                  <h3 className="mm-profile-name">
                    {selectedUsers[0].name}
                    {selectedUsers[0].pronouns && (
                      <span className="mm-profile-pronouns">
                        {" "}
                        ({selectedUsers[0].pronouns})
                      </span>
                    )}
                    <span className="mm-profile-degree"> · 1st</span>
                  </h3>
                  <p className="mm-profile-title">
                    {selectedUsers[0].title || "Professional"}
                  </p>
                </div>
              </div>

              <div className="mm-messages-area">
                {messages.length === 0 ? (
                  <div className="mm-empty-chat">
                    <p>Start a conversation with {selectedUsers[0].name}</p>
                  </div>
                ) : (
                  <div className="mm-messages-list">
                    {groupMessagesByDate(messages).map((item, idx) => {
                      if (item.type === "date") {
                        return (
                          <DateSeparator key={`date-${idx}`} date={item.date} />
                        );
                      }
                      return (
                        <MessageBubble
                          key={item.data.id || idx}
                          message={item.data}
                          API_BASE={API_BASE}
                          currentUserId={currentUserId}
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Multiple users */}
          {isMultipleUsers && !searchQuery && (
            <div className="mm-multi-users">
              <p className="mm-multi-label">Suggested</p>
            </div>
          )}

          {/* Message composer */}
          {selectedUsers.length > 0 && (
            <div className="mm-composer">
              <div className="mm-textarea-wrap">
                <textarea
                  ref={textareaRef}
                  placeholder="Write a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`mm-textarea ${isTextareaExpanded ? "mm-textarea-expanded" : ""}`}
                  rows={isTextareaExpanded ? 8 : 3}
                />
                <button
                  className="mm-collapse-btn"
                  title={isTextareaExpanded ? "Collapse" : "Expand"}
                  onClick={() => setIsTextareaExpanded((prev) => !prev)}
                  type="button"
                >
                  {isTextareaExpanded ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronUp size={16} />
                  )}
                </button>
              </div>
              <div className="mm-footer">
                <div className="mm-tools">
                  <button className="mm-tool-btn" title="Attach image">
                    <Image size={20} />
                  </button>
                  <button className="mm-tool-btn" title="Attach file">
                    <Paperclip size={20} />
                  </button>
                  <button className="mm-tool-btn mm-tool-gif" title="GIF">
                    GIF
                  </button>
                  <button className="mm-tool-btn" title="Emoji">
                    <Smile size={20} />
                  </button>
                </div>
                <div className="mm-footer-actions">
                  <button className="mm-more-btn" title="More options">
                    <Ellipsis size={20} />
                  </button>
                  <button
                    className={`mm-send-btn ${message.trim() ? "active" : ""}`}
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                  >
                    {sending ? "Sending..." : <Send size={20} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty state - no user selected yet */}
          {selectedUsers.length === 0 && !searchQuery && (
            <div className="mm-empty-state">
              <div className="mm-composer mm-composer-empty">
                <div className="mm-textarea-wrap">
                  <textarea
                    placeholder="Write a message..."
                    className="mm-textarea"
                    rows={3}
                    disabled
                  />
                </div>
                <div className="mm-footer">
                  <div className="mm-tools">
                    <button className="mm-tool-btn" disabled>
                      <Image size={20} />
                    </button>
                    <button className="mm-tool-btn" disabled>
                      <Paperclip size={20} />
                    </button>
                    <button className="mm-tool-btn mm-tool-gif" disabled>
                      GIF
                    </button>
                    <button className="mm-tool-btn" disabled>
                      <Smile size={20} />
                    </button>
                  </div>
                  <div className="mm-footer-actions">
                    <button className="mm-more-btn" disabled>
                      <Ellipsis size={20} />
                    </button>
                    <button className="mm-send-btn" disabled>
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function UserChip({ user, onRemove }) {
  return (
    <div className="mm-chip">
      <span className="mm-chip-name">
        {user.name || user.first_name || "User"}
      </span>
      <button
        className="mm-chip-remove"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(user.id);
        }}
        aria-label="Remove"
        type="button"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function SearchResultItem({ user, onSelect, API_BASE }) {
  const avatar = user.avatar_url
    ? `${API_BASE}${user.avatar_url}`
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <div className="mm-result-item" onClick={() => onSelect(user)}>
      <div className="mm-result-avatar-wrap">
        <img src={avatar} alt={user.name} className="mm-result-avatar" />
        <span className="mm-result-online-dot" />
      </div>
      <div className="mm-result-info">
        <p className="mm-result-name">
          {user.name} <span className="mm-result-degree">• 1st</span>
        </p>
        <p className="mm-result-title">{user.title || "Professional"}</p>
      </div>
    </div>
  );
}

function MessageBubble({ message, API_BASE, currentUserId }) {
  const isSent = message.sender_id === currentUserId;

  const formatTime = (ts) => {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const senderAvatar = message.sender_avatar_url
    ? `${API_BASE}${message.sender_avatar_url}`
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <div className={`mm-bubble-wrap ${isSent ? "mm-sent" : "mm-received"}`}>
      {!isSent && (
        <img
          src={senderAvatar}
          alt={message.sender_name}
          className="mm-bubble-avatar"
        />
      )}
      <div className="mm-bubble-content">
        {!isSent && (
          <div className="mm-bubble-meta">
            <span className="mm-bubble-sender">{message.sender_name}</span>
            <span className="mm-bubble-checkmark">✓</span>
            <span className="mm-bubble-time">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}
        <div
          className={`mm-bubble ${isSent ? "mm-bubble-sent" : "mm-bubble-received"}`}
        >
          <p>{message.message_text || message.text}</p>
        </div>
        {isSent && (
          <div className="mm-bubble-time-sent">
            <span className="mm-bubble-checkmark-sent">✓✓</span>
            <span>{formatTime(message.created_at)}</span>
          </div>
        )}
      </div>
      {isSent && (
        <img
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
          alt="you"
          className="mm-bubble-avatar mm-bubble-avatar-sent"
        />
      )}
    </div>
  );
}

function DateSeparator({ date }) {
  const formatDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dStr = d.toDateString();
    if (dStr === today.toDateString()) return "TODAY";
    if (dStr === yesterday.toDateString()) return "YESTERDAY";

    const diffDays = Math.floor((today - d) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return d.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    }
    if (d.getFullYear() === today.getFullYear()) {
      return d
        .toLocaleDateString("en-US", { month: "short", day: "numeric" })
        .toUpperCase();
    }
    return d
      .toLocaleDateString("en-US", { month: "short", year: "numeric" })
      .toUpperCase();
  };

  return (
    <div className="mm-date-sep">
      <span className="mm-date-sep-text">{formatDate(date)}</span>
    </div>
  );
}

function groupMessagesByDate(messages) {
  const grouped = [];
  let currentDate = null;
  messages.forEach((msg) => {
    const msgDate = new Date(msg.created_at).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      grouped.push({ type: "date", date: msg.created_at });
    }
    grouped.push({ type: "message", data: msg });
  });
  return grouped;
}
