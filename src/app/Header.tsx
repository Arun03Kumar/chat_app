import { ModeToggle } from "@/components/mode-toggle";
import React from "react";

const Header = ({ selectedUser, otherUsers, onlineUsers }) => {
  const selectedUserDetails = otherUsers.find(
    (user) => user.id === selectedUser
  );

  const isSelectedUserOnline = selectedUserDetails
    ? onlineUsers.includes(String(selectedUserDetails.id))
    : false;
  return (
    <div className="flex justify-between items-center sticky top-0 bg-gray-0 w-10/12">
      {selectedUserDetails ? (
        <div className="flex items-center space-x-2">
          <span className="font-medium text-lg">
            {selectedUserDetails.username}
          </span>
          <div
            className={`w-2 h-2 rounded-full ${
              isSelectedUserOnline ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>
      ) : (
        <p className="text-gray-500">No User Selected</p>
      )}
      <ModeToggle />
    </div>
  );
};

export default Header;
