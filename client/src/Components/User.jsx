import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { IoIosChatboxes, IoMdPerson } from "react-icons/io";
import { RiSearch2Fill } from "react-icons/ri";
import { GoBellFill } from "react-icons/go";
import { SiTicktick } from "react-icons/si";

function User() {
  /* ESTABLISHING CONNECTION TO THE WEB SOCKET */
  const socket = useMemo(() => io(`${import.meta.env.VITE_SERVER_URL}`), []);
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES */
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [friends, setFriends] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [searchRooms, setSearchRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("");
  const [chats, setChats] = useState([]);
  const [roomChats, setRoomChats] = useState([]);
  const [usernameColor, setUsernameColor] = useState("");

  /* SHOW AND HIDE POPUP NOTIFICATION FUNCTION */
  function Popup(message) {
    setShowPopup(true);
    setPopupMessage(message);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  }

  /* WEB SOCKET EVENT LISTENERS */
  useEffect(() => {
    /* CHAT RELATED EVENTS */
    socket.on("receive_message", (payload) => {
      setChats([
        ...chats,
        {
          usr_nm: payload.userData.username,
          usr_id: payload.userData.userId,
          msg: payload.message,
          room: payload.id,
          time: payload.time,
          read: payload.read,
        },
      ]);
    });
    socket.on("message_read_updated", ({ id, userData }) => {
      const updatedChat = chats.filter((message) => {
        if (message.room === id && message.usr_id !== userData.userId)
          message.read = true;
        return message;
      });
      setChats(updatedChat);
    });
    socket.on("chat_deleted", ({ from, to, room }) => {
      const updatedChat = chats.filter(
        (message) => message.room !== room.roomId
      );
      setChats(updatedChat);
      /* DELETE CHAT POPUP */
      if (from.userId === userData.userId) Popup(`Chat messages deleted!`);
      if (to.usr_id === userData.userId)
        Popup(`${from.username} deleted the chat!`);
    });
    /* FRIENDS AND ROOMS RELATED EVENTS */
    socket.on("friend_request", (payload) => {
      setNotifications([...notifications, payload]);
      if (payload.to.usr_id === userData.userId)
        Popup(`${payload.from.username} sent a Fren request!`);
      if (payload.from.userId === userData.userId)
        Popup(`Fren request sent to ${payload.to.usr_nm}!`);
    });
    socket.on("remove_friend", ({ from, to, roomToRemove }) => {
      const updatedRooms = rooms.filter(
        (room) => room.roomId !== roomToRemove.roomId
      );
      setRooms(updatedRooms);
      setSearchRooms(updatedRooms);
      const updatedFriends = friends.filter((friend) => {
        if (friend.usr_id !== from.userId && friend.usr_id !== to.usr_id)
          return friend;
      });
      setFriends(updatedFriends);
      const updatedChats = chats.filter(
        (chat) => chat.room !== roomToRemove.roomId
      );
      setChats(updatedChats);
      /* REMOVE FRIEND POPUP */
      if (from.userId === userData.userId)
        Popup(`Removed ${to.usr_nm} as fren!`);
      if (to.usr_id === userData.userId)
        Popup(`${from.username} removed you as fren!`);
    });
    socket.on("request_rejected", ({ oldNotification, newNotification }) => {
      const updatedNotifications = notifications.filter(
        (notification) => notification._id !== oldNotification._id
      );
      if (oldNotification.to.usr_id === userData.userId)
        return setNotifications(updatedNotifications);
      setNotifications([...updatedNotifications, newNotification]);
    });
    socket.on("join_room", (payload) => {
      socket.emit("join_room", payload);
    });
    socket.on("join_room_success", ({ from, to }) => {
      socket.emit("get_user_data", { room: userData.userId });
      if (from.userId === userData.userId)
        Popup(`${to.usr_nm} accepted your fren request!`);
      if (to.usr_id === userData.userId)
        Popup(`You are now frens with ${from.username}!`);
    });
    /* UPDATE CREDENTIAL RELATED EVENTS */
    socket.on("update_username", ({ userId, username }) => {
      /* CHANGE USERNAME IN FRIENDS LIST */
      const updatedFriends = friends.map((friend) => {
        if (friend.usr_id === userId) friend.usr_nm = username;
        return friend;
      });
      setFriends(updatedFriends);
      /* CHANGE USERNAME IN ROOMS LIST */
      const updatedRooms = rooms.map((room) => {
        if (
          room.users.includes(userId) &&
          room.type === "single" &&
          room.users[room.users.indexOf(userId)] !== userData.userId
        )
          room.name = username;
        return room;
      });
      setRooms(updatedRooms);
      /* CHANGE USERNAME IN NOTIFICATIONS */
      const updatedNotifications = notifications.map((notification) => {
        if (notification.to.usr_id === userId) {
          notification.to.usr_nm = username;
        } else if (notification.from.userId === userId) {
          notification.from.username = username;
        }
        return notification;
      });
      setNotifications(updatedNotifications);
      /* CHANGE USERNAME IN CHATS */
      const updatedChats = chats.map((chat) => {
        if (chat.usr_id === userId) chat.usr_nm = username;
        return chat;
      });
      setChats(updatedChats);
      /* CHANGE USERNAME POPUP */
      if (userData.userId === userId) Popup(`Username changed to ${username}`);
    });
    socket.on("update_userid", ({ oldUserid, newUserid }) => {
      /* CHANGE USERID IN FRIENDS LIST */
      const updatedFriends = friends.map((friend) => {
        if (friend.usr_id === oldUserid) friend.usr_id = newUserid;
        return friend;
      });
      setFriends(updatedFriends);
      /* CHANGE USERID IN ROOMS LIST */
      const updatedRooms = rooms.map((room) => {
        if (room.users.includes(oldUserid))
          room.users[room.users.indexOf(oldUserid)] = newUserid;
        return room;
      });
      setRooms(updatedRooms);
      /* CHANGE USERID IN NOTIFICATIONS */
      const updatedNotifications = notifications.map((notification) => {
        if (notification.to.usr_id === oldUserid) {
          notification.to.usr_id = newUserid;
        } else if (notification.from.userId === oldUserid) {
          notification.from.userId = newUserid;
        }
        return notification;
      });
      setNotifications(updatedNotifications);
      /* CHANGE USERID IN CHATS */
      const updatedChats = chats.map((chat) => {
        if (chat.usr_id === oldUserid) chat.usr_id = newUserid;
        return chat;
      });
      setChats(updatedChats);
      /* CHANGE USER ID POPUP */
      if (userData.userId === oldUserid)
        Popup(`Userid changed to ${newUserid}`);
    });
    socket.on("update_email", ({ userId, newEmail }) => {
      /* CHANGE EMAIL IN FRIENDS LIST */
      const updatedFriends = friends.map((friend) => {
        if (friend.usr_id === userId) friend.email = newEmail;
        return friend;
      });
      setFriends(updatedFriends);
      /* CHANGE EMAIL IN NOTIFICATIONS */
      const updatedNotifications = notifications.map((notification) => {
        if (notification.to.usr_id === userId) {
          notification.to.email = newEmail;
        } else if (notification.from.userId === userId) {
          notification.from.mail = newEmail;
        }
        return notification;
      });
      setNotifications(updatedNotifications);
      /* CHANGE EMAIL POPUP */
      if (userData.userId === userId) Popup(`Email id changed to ${newEmail}`);
    });
    socket.on("update_password", () => {
      Popup("Password changed successfully");
    });
  });

  /* GET THE NEW NOTIFICATIONS */
  useEffect(() => {
    const newNotifications = notifications.filter(
      (notification) => !notification.seen
    );
    console.log(newNotifications);
  }, [notifications]);

  useEffect(() => {
    if (!userData) {
      navigate("/login");
    } else {
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
        rooms.map((room) => {
          if (room.type === "single") {
            const friendId = room.users.filter(
              (user) => user !== userData.userId
            );
            const friend = friends.filter(
              (friend) => friend.usr_id === friendId[0]
            );
            room.name = friend[0].usr_nm;
          }
        });
        setRooms(rooms);
        setSearchRooms(rooms);
        setFriends(friends);
        setChats(chats);
        setNotifications(notifications);
      });
      /* SELECT AND SET A UNIQUE COLOR FOR USERNAME IN CHATS PAGE CARDS */
      const usernameColors = ["orange", "green", "violet", "goldenrod"];
      const randomColor =
        usernameColors[Math.floor(Math.random() * usernameColors.length)];
      setUsernameColor(randomColor);
      navigate("friends");
    }
  }, []);

  return (
    <div className="User_Page">
      {/* POP UP NOTIFICATIONS */}
      <div
        className={showPopup ? "User_PopUp User_PopUp--Active" : "User_PopUp"}
      >
        <div className="User_PopUp_Card">
          <p className="User_PopUp--Message">{popupMessage}</p>
          <SiTicktick className="User_PopUp--Icon" />
        </div>
      </div>
      {/* NAVBAR */}
      <nav className="User_Navbar">
        <p className="User_Appname">Frens</p>
        <div className="User_Nav_Options">
          <NavLink
            to="/user/friends"
            className={({ isActive }) =>
              isActive
                ? "User_Nav_Options--Active"
                : "User_Nav_Options--Inactive"
            }
          >
            <IoIosChatboxes className="User_Nav_Options--Icon" />
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
          <NavLink
            to="/user/profile"
            className={({ isActive }) =>
              isActive
                ? "User_Nav_Options--Active"
                : "User_Nav_Options--Inactive"
            }
          >
            <IoMdPerson className="User_Nav_Options--Icon" />
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
            currentRoom,
            setCurrentRoom,
            friends,
            setFriends,
            notifications,
            setNotifications,
            chats,
            setChats,
            roomChats,
            setRoomChats,
            usernameColor,
            setUsernameColor,
          }}
        />
      </section>
    </div>
  );
}

export default User;
