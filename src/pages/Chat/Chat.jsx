import React, { useContext, useEffect, useState } from "react";
import "./Chat.css";

import Chatbox from "../../components/Chatbox/Chatbox";
import LeftSiderbar from "../../components/LeftSidebar/LeftSidebar";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import { AppContext } from "../../context/AppContext";
  
const Chat = () => {
  const { chatData, userData } = useContext(AppContext)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chatData && userData) {
      setLoading(false);
    }
  }, [chatData, userData]);

  return (
    <div className="chat">
      {
        loading
          ? (<p className="loading">Loading...</p>)
          : (<div className="chat-container">
            <LeftSiderbar />
            <Chatbox />
            <RightSidebar />
          </div>
          )
      }
    </div>
  );
};

export default Chat;
