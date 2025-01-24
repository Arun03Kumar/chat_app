// import "./App.css";
// import { ThemeProvider } from "@/components/theme-provider";
// import ChatCenter from "./app/ChatCenter";
// import Layout from "./app/Layout";
// import Header from "./app/Header";
// import Page from "./app/login/page";
// import { useState, useEffect } from "react";

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [userDetails, setUserDetails] = useState(null);
//   const [otherUsers, setOtherUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null)
//   const [selectedUserText, setSelectedUserText] = useState(null)

//   const handleAuthSuccess = async (data) => {
//     // Store JWT and user details
//     setIsLoggedIn(true);
//     localStorage.setItem("jwt", data.jwt);
//     setUserDetails({jwt: data.jwt, user: data.user});

//     // Fetch all users except the logged-in user
//     fetchOtherUsers(data.jwt, data.user.id);
//     // fetchConversations(data.jwt);
//     // const mess = fetchAllMessages(data.jwt);
//     // mess.then((x) => console.log(x));
//   };

//   useEffect(() => {
//     if(isLoggedIn && userDetails) {
//       const conv = fetchConversationsBetweenUsers(userDetails?.jwt, userDetails?.user?.id, selectedUser);
//       conv.then((x) => 
//         {
//           console.log(x, selectedUser)
//           setSelectedUserText(x[0])
//         }
//     );
//     }

//   }, [isLoggedIn, selectedUser, userDetails])

//   // const fetchAllMessages = async (jwt) => {
//   //   try {
//   //     const response = await fetch(
//   //       "http://localhost:1337/api/messages?populate[conversation][populate]=participant",
//   //       {
//   //         method: "GET",
//   //         headers: {
//   //           Authorization: `Bearer ${jwt}`,
//   //         },
//   //       }
//   //     );

//   //     if (!response.ok) {
//   //       const errorData = await response.json();
//   //       throw new Error(errorData.error.message || "Failed to fetch messages");
//   //     }

//   //     const data = await response.json();
//   //     return data.data; // Array of messages
//   //   } catch (error) {
//   //     console.error("Error fetching messages:", error);
//   //     return [];
//   //   }
//   // };

//   // const fetchConversations = async (jwt) => {
//   //   const response = await fetch(
//   //     "http://localhost:1337/api/conversations?populate=participant",
//   //     {
//   //       headers: {
//   //         Authorization: `Bearer ${jwt}`,
//   //       },
//   //     }
//   //   );
//   //   const conversations = await response.json();
//   //   console.log(conversations);
//   // };

//   const fetchConversationsBetweenUsers = async (
//     jwt,
//     loggedInUserId,
//     clickedUserId
//   ) => {
//     try {
//       const response = await fetch(
//         // `http://localhost:1337/api/conversations?filters[participants][id][$in]=${loggedInUserId}&filters[participants][id][$in]=${clickedUserId}&populate=participants&populate=messages`,
//         // `http://localhost:1337/api/conversations?filters[participants][id][$in]=${loggedInUserId}&filters[participants][id][$in]=${clickedUserId}&populate[0]=participants&populate[1]=messages&populate[messages][populate][0]=senders`,
//         `http://localhost:1337/api/conversations?filters[participants][id][$in]=${loggedInUserId}&filters[participants][id][$in]=${clickedUserId}&populate[participants][populate]=*&populate[1]=messages&populate[messages][populate]=sender`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${jwt}`,
//           },
//         }
//       );
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error.message || "Failed to fetch conversations");
//       }
  
//       const data = await response.json();
//       const conversations = data.data;
//       console.log(conversations)
//       // Check if there's an existing conversation
//       const temp = conversations.filter((item) => {
//         // Ensure participants array exists and is populated
//         if (!item.participants || !Array.isArray(item.participants)) {
//           console.error("Participants array missing or invalid:", item);
//           return false;
//         }
      
//         // Extract participant IDs
//         const participantIds = item?.participants.map((p) => p?.id);
//         console.log("Participant IDs:", participantIds);
      
//         // Check if both loggedInUserId and clickedUserId are present
//         const match = [loggedInUserId, clickedUserId].every((id) => participantIds?.includes(id));
//         console.log("Match for conversation ID", item?.id, ":", match);
      
//         return match;
//       });
      
//       console.log("Filtered Conversations:", temp);
//       return temp;
//     } catch (error) {
//       console.error("Error fetching conversation ID:", error);
//       return null;
//     }
//   };

//   const fetchOtherUsers = async (jwt, loggedInUserId) => {
//     try {
//       const response = await fetch("http://localhost:1337/api/users", {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${jwt}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to fetch users");
//       }

//       const users = await response.json();
//       // Exclude the logged-in user
//       const filteredUsers = users.filter((user) => user.id !== loggedInUserId);
//       setOtherUsers(filteredUsers);
//       console.log(filteredUsers);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   return (
//     <div>
//       <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
//         {!isLoggedIn ? (
//           <Page onAuthSuccess={handleAuthSuccess} />
//         ) : (
//           <Layout userDetails={userDetails} otherUsers={otherUsers} setSelectedUser={setSelectedUser}>
//             <Header />
//             {/* <ChatCenter selectedUserText={selectedUserText} sender={userDetails?.user?.id} receiver={selectedUser} /> */}
//             <ChatCenter selectedUserText={selectedUserText} sender={userDetails} receiver={selectedUser} />
//           </Layout>
//         )}
//       </ThemeProvider>
//     </div>
//   );
// }

// export default App;

import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";
import ChatCenter from "./app/ChatCenter";
import Layout from "./app/Layout";
import Header from "./app/Header";
import Page from "./app/login/page";
import { useState, useEffect } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [otherUsers, setOtherUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserText, setSelectedUserText] = useState(null);

  useEffect(() => {
    // Check for JWT in localStorage and validate it
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
    } catch (error) {
      console.error("Error validating user:", error);
      localStorage.removeItem("jwt"); // Remove invalid token
    }
  };

  const handleAuthSuccess = async (data) => {
    // Store JWT and user details
    setIsLoggedIn(true);
    localStorage.setItem("jwt", data.jwt);
    setUserDetails({ jwt: data.jwt, user: data.user });

    // Fetch all users except the logged-in user
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
    }
  }, [isLoggedIn, selectedUser, userDetails]);

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
        throw new Error(errorData.error.message || "Failed to fetch conversations");
      }

      const data = await response.json();
      const conversations = data.data;
      console.log(conversations);
      // Check if there's an existing conversation
      const temp = conversations.filter((item) => {
        // Ensure participants array exists and is populated
        if (!item.participants || !Array.isArray(item.participants)) {
          console.error("Participants array missing or invalid:", item);
          return false;
        }

        // Extract participant IDs
        const participantIds = item?.participants.map((p) => p?.id);
        console.log("Participant IDs:", participantIds);

        // Check if both loggedInUserId and clickedUserId are present
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
      // Exclude the logged-in user
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
          >
            <Header />
            <ChatCenter
              selectedUserText={selectedUserText}
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


