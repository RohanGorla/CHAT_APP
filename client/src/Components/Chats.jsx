import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { LuSend } from "react-icons/lu";
import { IoMdPerson, IoMdArrowRoundBack } from "react-icons/io";
import { GoDotFill } from "react-icons/go";
import { FaXmark } from "react-icons/fa6";
import FriendsList from "./FriendsList";

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
    socket.emit("send_message", {
      userData,
      message,
      id,
      time: new Date(),
      read: false,
    });
    setMessage("");
  }

  /* DELETE ALL THE CHAT MESSAGES SOCKET EVENT */
  async function deleteChat() {
    socket.emit("delete_chat", { id });
    setShowRoomDetails(false);
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

  /* GET THE ROOM NAME FROM THE ROOM ID */
  useEffect(() => {
    const room = rooms.filter((room) => room.roomId === id);
    if (!room.length) return navigate("/user/friends");
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
        const friendsIdList = room[0].users.filter(
          (user) => user !== userData.userId
        );
        room[0].friendsList = friends.filter((friend) =>
          friendsIdList.includes(friend.usr_id)
        );
        break;
    }
    setFriendsList(room[0]?.friendsList);
    setCurrentRoom(room[0]);
  }, [id, rooms]);

  /* FILTER OUT THE MESSAGES OF THE PRESENT CHAT FROM ALL CHAT MESSAGES ON SENDING/RECEIVING MESSAGE */
  useEffect(() => {
    let count = 0;
    const roomChats = chats.filter((message) => {
      if (!message.read && message.usr_id !== userData?.userId) count += 1;
      if (message.room === id) return message;
    });
    setRoomChats(roomChats);
    if (count > 0) return setUnreadMessages(true);
    setUnreadMessages(false);
  }, [chats]);

  /* SCROLL TO THE BOTTOM/LATEST MESSAGE */
  useEffect(() => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    if (unreadMessages) socket.emit("update_message_read", { id, userData });
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
        <div
          className={
            showRoomDetails
              ? "Chat--Room_Information_Container"
              : "Chat--Room_Information--Inactive"
          }
        >
          <div className="Chat--Room_Information">
            <FaXmark
              onClick={() => setShowRoomDetails(false)}
              className="Chat--Room_Information--Close"
            />
            <div className="Chat--Room_Information--Image">
              <IoMdPerson className="Chat--Room_Information--Image--Icon" />
            </div>
            <div className="Chat--Room_Information--Friends_List">
              {friendsList?.map((friend, index) => {
                return (
                  <div
                    key={index}
                    className="Chat--Room_Information--Friend_Container"
                  >
                    {/* ROOM FRIEND INFORMATION */}
                    <div className="Chat--Room_Information--Friend">
                      <p className="Chat--Room_Information--Friend_Username">
                        {friend.usr_nm}
                      </p>
                      <p className="Chat--Room_Information--Friend_Userid">
                        {friend.usr_id}
                      </p>
                      <p className="Chat--Room_Information--Friend_Email">
                        <span className="Chat--Room_Information--Friend_Email--Heading">
                          Contact email:
                        </span>
                        {friend.email}
                      </p>
                    </div>
                    {/* ROOM CHAT DELETE OPTIONS */}
                    <div
                      className={
                        confirmDelete
                          ? "Chat--Room_Information--Buttons--Inactive"
                          : "Chat--Room_Information--Buttons"
                      }
                    >
                      <button
                        className="Chat--Room_Information--Buttons--Danger"
                        onClick={() => setConfirmDelete(true)}
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
                          onClick={deleteChat}
                        >
                          Confirm delete
                        </button>
                      </div>
                    </div>
                    {/* REMOVE FRIEND OPTIONS */}
                    <div
                      className={
                        confirmRemove
                          ? "Chat--Room_Information--Buttons--Inactive"
                          : "Chat--Room_Information--Buttons"
                      }
                    >
                      <button
                        className="Chat--Room_Information--Buttons--Danger"
                        onClick={() => setConfirmRemove(true)}
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
        <section className="Chat--Details">
          <div className="Chat--Back_Button">
            <IoMdArrowRoundBack
              className="Chat--Back_Button--Icon"
              onClick={() => navigate("/user/friends")}
            />
          </div>
          <div className="Chat--Image">
            <div className="Chat--Image_Icon_Container">
              <IoMdPerson className="Chat--Image_Icon" />
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
                    style={{ color: usernameColor }}
                  >
                    {message.usr_nm}
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
                            ? message.read
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
                Say hello 👋 to your new fren, {currentRoom?.name}!
              </p>
              <button
                className="Chat--Empty_Button"
                onClick={() => {
                  socket.emit("send_message", {
                    userData,
                    message: `Hello, ${currentRoom?.name}`,
                    id,
                    time: new Date(),
                  });
                }}
              >
                Hello!
              </button>
            </div>
          )}
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
