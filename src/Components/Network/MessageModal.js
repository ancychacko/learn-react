// src/Components/Network/MessageModal.js
// import React, { useState, useEffect, useRef } from "react";
// import {
//   X,
//   Minimize2,
//   Maximize2,
//   Image,
//   Paperclip,
//   Smile,
//   Send,
//   Plus,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import "./MessageModal.css";

// export default function NewMessageModal({
//   isOpen,
//   onClose,
//   preselectedUser,
//   API_BASE,
// }) {
//   const navigate = useNavigate();
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [message, setMessage] = useState("");
//   const [groupName, setGroupName] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [sending, setSending] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);
//   const [isMinimized, setIsMinimized] = useState(false);

//   const modalRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const textareaRef = useRef(null);

//   // Scroll to bottom when new messages arrive
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Prevent body scroll when modal is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//       setTimeout(() => searchInputRef.current?.focus(), 100);
//     } else {
//       document.body.style.overflow = "unset";
//     }

//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   // Set preselected user and load chat history
//   useEffect(() => {
//     if (preselectedUser && isOpen) {
//       setSelectedUsers([preselectedUser]);
//       setSearchQuery("");
//       loadChatHistory(preselectedUser.id);
//     }
//   }, [preselectedUser, isOpen]);

//   // Load existing chat messages (only for single user)
//   async function loadChatHistory(userId) {
//     try {
//       const res = await fetch(`${API_BASE}/api/messages/chat/${userId}`, {
//         credentials: "include",
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setMessages(data);
//       }
//     } catch (err) {
//       console.error("Load chat error:", err);
//     }
//   }

//   // Search connections
//   useEffect(() => {
//     if (searchQuery.trim()) {
//       searchConnections();
//     } else {
//       setSearchResults([]);
//     }
//   }, [searchQuery]);

//   async function searchConnections() {
//     setIsSearching(true);
//     try {
//       const res = await fetch(
//         `${API_BASE}/api/network/connections/search?query=${encodeURIComponent(
//           searchQuery
//         )}`,
//         { credentials: "include" }
//       );

//       if (res.ok) {
//         const data = await res.json();
//         const filtered = data.filter(
//           (user) => !selectedUsers.some((selected) => selected.id === user.id)
//         );
//         setSearchResults(filtered);
//       }
//     } catch (err) {
//       console.error("Search error:", err);
//     } finally {
//       setIsSearching(false);
//     }
//   }

//   // ✅ FIXED: Allow multiple user selection
//   function handleSelectUser(user) {
//     setSelectedUsers((prev) => [...prev, user]); // Add to array
//     setSearchQuery("");
//     setSearchResults([]);

//     // Only load chat history if it's the first and only user
//     if (selectedUsers.length === 0) {
//       loadChatHistory(user.id);
//     } else {
//       // Clear messages when multiple users selected
//       setMessages([]);
//     }

//     searchInputRef.current?.focus();
//   }

//   function handleRemoveUser(userId) {
//     setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));

//     // If removing last user, clear messages
//     if (selectedUsers.length === 1) {
//       setMessages([]);
//     }
//     // If only one user left after removal, load their chat
//     else if (selectedUsers.length === 2) {
//       const remainingUser = selectedUsers.find((u) => u.id !== userId);
//       if (remainingUser) {
//         loadChatHistory(remainingUser.id);
//       }
//     }

//     searchInputRef.current?.focus();
//   }

//   async function handleSendMessage(e) {
//     e?.preventDefault();
//     if (!message.trim() || selectedUsers.length === 0 || sending) return;

//     setSending(true);
//     const messageText = message.trim();

//     try {
//       // Send to all selected users
//       const promises = selectedUsers.map((user) =>
//         fetch(`${API_BASE}/api/messages/send`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify({
//             receiver_id: user.id,
//             text: messageText,
//           }),
//         })
//       );

//       const results = await Promise.all(promises);

//       if (results.every((res) => res.ok)) {
//         // For single user, add message to chat
//         if (selectedUsers.length === 1) {
//           const data = await results[0].json();
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: data.message.id,
//               sender_id: data.message.sender_id,
//               receiver_id: data.message.receiver_id,
//               message_text: messageText,
//               created_at: data.message.created_at,
//             },
//           ]);
//         }

//         // Clear input
//         setMessage("");
//         textareaRef.current?.focus();
//       } else {
//         console.error("Some messages failed to send");
//       }
//     } catch (err) {
//       console.error("Send error:", err);
//     } finally {
//       setSending(false);
//     }
//   }

//   function handleClose() {
//     setSelectedUsers([]);
//     setSearchQuery("");
//     setSearchResults([]);
//     setMessage("");
//     setMessages([]);
//     setGroupName("");
//     setIsMinimized(false);
//     onClose();
//   }

//   function toggleMinimize() {
//     setIsMinimized(!isMinimized);
//   }

//   function handleKeyDown(e) {
//     // Send on Enter (without Shift)
//     if (e.key === "Enter" && !e.shiftKey && selectedUsers.length > 0) {
//       e.preventDefault();
//       handleSendMessage();
//     }

//     // Remove last chip on Backspace when input is empty
//     if (e.key === "Backspace" && !searchQuery && selectedUsers.length > 0) {
//       handleRemoveUser(selectedUsers[selectedUsers.length - 1].id);
//     }
//   }

//   if (!isOpen) return null;

//   const showSearch = selectedUsers.length === 0 || searchQuery.length > 0;
//   const showChat = selectedUsers.length === 1 && !searchQuery;
//   const isSingleUser = selectedUsers.length === 1;
//   const isMultipleUsers = selectedUsers.length > 1;

//   return (
//     <div className="message-modal-overlay">
//       <div
//         className={`message-modal ${isMinimized ? "minimized" : ""}`}
//         ref={modalRef}
//       >
//         {/* Header */}
//         <div className="message-modal-header">
//           <div className="header-left">
//             <h2>New message</h2>
//             {selectedUsers.length > 0 && (
//               <span className="header-recipient">
//                 {isSingleUser
//                   ? `to: ${selectedUsers[0].name}`
//                   : `${selectedUsers.length} recipients`}
//               </span>
//             )}
//           </div>
//           <div className="message-modal-actions">
//             <button
//               className="icon-btn"
//               onClick={toggleMinimize}
//               title={isMinimized ? "Maximize" : "Minimize"}
//             >
//               {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
//             </button>
//             <button className="icon-btn" onClick={handleClose} title="Close">
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         {/* EXPANDED VIEW */}
//         {!isMinimized && (
//           <>
//             {/* Recipients Section */}
//             <div className="message-modal-recipients">
//               <div className="recipients-input-wrapper">
//                 {selectedUsers.map((user) => (
//                   <UserChip
//                     key={user.id}
//                     user={user}
//                     onRemove={handleRemoveUser}
//                   />
//                 ))}

//                 <input
//                   ref={searchInputRef}
//                   type="text"
//                   placeholder={
//                     selectedUsers.length === 0
//                       ? "Type a name or multiple names"
//                       : ""
//                   }
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   className="recipients-input"
//                 />
//               </div>

//               {/* Search Results */}
//               {showSearch && searchResults.length > 0 && (
//                 <div className="search-results-dropdown">
//                   {searchResults.map((user) => (
//                     <SearchResultItem
//                       key={user.id}
//                       user={user}
//                       onSelect={handleSelectUser}
//                       API_BASE={API_BASE}
//                     />
//                   ))}
//                 </div>
//               )}

//               {showSearch &&
//                 searchQuery &&
//                 searchResults.length === 0 &&
//                 !isSearching && (
//                   <div className="no-results">No connections found</div>
//                 )}
//             </div>

