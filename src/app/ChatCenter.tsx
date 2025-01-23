import React, { useState, useEffect, useRef } from "react";

const ChatCenter = ({ selectedUserText, sender, receiver }) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to the latest message when messages update
  useEffect(() => {
    console.log(selectedUserText);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedUserText]);

  const handleSend = async () => {
    if (input.trim() && sender && receiver) {
      try {
        // Assuming you want to create a message in an existing conversation
        // or create a new conversation if one doesn't exist
        const response = await fetch("http://localhost:1337/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
          body: JSON.stringify({
            data: {
              Content: [
                {
                  type: "paragraph",
                  children: [{ type: "text", text: input }],
                },
              ],
              senders: [sender.user.id],
              convs: selectedUserText.id,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error.message || "Failed to send message");
        }

        const result = await response.json();
        console.log("Message sent:", result);

        // Optionally, you might want to refresh the messages or update the UI
        setInput("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-screen items-center">
      {/* Chat Messages Section */}
      <div className="flex-1 overflow-y-auto h-9/12 p-4 space-y-4 w-9/12 mt-16 bg-gray-800 rounded-lg">
        {selectedUserText &&
          selectedUserText?.messages?.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg?.senders[0]?.id == sender.user.id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg text-white ${
                  msg.senders[0]?.id == sender.user.id
                    ? "bg-blue-600 text-right"
                    : "bg-gray-700 text-left"
                }`}
              >
                {/* Render message content */}
                {msg?.Content[0]?.children[0]?.text}
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
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
    </div>
  );
};

export default ChatCenter;
