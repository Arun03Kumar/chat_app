// import React, { useState, useEffect, useRef } from "react";

// const ChatCenter = ({ selectedUserText, sender, receiver }) => {
//   const [input, setInput] = useState("");
//   const messagesEndRef = useRef(null);

//   // Scroll to the latest message when messages update
//   useEffect(() => {
//     console.log(selectedUserText);
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [selectedUserText]);

//   const handleSend = async () => {
//     if (input.trim() && sender && receiver) {
//       try {
//         const response = await fetch("http://localhost:1337/api/messages", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("jwt")}`,
//           },
//           body: JSON.stringify({
//             data: {
//               Content: [
//                 {
//                   type: "paragraph",
//                   children: [{ type: "text", text: input }],
//                 },
//               ],
//               senders: [sender?.user?.id],
//               convs: selectedUserText?.id,
//             },
//           }),
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.error.message || "Failed to send message");
//         }

//         const result = await response.json();
//         console.log("Message sent:", result);

//         // Optionally, refresh messages or update the UI
//         setInput("");
//       } catch (error) {
//         console.error("Error sending message:", error);
//       }
//     }
//   };

//   return (
//     <div className="flex flex-col w-full h-screen items-center">
//       {/* Conditional Rendering */}
//       {!receiver ? (
//         <div className="flex-1 flex items-center justify-center">
//           <h2 className="text-gray-300 text-xl">Start a conversation</h2>
//         </div>
//       ) : (
//         <>
//           {/* Chat Messages Section */}
//           <div className="flex-1 overflow-y-auto h-9/12 p-4 space-y-4 w-9/12 mt-16 bg-gray-800 rounded-lg">
//             {selectedUserText &&
//               selectedUserText?.messages?.map((msg, index) => (
//                 <div
//                   key={index}
//                   className={`flex ${
//                     msg?.senders[0]?.id == sender.user.id
//                       ? "justify-end"
//                       : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-xs p-3 rounded-lg text-white ${
//                       msg.senders[0]?.id == sender.user.id
//                         ? "bg-blue-600 text-right"
//                         : "bg-gray-700 text-left"
//                     }`}
//                   >
//                     {/* Render message content */}
//                     {msg?.Content[0]?.children[0]?.text}
//                   </div>
//                 </div>
//               ))}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input Section */}
//           <div className="flex w-9/12 p-4 sticky bottom-0 bg-gray-900 rounded-lg">
//             <input
//               type="text"
//               className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-md outline-none placeholder-gray-400"
//               placeholder="Type a message..."
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSend()}
//             />
//             <button
//               onClick={handleSend}
//               className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
//             >
//               Send
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ChatCenter;


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
      if (data.conversationId === selectedUserText?.id) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    });

    return () => {
      socket.current.disconnect(); // Cleanup on unmount
    };
  }, [sender.user.id, selectedUserText]);

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