//             {/* Single User - Show Chat */}
//             {showChat && (
//               <>
//                 <div className="selected-user-info">
//                   <div className="user-info-card">
//                     <img
//                       src={
//                         selectedUsers[0].avatar_url
//                           ? `${API_BASE}${selectedUsers[0].avatar_url}`
//                           : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                       }
//                       alt={selectedUsers[0].name}
//                       className="user-info-avatar"
//                     />
//                     <div className="user-info-details">
//                       <h3 className="user-info-name">
//                         {selectedUsers[0].name}{" "}
//                         <span className="user-degree">• 1st</span>
//                       </h3>
//                       <p className="user-info-title">
//                         {selectedUsers[0].title || "Professional"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="messages-container">
//                   {messages.length === 0 ? (
//                     <div className="no-messages">
//                       <p>Start a conversation with {selectedUsers[0].name}</p>
//                     </div>
//                   ) : (
//                     <div className="messages-list">
//                       {messages.map((msg, idx) => (
//                         <MessageBubble key={msg.id || idx} message={msg} />
//                       ))}
//                       <div ref={messagesEndRef} />
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}

//             {/* Multiple Users - Show Info */}
//             {isMultipleUsers && !searchQuery && (
//               <div className="selected-user-info">
//                 <p className="info-text">
//                   Sending to {selectedUsers.length} recipients
//                 </p>
//                 <div className="users-preview">
//                   {selectedUsers.map((user) => (
//                     <div key={user.id} className="user-info-card">
//                       <img
//                         src={
//                           user.avatar_url
//                             ? `${API_BASE}${user.avatar_url}`
//                             : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                         }
//                         alt={user.name}
//                         className="user-info-avatar"
//                       />
//                       <div className="user-info-details">
//                         <h3 className="user-info-name">{user.name}</h3>
//                         <p className="user-info-title">
//                           {user.title || "Professional"}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Message Input */}
//             <div className="message-modal-footer">
//               <div className="message-input-wrapper">
//                 <textarea
//                   ref={textareaRef}
//                   placeholder="Write a message..."
//                   value={message}
//                   onChange={(e) => setMessage(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   className="message-textarea"
//                   disabled={selectedUsers.length === 0}
//                   rows={1}
//                 />
//               </div>

//               <div className="footer-actions">
//                 <div className="message-tools">
//                   <button className="tool-btn" title="Attach image">
//                     <Image size={18} />
//                   </button>
//                   <button className="tool-btn" title="Attach file">
//                     <Paperclip size={18} />
//                   </button>
//                   <button className="tool-btn" title="GIF">
//                     GIF
//                   </button>
//                   <button className="tool-btn" title="Emoji">
//                     <Smile size={18} />
//                   </button>
//                 </div>

//                 <button
//                   className="send-btn-icon"
//                   onClick={handleSendMessage}
//                   disabled={
//                     !message.trim() || selectedUsers.length === 0 || sending
//                   }
//                   title="Send"
//                 >
//                   <Send size={18} />
//                 </button>
//               </div>
//             </div>
//           </>
//         )}

//         {/* MINIMIZED VIEW */}
//         {isMinimized && (
//           <>
//             {/* Single User Minimized */}
//             {isSingleUser && (
//               <>
//                 <div className="minimized-chips">
//                   {selectedUsers.map((user) => (
//                     <UserChip
//                       key={user.id}
//                       user={user}
//                       onRemove={handleRemoveUser}
//                     />
//                   ))}
//                 </div>

//                 <div className="minimized-messages">
//                   {messages.length === 0 ? (
//                     <div className="no-messages-small">
//                       <p>Start a conversation</p>
//                     </div>
//                   ) : (
//                     <div className="messages-list">
//                       {messages.map((msg, idx) => (
//                         <MessageBubble key={msg.id || idx} message={msg} />
//                       ))}
//                       <div ref={messagesEndRef} />
//                     </div>
//                   )}
//                 </div>

//                 <div className="minimized-input">
//                   <textarea
//                     ref={textareaRef}
//                     placeholder="Write a message..."
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     className="minimized-textarea"
//                     rows={2}
//                   />
//                 </div>

//                 <div className="minimized-footer">
//                   <div className="message-tools">
//                     <button className="tool-btn-small" title="Attach image">
//                       <Image size={16} />
//                     </button>
//                     <button className="tool-btn-small" title="Attach file">
//                       <Paperclip size={16} />
//                     </button>
//                     <button className="tool-btn-small" title="GIF">
//                       GIF
//                     </button>
//                     <button className="tool-btn-small" title="Emoji">
//                       <Smile size={16} />
//                     </button>
//                   </div>
//                   <button
//                     className="send-btn-small"
//                     onClick={handleSendMessage}
//                     disabled={!message.trim() || sending}
//                     title="Send"
//                   >
//                     Send
//                   </button>
//                   <button className="more-btn-small">•••</button>
//                 </div>
//               </>
//             )}

//             {/* Multiple Users Minimized */}
//             {isMultipleUsers && (
//               <>
//                 <div className="minimized-chips">
//                   {selectedUsers.map((user) => (
//                     <UserChip
//                       key={user.id}
//                       user={user}
//                       onRemove={handleRemoveUser}
//                     />
//                   ))}
//                   <button
//                     className="add-more-btn"
//                     onClick={() => searchInputRef.current?.focus()}
//                     title="Add more recipients"
//                   >
//                     <Plus size={18} />
//                   </button>
//                 </div>

//                 {/* Group Name Input */}
//                 <div className="group-name-section">
//                   <label className="group-name-label">Group name</label>
//                   <input
//                     type="text"
//                     className="group-name-input"
//                     placeholder="Group name (optional)"
//                     value={groupName}
//                     onChange={(e) => setGroupName(e.target.value)}
//                   />
//                 </div>

//                 <div className="minimized-input">
//                   <textarea
//                     ref={textareaRef}
//                     placeholder="Write a message..."
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     className="minimized-textarea"
//                     rows={3}
//                   />
//                 </div>

//                 <div className="minimized-footer">
//                   <div className="message-tools">
//                     <button className="tool-btn-small" title="Attach image">
//                       <Image size={16} />
//                     </button>
//                     <button className="tool-btn-small" title="Attach file">
//                       <Paperclip size={16} />
//                     </button>
//                     <button className="tool-btn-small" title="GIF">
//                       GIF
//                     </button>
//                     <button className="tool-btn-small" title="Emoji">
//                       <Smile size={16} />
//                     </button>
//                   </div>
//                   <button
//                     className="send-btn-small"
//                     onClick={handleSendMessage}
//                     disabled={!message.trim() || sending}
//                   >
//                     Send
//                   </button>
//                   <button className="more-btn-small">•••</button>
//                 </div>
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // User Chip Component
// function UserChip({ user, onRemove }) {
//   return (
//     <div className="user-chip">
//       <span className="chip-name">{user.name}</span>
//       <button
//         className="chip-remove"
//         onClick={() => onRemove(user.id)}
//         aria-label="Remove"
//       >
//         <X size={14} />
//       </button>
//     </div>
//   );
// }

// // Search Result Item Component
// function SearchResultItem({ user, onSelect, API_BASE }) {
//   const avatar = user.avatar_url
//     ? `${API_BASE}${user.avatar_url}`
//     : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

//   return (
//     <div className="search-result-item" onClick={() => onSelect(user)}>
//       <img src={avatar} alt={user.name} className="result-avatar" />
//       <div className="result-info">
//         <p className="result-name">{user.name}</p>
//         <p className="result-title">{user.title || "Professional"}</p>
//       </div>
//     </div>
//   );
// }

