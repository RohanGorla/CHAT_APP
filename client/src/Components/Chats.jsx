import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { LuSend } from "react-icons/lu";
import FriendsList from "./FriendsList";

function Chats() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const { id } = useParams();
  const { socket, chats, roomChats, setRoomChats } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES AND ELEMENT REFS */
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef(null);
  const messagesRef = useRef(null);
  const textAreaContainerRef = useRef(null);
  const textAreaRef = useRef(null);

  /* SEND MESSAGES TO THE WEB SOCKET SERVER */
  async function sendMessage(e) {
    e.preventDefault();
    socket.emit("send_message", { userData, message, id, time: new Date() });
    setMessage("");
  }

  /* MAKE ADJUSTMENTS TO THE HEIGHTS OF NECESSARY COMPONENTS WHENEVER TEXT CHANGES IN TEXTAREA */
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    const messages = messagesRef.current;
    const textArea = textAreaRef.current;
    const textAreaContainer = textAreaContainerRef.current;
    /* READJUST THE HEIGHTS OF COMPONENTS */
    textArea.style.height = textAreaContainer.style.height = "50px";
    messages.style.height = `${chatContainer.offsetHeight - 50}px`;
    /* SET THE HEIGHTS OF COMPONENTS ACCORDING TO THE TEXT IN TEXTAREA */
    textAreaContainer.style.height =
      textArea.style.height = `${textArea.scrollHeight}px`;
    messages.style.height = `${
      chatContainer.offsetHeight - textArea.scrollHeight
    }px`;
    /* SCROLL THE MESSAGES CONTAINER TO BOTTOM IF TEXTAREA HAS MULTIPLE LINE TEXT */
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [message]);

  /* FILTER OUT THE MESSAGES OF THE PRESENT CHAT FROM ALL CHAT MESSAGES ON SENDING/RECEIVING MESSAGE */
  useEffect(() => {
    const roomChats = chats.filter((message) => message.room === id);
    setRoomChats(roomChats);
  }, [chats]);

  /* SCROLL TO THE BOTTOM/LATEST MESSAGE */
  useEffect(() => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [roomChats]);

  useEffect(() => {
    /* NAVIGATE TO LOGIN PAGE IF USER IS NOT LOGGED IN */
    if (!userData) return navigate("/login");
  }, []);

  return (
    <div className="Chat_Page">
      <section className="Chat_Friends_List_Container">
        <FriendsList />
      </section>
      <div className="Chat_Container" ref={chatContainerRef}>
        <section className="Chat--Messages" ref={messagesRef}>
          {roomChats.map((message, index) => {
            return (
              <div
                key={index}
                className={
                  userData?.userId === message.usr_id
                    ? "Chat--Message_Card Chat--Message_Card--Own"
                    : "Chat--Message_Card Chat--Message_Card--Others"
                }
              >
                <p
                  className={
                    userData?.userId === message.usr_id
                      ? "Chat--Message_Card--Username--Inactive"
                      : "Chat--Message_Card--Username"
                  }
                >
                  {message.usr_nm}
                </p>
                <p className="Chat--Message_Card--Message">{message.msg}</p>
              </div>
            );
          })}
        </section>
        <section className="Chat--New_Message" ref={textAreaContainerRef}>
          <form onSubmit={sendMessage} className="Chat--New_Message--Form">
            <textarea
              ref={textAreaRef}
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              autoFocus
              placeholder="Type a message..."
            ></textarea>
            <button type="submit">
              <LuSend size={25} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Chats;
