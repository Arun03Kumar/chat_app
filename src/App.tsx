import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";
import ChatCenter from "./app/ChatCenter";
import Layout from "./app/Layout";
import Header from "./app/Header";
import Page from "./app/login/page";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserText, setSelectedUserText] = useState(null);
  const [conversationNew, setConversationNew] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      fetchUserDetails(jwt);
    }
  }, []);

  const fetchUserDetails = async (jwt) => {
    try {
      const response = await fetch("http://localhost:1337/api/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      const user = await response.json();
      setUserDetails({ jwt, user });
      setIsLoggedIn(true);
      fetchOtherUsers(jwt, user.id);

      const socket = io("http://localhost:1337", {
        query: { userId: user.id },
        transports: ["websocket"],
      });

      socket.on("update_user_status", (onlineUserIds) => {
        console.log(`[Frontend] Online users updated:`, onlineUserIds);
        setOnlineUsers(onlineUserIds);
      });

      socket.on("disconnect", () => {
        console.log("[Frontend] Socket disconnected.");
      });
    } catch (error) {
      console.error("Error validating user:", error);
      localStorage.removeItem("jwt");
    }
  };

  const handleAuthSuccess = async (data) => {
    setIsLoggedIn(true);
    localStorage.setItem("jwt", data.jwt);
    setUserDetails({ jwt: data.jwt, user: data.user });

    fetchOtherUsers(data.jwt, data.user.id);
  };

  useEffect(() => {
    if (selectedUser && isLoggedIn && userDetails) {
      const conv = fetchConversationsBetweenUsers(
        userDetails?.jwt,
        userDetails?.user?.id,
        selectedUser
      );
      conv.then((x) => {
        console.log(x, selectedUser);
        setSelectedUserText(x[0]);
      });
      const conv2 = fetchOrCreateConversation(
        userDetails?.jwt,
        userDetails?.user?.id,
        selectedUser
      );
      conv2.then((x) => {
        console.log(x, selectedUser);
        setConversationNew(x);
      });
    }
  }, [isLoggedIn, selectedUser, userDetails]);

  const fetchOrCreateConversation = async (jwt, senderId, receiverId) => {
    try {
      const response = await fetch(
        `http://localhost:1337/api/conversations?filters[participants][id][$in]=${senderId}&filters[participants][id][$in]=${receiverId}&populate[participants][populate]=*`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      let conversation = data.data[0]; 

      if (!conversation) {
        console.log(`[Frontend] No conversation found. Creating a new one.`);
        const createResponse = await fetch(
          "http://localhost:1337/api/conversations",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
              data: {
                Title: `Conversation between ${senderId} and ${receiverId}`,
                participants: [senderId, receiverId],
              },
            }),
          }
        );

        if (!createResponse.ok) {
          throw new Error("Failed to create a conversation");
        }

        const createData = await createResponse.json();
        conversation = createData.data; 
      }

      console.log(`[Frontend] Conversation fetched or created:`, conversation);
      return conversation; 
    } catch (error) {
      console.error("Error fetching or creating conversation:", error);
      return null;
    }
  };

  const fetchConversationsBetweenUsers = async (
    jwt,
    loggedInUserId,
    clickedUserId
  ) => {
    try {
      const response = await fetch(
        // `http://localhost:1337/api/conversations?filters[participants][id][$in]=${loggedInUserId}&filters[participants][id][$in]=${clickedUserId}&populate=participants&populate=messages`,
        // `http://localhost:1337/api/conversations?filters[participants][id][$in]=${loggedInUserId}&filters[participants][id][$in]=${clickedUserId}&populate[0]=participants&populate[1]=messages&populate[messages][populate][0]=senders`,
        `http://localhost:1337/api/conversations?filters[participants][id][$in]=${loggedInUserId}&filters[participants][id][$in]=${clickedUserId}&populate[participants][populate]=*&populate[1]=messages&populate[messages][populate]=sender`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error.message || "Failed to fetch conversations"
        );
      }

      const data = await response.json();
      const conversations = data.data;
      console.log(conversations);
      const temp = conversations.filter((item) => {
        if (!item.participants || !Array.isArray(item.participants)) {
          console.error("Participants array missing or invalid:", item);
          return false;
        }

        const participantIds = item?.participants.map((p) => p?.id);
        console.log("Participant IDs:", participantIds);

        const match = [loggedInUserId, clickedUserId].every((id) =>
          participantIds?.includes(id)
        );
        console.log("Match for conversation ID", item?.id, ":", match);

        return match;
      });

      console.log("Filtered Conversations:", temp);
      return temp;
    } catch (error) {
      console.error("Error fetching conversation ID:", error);
      return null;
    }
  };

  const fetchOtherUsers = async (jwt, loggedInUserId) => {
    try {
      const response = await fetch("http://localhost:1337/api/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const users = await response.json();
      const filteredUsers = users.filter((user) => user.id !== loggedInUserId);
      setOtherUsers(filteredUsers);
      console.log(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <div>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {!isLoggedIn ? (
          <Page onAuthSuccess={handleAuthSuccess} />
        ) : (
          <Layout
            userDetails={userDetails}
            otherUsers={otherUsers}
            setSelectedUser={setSelectedUser}
            onlineUsers={onlineUsers}
          >
            <Header
              selectedUser={selectedUser}
              otherUsers={otherUsers}
              onlineUsers={onlineUsers}
            />
            <ChatCenter
              selectedUserText={selectedUserText}
              conversationNew={conversationNew}
              sender={userDetails}
              receiver={selectedUser}
            />
          </Layout>
        )}
      </ThemeProvider>
    </div>
  );
}

export default App;