// // Message Bubble Component
// function MessageBubble({ message }) {
//   const isSent = message.sender_id;

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   return (
//     <div className={`message-bubble ${isSent ? "sent" : "received"}`}>
//       <div className="message-content">
//         <p>{message.message_text || message.text}</p>
//       </div>
//       <span className="message-time">{formatTime(message.created_at)}</span>
//     </div>
//   );
// }

// src/Components/Network/MessageModal.js
// import React, { useState, useEffect, useRef } from "react";
// import {
//   X,
//   Minimize2,
//   Maximize2,
//   Image,
//   Paperclip,
//   Smile,
//   Send,
//   Plus,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import "./MessageModal.css";

// export default function NewMessageModal({
//   isOpen,
//   onClose,
//   preselectedUser,
//   API_BASE,
//   currentUserId, // Add this prop
// }) {
//   const navigate = useNavigate();
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [message, setMessage] = useState("");
//   const [groupName, setGroupName] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [sending, setSending] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);
//   const [isMinimized, setIsMinimized] = useState(false);

//   const modalRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const textareaRef = useRef(null);

//   // Scroll to bottom when new messages arrive
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Prevent body scroll when modal is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//       setTimeout(() => searchInputRef.current?.focus(), 100);
//     } else {
//       document.body.style.overflow = "unset";
//     }

//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   // Set preselected user and load chat history
//   useEffect(() => {
//     if (preselectedUser && isOpen) {
//       setSelectedUsers([preselectedUser]);
//       setSearchQuery("");
//       loadChatHistory(preselectedUser.id);
//     }
//   }, [preselectedUser, isOpen]);

//   // Load existing chat messages (only for single user)
//   async function loadChatHistory(userId) {
//     try {
//       const res = await fetch(`${API_BASE}/api/messages/chat/${userId}`, {
//         credentials: "include",
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setMessages(data);
//       }
//     } catch (err) {
//       console.error("Load chat error:", err);
//     }
//   }

//   // Search connections
//   useEffect(() => {
//     if (searchQuery.trim()) {
//       searchConnections();
//     } else {
//       setSearchResults([]);
//     }
//   }, [searchQuery]);

//   async function searchConnections() {
//     setIsSearching(true);
//     try {
//       const res = await fetch(
//         `${API_BASE}/api/network/connections/search?query=${encodeURIComponent(
//           searchQuery
//         )}`,
//         { credentials: "include" }
//       );

//       if (res.ok) {
//         const data = await res.json();
//         const filtered = data.filter(
//           (user) => !selectedUsers.some((selected) => selected.id === user.id)
//         );
//         setSearchResults(filtered);
//       }
//     } catch (err) {
//       console.error("Search error:", err);
//     } finally {
//       setIsSearching(false);
//     }
//   }

//   // ✅ FIXED: Allow multiple user selection
//   function handleSelectUser(user) {
//     setSelectedUsers((prev) => [...prev, user]); // Add to array
//     setSearchQuery("");
//     setSearchResults([]);

//     // Only load chat history if it's the first and only user
//     if (selectedUsers.length === 0) {
//       loadChatHistory(user.id);
//     } else {
//       // Clear messages when multiple users selected
//       setMessages([]);
//     }

//     searchInputRef.current?.focus();
//   }

//   function handleRemoveUser(userId) {
//     setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));

//     // If removing last user, clear messages
//     if (selectedUsers.length === 1) {
//       setMessages([]);
//     }
//     // If only one user left after removal, load their chat
//     else if (selectedUsers.length === 2) {
//       const remainingUser = selectedUsers.find((u) => u.id !== userId);
//       if (remainingUser) {
//         loadChatHistory(remainingUser.id);
//       }
//     }

//     searchInputRef.current?.focus();
//   }

//   async function handleSendMessage(e) {
//     e?.preventDefault();
//     if (!message.trim() || selectedUsers.length === 0 || sending) return;

//     setSending(true);
//     const messageText = message.trim();

//     try {
//       // Send to all selected users
//       const promises = selectedUsers.map((user) =>
//         fetch(`${API_BASE}/api/messages/send`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify({
//             receiver_id: user.id,
//             text: messageText,
//           }),
//         })
//       );

//       const results = await Promise.all(promises);

//       if (results.every((res) => res.ok)) {
//         // For single user, add message to chat
//         if (selectedUsers.length === 1) {
//           const data = await results[0].json();
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: data.message.id,
//               sender_id: data.message.sender_id,
//               receiver_id: data.message.receiver_id,
//               message_text: messageText,
//               created_at: data.message.created_at,
//             },
//           ]);
//         }

//         // Clear input
//         setMessage("");
//         textareaRef.current?.focus();
//       } else {
//         console.error("Some messages failed to send");
//       }
//     } catch (err) {
//       console.error("Send error:", err);
//     } finally {
//       setSending(false);
//     }
//   }

//   function handleClose() {
//     setSelectedUsers([]);
//     setSearchQuery("");
//     setSearchResults([]);
//     setMessage("");
//     setMessages([]);
//     setGroupName("");
//     setIsMinimized(false);
//     onClose();
//   }

//   function toggleMinimize() {
//     setIsMinimized(!isMinimized);
//   }

//   function handleKeyDown(e) {
//     // Send on Enter (without Shift)
//     if (e.key === "Enter" && !e.shiftKey && selectedUsers.length > 0) {
//       e.preventDefault();
//       handleSendMessage();
//     }

//     // Remove last chip on Backspace when input is empty
//     if (e.key === "Backspace" && !searchQuery && selectedUsers.length > 0) {
//       handleRemoveUser(selectedUsers[selectedUsers.length - 1].id);
//     }
//   }

//   if (!isOpen) return null;

//   const showSearch = selectedUsers.length === 0 || searchQuery.length > 0;
//   const showChat = selectedUsers.length === 1 && !searchQuery;
//   const isSingleUser = selectedUsers.length === 1;
//   const isMultipleUsers = selectedUsers.length > 1;

//   return (
//     <div className="message-modal-overlay">
//       <div
//         className={`message-modal ${isMinimized ? "minimized" : ""}`}
//         ref={modalRef}
//       >
//         {/* Header */}
//         <div className="message-modal-header">
//           <div className="header-left">
//             <h2>New message</h2>
//             {selectedUsers.length > 0 && (
//               <span className="header-recipient">
//                 {isSingleUser
//                   ? `to: ${selectedUsers[0].name}`
//                   : `${selectedUsers.length} recipients`}
//               </span>
//             )}
//           </div>
//           <div className="message-modal-actions">
//             <button
//               className="icon-btn"
//               onClick={toggleMinimize}
//               title={isMinimized ? "Maximize" : "Minimize"}
//             >
//               {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
//             </button>
//             <button className="icon-btn" onClick={handleClose} title="Close">
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         {/* EXPANDED VIEW */}
//         {!isMinimized && (
//           <>
//             {/* Recipients Section */}
//             <div className="message-modal-recipients">
//               <div className="recipients-input-wrapper">
//                 {selectedUsers.map((user) => (
//                   <UserChip
//                     key={user.id}
//                     user={user}
//                     onRemove={handleRemoveUser}
//                   />
//                 ))}

//                 <input
//                   ref={searchInputRef}
//                   type="text"
//                   placeholder={
//                     selectedUsers.length === 0
//                       ? "Type a name or multiple names"
//                       : ""
//                   }
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   className="recipients-input"
//                 />
//               </div>

//               {/* Search Results */}
//               {showSearch && searchResults.length > 0 && (
//                 <div className="search-results-dropdown">
//                   {searchResults.map((user) => (
//                     <SearchResultItem
//                       key={user.id}
//                       user={user}
//                       onSelect={handleSelectUser}
//                       API_BASE={API_BASE}
//                     />
//                   ))}
//                 </div>
//               )}

//               {showSearch &&
//                 searchQuery &&
//                 searchResults.length === 0 &&
//                 !isSearching && (
//                   <div className="no-results">No connections found</div>
//                 )}
//             </div>

//             {/* Single User - Show Chat */}
//             {showChat && (
//               <>
//                 <div className="selected-user-info">
//                   <div className="user-info-card">
//                     <img
//                       src={
//                         selectedUsers[0].avatar_url
//                           ? `${API_BASE}${selectedUsers[0].avatar_url}`
//                           : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                       }
//                       alt={selectedUsers[0].name}
//                       className="user-info-avatar"
//                     />
//                     <div className="user-info-details">
//                       <h3 className="user-info-name">
//                         {selectedUsers[0].name}{" "}
//                         <span className="user-degree">• 1st</span>
//                       </h3>
//                       <p className="user-info-title">
//                         {selectedUsers[0].title || "Professional"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="messages-container">
//                   {messages.length === 0 ? (
//                     <div className="no-messages">
//                       <p>Start a conversation with {selectedUsers[0].name}</p>
//                     </div>
//                   ) : (
//                     <div className="messages-list">
//                       {groupMessagesByDate(messages).map((item, idx) => {
//                         if (item.type === "date") {
//                           return (
//                             <DateSeparator
//                               key={`date-${idx}`}
//                               date={item.date}
//                             />
//                           );
//                         } else {
//                           return (
//                             <MessageBubble
//                               key={item.data.id || idx}
//                               message={item.data}
//                               API_BASE={API_BASE}
//                               currentUserId={currentUserId}
//                             />
//                           );
//                         }
//                       })}
//                       <div ref={messagesEndRef} />
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}

