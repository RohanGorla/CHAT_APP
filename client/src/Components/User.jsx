import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import { ImUsers } from "react-icons/im";
import { RiSearch2Fill } from "react-icons/ri";
import { GoBellFill } from "react-icons/go";

function User() {
  /* ESTABLISHING CONNECTION TO THE WEB SOCKET */
  const socket = useMemo(() => io(`${import.meta.env.VITE_SERVER_URL}`), []);
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES */
  const [notifications, setNotifications] = useState([]);
  const [friends, setFriends] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [chat, setChat] = useState([]);

  /* WEB SOCKET EVENT LISTENERS */
  useEffect(() => {
    socket.on("allChat", (paylod) => {
      setChat(paylod);
    });
    socket.on("message_output", (payload) => {
      setChat([...chat, { name: payload.username, msg: payload.message }]);
    });
    socket.on("friend_request", (payload) => {
      console.log(payload);
      setNotifications([...notifications, payload]);
    });
    socket.on("join_room", (payload) => {
      console.log(payload);
      socket.emit("join_room", payload);
    });
  });

  useEffect(() => {
    /* SEND USER ID TO GET USER DATA ON SOCKET CONNECTION */
    socket.on("socket_connect", () => {
      socket.emit("get_user_data", { room: userData.userId });
    });
    /* GET ALL USER ROOMS, FRIENDS LIST AND NOTIFICATIONS */
    socket.on("user_data", ({ rooms, friends, notifications }) => {
      console.log(
        "Rooms Data -> ",
        rooms,
        "\n\nFriends Data -> ",
        friends,
        "\n\nNotifications Data -> ",
        notifications
      );
      setRooms(rooms);
      setFriends(friends);
      setNotifications(notifications);
    });
  }, []);

  return (
    <div className="User_Page">
      {/* NAVBAR */}
      <nav className="User_Navbar">
        <p className="User_Appname">Chat app</p>
        <div className="User_Nav_Options">
          <NavLink
            to="/user/friends"
            className={({ isActive }) =>
              isActive
                ? "User_Nav_Options--Active"
                : "User_Nav_Options--Inactive"
            }
          >
            <ImUsers className="User_Nav_Options--Icon" />
          </NavLink>
          <NavLink
            to="/user/findfriends"
            className={({ isActive }) =>
              isActive
                ? "User_Nav_Options--Active"
                : "User_Nav_Options--Inactive"
            }
          >
            <RiSearch2Fill className="User_Nav_Options--Icon" />
          </NavLink>
          <NavLink
            to="/user/notifications"
            className={({ isActive }) =>
              isActive
                ? "User_Nav_Options--Active"
                : "User_Nav_Options--Inactive"
            }
          >
            <GoBellFill className="User_Nav_Options--Icon" />
          </NavLink>
        </div>
      </nav>
      {/* RENDER OUTLET ELEMENTS */}
      <section className="User_Outlet_Container">
        <Outlet
          context={{
            socket,
            rooms,
            setRooms,
            friends,
            setFriends,
            notifications,
            setNotifications,
            chat,
            setChat,
          }}
        />
      </section>
    </div>
  );
}

export default User;
