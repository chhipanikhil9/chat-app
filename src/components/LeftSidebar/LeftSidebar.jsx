import React, { useContext, useEffect, useState } from "react";
import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { auth, db, logout } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData, chatData,messagesId, setMessages, setMessagesId, setChatUser,chatVisible, setChatVisible, chatUser } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (event) => {
    try {
      const input = event.target.value.toLowerCase();
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "==", input));
        const querySnap = await getDocs(q);
        const selectedUser = querySnap.docs[0].data();

        if (!querySnap.empty && selectedUser.id !== userData.id) {
          // if searching the selected user then don't set user
          let isSelected = false;
          chatData?.map((item) => {
            if (item.id === selectedUser.id) {
              isSelected = true;
            }
          });
          if (!isSelected) {
            setUser(selectedUser);
          }
        }
        else {
          setUser(null);
          setShowSearch(false);
        }
      }
      else {
        setShowSearch(false);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const addChat = async () => {
    try {
      const messagesRef = collection(db, "messages");
      const chatsRef = collection(db, "chats");
  
      // Check if a chat already exists between the two users
      let existingChat = chatData?.find((chat) => chat.rId === user.id);
      let messageId;
  
      if (existingChat) {
        // If chat exists, use the existing messageId
        messageId = existingChat.messageId;
      } else {
        // Create a new message document if no chat exists
        const newMessageRef = doc(messagesRef, userData.id + "_" + user.id); // Unique ID for the chat
        messageId = newMessageRef.id;
  
        await setDoc(newMessageRef, {
          createAt: serverTimestamp(),
          messages: [],
        });
  
        // Update chats collection for both users
        await updateDoc(doc(chatsRef, user.id), {
          chatData: arrayUnion({
            messageId,
            lastMessage: "",
            rId: userData.id,
            updatedAt: Date.now(),
            messageSeen: true,
          }),
        });
  
        await updateDoc(doc(chatsRef, userData.id), {
          chatData: arrayUnion({
            messageId,
            lastMessage: "",
            rId: user.id,
            updatedAt: Date.now(),
            messageSeen: true,
          }),
        });

        // to show the selected user chat by clicking on it
        const uSnap = await getDoc(doc(db,'users',user.id))
        const uData = uSnap.data();
        setChat({
          messagesId: newMessageRef.id,
          lastMessage: "",
          rId: user.id,
          updatedAt: Date.now(),
          messageSeen: true,
          userData: uData
        });

        setShowSearch(false);
        setChatVisible(true);
      }
  
      // Set state to open the chat
      setMessagesId(messageId);
      setChatUser({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      });
  
      setShowSearch(false); // Hide the search results
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };
  

  const setChat = async(item) => {
    try {
      setMessagesId(item.messageId);
      setChatUser(item);
      const userChatsRef = doc(db,'chats',userData.id);
      const userChatsRefSnapShot = await getDoc(userChatsRef);
      const userChatsData = userChatsRefSnapShot.data();
      const chatIndex = userChatsData.chatData.findIndex((c)=> c.messageId === item.messageId)
      userChatsData.chatData[chatIndex].messageSeen = true;
      await updateDoc(userChatsRef,{
        chatData: userChatsData.chatData
      })
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message);
    }
  };


  useEffect(()=>{
    const updateChatUserData = async()=>{
      if(chatUser){
        const userRef = doc(db,'users',chatUser.userData.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setChatUser(prev=>({...prev,userData: userData}));
      }
    }
    updateChatUserData();
  },[chatData]);

  return (
    <div className={`ls ${chatVisible ? "hidden":""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} alt="" className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p onClick={()=>logout()}>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search here.."
          />
        </div>
      </div>
      <div className="ls-list">
        {
          showSearch && user
            ?
            <div onClick={addChat} className="friends add-user">
              <img src={user.avatar} alt="" />
              <p>{user.name}</p>
            </div>
            :
            chatData?.map((item, index) => (
              <div onClick={() => { setChat(item) }} className={`friends ${item.messageSeen || item.messageId === messagesId ? "": "border"}`} key={index}>
                <img src={item.userData.avatar} alt="" />
                <div>
                  <p>{item.userData.name}</p>
                  <span>{item.lastMessage}</span>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
};

export default LeftSidebar;
