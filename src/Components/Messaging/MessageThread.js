import React, { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";


export default function MessageThread({ messages, currentUser }) {
  const bottomRef = useRef();

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="message-thread">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} currentUser={currentUser} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