//             {/* Multiple Users - Show Info */}
//             {isMultipleUsers && !searchQuery && (
//               <div className="selected-user-info">
//                 <p className="info-text">
//                   Sending to {selectedUsers.length} recipients
//                 </p>
//                 <div className="users-preview">
//                   {selectedUsers.map((user) => (
//                     <div key={user.id} className="user-info-card">
//                       <img
//                         src={
//                           user.avatar_url
//                             ? `${API_BASE}${user.avatar_url}`
//                             : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                         }
//                         alt={user.name}
//                         className="user-info-avatar"
//                       />
//                       <div className="user-info-details">
//                         <h3 className="user-info-name">{user.name}</h3>
//                         <p className="user-info-title">
//                           {user.title || "Professional"}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Message Input */}
//             <div className="message-modal-body">
//               <textarea
//                 ref={textareaRef}
//                 placeholder="Write a message..."
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 className="message-textarea"
//                 disabled={selectedUsers.length === 0}
//               />
//             </div>

//             {/* Footer */}
//             <div className="message-modal-footer">
//               <div className="message-tools">
//                 <button className="tool-btn" title="Attach image">
//                   <Image size={20} />
//                 </button>
//                 <button className="tool-btn" title="Attach file">
//                   <Paperclip size={20} />
//                 </button>
//                 <button className="tool-btn" title="GIF">
//                   GIF
//                 </button>
//                 <button className="tool-btn" title="Emoji">
//                   <Smile size={20} />
//                 </button>
//               </div>
//               <div className="message-actions">
//                 <button className="more-btn">•••</button>
//                 <button
//                   className="send-btn"
//                   onClick={handleSendMessage}
//                   disabled={
//                     !message.trim() || selectedUsers.length === 0 || sending
//                   }
//                 >
//                   {sending ? "Sending..." : "Send"}
//                 </button>
//               </div>
//             </div>
//           </>
//         )}

//         {/* MINIMIZED VIEW */}
//         {isMinimized && (
//           <>
//             {/* Single User Minimized */}
//             {isSingleUser && (
//               <>
//                 <div className="minimized-chips">
//                   {selectedUsers.map((user) => (
//                     <UserChip
//                       key={user.id}
//                       user={user}
//                       onRemove={handleRemoveUser}
//                     />
//                   ))}
//                 </div>

//                 <div className="minimized-messages">
//                   {messages.length === 0 ? (
//                     <div className="no-messages-small">
//                       <p>Start a conversation</p>
//                     </div>
//                   ) : (
//                     <div className="messages-list">
//                       {groupMessagesByDate(messages).map((item, idx) => {
//                         if (item.type === "date") {
//                           return (
//                             <DateSeparator
//                               key={`date-${idx}`}
//                               date={item.date}
//                             />
//                           );
//                         } else {
//                           return (
//                             <MessageBubble
//                               key={item.data.id || idx}
//                               message={item.data}
//                               API_BASE={API_BASE}
//                               currentUserId={currentUserId}
//                             />
//                           );
//                         }
//                       })}
//                       <div ref={messagesEndRef} />
//                     </div>
//                   )}
//                 </div>

//                 <div className="minimized-input">
//                   <textarea
//                     ref={textareaRef}
//                     placeholder="Write a message..."
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     className="minimized-textarea"
//                     rows={2}
//                   />
//                 </div>

//                 <div className="minimized-footer">
//                   <div className="message-tools">
//                     <button className="tool-btn-small" title="Attach image">
//                       <Image size={16} />
//                     </button>
//                     <button className="tool-btn-small" title="Attach file">
//                       <Paperclip size={16} />
//                     </button>
//                     <button className="tool-btn-small" title="GIF">
//                       GIF
//                     </button>
//                     <button className="tool-btn-small" title="Emoji">
//                       <Smile size={16} />
//                     </button>
//                   </div>
//                   <button
//                     className="send-btn-small"
//                     onClick={handleSendMessage}
//                     disabled={!message.trim() || sending}
//                     title="Send"
//                   >
//                     Send
//                   </button>
//                   <button className="more-btn-small">•••</button>
//                 </div>
//               </>
//             )}

//             {/* Multiple Users Minimized */}
//             {isMultipleUsers && (
//               <>
//                 <div className="minimized-chips">
//                   {selectedUsers.map((user) => (
//                     <UserChip
//                       key={user.id}
//                       user={user}
//                       onRemove={handleRemoveUser}
//                     />
//                   ))}
//                   <button
//                     className="add-more-btn"
//                     onClick={() => searchInputRef.current?.focus()}
//                     title="Add more recipients"
//                   >
//                     <Plus size={18} />
//                   </button>
//                 </div>

//                 {/* Group Name Input */}
//                 <div className="group-name-section">
//                   <label className="group-name-label">Group name</label>
//                   <input
//                     type="text"
//                     className="group-name-input"
//                     placeholder="Group name (optional)"
//                     value={groupName}
//                     onChange={(e) => setGroupName(e.target.value)}
//                   />
//                 </div>

//                 <div className="minimized-input">
//                   <textarea
//                     ref={textareaRef}
//                     placeholder="Write a message..."
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     className="minimized-textarea"
//                     rows={3}
//                   />
//                 </div>

//                 <div className="minimized-footer">
//                   <div className="message-tools">
//                     <button className="tool-btn-small" title="Attach image">
//                       <Image size={16} />
//                     </button>
//                     <button className="tool-btn-small" title="Attach file">
//                       <Paperclip size={16} />
//                     </button>
//                     <button className="tool-btn-small" title="GIF">
//                       GIF
//                     </button>
//                     <button className="tool-btn-small" title="Emoji">
//                       <Smile size={16} />
//                     </button>
//                   </div>
//                   <button
//                     className="send-btn-small"
//                     onClick={handleSendMessage}
//                     disabled={!message.trim() || sending}
//                   >
//                     Send
//                   </button>
//                   <button className="more-btn-small">•••</button>
//                 </div>
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // User Chip Component
// function UserChip({ user, onRemove }) {
//   return (
//     <div className="user-chip">
//       <span className="chip-name">{user.name}</span>
//       <button
//         className="chip-remove"
//         onClick={() => onRemove(user.id)}
//         aria-label="Remove"
//       >
//         <X size={14} />
//       </button>
//     </div>
//   );
// }

// // Search Result Item Component
// function SearchResultItem({ user, onSelect, API_BASE }) {
//   const avatar = user.avatar_url
//     ? `${API_BASE}${user.avatar_url}`
//     : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

//   return (
//     <div className="search-result-item" onClick={() => onSelect(user)}>
//       <img src={avatar} alt={user.name} className="result-avatar" />
//       <div className="result-info">
//         <p className="result-name">{user.name}</p>
//         <p className="result-title">{user.title || "Professional"}</p>
//       </div>
//     </div>
//   );
// }

// // Message Bubble Component
// function MessageBubble({ message, API_BASE, currentUserId }) {
//   const isSent = message.sender_id === currentUserId;

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   // Get sender info (for received messages)
//   const senderAvatar = message.sender_avatar_url
//     ? `${API_BASE}${message.sender_avatar_url}`
//     : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

//   return (
//     <div className={`message-bubble ${isSent ? "sent" : "received"}`}>
//       {!isSent && (
//         <div className="message-header">
//           <img
//             src={senderAvatar}
//             alt={message.sender_name}
//             className="message-avatar"
//           />
//           <div className="message-sender-info">
//             <span className="message-sender-name">{message.sender_name}</span>
//             <span className="message-time">
//               {formatTime(message.created_at)}
//             </span>
//           </div>
//         </div>
//       )}

