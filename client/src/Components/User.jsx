import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import { PiChats } from "react-icons/pi";
import { CiSearch } from "react-icons/ci";
import { IoNotificationsOutline } from "react-icons/io5";
import "../App.css";

function User() {
  /* ESTABLISHING CONNECTION TO THE WEB SOCKET */
  const socket = useMemo(() => io(`${import.meta.env.VITE_SERVER_URL}`), []);
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES */
  const [notif, setNotif] = useState("");

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
    socket.on("friend_request", (payload) => {
      setNotif(payload.type);
    });
  });

  return (
    <div className="User_Page">
      <nav className="User_Navbar">
        <p className="User_Appname">Chat app</p>
        <div className="User_Nav_Options">
          <NavLink
            to="/user/chats"
            className={({ isActive }) =>
              isActive ? "User_Nav_Options--Selected" : ""
            }
          >
            <PiChats className="User_Nav_Options--Icon" size={25} />
          </NavLink>
          <NavLink
            to="/user/findfriends"
            className={({ isActive }) =>
              isActive ? "User_Nav_Options--Selected" : ""
            }
          >
            <CiSearch className="User_Nav_Options--Icon" size={25} />
          </NavLink>
          <NavLink
            to="/user/notifications"
            className={({ isActive }) =>
              isActive ? "User_Nav_Options--Selected" : ""
            }
          >
            <IoNotificationsOutline
              className="User_Nav_Options--Icon"
              size={25}
            />
          </NavLink>
        </div>
      </nav>
      <Outlet context={{ socket, notif, setNotif }} />
    </div>
  );
}

export default User;