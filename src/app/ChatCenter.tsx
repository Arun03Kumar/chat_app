import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const ChatCenter = ({ selectedUserText, sender, receiver }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize Socket.IO
    socket.current = io("http://localhost:1337", {
      query: { userId: sender.user.id },
      transports: ["websocket"],
    });

    // Listen for real-time messages
    socket.current.on("receive_message", (data) => {
      console.log("Received message:", data);
      if (data.conversationId === selectedUserText?.id) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    });

    return () => {
      socket.current.disconnect(); // Cleanup on unmount
    };
  }, [sender.user.id, selectedUserText?.id]);

  // Update messages when `selectedUserText` changes
  useEffect(() => {
    if (receiver) {
      if (selectedUserText?.messages) {
        setMessages(selectedUserText.messages);
      } else {
        setMessages([]); // Clear messages if no conversation exists
      }
    } else {
      setMessages([]); // Clear messages if no receiver is selected
    }
  }, [receiver, selectedUserText]);

  // Scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && sender && receiver) {
      const messageData = {
        content: input,
        senderId: sender.user.id,
        receiverId: receiver,
      };

      // Emit the message to the server
      socket.current.emit("send_message", messageData);

      // Optimistically update the UI
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          Content: [
            {
              type: "paragraph",
              children: [{ type: "text", text: input }],
            },
          ],
          sender: { id: sender.user.id },
        },
      ]);

      setInput("");
    }
  };

  return (
    <div className="flex flex-col w-full h-screen items-center">
      {!receiver ? (
        <div className="flex-1 flex items-center justify-center">
          <h2 className="text-gray-300 text-xl">Start a conversation</h2>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto h-9/12 p-4 space-y-4 w-9/12 mt-16 bg-gray-800 rounded-lg">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg?.sender?.id === sender.user.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg text-white ${
                    msg?.sender?.id === sender.user.id
                      ? "bg-blue-600 text-right"
                      : "bg-gray-700 text-left"
                  }`}
                >
                  {msg?.Content?.[0]?.children?.[0]?.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex w-9/12 p-4 sticky bottom-0 bg-gray-900 rounded-lg">
            <input
              type="text"
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-md outline-none placeholder-gray-400"
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
        </>
      )}
    </div>
  );
};

export default ChatCenter;