//       <div className={`message-content ${!isSent ? "with-avatar" : ""}`}>
//         <p>{message.message_text || message.text}</p>
//       </div>

//       {isSent && (
//         <span className="message-time">{formatTime(message.created_at)}</span>
//       )}
//     </div>
//   );
// }

// // Date Separator Component
// function DateSeparator({ date }) {
//   const formatDate = (timestamp) => {
//     const messageDate = new Date(timestamp);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);

//     // Reset time to compare only dates
//     today.setHours(0, 0, 0, 0);
//     yesterday.setHours(0, 0, 0, 0);
//     messageDate.setHours(0, 0, 0, 0);

//     if (messageDate.getTime() === today.getTime()) {
//       return "TODAY";
//     } else if (messageDate.getTime() === yesterday.getTime()) {
//       return "YESTERDAY";
//     } else {
//       const now = new Date();
//       const diffTime = now - new Date(timestamp);
//       const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//       // If within last week, show day name
//       if (diffDays < 7) {
//         return new Date(timestamp)
//           .toLocaleDateString("en-US", {
//             weekday: "long",
//           })
//           .toUpperCase();
//       }

//       // If this year, show month and day
//       if (new Date(timestamp).getFullYear() === now.getFullYear()) {
//         return new Date(timestamp)
//           .toLocaleDateString("en-US", {
//             month: "short",
//             day: "numeric",
//           })
//           .toUpperCase();
//       }

//       // Otherwise show month and year
//       return new Date(timestamp)
//         .toLocaleDateString("en-US", {
//           month: "short",
//           year: "numeric",
//         })
//         .toUpperCase();
//     }
//   };

//   return (
//     <div className="date-separator">
//       <span className="date-separator-text">{formatDate(date)}</span>
//     </div>
//   );
// }

// // Helper function to group messages by date
// function groupMessagesByDate(messages) {
//   const grouped = [];
//   let currentDate = null;

//   messages.forEach((msg) => {
//     const msgDate = new Date(msg.created_at).toDateString();

//     if (msgDate !== currentDate) {
//       currentDate = msgDate;
//       grouped.push({ type: "date", date: msg.created_at });
//     }

//     grouped.push({ type: "message", data: msg });
//   });

//   return grouped;
// }

// src/Components/Network/MessageModal.js
// import React, { useState, useEffect, useRef } from "react";
// import {
//   X,
//   Minimize2,
//   Maximize2,
//   Image,
//   Paperclip,
//   Smile,
//   Send,
//   Plus,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import "./MessageModal.css";

// export default function NewMessageModal({
//   isOpen,
//   onClose,
//   preselectedUser,
//   API_BASE,
//   currentUserId, // Add this prop
// }) {
//   const navigate = useNavigate();
//   const [selectedUsers, setSelectedUsers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [message, setMessage] = useState("");
//   const [groupName, setGroupName] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [sending, setSending] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);
//   const [isMinimized, setIsMinimized] = useState(false);

//   const modalRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const messagesEndRef = useRef(null);
//   const textareaRef = useRef(null);

//   // Scroll to bottom when new messages arrive
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Prevent body scroll when modal is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//       setTimeout(() => searchInputRef.current?.focus(), 100);
//     } else {
//       document.body.style.overflow = "unset";
//     }

//     return () => {
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen]);

//   // Set preselected user and load chat history
//   useEffect(() => {
//     if (preselectedUser && isOpen) {
//       setSelectedUsers([preselectedUser]);
//       setSearchQuery("");
//       loadChatHistory(preselectedUser.id);
//     }
//   }, [preselectedUser, isOpen]);

//   // Load existing chat messages (only for single user)
//   async function loadChatHistory(userId) {
//     try {
//       const res = await fetch(`${API_BASE}/api/messages/chat/${userId}`, {
//         credentials: "include",
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setMessages(data);
//       }
//     } catch (err) {
//       console.error("Load chat error:", err);
//     }
//   }

//   // Search connections
//   useEffect(() => {
//     if (searchQuery.trim()) {
//       searchConnections();
//     } else {
//       setSearchResults([]);
//     }
//   }, [searchQuery]);

//   async function searchConnections() {
//     setIsSearching(true);
//     try {
//       const res = await fetch(
//         `${API_BASE}/api/network/connections/search?query=${encodeURIComponent(
//           searchQuery
//         )}`,
//         { credentials: "include" }
//       );

//       if (res.ok) {
//         const data = await res.json();
//         const filtered = data.filter(
//           (user) => !selectedUsers.some((selected) => selected.id === user.id)
//         );
//         setSearchResults(filtered);
//       }
//     } catch (err) {
//       console.error("Search error:", err);
//     } finally {
//       setIsSearching(false);
//     }
//   }

//   // ✅ FIXED: Allow multiple user selection
//   function handleSelectUser(user) {
//     setSelectedUsers((prev) => [...prev, user]); // Add to array
//     setSearchQuery("");
//     setSearchResults([]);

//     // Only load chat history if it's the first and only user
//     if (selectedUsers.length === 0) {
//       loadChatHistory(user.id);
//     } else {
//       // Clear messages when multiple users selected
//       setMessages([]);
//     }

//     searchInputRef.current?.focus();
//   }

//   function handleRemoveUser(userId) {
//     setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));

//     // If removing last user, clear messages
//     if (selectedUsers.length === 1) {
//       setMessages([]);
//     }
//     // If only one user left after removal, load their chat
//     else if (selectedUsers.length === 2) {
//       const remainingUser = selectedUsers.find((u) => u.id !== userId);
//       if (remainingUser) {
//         loadChatHistory(remainingUser.id);
//       }
//     }

//     searchInputRef.current?.focus();
//   }

//   async function handleSendMessage(e) {
//     e?.preventDefault();
//     if (!message.trim() || selectedUsers.length === 0 || sending) return;

//     setSending(true);
//     const messageText = message.trim();

//     try {
//       // Send to all selected users
//       const promises = selectedUsers.map((user) =>
//         fetch(`${API_BASE}/api/messages/send`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           credentials: "include",
//           body: JSON.stringify({
//             receiver_id: user.id,
//             text: messageText,
//           }),
//         })
//       );

//       const results = await Promise.all(promises);

//       if (results.every((res) => res.ok)) {
//         // For single user, add message to chat
//         if (selectedUsers.length === 1) {
//           const data = await results[0].json();
//           setMessages((prev) => [
//             ...prev,
//             {
//               id: data.message.id,
//               sender_id: data.message.sender_id,
//               receiver_id: data.message.receiver_id,
//               message_text: messageText,
//               created_at: data.message.created_at,
//             },
//           ]);
//         }

//         // Clear input
//         setMessage("");
//         textareaRef.current?.focus();
//       } else {
//         console.error("Some messages failed to send");
//       }
//     } catch (err) {
//       console.error("Send error:", err);
//     } finally {
//       setSending(false);
//     }
//   }

//   function handleClose() {
//     setSelectedUsers([]);
//     setSearchQuery("");
//     setSearchResults([]);
//     setMessage("");
//     setMessages([]);
//     setGroupName("");
//     setIsMinimized(false);
//     onClose();
//   }

//   function toggleMinimize() {
//     setIsMinimized(!isMinimized);
//   }

//   function handleKeyDown(e) {
//     // Send on Enter (without Shift)
//     if (e.key === "Enter" && !e.shiftKey && selectedUsers.length > 0) {
//       e.preventDefault();
//       handleSendMessage();
//     }

//     // Remove last chip on Backspace when input is empty
//     if (e.key === "Backspace" && !searchQuery && selectedUsers.length > 0) {
//       handleRemoveUser(selectedUsers[selectedUsers.length - 1].id);
//     }
//   }

//   if (!isOpen) return null;

