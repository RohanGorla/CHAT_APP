import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { LuSend } from "react-icons/lu";
import FriendsList from "./FriendsList";
import axios from "axios";

function Chats() {
  /* SPECIAL VARIABLES */
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  const navigate = useNavigate();
  const { socket, chat, setChat } = useOutletContext();
  const textAreaRef = useRef(null);
  /* STATE VARIABLES */
  const [message, setMessage] = useState("");

  /* SEND MESSAGES TO THE WEB SOCKET SERVER */
  async function sendMessage(e) {
    e.preventDefault();
    socket.emit("message_input", { username, message });
    setMessage("");
  }

  function adjustHeight(e) {
    const textArea = textAreaRef.current;
    if (!e.target.value.length) return (textArea.style.height = "40px");
    textArea.style.height = "auto";
    textArea.style.height = textArea.scrollHeight + "px";
    setMessage(e.target.value);
  }

  useEffect(() => {
    /* NAVIGATE TO LOGIN PAGE IF USER IS NOT LOGGED IN */
    if (!userData) return navigate("/login");
  }, []);

  return (
    <div className="Chat_Page">
      <FriendsList />
      <div className="Chat_Container" ref={chatContainerRef}>
        <section className="Chat--Messages" ref={messagesRef}>
          {chat.map((message, index) => {
            return (
              <div
                key={index}
                className={
                  username === message.name
                    ? "Chat--Message_Card Chat--Message_Card--Own"
                    : "Chat--Message_Card Chat--Message_Card--Others"
                }
              >
                <p
                  className={
                    username === message.name
                      ? "Chat--Message_Card--Username--Inactive"
                      : "Chat--Message_Card--Username"
                  }
                >
                  {message.name}
                </p>
                <p className="Chat--Message_Card--Message">{message.msg}</p>
              </div>
            );
          })}
        </section>
        <section className="Chat--New_Message">
          <form onSubmit={sendMessage} className="Chat--New_Message--Form">
            <textarea
              ref={textAreaRef}
              type="text"
              value={message}
              onChange={adjustHeight}
            ></textarea>
            <button type="submit">
              <LuSend />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Chats;
