import { ModeToggle } from "@/components/mode-toggle";
import React from "react";

const Header = () => {
  return (
    <div className="flex justify-between items-center sticky top-0 bg-gray-0 w-10/12">
      <p>User Name</p>
      <ModeToggle />
    </div>
  );
};

export default Header;