//   const showSearch = selectedUsers.length === 0 || searchQuery.length > 0;
//   const showChat = selectedUsers.length === 1 && !searchQuery;
//   const isSingleUser = selectedUsers.length === 1;
//   const isMultipleUsers = selectedUsers.length > 1;

//   return (
//     <div className="message-modal-overlay">
//       <div
//         className={`message-modal ${isMinimized ? "minimized" : ""}`}
//         ref={modalRef}
//       >
//         {/* Header */}
//         <div className="message-modal-header">
//           <div className="header-left">
//             <h2>New message</h2>
//             {selectedUsers.length > 0 && (
//               <span className="header-recipient">
//                 {isSingleUser
//                   ? `to: ${selectedUsers[0].name}`
//                   : `${selectedUsers.length} recipients`}
//               </span>
//             )}
//           </div>
//           <div className="message-modal-actions">
//             <button
//               className="icon-btn"
//               onClick={toggleMinimize}
//               title={isMinimized ? "Maximize" : "Minimize"}
//             >
//               {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
//             </button>
//             <button className="icon-btn" onClick={handleClose} title="Close">
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         {/* EXPANDED VIEW */}
//         {!isMinimized && (
//           <>
//             {/* Recipients Section */}
//             <div className="message-modal-recipients">
//               <div className="recipients-input-wrapper">
//                 {selectedUsers.map((user) => (
//                   <UserChip
//                     key={user.id}
//                     user={user}
//                     onRemove={handleRemoveUser}
//                   />
//                 ))}

//                 <input
//                   ref={searchInputRef}
//                   type="text"
//                   placeholder={
//                     selectedUsers.length === 0
//                       ? "Type a name or multiple names"
//                       : ""
//                   }
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   className="recipients-input"
//                 />
//               </div>

//               {/* Search Results */}
//               {showSearch && searchResults.length > 0 && (
//                 <div className="search-results-dropdown">
//                   {searchResults.map((user) => (
//                     <SearchResultItem
//                       key={user.id}
//                       user={user}
//                       onSelect={handleSelectUser}
//                       API_BASE={API_BASE}
//                     />
//                   ))}
//                 </div>
//               )}

//               {showSearch &&
//                 searchQuery &&
//                 searchResults.length === 0 &&
//                 !isSearching && (
//                   <div className="no-results">No connections found</div>
//                 )}
//             </div>

//             {/* Single User - Show Chat */}
//             {showChat && (
//               <>
//                 <div className="selected-user-info">
//                   <div className="user-info-card">
//                     <img
//                       src={
//                         selectedUsers[0].avatar_url
//                           ? `${API_BASE}${selectedUsers[0].avatar_url}`
//                           : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                       }
//                       alt={selectedUsers[0].name}
//                       className="user-info-avatar"
//                     />
//                     <div className="user-info-details">
//                       <h3 className="user-info-name">
//                         {selectedUsers[0].name}{" "}
//                         <span className="user-degree">• 1st</span>
//                       </h3>
//                       <p className="user-info-title">
//                         {selectedUsers[0].title || "Professional"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="messages-container">
//                   {messages.length === 0 ? (
//                     <div className="no-messages">
//                       <p>Start a conversation with {selectedUsers[0].name}</p>
//                     </div>
//                   ) : (
//                     <div className="messages-list">
//                       {groupMessagesByDate(messages).map((item, idx) => {
//                         if (item.type === "date") {
//                           return (
//                             <DateSeparator
//                               key={`date-${idx}`}
//                               date={item.date}
//                             />
//                           );
//                         } else {
//                           return (
//                             <MessageBubble
//                               key={item.data.id || idx}
//                               message={item.data}
//                               API_BASE={API_BASE}
//                               currentUserId={currentUserId}
//                             />
//                           );
//                         }
//                       })}
//                       <div ref={messagesEndRef} />
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}

//             {/* Multiple Users - Show Info */}
//             {isMultipleUsers && !searchQuery && (
//               <div className="selected-user-info">
//                 <p className="info-text">
//                   Sending to {selectedUsers.length} recipients
//                 </p>
//                 <div className="users-preview">
//                   {selectedUsers.map((user) => (
//                     <div key={user.id} className="user-info-card">
//                       <img
//                         src={
//                           user.avatar_url
//                             ? `${API_BASE}${user.avatar_url}`
//                             : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
//                         }
//                         alt={user.name}
//                         className="user-info-avatar"
//                       />
//                       <div className="user-info-details">
//                         <h3 className="user-info-name">{user.name}</h3>
//                         <p className="user-info-title">
//                           {user.title || "Professional"}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Message Input */}
//             {selectedUsers.length > 0 && (
//               <>
//                 <div className="message-modal-body">
//                   <textarea
//                     ref={textareaRef}
//                     placeholder="Write a message..."
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     className="message-textarea"
//                     disabled={selectedUsers.length === 0}
//                   />
//                 </div>

//                 {/* Footer */}
//                 <div className="message-modal-footer">
//                   <div className="message-tools">
//                     <button className="tool-btn" title="Attach image">
//                       <Image size={20} />
//                     </button>
//                     <button className="tool-btn" title="Attach file">
//                       <Paperclip size={20} />
//                     </button>
//                     <button className="tool-btn" title="GIF">
//                       GIF
//                     </button>
//                     <button className="tool-btn" title="Emoji">
//                       <Smile size={20} />
//                     </button>
//                   </div>
//                   <div className="message-actions">
//                     <button className="more-btn">•••</button>
//                     <button
//                       className="send-btn"
//                       onClick={handleSendMessage}
//                       disabled={
//                         !message.trim() || selectedUsers.length === 0 || sending
//                       }
//                     >
//                       {sending ? "Sending..." : "Send"}
//                     </button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </>
//         )}

//         {/* MINIMIZED VIEW */}
//         {isMinimized && (
//           <>
//             {/* Single User Minimized */}
//             {isSingleUser && (
//               <>
//                 <div className="minimized-chips">
//                   {selectedUsers.map((user) => (
//                     <UserChip
//                       key={user.id}
//                       user={user}
//                       onRemove={handleRemoveUser}
//                     />
//                   ))}
//                 </div>

//                 <div className="minimized-messages">
//                   {messages.length === 0 ? (
//                     <div className="no-messages-small">
//                       <p>Start a conversation</p>
//                     </div>
//                   ) : (
//                     <div className="messages-list">
//                       {groupMessagesByDate(messages).map((item, idx) => {
//                         if (item.type === "date") {
//                           return (
//                             <DateSeparator
//                               key={`date-${idx}`}
//                               date={item.date}
//                             />
//                           );
//                         } else {
//                           return (
//                             <MessageBubble
//                               key={item.data.id || idx}
//                               message={item.data}
//                               API_BASE={API_BASE}
//                               currentUserId={currentUserId}
//                             />
//                           );
//                         }
//                       })}
//                       <div ref={messagesEndRef} />
//                     </div>
//                   )}
//                 </div>

//                 <div className="minimized-input">
//                   <textarea
//                     ref={textareaRef}
//                     placeholder="Write a message..."
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     className="minimized-textarea"
//                     rows={2}
//                   />
//                 </div>

//                 <div className="minimized-footer">
//                   <div className="message-tools">
//                     <button className="tool-btn-small" title="Attach image">
//                       <Image size={16} />
//                     </button>
//                     <button className="tool-btn-small" title="Attach file">
//                       <Paperclip size={16} />
//                     </button>
//                     <button className="tool-btn-small" title="GIF">
//                       GIF
//                     </button>
//                     <button className="tool-btn-small" title="Emoji">
//                       <Smile size={16} />
//                     </button>
//                   </div>
//                   <button
//                     className="send-btn-small"
//                     onClick={handleSendMessage}
//                     disabled={!message.trim() || sending}
//                     title="Send"
//                   >
//                     Send
//                   </button>
//                   <button className="more-btn-small">•••</button>
//                 </div>
//               </>
//             )}

