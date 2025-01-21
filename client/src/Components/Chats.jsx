import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { LuSend } from "react-icons/lu";
import { IoMdPerson, IoMdArrowRoundBack } from "react-icons/io";
import { GoDotFill } from "react-icons/go";
import { FaXmark } from "react-icons/fa6";
import FriendsList from "./FriendsList";
import axios from "axios";

function Chats() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    socket,
    rooms,
    friends,
    chats,
    roomChats,
    setRoomChats,
    currentRoom,
    setCurrentRoom,
    usernameColor,
  } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES AND ELEMENT REFS */
  const [message, setMessage] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const chatContainerRef = useRef(null);
  const messagesRef = useRef(null);
  const textAreaContainerRef = useRef(null);
  const textAreaRef = useRef(null);

  /* SEND MESSAGES TO THE WEB SOCKET SERVER */
  async function sendMessage(e) {
    e?.preventDefault();
    if (!message.length) return;
    let read;
    if (currentRoom.type === "single") read = false;
    else read = [userData.userId];
    socket.emit("send_message", {
      userData,
      message,
      id,
      time: new Date(),
      read,
    });
    setMessage("");
  }

  /* DELETE ALL THE CHAT MESSAGES SOCKET EVENT */
  async function deleteChat(friend) {
    socket.emit("delete_chat", {
      from: userData,
      to: friend,
      room: currentRoom,
    });
    setShowRoomDetails(false);
    setConfirmDelete(false);
  }

  /* REMOVE FRIEND SOCKET EVENT */
  async function removeFriend(friend) {
    socket.emit("remove_friend", {
      from: userData,
      to: friend,
      room: currentRoom,
    });
  }

  /* MAKE ADJUSTMENTS TO THE HEIGHTS OF NECESSARY COMPONENTS WHENEVER TEXT CHANGES IN TEXTAREA */
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    const messages = messagesRef.current;
    const textArea = textAreaRef.current;
    const textAreaContainer = textAreaContainerRef.current;
    /* READJUST THE HEIGHTS OF COMPONENTS */
    textArea.style.height = textAreaContainer.style.height = "50px";
    messages.style.height = `${chatContainer.offsetHeight - 120}px`;
    /* SET THE HEIGHTS OF COMPONENTS ACCORDING TO THE TEXT IN TEXTAREA */
    textAreaContainer.style.height =
      textArea.style.height = `${textArea.scrollHeight}px`;
    messages.style.height = `${
      chatContainer.offsetHeight - (textArea.scrollHeight + 70)
    }px`;
    /* SCROLL THE MESSAGES CONTAINER TO BOTTOM IF TEXTAREA HAS MULTIPLE LINE TEXT */
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [message]);

  /* GET THE ROOM INFORMATION FROM THE ROOM ID */
  useEffect(() => {
    const room = rooms.filter((room) => room.roomId === id);
    if (!room.length) {
      navigate("/user/friends");
    } else {
      switch (room[0]?.type) {
        /* IF SINGLE CHAT */
        case "single":
          const friendId = room[0].users.filter(
            (user) => user !== userData.userId
          );
          room[0].friendsList = friends.filter(
            (friend) => friend.usr_id === friendId[0]
          );
          break;
        /* IF GROUP CHAT */
        case "group":
          room[0].friendsList = room[0].members;
          break;
      }
      setFriendsList(room[0]?.friendsList);
      setCurrentRoom(room[0]);
    }
  }, [id, rooms]);

  /* FILTER OUT THE MESSAGES OF THE PRESENT CHAT FROM ALL CHAT MESSAGES ON SENDING/RECEIVING MESSAGE */
  useEffect(() => {
    let count = 0;
    if (currentRoom.type === "single") {
      const roomChats = chats.filter((message) => {
        if (
          !message.read &&
          message.usr_id !== userData?.userId &&
          message.room === id
        )
          count += 1;
        if (message.room === id) return message;
      });
      setRoomChats(roomChats);
      if (count > 0) setUnreadMessages(true);
      else setUnreadMessages(false);
    } else {
      const roomChats = chats.filter((message) => {
        if (message.room === id) {
          const readStatus = currentRoom.users.every((id) =>
            message.read.includes(id)
          );
          if (!readStatus && message.usr_id !== userData?.userId) count += 1;
          return message;
        }
      });
      setRoomChats(roomChats);
    }
  }, [id, chats]);

  /* SCROLL TO THE BOTTOM/LATEST MESSAGE */
  useEffect(() => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    if (unreadMessages) socket.emit("update_message_read", { id, userData });
  }, [roomChats]);

  useEffect(() => {
    /* NAVIGATE TO LOGIN PAGE IF USER IS NOT LOGGED IN */
    if (!userData) navigate("/login");
  }, []);

  return (
    <div className="Chat_Page">
      <section className="Chat_Friends_List_Container">
        <FriendsList />
      </section>
      <div className="Chat_Container" ref={chatContainerRef}>
        {/* ROOM FRIENDS INFORMATION CARD */}
        <div
          className={
            showRoomDetails
              ? "Chat--Room_Information_Container"
              : "Chat--Room_Information--Inactive"
          }
        >
          <div className="Chat--Room_Information">
            <FaXmark
              onClick={() => {
                setShowRoomDetails(false);
                setConfirmDelete(false);
                setConfirmRemove(false);
              }}
              className="Chat--Room_Information--Close"
            />
            <div className="Chat--Room_Information--Image">
              {currentRoom.imageUrl ? (
                <div className="Chat--Room_Information--Image_Frame">
                  <img src={currentRoom.imageUrl}></img>
                </div>
              ) : (
                <IoMdPerson className="Chat--Room_Information--Image--Icon" />
              )}
            </div>
            <div className="Chat--Room_Information--Friends_List">
              {friendsList?.map((friend, index) => {
                return (
                  <div
                    key={index}
                    className="Chat--Room_Information--Friend_Container"
                  >
                    {/* ROOM FRIENDS INFORMATION */}
                    <div className="Chat--Room_Information--Friend">
                      {/* SHOW FRIENDS IMAGES IN GROUP TYPE ROOM */}
                      <div
                        className={
                          currentRoom.type === "group"
                            ? "Chat--Room_Information--Friend--Image_Container"
                            : "Chat--Room_Information--Friend--Image_Container--Inactive"
                        }
                      >
                        <div className="Chat--Room_Information--Friend--Image">
                          {friend.imageUrl ? (
                            <div className="Chat--Room_Information--Friend--Image_Frame">
                              <img src={friend.imageUrl}></img>
                            </div>
                          ) : (
                            <IoMdPerson className="Chat--Room_Information--Friend--Icon" />
                          )}
                        </div>
                      </div>
                      {/* SHOW FRIENDS DETAILS */}
                      <div
                        className={
                          currentRoom.type === "group"
                            ? "Chat--Room_Information--Friend--Details"
                            : ""
                        }
                      >
                        <p className="Chat--Room_Information--Friend_Username">
                          {friend.usr_nm}
                        </p>
                        <p className="Chat--Room_Information--Friend_Userid">
                          {friend.usr_id}
                        </p>
                        <p
                          className={
                            currentRoom.type === "single"
                              ? "Chat--Room_Information--Friend_Email"
                              : "Chat--Room_Information--Friend_Email--Inactive"
                          }
                        >
                          <span className="Chat--Room_Information--Friend_Email--Heading">
                            Contact email:
                          </span>
                          {friend.email}
                        </p>
                      </div>
                    </div>
                    {/* ROOM CHAT DELETE OPTIONS */}
                    <div
                      className={
                        currentRoom.type === "single"
                          ? confirmDelete || confirmRemove
                            ? "Chat--Room_Information--Buttons--Inactive"
                            : "Chat--Room_Information--Buttons"
                          : "Chat--Room_Information--Buttons--Inactive"
                      }
                    >
                      <button
                        className="Chat--Room_Information--Buttons--Danger"
                        onClick={() => {
                          setConfirmDelete(true);
                          setConfirmRemove(false);
                        }}
                      >
                        Delete chat
                      </button>
                    </div>
                    <div
                      className={
                        confirmDelete
                          ? "Chat--Room_Information--Confirm_Delete"
                          : "Chat--Room_Information--Confirm_Delete--Inactive"
                      }
                    >
                      <p className="Chat--Room_Information--Confirm_Delete--Message">
                        This action will delete all the messages in this chat.
                        Confirm delete if you want to proceed.
                      </p>
                      <div className="Chat--Room_Information--Buttons">
                        <button
                          className="Chat--Room_Information--Buttons--Cancel"
                          onClick={() => setConfirmDelete(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="Chat--Room_Information--Buttons--Danger"
                          onClick={() => deleteChat(friend)}
                        >
                          Confirm delete
                        </button>
                      </div>
                    </div>
                    {/* REMOVE FRIEND OPTIONS */}
                    <div
                      className={
                        currentRoom.type === "single"
                          ? confirmDelete || confirmRemove
                            ? "Chat--Room_Information--Buttons--Inactive"
                            : "Chat--Room_Information--Buttons"
                          : "Chat--Room_Information--Buttons--Inactive"
                      }
                    >
                      <button
                        className="Chat--Room_Information--Buttons--Danger"
                        onClick={() => {
                          setConfirmRemove(true);
                          setConfirmDelete(false);
                        }}
                      >
                        Remove fren
                      </button>
                    </div>
                    <div
                      className={
                        confirmRemove
                          ? "Chat--Room_Information--Confirm_Delete"
                          : "Chat--Room_Information--Confirm_Delete--Inactive"
                      }
                    >
                      <p className="Chat--Room_Information--Confirm_Delete--Message">
                        By removing {friend.usr_nm} as your fren, all your chat
                        messages will be deleted permanently and you will no
                        longer be frens!
                      </p>
                      <div className="Chat--Room_Information--Buttons">
                        <button
                          className="Chat--Room_Information--Buttons--Cancel"
                          onClick={() => setConfirmRemove(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="Chat--Room_Information--Buttons--Danger"
                          onClick={() => removeFriend(friend)}
                        >
                          Confirm remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* CHAT ROOM BASIC DETAILS */}
        <section className="Chat--Details">
          <div className="Chat--Back_Button">
            <IoMdArrowRoundBack
              className="Chat--Back_Button--Icon"
              onClick={() => navigate("/user/friends")}
            />
          </div>
          <div className="Chat--Image">
            <div className="Chat--Image_Icon_Container">
              {currentRoom.imageUrl ? (
                <div className="Chat--Image_Frame">
                  <img src={currentRoom.imageUrl}></img>
                </div>
              ) : (
                <IoMdPerson className="Chat--Image_Icon" />
              )}
            </div>
          </div>
          <div className="Chat--Room_Details">
            <div className="Chat--Name">{currentRoom?.name}</div>
            <div
              className="Chat--Show_Details"
              onClick={() => setShowRoomDetails(true)}
            >
              Show details
            </div>
          </div>
        </section>
        {/* CHAT MESSAGES CONTAINER */}
        <section className="Chat--Messages" ref={messagesRef}>
          {roomChats.length ? (
            roomChats.map((message, index) => {
              const currentDate = new Date().toLocaleDateString("en-IN");
              const messageDate = new Date(message.time).toLocaleDateString(
                "en-IN"
              );
              const messageTime = new Date(message.time).toLocaleTimeString(
                "en-IN",
                {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                }
              );
              let readByAll = false;
              if (currentRoom.type === "group") {
                readByAll = currentRoom.users.every((id) =>
                  message.read.includes(id)
                );
              }
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
                      currentRoom.type === "group"
                        ? userData?.userId === message.usr_id
                          ? "Chat--Message_Card--Userid--Inactive"
                          : "Chat--Message_Card--Userid"
                        : "Chat--Message_Card--Userid--Inactive"
                    }
                    // style={{ color: usernameColor }}
                  >
                    {message.usr_id}
                  </p>
                  <p className="Chat--Message_Card--Message">{message.msg}</p>
                  <div className="Chat--Message_Card--Time_And_Status">
                    <p className="Chat--Message_Card--Time">
                      {currentDate === messageDate
                        ? `${messageTime.split(" ")[0]} ${messageTime
                            .split(" ")[1]
                            .toUpperCase()}`
                        : `${messageDate}, ${
                            messageTime.split(" ")[0]
                          } ${messageTime.split(" ")[1].toUpperCase()}`}
                    </p>
                    <div className="Chat--Message_Card--Read_Status--Icon">
                      <GoDotFill
                        className={
                          message.usr_id === userData.userId
                            ? currentRoom.type === "single"
                              ? message.read
                                ? "Chat--Message_Card--Read_Status--True"
                                : "Chat--Message_Card--Read_Status--False"
                              : readByAll
                              ? "Chat--Message_Card--Read_Status--True"
                              : "Chat--Message_Card--Read_Status--False"
                            : "Chat--Message_Card--Read_Status--Inactive"
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="Chat--Empty">
              <p className="Chat--Empty_Message">
                {currentRoom.type === "single"
                  ? `Say hello 👋 to your fren, ${currentRoom?.name}!`
                  : `Say hello 👋 to your frens!`}
              </p>
              <button
                className="Chat--Empty_Button"
                onClick={() => {
                  let msg, read;
                  if (currentRoom.type === "single") {
                    msg = `Hello, ${currentRoom?.name}`;
                    read = false;
                  } else {
                    msg = `Hello, frens`;
                    read = [userData.userId];
                  }
                  socket.emit("send_message", {
                    userData,
                    message: msg,
                    id,
                    time: new Date(),
                    read,
                  });
                }}
              >
                Hello!
              </button>
            </div>
          )}
        </section>
        {/* NEW MESSAGE INPUT SECTION */}
        <section className="Chat--New_Message" ref={textAreaContainerRef}>
          <form onSubmit={sendMessage} className="Chat--New_Message--Form">
            <textarea
              ref={textAreaRef}
              type="text"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
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
