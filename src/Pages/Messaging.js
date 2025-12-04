// //src/Pages/Messaging.js
// import React, { useEffect, useState } from "react";
// import "./Messaging.css";
// import ConversationList from "../Components/Messaging/ConversationList";
// import MessageThread from "../Components/Messaging/MessageThread";
// import MessageInput from "../Components/Messaging/MessageInput";
// import { Ellipsis, Pencil } from "lucide-react";

// export default function Messaging({ API_BASE, currentUser }) {
//   const [conversations, setConversations] = useState([]);
//   const [activeUser, setActiveUser] = useState(null);
//   const [messages, setMessages] = useState([]);

//   // Load conversation list
//   async function loadConversations() {
//     const r = await fetch(`${API_BASE}/api/messages/conversations`, {
//       credentials: "include",
//     });

//     if (r.ok) setConversations(await r.json());
//   }

//   useEffect(() => {
//     loadConversations();
//   }, []);

//   // Load selected chat
//   async function loadChat(userId) {
//     const r = await fetch(`${API_BASE}/api/messages/${userId}`, {
//       credentials: "include",
//     });

//     if (r.ok) setMessages(await r.json());
//   }

//   function handleSelectUser(user) {
//     setActiveUser(user);
//     loadChat(user.id);
//   }

//   // SEND MESSAGE
//   async function handleSendMessage(text, file) {
//     const form = new FormData();
//     form.append("receiver_id", activeUser.id);
//     form.append("text", text);
//     if (file) form.append("attachment", file);

//     const r = await fetch(`${API_BASE}/api/messages/send`, {
//       method: "POST",
//       body: form,
//       credentials: "include",
//     });

//     if (r.ok) {
//       loadChat(activeUser.id);
//       loadConversations();
//     }
//   }

//   return (
//     <>
//       {/* ============================
//           LINKEDIN TOP MESSAGING HEADER
//       ============================ */}
//       <div className="messaging-header">
//         <div className="messaging-header-left">
//           <div className="messaging-header-title">Messaging</div>
//           <input
//             className="messaging-search-box"
//             placeholder="Search messages"
//           />
//         </div>

//         <div className="messaging-header-right">
//           <button className="header-icon-btn">
//             <Ellipsis size={20} color="black" />
//           </button>
//           <button className="header-icon-btn">
//             <Pencil size={16} color="black" />
//           </button>
//         </div>
//       </div>

//       {/* ============================
//           FILTER BAR (Focused, Jobs, Unread...)
//       ============================ */}
//       <div className="messaging-filter-bar">
//         <div className="filter-pill active">Focused</div>
//         <div className="filter-pill">Jobs</div>
//         <div className="filter-pill">Unread</div>
//         <div className="filter-pill">Connections</div>
//         <div className="filter-pill">InMail</div>
//         <div className="filter-pill">Starred</div>
//       </div>

//       {/* ============================
//           MAIN BODY (left + right panels)
//       ============================ */}
//       <div className="messaging-container">
//         <ConversationList
//           conversations={conversations}
//           activeUser={activeUser}
//           onSelect={handleSelectUser}
//         />

//         <div className="messaging-right">
//           {activeUser ? (
//             <>
//               <MessageThread messages={messages} currentUser={currentUser} />
//               <MessageInput onSend={handleSendMessage} />
//             </>
//           ) : (
//             <div className="empty-thread">Select a conversation</div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// src/Pages/Messaging.js
import React, { useEffect, useState } from "react";
import "./Messaging.css";
import ConversationList from "../Components/Messaging/ConversationList";
import MessageThread from "../Components/Messaging/MessageThread";
import MessageInput from "../Components/Messaging/MessageInput";
import { Ellipsis, Pencil } from "lucide-react";

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
    loadConversations();
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
      {/* ============================
          FIXED HEADER
      ============================ */}
      <div className="messaging-header">
        <div className="messaging-header-left">
          <div className="messaging-header-title">Messaging</div>
          <input
            className="messaging-search-box"
            placeholder="Search messages"
          />
        </div>

        <div className="messaging-header-right">
          <button className="header-icon-btn">
            <Ellipsis size={20} color="black" />
          </button>
          <button className="header-icon-btn">
            <Pencil size={16} color="black" />
          </button>
        </div>
      </div>

      {/* ============================
          FIXED FILTER BAR
      ============================ */}
      <div className="messaging-filter-bar">
        <div className="filter-pill active">Focused</div>
        <div className="filter-pill">Jobs</div>
        <div className="filter-pill">Unread</div>
        <div className="filter-pill">Connections</div>
        <div className="filter-pill">InMail</div>
        <div className="filter-pill">Starred</div>
      </div>

      {/* ============================
          CENTERED MESSAGING BODY
      ============================ */}
      <div className="messaging-outer-center">
        <div className="messaging-container">
          <ConversationList
            conversations={conversations}
            activeUser={activeUser}
            onSelect={handleSelectUser}
          />

          <div className="messaging-right">
            {activeUser ? (
              <>
                <MessageThread messages={messages} currentUser={currentUser} />
                <MessageInput onSend={handleSendMessage} />
              </>
            ) : (
              <div className="empty-thread">Select a conversation</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
