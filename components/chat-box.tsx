"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { id: 1, sender: "other", text: "Hey, welcome to TechConnect!" },
    { id: 2, sender: "me", text: "Thanks! Glad to be here." },
    { id: 3, sender: "other", text: "How’s your week going?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      { id: Date.now(), sender: "me", text: input.trim() },
    ]);
    setInput("");
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-2">Chat</h3>
      <p className="text-sm text-gray-500 mb-4">
        Start a conversation with your followers.
      </p>

      {/* Chat container */}
      <div className="flex flex-col h-80 border rounded-lg bg-white shadow-sm">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-xs text-sm ${
                  msg.sender === "me"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="border-t p-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <Button className="px-4 py-2 text-sm" onClick={sendMessage}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