//             {/* Multiple Users Minimized */}
//             {isMultipleUsers && (
//               <>
//                 <div className="minimized-chips">
//                   {selectedUsers.map((user) => (
//                     <UserChip
//                       key={user.id}
//                       user={user}
//                       onRemove={handleRemoveUser}
//                     />
//                   ))}
//                   <button
//                     className="add-more-btn"
//                     onClick={() => searchInputRef.current?.focus()}
//                     title="Add more recipients"
//                   >
//                     <Plus size={18} />
//                   </button>
//                 </div>

//                 {/* Group Name Input */}
//                 <div className="group-name-section">
//                   <label className="group-name-label">Group name</label>
//                   <input
//                     type="text"
//                     className="group-name-input"
//                     placeholder="Group name (optional)"
//                     value={groupName}
//                     onChange={(e) => setGroupName(e.target.value)}
//                   />
//                 </div>

//                 <div className="minimized-input">
//                   <textarea
//                     ref={textareaRef}
//                     placeholder="Write a message..."
//                     value={message}
//                     onChange={(e) => setMessage(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     className="minimized-textarea"
//                     rows={3}
//                   />
//                 </div>

//                 <div className="minimized-footer">
//                   <div className="message-tools">
//                     <button className="tool-btn-small" title="Attach image">
//                       <Image size={16} />
//                     </button>
//                     <button className="tool-btn-small" title="Attach file">
//                       <Paperclip size={16} />
//                     </button>
//                     <button className="tool-btn-small" title="GIF">
//                       GIF
//                     </button>
//                     <button className="tool-btn-small" title="Emoji">
//                       <Smile size={16} />
//                     </button>
//                   </div>
//                   <button
//                     className="send-btn-small"
//                     onClick={handleSendMessage}
//                     disabled={!message.trim() || sending}
//                   >
//                     Send
//                   </button>
//                   <button className="more-btn-small">•••</button>
//                 </div>
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // User Chip Component
// function UserChip({ user, onRemove }) {
//   return (
//     <div className="user-chip">
//       <span className="chip-name">{user.name}</span>
//       <button
//         className="chip-remove"
//         onClick={() => onRemove(user.id)}
//         aria-label="Remove"
//       >
//         <X size={14} />
//       </button>
//     </div>
//   );
// }

// // Search Result Item Component
// function SearchResultItem({ user, onSelect, API_BASE }) {
//   const avatar = user.avatar_url
//     ? `${API_BASE}${user.avatar_url}`
//     : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

//   return (
//     <div className="search-result-item" onClick={() => onSelect(user)}>
//       <img src={avatar} alt={user.name} className="result-avatar" />
//       <div className="result-info">
//         <p className="result-name">{user.name}</p>
//         <p className="result-title">{user.title || "Professional"}</p>
//       </div>
//     </div>
//   );
// }

// // Message Bubble Component
// function MessageBubble({ message, API_BASE, currentUserId }) {
//   const isSent = message.sender_id === currentUserId;

//   const formatTime = (timestamp) => {
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   // Get sender info (for received messages)
//   const senderAvatar = message.sender_avatar_url
//     ? `${API_BASE}${message.sender_avatar_url}`
//     : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

//   return (
//     <div className={`message-bubble ${isSent ? "sent" : "received"}`}>
//       {!isSent && (
//         <div className="message-header">
//           <img
//             src={senderAvatar}
//             alt={message.sender_name}
//             className="message-avatar"
//           />
//           <div className="message-sender-info">
//             <span className="message-sender-name">{message.sender_name}</span>
//             <span className="message-time">
//               {formatTime(message.created_at)}
//             </span>
//           </div>
//         </div>
//       )}

//       <div className={`message-content ${!isSent ? "with-avatar" : ""}`}>
//         <p>{message.message_text || message.text}</p>
//       </div>

//       {isSent && (
//         <span className="message-time">{formatTime(message.created_at)}</span>
//       )}
//     </div>
//   );
// }

// // Date Separator Component
// function DateSeparator({ date }) {
//   const formatDate = (timestamp) => {
//     const messageDate = new Date(timestamp);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);

//     // Reset time to compare only dates
//     today.setHours(0, 0, 0, 0);
//     yesterday.setHours(0, 0, 0, 0);
//     messageDate.setHours(0, 0, 0, 0);

//     if (messageDate.getTime() === today.getTime()) {
//       return "TODAY";
//     } else if (messageDate.getTime() === yesterday.getTime()) {
//       return "YESTERDAY";
//     } else {
//       const now = new Date();
//       const diffTime = now - new Date(timestamp);
//       const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//       // If within last week, show day name
//       if (diffDays < 7) {
//         return new Date(timestamp)
//           .toLocaleDateString("en-US", {
//             weekday: "long",
//           })
//           .toUpperCase();
//       }

//       // If this year, show month and day
//       if (new Date(timestamp).getFullYear() === now.getFullYear()) {
//         return new Date(timestamp)
//           .toLocaleDateString("en-US", {
//             month: "short",
//             day: "numeric",
//           })
//           .toUpperCase();
//       }

//       // Otherwise show month and year
//       return new Date(timestamp)
//         .toLocaleDateString("en-US", {
//           month: "short",
//           year: "numeric",
//         })
//         .toUpperCase();
//     }
//   };

//   return (
//     <div className="date-separator">
//       <span className="date-separator-text">{formatDate(date)}</span>
//     </div>
//   );
// }

// // Helper function to group messages by date
// function groupMessagesByDate(messages) {
//   const grouped = [];
//   let currentDate = null;

//   messages.forEach((msg) => {
//     const msgDate = new Date(msg.created_at).toDateString();

//     if (msgDate !== currentDate) {
//       currentDate = msgDate;
//       grouped.push({ type: "date", date: msg.created_at });
//     }

//     grouped.push({ type: "message", data: msg });
//   });

//   return grouped;
// }

// src/Components/Network/MessageModal.js
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Minimize2,
  Maximize2,
  Image,
  Paperclip,
  Smile,
  Send,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MessageModal.css";

