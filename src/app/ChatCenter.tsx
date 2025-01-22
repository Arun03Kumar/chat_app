import React, { useState, useEffect, useRef } from "react";

const ChatCenter = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you today?", sender: "AI" },
    { text: "Can you tell me about ChatGPT?", sender: "You" },
    {
      text: "Sure! ChatGPT is a large language model trained by OpenAI.",
      sender: "AI",
    },
    { text: "That's amazing! How does it work?", sender: "You" },
    {
      text: "It uses deep learning to generate responses based on input prompts.",
      sender: "AI",
    },
    {
      text: "It uses deep learning to generate responses based on input prompts.",
      sender: "AI",
    },
    {
      text: "It uses deep learning to generate responses based on input prompts.",
      sender: "AI",
    },
    {
      text: "It uses deep learning to generate responses based on input prompts.",
      sender: "AI",
    },
    {
      text: "It uses deep learning to generate responses based on input prompts.",
      sender: "AI",
    },
    {
      text: "It uses deep learning to generate responses based on input prompts.",
      sender: "AI",
    },
  ]);

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef?.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: "You" }]);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col w-full h-screen items-center">
      <div className="flex-1 overflow-y-auto h-9/12 p-4 space-y-4 w-9/12 mt-16">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "You" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${
                msg.sender === "You" ? "bg-sidebar" : "bg-sidebar"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex w-9/12 p-4 sticky bottom-0">
        <input
          type="text"
          className="flex-1 px-4 py-2 bg-sidebar text-white rounded-md outline-none placeholder-gray-400"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatCenter;
