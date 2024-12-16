import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdSend } from "react-icons/io";
import axios from "axios";
import "../Styles/Friends.css";

function Friends() {
  /* SPECIAL VARIABLES */
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  const navigate = useNavigate();
  const { socket, userChats } = useOutletContext();
  /* STATE VARIABLES */
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");

  /* SEND MESSAGES TO THE WEB SOCKET SERVER */
  async function sendMessage(e) {
    e.preventDefault();
    socket.emit("message_input", { username, message });
    setMessage("");
  }

  useEffect(() => {
    /* NAVIGATE TO LOGIN PAGE IF USER IS NOT LOGGED IN */
    if (!userData) return navigate("/login");
  }, []);

  return (
    <div className="Friends_Page"></div>
  );
}

export default Friends;
