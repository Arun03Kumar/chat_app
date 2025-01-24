import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const ChatCenter = ({
  selectedUserText,
  conversationNew,
  sender,
  receiver,
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log(
      `[Frontend] Initializing Socket.IO for user: ${sender.user.id}`
    );
    socket.current = io("http://localhost:1337", {
      query: { userId: sender.user.id },
      transports: ["websocket"],
    });

    socket.current.on("connect", () => {
      console.log(`[Frontend] Socket connected. ID: ${socket.current.id}`);
    });

    if (conversationNew?.id) {
      console.log(
        `[Frontend] Joining conversation room: ${conversationNew.id}`
      );
      socket.current.emit("join_conversation", conversationNew.id);
    }

    socket.current.on("receive_message", (data) => {
      console.log(`[Frontend] Received message:`, data);
      if (data.conversationId === selectedUserText?.id) {
        console.log(
          `[Frontend] Message belongs to current conversation. Updating UI.`
        );
        setMessages((prevMessages) => [...prevMessages, data.message]);
      } else {
        console.log(
          `[Frontend] Message does not belong to current conversation.`
        );
      }
    });

    socket.current.on("message_sent", (data) => {
      console.log(`[Frontend] Message sent confirmation received:`, data);
    });

    socket.current.on("disconnect", () => {
      console.log(`[Frontend] Socket disconnected.`);
    });

    socket.current.on("connect_error", (err) => {
      console.error(`[Frontend] Socket connection error:`, err);
    });

    return () => {
      console.log(`[Frontend] Disconnecting socket.`);
      socket.current.disconnect();
    };
  }, [sender.user.id, conversationNew]);

  useEffect(() => {
    console.log(`[Frontend] selectedUserText changed:`, selectedUserText);
    if (selectedUserText?.messages) {
      setMessages(selectedUserText.messages);
      console.log(`[Frontend] Messages updated from selectedUserText.`);
    } else {
      setMessages([]);
      console.log(
        `[Frontend] No messages found for selectedUserText. Clearing messages.`
      );
    }
  }, [selectedUserText]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      console.log(`[Frontend] Scrolling to the latest message.`);
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && sender && receiver) {
      const messageData = {
        content: input,
        senderId: sender.user.id,
        receiverId: receiver,
        conversationId: conversationNew?.id,
      };

      console.log(`[Frontend] Sending message:`, messageData);

      socket.current.emit("send_message", messageData);

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
      console.log(`[Frontend] Message optimistically added to the UI.`);

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
          <div className="flex-1 overflow-y-auto h-9/12 p-4 space-y-4 w-9/12 mt-16 border rounded-lg">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg?.sender?.id === sender.user.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg?.sender?.id === sender.user.id
                      ? "bg-sidebar text-right"
                      : "bg-sidebar text-left"
                  }`}
                >
                  {msg?.Content?.[0]?.children?.[0]?.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex w-9/12 p-4 sticky bottom-0 rounded-lg">
            <input
              type="text"
              className="flex-1 px-4 py-2 bg-sidebar rounded-md outline-none placeholder-gray-400"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="ml-4 px-4 py-2 bg-sidebar rounded-md hover:bg-gray-500 hover:text-white"
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
