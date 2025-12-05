// src/Pages/Messaging.js
import React, { useEffect, useState } from "react";
import "./Messaging.css";
import ConversationList from "../Components/Messaging/ConversationList";
import MessageThread from "../Components/Messaging/MessageThread";
import MessageInput from "../Components/Messaging/MessageInput";
import { Ellipsis, SquarePen } from "lucide-react";

export default function Messaging({ API_BASE, currentUser }) {
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);

  // Load conversation list
  async function loadConversations() {
    const r = await fetch(`${API_BASE}/api/messages/conversations`, {
      credentials: "include",
    });
    if (r.ok) setConversations(await r.json());
  }

  useEffect(() => {
    // Load immediately
    loadConversations();
    // Refresh every 10 second
  }, []);

  // Load selected chat
  async function loadChat(userId) {
    const r = await fetch(`${API_BASE}/api/messages/${userId}`, {
      credentials: "include",
    });

    if (r.ok) setMessages(await r.json());
  }

  function handleSelectUser(user) {
    setActiveUser(user);
    loadChat(user.id);
  }

  // SEND MESSAGE
  async function handleSendMessage(text, file) {
    const form = new FormData();
    form.append("receiver_id", activeUser.id);
    form.append("text", text);
    if (file) form.append("attachment", file);

    const r = await fetch(`${API_BASE}/api/messages/send`, {
      method: "POST",
      body: form,
      credentials: "include",
    });

    if (r.ok) {
      loadChat(activeUser.id);
      loadConversations();
    }
  }

  return (
    <div className="messaging-page-wrapper">
      {/* Centered messaging card */}
      <div className="messaging-outer-center">
        <div className="messaging-container">
          {/* Top: header (search + icons) */}
          <div className="messaging-header">
            <div className="messaging-header-left">
              <div className="messaging-header-title">Messaging</div>
              <input
                className="messaging-search-box"
                placeholder="Search messages"
                aria-label="Search messages"
              />
            </div>

            <div className="messaging-header-right">
              <button className="header-icon-btn" aria-label="More">
                <Ellipsis size={20} color="black" />
              </button>
              <button className="header-icon-btn" aria-label="Compose">
                <SquarePen size={16} color="black" />
              </button>
            </div>
          </div>

          {/* Filters row */}
          <div className="messaging-filter-bar">
            <div className="filter-pill active">Focused</div>
            <div className="filter-pill">Jobs</div>
            <div className="filter-pill">Unread</div>
            <div className="filter-pill">Connections</div>
            <div className="filter-pill">InMail</div>
            <div className="filter-pill">Starred</div>
          </div>

          {/* Body: two panels. only these panels scroll internally */}
          <div className="messaging-body">
            {/* LEFT: conversation list (scrollable) */}
            <div className="sidebar">
              <div className="conversation-list scroll-y">
                <ConversationList
                  conversations={conversations}
                  activeUser={activeUser}
                  onSelect={handleSelectUser}
                />
              </div>
            </div>

            {/* RIGHT: chat panel (thread scroll + fixed input) */}
            <div className="chat-panel">
              <div className="thread">
                {activeUser ? (
                  <MessageThread
                    messages={messages}
                    currentUser={currentUser}
                  />
                ) : (
                  <div className="empty-thread">Select a conversation</div>
                )}
              </div>

              {/* Fixed input at bottom of chat panel */}
              <div className="message-input-wrapper">
                {/* keep MessageInput API the same */}
                <MessageInput onSend={handleSendMessage} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
