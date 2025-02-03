import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { IoIosChatboxes, IoMdPerson } from "react-icons/io";
import { RiSearch2Fill } from "react-icons/ri";
import { GoBellFill, GoDotFill } from "react-icons/go";
import { SiTicktick } from "react-icons/si";
import { GiCancel } from "react-icons/gi";
import axios from "axios";
import logoUrl from "../assets/Logo";

function User() {
  /* ESTABLISHING CONNECTION TO THE WEB SOCKET */
  const socket = useMemo(() => io(`${import.meta.env.VITE_SERVER_URL}`), []);
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES */
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [newNotifications, setNewNotifications] = useState([]);
  const [friends, setFriends] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [searchRooms, setSearchRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("");
  const [chats, setChats] = useState([]);
  const [roomChats, setRoomChats] = useState([]);

  /* GET PROFILE PICTURE GET URL FUNCTION */
  async function generateGetUrl(key) {
    const generateGetUrlResponse = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/generategeturl`,
      {
        key,
      }
    );
    return generateGetUrlResponse.data.url;
  }

  /* SHOW AND HIDE POPUP NOTIFICATION FUNCTION */
  function Popup(message, type) {
    setShowPopup(true);
    setPopupMessage(message);
    setPopupType(type);
    setTimeout(() => {
      setShowPopup(false);
      setTimeout(() => {
        setPopupMessage("");
      }, 700);
    }, 3000);
  }

  /* WEB SOCKET EVENT LISTENERS */
  /* FOR THESE EVENTS WE HAVE NO DEPENDANCY ARRAY BECAUSE WE UPDATE THE STATE VARIABLES LIVE */
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
    socket.on("message_read_updated", ({ id, userData, type }) => {
      const updatedChat = chats.filter((message) => {
        if (
          type === "single" &&
          message.room === id &&
          message.usr_id !== userData.userId
        )
          message.read = true;
        if (
          type === "group" &&
          message.room === id &&
          !message.read.includes(userData.userId)
        )
          message.read.push(userData.userId);
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
      if (from.userId === userData.userId)
        Popup(`Chat messages deleted!`, "Good");
      if (to.usr_id === userData.userId)
        Popup(`${from.username} deleted the chat!`, "Bad");
    });
    /* FRIEND REQUESTS RELATED EVENTS */
    socket.on("friend_request", (payload) => {
      const updatedNotifications = notifications.filter(
        (notification) =>
          !(
            notification.from.userId === payload.from.userId &&
            notification.to.usr_id === payload.to.usr_id
          )
      );
      setNotifications([...updatedNotifications, payload]);
      if (payload.to.usr_id === userData.userId)
        Popup(`${payload.from.username} sent a Fren request!`, "Good");
      if (payload.from.userId === userData.userId)
        Popup(`Fren request sent to ${payload.to.usr_nm}!`, "Good");
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
        Popup(`Removed ${to.usr_nm} as fren!`, "Good");
      if (to.usr_id === userData.userId)
        Popup(`${from.username} removed you as fren!`, "Bad");
    });
    socket.on("request_rejected", ({ oldNotification, newNotification }) => {
      const updatedNotifications = notifications.filter(
        (notification) => notification._id !== oldNotification._id
      );
      if (oldNotification.to.usr_id === userData.userId)
        return setNotifications(updatedNotifications);
      setNotifications([...updatedNotifications, newNotification]);
      if (oldNotification.from.userId === userData.userId)
        Popup(
          `${oldNotification.to.usr_nm} rejected your fren request!`,
          "Bad"
        );
    });
    socket.on("request_deleted", (payload) => {
      const updatedNotifications = notifications.filter(
        (notification) => notification._id !== payload._id
      );
      setNotifications(updatedNotifications);
    });
    /* GROUP RELATED EVENTS */
    socket.on("exit_group_success", ({ id, user, name }) => {
      if (user.userId === userData.userId) {
        const updatedRooms = rooms.filter((room) => room.roomId !== id);
        setRooms(updatedRooms);
        setSearchRooms(updatedRooms);
        Popup(`You left ${name}!`, "Good");
      } else {
        const updatedRooms = rooms.map((room) => {
          if (room.roomId === id) {
            const updatedUsers = room.users.filter(
              (groupUser) => groupUser !== user.userId
            );
            room.users = updatedUsers;
            const updatedMembers = room.members.filter(
              (member) => member.usr_id !== user.userId
            );
            room.members = updatedMembers;
          }
          return room;
        });
        setRooms(updatedRooms);
        setSearchRooms(updatedRooms);
        Popup(`${user.username} left ${name}!`, "Bad");
      }
    });
    socket.on("group_picture_updated", async ({ id, key, groupName, url }) => {
      const updatedRooms = rooms.map((room) => {
        if (room.roomId === id) {
          room.imageTag = key;
          room.imageUrl = url;
        }
        return room;
      });
      setRooms(updatedRooms);
      setSearchRooms(updatedRooms);
      Popup(`${groupName} group picture updated!`, "Good");
    });
    socket.on("group_name_updated", ({ id, oldRoomname, newRoomname }) => {
      const updatedRooms = rooms.map((room) => {
        if (room.roomId === id) room.name = newRoomname;
        return room;
      });
      setRooms(updatedRooms);
      setSearchRooms(updatedRooms);
      Popup(`${oldRoomname} is now ${newRoomname}`, "Good");
    });
    socket.on("group_deleted", ({ id, groupName, from }) => {
      const updatedRooms = rooms.filter((room) => room.roomId !== id);
      setRooms(updatedRooms);
      setSearchRooms(updatedRooms);
      if (from.userId === userData.userId)
        return Popup(`You deleted ${groupName}.`, "Bad");
      Popup(`${from.username} deleted ${groupName}!`, "Bad");
    });
    /* UPDATE CREDENTIAL RELATED EVENTS */
    socket.on("update_profile_picture", async ({ userId, key, url }) => {
      /* CHANGE PROFILE PICTURE IN FRIENDS LIST */
      const updatedFriends = friends.map((friend) => {
        if (friend.usr_id === userId) {
          friend.imageTag = key;
          friend.imageUrl = url;
        }
        return friend;
      });
      setFriends(updatedFriends);
      /* CHANGE PROFILE PICTURE IN ROOMS LIST */
      const updatedRooms = rooms.map((room) => {
        if (
          room.users.includes(userId) &&
          room.type === "single" &&
          room.users[room.users.indexOf(userId)] !== userData.userId
        ) {
          room.imageTag = key;
          room.imageUrl = url;
        }
        return room;
      });
      setRooms(updatedRooms);
      setSearchRooms(updatedRooms);
      /* CHANGE USERNAME IN NOTIFICATIONS */
      const updatedNotifications = notifications.map((notification) => {
        if (notification.to.usr_id === userId) {
          notification.to.imageTag = key;
        } else if (notification.from.userId === userId) {
          notification.from.imageTag = key;
        }
        return notification;
      });
      setNotifications(updatedNotifications);
      /* CHANGE PROFILE PICTURE POPUP */
      if (userData.userId === userId) Popup(`Updated profile picture!`, "Good");
    });
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
      setSearchRooms(updatedRooms);
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
      if (userData.userId === userId)
        Popup(`Username changed to ${username}`, "Good");
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
      setSearchRooms(updatedRooms);
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
        Popup(`Userid changed to ${newUserid}`, "Good");
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
      if (userData.userId === userId)
        Popup(`Email id changed to ${newEmail}`, "Good");
    });
    socket.on("update_password", () => {
      Popup("Password changed successfully", "Good");
    });
  });

  /* ADD A NEW FRIEND AND JOIN ROOM SOCKET EVENTS */
  /* HERE WE SPECIFY AN EMPTY DEPENDANCY ARRAY BECAUSE WE ARE NOT UPDATING STATE VARIABLES
     HERE WE ONLY WANT TO MOUNT THESE EVENTS WHEN COMPONENT MOUNTS */
  useEffect(() => {
    /* JOIN SINGLE ROOM SOCKET EVENTS */
    socket.on("join_room", (payload) => {
      socket.emit("join_room", payload);
    });
    socket.on("join_room_success", ({ from, to }) => {
      socket.emit("get_user_data", { room: userData.userId });
      if (from.userId === userData.userId)
        Popup(`${to.usr_nm} accepted your fren request!`, "Good");
      if (to.usr_id === userData.userId)
        Popup(`You are now frens with ${from.username}!`, "Good");
    });
    /* JOIN GROUP ROOM SOCKET EVENTS */
    socket.on("join_group", (payload) => {
      socket.emit("join_group", payload);
    });
    socket.on("join_group_success", ({ groupName, createdBy }) => {
      socket.emit("get_user_data", { room: userData.userId });
      if (createdBy.usr_id === userData.userId)
        Popup(`${groupName} has been created!`, "Good");
      else Popup(`${createdBy.usr_nm} added you in ${groupName}`, "Good");
    });
    socket.on("group_members_added", ({ groupName }) => {
      socket.emit("get_user_data", { room: userData.userId });
      Popup(`New members have been added to ${groupName}!`, "Good");
    });
  }, []);

  /* GET THE NEW NOTIFICATIONS */
  useEffect(() => {
    const newNotifications = notifications.filter((notification) => {
      if (
        notification.to.usr_id === userData.userId &&
        !notification.seen &&
        notification.type !== "Reject"
      )
        return notification;
      if (
        notification.from.userId === userData.userId &&
        !notification.seen &&
        notification.type === "Reject"
      )
        return notification;
    });
    setNewNotifications(newNotifications);
  }, [notifications]);

  /* CREATE A SOCKET CONNECTION AND GET USER DATA */
  useEffect(() => {
    if (!userData) {
      navigate("/login");
    } else {
      /* SEND USER ID TO GET USER DATA ON SOCKET CONNECTION */
      socket.on("socket_connect", () => {
        socket.emit("get_user_data", { room: userData.userId });
      });
      /* GET ALL USER ROOMS, FRIENDS LIST AND NOTIFICATIONS */
      socket.on(
        "user_data",
        async ({ rooms, friends, chats, notifications }) => {
          for (let i = 0; i < friends.length; i++) {
            if (friends[i].imageTag)
              friends[i].imageUrl = await generateGetUrl(friends[i].imageTag);
          }
          for (let i = 0; i < rooms.length; i++) {
            switch (rooms[i].type) {
              case "single":
                const friendId = rooms[i].users.filter(
                  (user) => user !== userData.userId
                );
                const friend = friends.filter(
                  (friend) => friend.usr_id === friendId[0]
                );
                rooms[i].name = friend[0].usr_nm;
                if (friend[0].imageUrl) {
                  rooms[i].imageTag = friend[0].imageTag;
                  rooms[i].imageUrl = friend[0].imageUrl;
                }
                break;

              case "group":
                const groupMembers = friends.filter((friend) =>
                  rooms[i].users.includes(friend.usr_id)
                );
                rooms[i].members = groupMembers;
                if (rooms[i]?.imageTag)
                  rooms[i].imageUrl = await generateGetUrl(rooms[i].imageTag);
                break;

              default:
                break;
            }
          }
          setRooms(rooms);
          setSearchRooms(rooms);
          setFriends(friends);
          setChats(chats);
          setNotifications(notifications);
        }
      );
      navigate("/user/friends");
    }
  }, []);

  return (
    <div className="User_Page">
      {/* POP UP NOTIFICATIONS */}
      <div
        className={showPopup ? "User_PopUp User_PopUp--Active" : "User_PopUp"}
      >
        <div
          className={
            popupType === "Good"
              ? "User_PopUp_Card User_PopUp_Card--Good"
              : "User_PopUp_Card User_PopUp_Card--Bad"
          }
        >
          <p className="User_PopUp--Message">{popupMessage}</p>
          <SiTicktick
            className={
              popupType === "Good"
                ? "User_PopUp--Icon User_PopUp--Icon--Good"
                : "Inactive"
            }
          />
          <GiCancel
            className={
              popupType === "Bad"
                ? "User_PopUp--Icon User_PopUp--Icon--Bad"
                : "Inactive"
            }
          />
        </div>
      </div>
      {/* NAVBAR */}
      <nav className="User_Navbar">
        <div className="User_App--Logo_And_Name">
          <img className="User_App--Logo" src={`data:image/png;base64,${logoUrl}`}></img>
          <p className="User_App--Name">frens</p>
        </div>
        <div className="User_Nav_Options">
          {/* NAVBAR CHATS ICON */}
          <div className="User_Nav_Options--Navlink">
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
          </div>
          {/* NAVBAR FIND FRIENDS ICON */}
          <div className="User_Nav_Options--Navlink">
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
          </div>
          {/* NAVBAR NOTIFICATIONS ICON */}
          <div className="User_Nav_Options--Navlink">
            <GoDotFill
              className={
                newNotifications.length ? "User_Nav_Options--Alert" : "Inactive"
              }
            />
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
          {/* NAVBAR PROFILE ICON */}
          <div className="User_Nav_Options--Navlink">
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
          }}
        />
      </section>
    </div>
  );
}

export default User;
