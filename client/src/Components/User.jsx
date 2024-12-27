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
  const [searchRooms, setSearchRooms] = useState([]);
  const [chats, setChats] = useState([]);
  const [roomChats, setRoomChats] = useState([]);

  /* WEB SOCKET EVENT LISTENERS */
  useEffect(() => {
    socket.on("receive_message", (payload) => {
      setChats([
        ...chats,
        {
          usr_nm: payload.userData.username,
          usr_id: payload.userData.userId,
          msg: payload.message,
          room: payload.id,
          time: payload.time,
        },
      ]);
    });
    socket.on("friend_request", (payload) => {
      setNotifications([...notifications, payload]);
    });
    socket.on("join_room", (payload) => {
      socket.emit("join_room", payload);
    });
    socket.on("join_room_success", () => {
      socket.emit("get_user_data", { room: userData.userId });
    });
    socket.on("request_rejected", () => {
      socket.emit("get_user_data", { room: userData.userId });
    });
  });

  useEffect(() => {
    /* SEND USER ID TO GET USER DATA ON SOCKET CONNECTION */
    socket.on("socket_connect", () => {
      socket.emit("get_user_data", { room: userData.userId });
    });
    /* GET ALL USER ROOMS, FRIENDS LIST AND NOTIFICATIONS */
    socket.on("user_data", ({ rooms, friends, chats, notifications }) => {
      console.log(
        "Rooms Data -> ",
        rooms,
        "\n\nFriends Data -> ",
        friends,
        "\n\nNotifications Data -> ",
        notifications,
        "\n\nChats Data -> ",
        chats
      );
      setRooms(rooms);
      setSearchRooms(rooms);
      setFriends(friends);
      setChats(chats);
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
            searchRooms,
            setSearchRooms,
            friends,
            setFriends,
            notifications,
            setNotifications,
            chats,
            setChats,
            roomChats,
            setRoomChats,
          }}
        />
      </section>
    </div>
  );
}

export default User;
