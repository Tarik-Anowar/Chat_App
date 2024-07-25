import { Box } from "@chakra-ui/react";
import React, { useState } from "react";
import { ChatState } from "../context/ChatProvider";
import SideDrawer from "../components/Mislanious/SideDrawer";
import MyChats from "../components/MyChats";
import ChatBox from "../components/ChatBox";

const Chatpage = () => {
  const { user } = ChatState();
  const [fetchAgain,setFetchAgain] = useState(false);

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        flexDirection={{ base: "column", lg: "row" }} 
        width="100%"
        height={{ base: "100vh", lg: "91.5vh" }} 
      >
        {user && <MyChats fetchAgain={fetchAgain} width={{ base: "100%", lg: "31%" }} />} 
        {user && <ChatBox fetchAgain={fetchAgain} width={{ base: "100%", lg: "69%" }} setFetchAgain={setFetchAgain}/>}
      </Box>
    </div>
  );
};

export default Chatpage;
