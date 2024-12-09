import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import upload from "../../lib/upload";


const ChatBox = () => {
    const { userData, messagesId, chatUser, messages, setMessages,chatVisible, setChatVisible } =
        useContext(AppContext);

    const [input, setInput] = useState("");

    const sendMessage = async()=>{
        try {
            if(input && messagesId){
                await updateDoc(doc(db,"messages",messagesId),{
                    messages: arrayUnion({
                        sId: userData.id,
                        text: input,
                        createdAt: new Date()
                    })
                })

                const userIDs = [chatUser.rId,userData.id];
                userIDs.forEach(async(id)=>{
                    const userChatsRef = doc(db,'chats',id);
                    const userChatsRefSnapShot = await getDoc(userChatsRef);
                    if(userChatsRefSnapShot.exists()){
                        const userChatData = userChatsRefSnapShot.data();
                        const chatIndex = userChatData.chatData.findIndex((c)=>c.messageId === messagesId)
                        userChatData.chatData[chatIndex].lastMessage = input.slice(0,30);
                        userChatData.chatData[chatIndex].updatedAt = Date.now()
                        if(userChatData.chatData[chatIndex].rId === userData.id){
                            userChatData.chatData[chatIndex].messageSeen = false
                        }
                        await updateDoc(userChatsRef,{
                            chatData: userChatData.chatData
                        })
                    }
                })
            }

        } catch (error) {
            console.log(error);
        }
        setInput("");
    }

    const sendImage = async (event)=>{
        try {
            const fileUrl = await upload(event.target.files[0]);
            if(fileUrl && messagesId){
                await updateDoc(doc(db,"messages",messagesId),{
                    messages: arrayUnion({
                        sId: userData.id,
                        image: fileUrl,
                        createdAt: new Date()
                    })
                })
            }
            
            const userIDs = [chatUser.rId,userData.id];
            userIDs.forEach(async(id)=>{
                const userChatsRef = doc(db,'chats',id);
                const userChatsRefSnapShot = await getDoc(userChatsRef);
                if(userChatsRefSnapShot.exists()){
                    const userChatData = userChatsRefSnapShot.data();
                    const chatIndex = userChatData.chatData.findIndex((c)=>c.messageId === messagesId)
                    userChatData.chatData[chatIndex].lastMessage = "image";
                    userChatData.chatData[chatIndex].updatedAt = Date.now()
                    if(userChatData.chatData[chatIndex].rId === userData.id){
                        userChatData.chatData[chatIndex].messageSeen = false
                    }
                    await updateDoc(userChatsRef,{
                        chatData: userChatData.chatData
                    })
                }
            })    
        } 
        catch (error) {
            console.log(error);
        }
    }

    
    const convertTimestamp = (timestamp)=>{
        let date = timestamp.toDate();
        const hr = date.getHours();
        const min = date.getMinutes();
        if(hr>12){
            return `${hr-12}:${min} PM`;
        }
        else{
            return `${hr}:${min} AM`;
        }
    }
    
    useEffect(()=>{
        if(messagesId){
            const unSub = onSnapshot(doc(db,"messages",messagesId),(res)=>{
                const fetchedMessages = res.data()?.messages || [];
                setMessages([...fetchedMessages].reverse());
            })

            return ()=>{ unSub() }
        }
    },[messagesId])

    return chatUser ? (
        <div className={`chat-box ${chatVisible ?"" :"hidden" }`}>
            <div className="chat-user">
                <img src={chatUser.userData.avatar} alt="" />
                <p>
                    {chatUser.userData.name} {Date.now()-chatUser.userData.lastSeen <= 70000 ? <img className="dot" src={assets.green_dot} alt="" />: null}
                </p>
                <img src={assets.help_icon} alt="" />
                <img onClick={()=>{setChatVisible(false)}} src={assets.arrow_icon} className="arrow" alt="" />
            </div>

            <div className="chat-msg">
                {
                messages.map((msg,index)=>(
                    <div key = {index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
                        {
                            msg['image']
                            ? <img className="msg-img" src={msg.image} alt="" />
                            : <p className="msg">{msg.text}</p>
                        }
                        
                        <div>
                            <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
                            <p>{convertTimestamp(msg.createdAt)}</p>
                        </div>
                    </div>
                ))
                }
            </div>

            <div className="chat-input">
                <input onChange={(e)=>{setInput(e.target.value)}} value={input} type="text" placeholder="Send a message" />
                <input onChange={sendImage} type="file" id="image" accept="image/png image/jpeg" hidden />
                <label htmlFor="image">
                    <img src={assets.gallery_icon} alt="" />
                </label>
                <img onClick={sendMessage} src={assets.send_button} alt="" />
            </div>
        </div>
    )
    :
    (<div className={`chat-welcome ${chatVisible ?"" :"hidden" }`}>
        <img src={assets.logo_icon} alt="" />
        <p>Chat anytime, anywhere</p>
    </div>
    )
}

export default ChatBox;
