import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { IoMdSend } from "react-icons/io";
import axios from "axios";
import "../Styles/Chats.css";

function Chats() {
  /* SPECIAL VARIABLES */
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  const navigate = useNavigate();
  /* STATE VARIABLES */
  const [username, setUsername] = useState("");
  const [chatslist, setChatslist] = useState([]);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  /* ESTABLISHING CONNECTION TO THE WEB SOCKET */
  const socket = useMemo(() => io(`${import.meta.env.VITE_SERVER_URL}`), []);

  /* SEND MESSAGES TO THE WEB SOCKET SERVER */
  async function sendMessage(e) {
    e.preventDefault();
    socket.emit("message_input", { username, message });
    setMessage("");
  }

  /* WEB SOCKET EVENT LISTENERS */
  useEffect(() => {
    socket.on("socket_connect", (payload) => {
      socket.emit("join_personal", { room: userData.userId });
    });
    socket.on("allChat", (paylod) => {
      setChat(paylod);
    });
    socket.on("message_output", (payload) => {
      setChat([...chat, { name: payload.username, msg: payload.message }]);
    });
  });

  useEffect(() => {
    /* NAVIGATE TO LOGIN PAGE IF USER IS NOT LOGGED IN */
    if (!userData) return navigate("/login");
  }, []);

  return (
    <div className="Chat_App">
      <div className="Chat_App--Container">
        <section className="Chat_App--Header">
          <h1>Chit-Chat</h1>
        </section>
        <section className="Chat_App--Chats">
          <div className="Chat_App--Chat_Messages">
            {chat.map((message, index) => {
              return (
                <div
                  key={index}
                  className={
                    username === message.name
                      ? "Chat_App--Chat_Message Chat_App--Chat_Message--Own"
                      : "Chat_App--Chat_Message Chat_App--Chat_Message--Others"
                  }
                >
                  <p
                    className={
                      username === message.name
                        ? "Chat_App--Chat_Message--Username--Inactive"
                        : "Chat_App--Chat_Message--Username"
                    }
                  >
                    {message.name}
                  </p>
                  <p className="Chat_App--Chat_Message--Message">
                    {message.msg}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
        <section className="Chat_App--Type_Message">
          <form onSubmit={sendMessage} className="Chat_App--Type_Message--Form">
            <input
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            ></input>
            <button type="submit">
              <IoMdSend size={25} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Chats;