export default function NewMessageModal({
  isOpen,
  onClose,
  preselectedUser,
  API_BASE,
  currentUserId, // Add this prop
}) {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const modalRef = useRef(null);
  const searchInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Set preselected user and load chat history
  useEffect(() => {
    if (preselectedUser && isOpen) {
      setSelectedUsers([preselectedUser]);
      setSearchQuery("");
      loadChatHistory(preselectedUser.id);
    }
  }, [preselectedUser, isOpen]);

  // Load existing chat messages (only for single user)
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

  // ✅ FIXED: Allow multiple user selection
  function handleSelectUser(user) {
    setSelectedUsers((prev) => [...prev, user]); // Add to array
    setSearchQuery("");
    setSearchResults([]);

    // Only load chat history if it's the first and only user
    if (selectedUsers.length === 0) {
      loadChatHistory(user.id);
    } else {
      // Clear messages when multiple users selected
      setMessages([]);
    }

    searchInputRef.current?.focus();
  }

  function handleRemoveUser(userId) {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));

    // If removing last user, clear messages
    if (selectedUsers.length === 1) {
      setMessages([]);
    }
    // If only one user left after removal, load their chat
    else if (selectedUsers.length === 2) {
      const remainingUser = selectedUsers.find((u) => u.id !== userId);
      if (remainingUser) {
        loadChatHistory(remainingUser.id);
      }
    }

    searchInputRef.current?.focus();
  }

  async function handleSendMessage(e) {
    e?.preventDefault();
    if (!message.trim() || selectedUsers.length === 0 || sending) return;

    setSending(true);
    const messageText = message.trim();

    try {
      // Send to all selected users
      const promises = selectedUsers.map((user) =>
        fetch(`${API_BASE}/api/messages/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            receiver_id: user.id,
            text: messageText,
          }),
        })
      );

      const results = await Promise.all(promises);

      if (results.every((res) => res.ok)) {
        // For single user, add message to chat
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

        // Clear input
        setMessage("");
        textareaRef.current?.focus();
      } else {
        console.error("Some messages failed to send");
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

  function toggleMinimize() {
    setIsMinimized(!isMinimized);
  }

  function handleKeyDown(e) {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey && selectedUsers.length > 0) {
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
  const showChat = selectedUsers.length === 1 && !searchQuery;
  const isSingleUser = selectedUsers.length === 1;
  const isMultipleUsers = selectedUsers.length > 1;

  return (
    <div className="message-modal-overlay">
      <div
        className={`message-modal ${isMinimized ? "minimized" : ""}`}
        ref={modalRef}
      >
        {/* Header */}
        <div className="message-modal-header">
          <div className="header-left">
            <h2>New message</h2>
            {selectedUsers.length > 0 && (
              <span className="header-recipient">
                {isSingleUser
                  ? `to: ${selectedUsers[0].name}`
                  : `${selectedUsers.length} recipients`}
              </span>
            )}
          </div>
          <div className="message-modal-actions">
            <button
              className="icon-btn"
              onClick={toggleMinimize}
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
            </button>
            <button className="icon-btn" onClick={handleClose} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* EXPANDED VIEW */}
        {!isMinimized && (
          <>
            {/* Recipients Section */}
            <div className="message-modal-recipients">
              <div className="recipients-input-wrapper">
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

            {/* Single User - Show Chat */}
            {showChat && (
              <>
                <div className="selected-user-info">
                  <div className="user-info-card">
                    <img
                      src={
                        selectedUsers[0].avatar_url
                          ? `${API_BASE}${selectedUsers[0].avatar_url}`
                          : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={selectedUsers[0].name}
                      className="user-info-avatar"
                    />
                    <div className="user-info-details">
                      <h3 className="user-info-name">
                        {selectedUsers[0].name}{" "}
                        <span className="user-degree">• 1st</span>
                      </h3>
                      <p className="user-info-title">
                        {selectedUsers[0].title || "Professional"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="messages-container">
                  {messages.length === 0 ? (
                    <div className="no-messages">
                      <p>Start a conversation with {selectedUsers[0].name}</p>
                    </div>
                  ) : (
                    <div className="messages-list">
                      {groupMessagesByDate(messages).map((item, idx) => {
                        if (item.type === "date") {
                          return (
                            <DateSeparator
                              key={`date-${idx}`}
                              date={item.date}
                            />
                          );
                        } else {
                          return (
                            <MessageBubble
                              key={item.data.id || idx}
                              message={item.data}
                              API_BASE={API_BASE}
                              currentUserId={currentUserId}
                            />
                          );
                        }
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Multiple Users - Show Info */}
            {isMultipleUsers && !searchQuery && (
              <div className="selected-user-info">
                <p className="info-text">
                  Sending to {selectedUsers.length} recipients
                </p>
                <div className="users-preview">
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
                        <h3 className="user-info-name">{user.name}</h3>
                        <p className="user-info-title">
                          {user.title || "Professional"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            {selectedUsers.length > 0 && (
              <>
                <div className="message-modal-body">
                  <textarea
                    ref={textareaRef}
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
              </>
            )}
          </>
        )}

        {/* MINIMIZED VIEW */}
        {isMinimized && (
          <>
            {/* Single User Minimized */}
            {isSingleUser && (
              <>
                <div className="minimized-chips">
                  {selectedUsers.map((user) => (
                    <UserChip
                      key={user.id}
                      user={user}
                      onRemove={handleRemoveUser}
                    />
                  ))}
                </div>

                <div className="minimized-messages">
                  {messages.length === 0 ? (
                    <div className="no-messages-small">
                      <p>Start a conversation</p>
                    </div>
                  ) : (
                    <div className="messages-list">
                      {groupMessagesByDate(messages).map((item, idx) => {
                        if (item.type === "date") {
                          return (
                            <DateSeparator
                              key={`date-${idx}`}
                              date={item.date}
                            />
                          );
                        } else {
                          return (
                            <MessageBubble
                              key={item.data.id || idx}
                              message={item.data}
                              API_BASE={API_BASE}
                              currentUserId={currentUserId}
                            />
                          );
                        }
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <div className="minimized-input">
                  <textarea
                    ref={textareaRef}
                    placeholder="Write a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="minimized-textarea"
                    rows={2}
                  />
                </div>

                <div className="minimized-footer">
                  <div className="message-tools">
                    <button className="tool-btn-small" title="Attach image">
                      <Image size={16} />
                    </button>
                    <button className="tool-btn-small" title="Attach file">
                      <Paperclip size={16} />
                    </button>
                    <button className="tool-btn-small" title="GIF">
                      GIF
                    </button>
                    <button className="tool-btn-small" title="Emoji">
                      <Smile size={16} />
                    </button>
                  </div>
                  <button
                    className="send-btn-small"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                    title="Send"
                  >
                    Send
                  </button>
                  <button className="more-btn-small">•••</button>
                </div>
              </>
            )}

            {/* Multiple Users Minimized */}
            {isMultipleUsers && (
              <>
                <div className="minimized-chips">
                  {selectedUsers.map((user) => (
                    <UserChip
                      key={user.id}
                      user={user}
                      onRemove={handleRemoveUser}
                    />
                  ))}
                  <button
                    className="add-more-btn"
                    onClick={() => searchInputRef.current?.focus()}
                    title="Add more recipients"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Group Name Input */}
                <div className="group-name-section">
                  <label className="group-name-label">Group name</label>
                  <input
                    type="text"
                    className="group-name-input"
                    placeholder="Group name (optional)"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>

                <div className="minimized-input">
                  <textarea
                    ref={textareaRef}
                    placeholder="Write a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="minimized-textarea"
                    rows={3}
                  />
                </div>

                <div className="minimized-footer">
                  <div className="message-tools">
                    <button className="tool-btn-small" title="Attach image">
                      <Image size={16} />
                    </button>
                    <button className="tool-btn-small" title="Attach file">
                      <Paperclip size={16} />
                    </button>
                    <button className="tool-btn-small" title="GIF">
                      GIF
                    </button>
                    <button className="tool-btn-small" title="Emoji">
                      <Smile size={16} />
                    </button>
                  </div>
                  <button
                    className="send-btn-small"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sending}
                  >
                    Send
                  </button>
                  <button className="more-btn-small">•••</button>
                </div>
              </>
            )}
          </>
        )}
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

// Message Bubble Component
function MessageBubble({ message, API_BASE, currentUserId }) {
  const isSent = message.sender_id === currentUserId;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get sender info (for received messages)
  const senderAvatar = message.sender_avatar_url
    ? `${API_BASE}${message.sender_avatar_url}`
    : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <div className={`message-bubble ${isSent ? "sent" : "received"}`}>
      {!isSent && (
        <div className="message-header">
          <img
            src={senderAvatar}
            alt={message.sender_name}
            className="message-avatar"
          />
          <div className="message-sender-info">
            <span className="message-sender-name">{message.sender_name}</span>
            <span className="message-time">
              {formatTime(message.created_at)}
            </span>
          </div>
        </div>
      )}

      <div className={`message-content ${!isSent ? "with-avatar" : ""}`}>
        <p>{message.message_text || message.text}</p>
      </div>

      {isSent && (
        <span className="message-time">{formatTime(message.created_at)}</span>
      )}
    </div>
  );
}

// Date Separator Component
function DateSeparator({ date }) {
  const formatDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    messageDate.setHours(0, 0, 0, 0);

    if (messageDate.getTime() === today.getTime()) {
      return "TODAY";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "YESTERDAY";
    } else {
      const now = new Date();
      const diffTime = now - new Date(timestamp);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // If within last week, show day name
      if (diffDays < 7) {
        return new Date(timestamp)
          .toLocaleDateString("en-US", {
            weekday: "long",
          })
          .toUpperCase();
      }

      // If this year, show month and day
      if (new Date(timestamp).getFullYear() === now.getFullYear()) {
        return new Date(timestamp)
          .toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
          .toUpperCase();
      }

      // Otherwise show month and year
      return new Date(timestamp)
        .toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
        .toUpperCase();
    }
  };

  return (
    <div className="date-separator">
      <span className="date-separator-text">{formatDate(date)}</span>
    </div>
  );
}

// Helper function to group messages by date
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
