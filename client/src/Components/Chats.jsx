import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { LuSend } from "react-icons/lu";
import { IoMdPerson, IoMdArrowRoundBack } from "react-icons/io";
import { GoDotFill } from "react-icons/go";
import { FaXmark } from "react-icons/fa6";
import { FaEdit, FaCamera } from "react-icons/fa";
import { SiTicktick } from "react-icons/si";
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
  } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  const usernameColors = ["orange", "green", "violet", "goldenrod"];
  /* STATE VARIABLES AND ELEMENT REFS */
  const [message, setMessage] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [groupPicture, setGroupPicture] = useState("");
  const [confirmGroupPicture, setConfirmGroupPicture] = useState(false);
  const [editRoomname, setEditRoomname] = useState(false);
  const [newRoomname, setNewRoomname] = useState(currentRoom.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(false);
  const [addFriends, setAddFriends] = useState(false);
  const [addFriendsList, setAddFriendsList] = useState([]);
  const [addFriendsSearch, setAddFriendsSearch] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loadedImages, setLoadedImages] = useState([]);
  const chatContainerRef = useRef(null);
  const messagesRef = useRef(null);
  const textAreaContainerRef = useRef(null);
  const textAreaRef = useRef(null);

  /* GET PROFILE PICTURE GET URL FUNCTION */
  async function generateGetUrl(key) {
    const generateGetUrlResponse = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/generategeturl`,
      {
        key,
      }
    );
    userData.imageUrl = generateGetUrlResponse.data.url;
    localStorage.setItem("ChatApp_UserInfo", JSON.stringify(userData));
  }

  /* CHECK THE VALIDITY OF SIGNED URL */
  async function checkUrlValidity() {
    try {
      const response = await axios.get(userData.imageUrl);
      if (response.status === 200) return;
    } catch (e) {
      generateGetUrl(userData.imageTag);
    }
  }

  /* SEND MESSAGES TO THE WEB SOCKET SERVER */
  function sendMessage(e) {
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
  function deleteChat(friend) {
    socket.emit("delete_chat", {
      from: userData,
      to: friend,
      room: currentRoom,
    });
    setShowRoomDetails(false);
    setConfirmDelete(false);
  }

  /* REMOVE FRIEND SOCKET EVENT */
  function removeFriend(friend) {
    socket.emit("remove_friend", {
      from: userData,
      to: friend,
      room: currentRoom,
    });
  }

  /* EXIT GROUP SOCKET EVENT */
  function exitGroup() {
    socket.emit("exit_group", { id, user: userData, name: currentRoom.name });
    setConfirmExit(false);
    navigate("/user/friends");
  }

  /* DELETE GROUP */
  function deleteGroup() {
    socket.emit("delete_group", {
      id,
      groupName: currentRoom.name,
      from: userData,
      members: currentRoom.users,
    });
  }

  /* UPLOAD GROUP PICTURE */
  async function uploadGroupPicture() {
    if (!groupPicture) return;
    /* GENERATE PUT URL FROM S3 */
    const generatePutUrlResponse = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/generateputurl`,
      {
        contentType: groupPicture.type,
        newKey: currentRoom.roomId,
        oldKey: currentRoom?.imageTag,
      }
    );
    /* SEND THE PICTURE TO S3 USING THE PUT URL */
    const putRequestResponse = await axios.put(
      generatePutUrlResponse.data.url,
      groupPicture,
      {
        headers: {
          "Content-Type": groupPicture.type,
        },
      }
    );
    if (putRequestResponse.status === 200) {
      /* SOCKET METHOD TO UPDATE THE PROFILE PICTURE */
      socket.emit("update_group_picture", {
        id,
        key: generatePutUrlResponse.data.key,
        groupName: currentRoom.name,
      });
    }
  }

  /* UPDATE ROOM NAME SOCKET EVENT */
  function updateGroupName() {
    if (newRoomname.length && newRoomname !== currentRoom.name)
      socket.emit("update_group_name", {
        id,
        oldRoomname: currentRoom.name,
        newRoomname,
      });
    if (newRoomname.length) setEditRoomname(false);
  }

  /* ADD FRIENDS TO THE GROUP SOCKET EVENT */
  function addGroupMembers() {
    if (!selectedFriends.length) return;
    socket.emit("add_group_members", {
      id,
      groupName: currentRoom.name,
      members: selectedFriends,
      addedBy: { usr_nm: userData.username, usr_id: userData.userId },
    });
    setShowRoomDetails(false);
    setAddFriends(false);
    setSelectedFriends([]);
  }

  /* FUNCTION TO SORT THE FRIENDS LIST BASED ON SELECTED FRIENDS IN ADD FRIENDS SECTION */
  function sortFriendsList(list) {
    /* FILTER OUT USERS FROM FRIENDS LIST WHO ARE NOT ALREADY INCLUDED IN THE GROUP */
    const notIncludedFriends = list.filter(
      (friend) => !currentRoom.users.includes(friend.usr_id)
    );
    /* FILTER 'NOT INCLUDED FRIENDS LIST' BASED ON SELECTED STATUS */
    const selectedList = notIncludedFriends.filter((friend) =>
      selectedFriends.includes(friend.usr_id)
    );
    const notSelectedList = notIncludedFriends.filter(
      (friend) => !selectedFriends.includes(friend.usr_id)
    );
    setAddFriendsList([...selectedList, ...notSelectedList]);
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
    if (!room.length) navigate("/user/friends");
    else {
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
          room[0].userIdColors = {};
          room[0].users.forEach((user) => {
            room[0].userIdColors[`${user}`] =
              usernameColors[Math.floor(Math.random() * usernameColors.length)];
          });
          break;
      }
      setFriendsList(room[0]?.friendsList);
      setCurrentRoom(room[0]);
      setShowRoomDetails(false);
      setConfirmDelete(false);
      setConfirmRemove(false);
      setConfirmDeleteGroup(false);
      setConfirmExit(false);
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
    }
    if (currentRoom.type === "group") {
      const roomChats = chats.filter((message) => {
        if (message.room === id) {
          const readStatus = currentRoom.users.every((id) =>
            message.read.includes(id)
          );
          if (
            !readStatus &&
            message.usr_id !== userData?.userId &&
            !message.read.includes(userData.userId)
          )
            count += 1;
          return message;
        }
      });
      setRoomChats(roomChats);
      if (count > 0) setUnreadMessages(true);
      else setUnreadMessages(false);
    }
  }, [id, chats]);

  /* SCROLL TO THE BOTTOM/LATEST MESSAGE */
  useEffect(() => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    if (unreadMessages)
      socket.emit("update_message_read", {
        id,
        userData,
        type: currentRoom.type,
      });
  }, [roomChats]);

  /* SORT THE ADD FRIENDS SECTION FRIENDS LIST BASED ON SEARCH INPUT */
  useEffect(() => {
    if (addFriendsSearch.length) {
      const filteredFriends = friends.filter(
        (friend) =>
          friend.usr_nm
            .toLowerCase()
            .startsWith(addFriendsSearch.toLowerCase()) ||
          friend.usr_id.toLowerCase().startsWith(addFriendsSearch.toLowerCase())
      );
      sortFriendsList(filteredFriends);
    } else {
      sortFriendsList(friends);
    }
  }, [addFriendsSearch, rooms]);

  /* SORT THE FRIENDS LIST BASED ON SELECTED FRIENDS IN ADD FRIENDS SECTION */
  useEffect(() => {
    if (currentRoom.type === "group") sortFriendsList(friends);
  }, [selectedFriends]);

  useEffect(() => {
    /* NAVIGATE TO LOGIN PAGE IF USER IS NOT LOGGED IN */
    if (!userData) navigate("/login");
    else {
      /* CHECK IMAGE URL VALIDITY IF EXISTS OR GENERATE A NEW SIGNED URL */
      if (userData.imageUrl && currentRoom.type === "group") checkUrlValidity();
    }
  }, []);

  return (
    <div className="Chat_Page">
      {/* FRIENDS LIST */}
      <section className="Chat_Friends_List_Container">
        <FriendsList />
      </section>
      <section className="Chat_Container" ref={chatContainerRef}>
        {/* ROOM FRIENDS INFORMATION CARD */}
        <div
          className={
            showRoomDetails ? "Chat--Room_Information_Container" : "Inactive"
          }
        >
          <div className="Chat--Room_Information">
            {/* CONFIRM UPLOAD/UPDATE GROUP PICTURE - MESSAGE BOX */}
            <div
              className={
                confirmGroupPicture
                  ? "Chat--Room_Information_Confirm_Picture--Container"
                  : "Inactive"
              }
            >
              <div className="Chat--Room_Information_Confirm_Picture">
                <p className="Chat--Room_Information_Confirm_Picture--Heading">
                  CONFIRM GROUP PICTURE
                </p>
                <p className="Chat--Room_Information_Confirm_Picture--Message">
                  Set the selected image as group picture?
                </p>
                <button
                  className="Chat--Room_Information_Confirm_Picture--Cancel_Button"
                  onClick={() => setConfirmGroupPicture(false)}
                >
                  Cancel
                </button>
                <button
                  className="Chat--Room_Information_Confirm_Picture--Confirm_Button"
                  onClick={() => {
                    setConfirmGroupPicture(false);
                    uploadGroupPicture();
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
            {/* ROOM INFORMATION SCROLLABLE SECTION */}
            <div className="Chat--Room_Information--Inner_Container">
              {/* CLOSE ROOM INFORMATION */}
              <FaXmark
                onClick={() => {
                  setShowRoomDetails(false);
                  setConfirmDelete(false);
                  setConfirmRemove(false);
                }}
                className="Chat--Room_Information--Close"
              />
              {/* ADD FRIENDS TO GROUP TYPE ROOM */}
              <div
                className={
                  addFriends
                    ? "Chat--Room_Information--Add_Friends_Container"
                    : "Inactive"
                }
              >
                {/* CLOSE ADD FRIENDS */}
                <FaXmark
                  onClick={() => {
                    setAddFriends(false);
                    setSelectedFriends([]);
                  }}
                  className="Chat--Room_Information--Close"
                />
                <div className="Chat--Room_Information--Add_Friends">
                  {/* ADD FRIENDS - HEADER SECTION */}
                  <div className="Chat--Room_Information--Add_Friends--Header">
                    {/* ADD FRIENDS - HEADING AND DONE BUTTON */}
                    <div className="Chat--Room_Information--Add_Friends--Header--Heading_And_Button">
                      <p className="Chat--Room_Information--Add_Friends--Header_Heading">
                        Add frens
                      </p>
                      <div className="Chat--Room_Information--Add_Friends--Header_Button">
                        <button
                          className={
                            selectedFriends.length
                              ? "Chat--Room_Information--Add_Friends--Header_Button--Done"
                              : "Chat--Room_Information--Add_Friends--Header_Button--Done--Inactive"
                          }
                          onClick={addGroupMembers}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                    {/* ADD FRIENDS - FRIENDS LIST SEARCH */}
                    <div className="Chat--Room_Information--Add_Friends--Search">
                      <input
                        type="text"
                        value={addFriendsSearch}
                        onChange={(e) => setAddFriendsSearch(e.target.value)}
                        placeholder="Search your frens list..."
                      ></input>
                    </div>
                  </div>
                  {/* ADD FRIENDS - FRIENDS LIST */}
                  <div className="Chat--Room_Information--Add_Friends--Friends_List">
                    {addFriendsList.map((friend, index) => {
                      return (
                        <div
                          key={index}
                          className="Chat--Room_Information--Add_Friends--Friend_Card"
                          onClick={() => {
                            if (selectedFriends.includes(friend.usr_id)) {
                              const updatedList = selectedFriends.filter(
                                (id) => id !== friend.usr_id
                              );
                              setSelectedFriends(updatedList);
                            } else {
                              setSelectedFriends([
                                ...selectedFriends,
                                friend.usr_id,
                              ]);
                            }
                            setAddFriendsSearch("");
                          }}
                        >
                          <div className="Chat--Room_Information--Add_Friends--Friend_Image_Container">
                            <div className="Chat--Room_Information--Add_Friends--Friend_Image">
                              {friend.imageUrl ? (
                                <>
                                  <div
                                    className={
                                      loadedImages.includes(friend.imageTag)
                                        ? "Chat--Room_Information--Add_Friends--Friend_Image_Frame"
                                        : "Inactive"
                                    }
                                  >
                                    <img
                                      src={friend.imageUrl}
                                      onLoad={() =>
                                        setLoadedImages((prev) => [
                                          ...prev,
                                          friend.imageTag,
                                        ])
                                      }
                                    ></img>
                                  </div>
                                  <IoMdPerson
                                    className={
                                      loadedImages.includes(friend.imageTag)
                                        ? "Inactive"
                                        : "Chat--Room_Information--Add_Friends--Friend_Icon"
                                    }
                                  />
                                </>
                              ) : (
                                <IoMdPerson className="Chat--Room_Information--Add_Friends--Friend_Icon" />
                              )}
                            </div>
                          </div>
                          <div className="Chat--Room_Information--Add_Friends--Friend_Details">
                            <div className="Chat--Room_Information--Add_Friends--Name_And_Id">
                              <p className="Chat--Room_Information--Add_Friends--Friend_Username">
                                {friend.usr_nm}
                              </p>
                              <p className="Chat--Room_Information--Add_Friends--Friend_UserId">
                                {friend.usr_id}
                              </p>
                            </div>
                            <div
                              className={
                                selectedFriends.includes(friend.usr_id)
                                  ? "Chat--Room_Information--Add_Friends--Selected"
                                  : "Inactive"
                              }
                            >
                              <SiTicktick className="Chat--Room_Information--Add_Friends--Selected_Icon" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* ROOM INFORMATION - IMAGE DISPLAY AND SELECTION */}
              <div className="Chat--Room_Information--Image">
                {/* ROOM INFORMATION - IMAGE/ICON */}
                {currentRoom.imageUrl ? (
                  <>
                    <div
                      className={
                        loadedImages.includes(currentRoom.imageTag)
                          ? "Chat--Room_Information--Image_Frame"
                          : "Inactive"
                      }
                    >
                      <img
                        src={currentRoom.imageUrl}
                        onLoad={() =>
                          setLoadedImages((prev) => [
                            ...prev,
                            currentRoom.imageTag,
                          ])
                        }
                      ></img>
                    </div>
                    <IoMdPerson
                      className={
                        loadedImages.includes(currentRoom.imageTag)
                          ? "Inactive"
                          : "Chat--Room_Information--Image--Icon"
                      }
                    />
                  </>
                ) : (
                  <IoMdPerson className="Chat--Room_Information--Image--Icon" />
                )}
                {/* ROOM INFORMATION - IMAGE SELECTOR */}
                <label
                  className={currentRoom.type === "group" ? "" : "Inactive"}
                  htmlFor="Chat--Room_Information--Image_Select"
                >
                  <FaCamera className="Chat--Room_Information--Image_Edit--Icon" />
                </label>
                <input
                  id="Chat--Room_Information--Image_Select"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setGroupPicture(e.target.files[0]);
                    setConfirmGroupPicture(true);
                  }}
                ></input>
              </div>
              {/* ROOM INFORMATION - GROUP TYPE ROOM HEADER */}
              <div
                className={
                  currentRoom.type === "group"
                    ? "Chat--Room_Information--Edit_Room"
                    : "Inactive"
                }
              >
                {/* ROOM INFORMATION - GROUP NAME DISPLAY AND EDIT */}
                <div className="Chat--Room_Information--Edit_Room_Name">
                  {/* ROOM INFORMATION - GROUP NAME DISPLAY */}
                  <div
                    className={
                      editRoomname
                        ? "Inactive"
                        : "Chat--Room_Information--Edit_Room_Name--Display"
                    }
                  >
                    <p className="Chat--Room_Information--Edit_Room_Name--Name">
                      {currentRoom.name}
                    </p>
                    <div className="Chat--Room_Information--Edit_Room_Name--Edit_Icon_Container">
                      <FaEdit
                        className="Chat--Room_Information--Edit_Room_Name--Edit_Icon"
                        onClick={() => setEditRoomname(true)}
                      />
                    </div>
                  </div>
                  {/* ROOM INFORMATION - GROUP NAME EDIT */}
                  <div
                    className={
                      editRoomname
                        ? "Chat--Room_Information--Edit_Room_Name--Input"
                        : "Inactive"
                    }
                  >
                    <input
                      type="text"
                      value={newRoomname}
                      onChange={(e) => {
                        if (e.target.value.length <= 100)
                          setNewRoomname(e.target.value);
                      }}
                      placeholder="Enter group name..."
                    ></input>
                    <div className="Chat--Room_Information--Edit_Room_Name--Buttons_And_Character_Count">
                      <div className="Chat--Room_Information--Edit_Room_Name--Buttons">
                        <button
                          className="Chat--Room_Information--Edit_Room_Name--Buttons--Cancel"
                          onClick={() => setEditRoomname(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className={
                            newRoomname?.length
                              ? "Chat--Room_Information--Edit_Room_Name--Buttons--Done"
                              : "Chat--Room_Information--Edit_Room_Name--Buttons--Done--Inactive"
                          }
                          onClick={updateGroupName}
                        >
                          Done
                        </button>
                      </div>
                      <div className="Chat--Room_Information--Edit_Room_Name--Character_Count">
                        {newRoomname?.length}/100
                      </div>
                    </div>
                  </div>
                </div>
                {/* ROOM INFORMATION - BUTTON TO OPEN ADD FRIENDS SECTION */}
                <div className="Chat--Room_Information--Edit_Room_Users">
                  <button
                    className="Chat--Room_Information--Edit_Room_Users--Button"
                    onClick={() => setAddFriends(true)}
                  >
                    Add frens
                  </button>
                </div>
              </div>
              {/* ROOM INFORMATION - FRIENDS LIST */}
              <div className="Chat--Room_Information--Friends_List">
                {/* FRIENDS LIST - OWN CARD - FOR GROUP TYPE ROOM */}
                <div
                  className={
                    currentRoom.type === "group"
                      ? "Chat--Room_Information--Friend_Container"
                      : "Inactive"
                  }
                >
                  <div className="Chat--Room_Information--Friend Chat--Room_Information--Friend--Group">
                    <div className="Chat--Room_Information--Friend--Image_Container">
                      <div className="Chat--Room_Information--Friend--Image">
                        {userData.imageUrl ? (
                          <>
                            <div
                              className={
                                loadedImages.includes(userData.imageTag)
                                  ? "Chat--Room_Information--Friend--Image_Frame"
                                  : "Inactive"
                              }
                            >
                              <img
                                src={userData.imageUrl}
                                onLoad={() =>
                                  setLoadedImages((prev) => [
                                    ...prev,
                                    userData.imageTag,
                                  ])
                                }
                              ></img>
                            </div>
                            <IoMdPerson
                              className={
                                loadedImages.includes(userData.imageTag)
                                  ? "Inactive"
                                  : "Chat--Room_Information--Friend--Icon"
                              }
                            />
                          </>
                        ) : (
                          <IoMdPerson className="Chat--Room_Information--Friend--Icon" />
                        )}
                      </div>
                    </div>
                    <div className="Chat--Room_Information--Friend--Details">
                      <p className="Chat--Room_Information--Friend_Username">
                        {userData.username} (You)
                      </p>
                      <p className="Chat--Room_Information--Friend_Userid">
                        {userData.userId}
                      </p>
                    </div>
                  </div>
                </div>
                {/* FRIENDS LIST - FRIENDS CARDS LIST */}
                {friendsList?.map((friend, index) => {
                  return (
                    <div
                      key={index}
                      className="Chat--Room_Information--Friend_Container"
                    >
                      {/* ROOM FRIENDS INFORMATION */}
                      <div
                        className={
                          currentRoom.type === "single"
                            ? "Chat--Room_Information--Friend"
                            : "Chat--Room_Information--Friend Chat--Room_Information--Friend--Group"
                        }
                      >
                        {/* SHOW FRIENDS IMAGES ONLY IN GROUP TYPE ROOM */}
                        <div
                          className={
                            currentRoom.type === "group"
                              ? "Chat--Room_Information--Friend--Image_Container"
                              : "Inactive"
                          }
                        >
                          <div className="Chat--Room_Information--Friend--Image">
                            {friend.imageUrl ? (
                              <>
                                <div
                                  className={
                                    loadedImages.includes(friend.imageTag)
                                      ? "Chat--Room_Information--Friend--Image_Frame"
                                      : "Inactive"
                                  }
                                >
                                  <img
                                    src={friend.imageUrl}
                                    onLoad={() =>
                                      setLoadedImages((prev) => [
                                        ...prev,
                                        friend.imageTag,
                                      ])
                                    }
                                  ></img>
                                </div>
                                <IoMdPerson
                                  className={
                                    loadedImages.includes(friend.imageTag)
                                      ? "Inactive"
                                      : "Chat--Room_Information--Friend--Icon"
                                  }
                                />
                              </>
                            ) : (
                              <IoMdPerson className="Chat--Room_Information--Friend--Icon" />
                            )}
                          </div>
                        </div>
                        {/* SHOW FRIENDS DETAILS */}
                        <div
                          className={
                            currentRoom.type === "group"
                              ? "Chat--Room_Information--Friend--Details--Group"
                              : "Chat--Room_Information--Friend--Details--Single"
                          }
                        >
                          <p className="Chat--Room_Information--Friend_Username">
                            {friend.usr_nm}
                          </p>
                          <p className="Chat--Room_Information--Friend_Userid">
                            {friend.usr_id}
                          </p>
                          <div
                            className={
                              currentRoom.type === "single"
                                ? "Chat--Room_Information--Friend_Email_Container"
                                : "Inactive"
                            }
                          >
                            <p className="Chat--Room_Information--Friend_Email--Heading">
                              Contact email:
                            </p>
                            <p className="Chat--Room_Information--Friend_Email">
                              {friend.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* ROOM CHAT DELETE OPTIONS FOR SINGLE TYPE ROOM */}
                      <div
                        className={
                          currentRoom.type === "single"
                            ? confirmDelete || confirmRemove
                              ? "Inactive"
                              : "Chat--Room_Information--Buttons"
                            : "Inactive"
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
                      {/* ROOM CHAT CONFIRM DELETE OPTIONS FOR SINGLE TYPE ROOM */}
                      <div
                        className={
                          currentRoom.type === "single" && confirmDelete
                            ? "Chat--Room_Information--Confirm_Delete"
                            : "Inactive"
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
                      {/* REMOVE FRIEND OPTIONS FOR SINGLE TYPE ROOM */}
                      <div
                        className={
                          currentRoom.type === "single"
                            ? confirmDelete || confirmRemove
                              ? "Inactive"
                              : "Chat--Room_Information--Buttons"
                            : "Inactive"
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
                      {/* CONFIRM REMOVE FRIEND OPTIONS FOR SINGLE TYPE ROOM */}
                      <div
                        className={
                          confirmRemove
                            ? "Chat--Room_Information--Confirm_Delete"
                            : "Inactive"
                        }
                      >
                        <p className="Chat--Room_Information--Confirm_Delete--Message">
                          By removing {friend.usr_nm} as your fren, all your
                          chat messages will be deleted permanently and you will
                          no longer be frens!
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
              {/* EXIT GROUP OPTIONS FOR GROUP TYPE ROOM */}
              <div
                className={
                  currentRoom.type === "group"
                    ? confirmExit || confirmDeleteGroup
                      ? "Inactive"
                      : "Chat--Room_Information--Buttons"
                    : "Inactive"
                }
              >
                <button
                  className="Chat--Room_Information--Buttons--Danger"
                  onClick={() => {
                    setConfirmExit(true);
                  }}
                >
                  Exit group
                </button>
              </div>
              {/* CONFIRM EXIT GROUP OPTIONS FOR GROUP TYPE ROOM */}
              <div
                className={
                  currentRoom.type === "group" && confirmExit
                    ? "Chat--Room_Information--Confirm_Delete"
                    : "Inactive"
                }
              >
                <p className="Chat--Room_Information--Confirm_Delete--Message">
                  By exiting this group, you will no longer be able to send or
                  see messages in this group, and you will no longer be part of
                  the group. Do you want to proceed?
                </p>
                <div className="Chat--Room_Information--Buttons">
                  <button
                    className="Chat--Room_Information--Buttons--Cancel"
                    onClick={() => setConfirmExit(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="Chat--Room_Information--Buttons--Danger"
                    onClick={exitGroup}
                  >
                    Confirm exit
                  </button>
                </div>
              </div>
              {/* DELETE GROUP OPTIONS - AVAILABLE ONLY TO THE GROUP CREATOR */}
              <div
                className={
                  currentRoom.type === "group"
                    ? confirmDeleteGroup || confirmExit
                      ? "Inactive"
                      : "Chat--Room_Information--Buttons"
                    : "Inactive"
                }
              >
                <button
                  className="Chat--Room_Information--Buttons--Danger"
                  onClick={() => {
                    setConfirmDeleteGroup(true);
                    setConfirmExit(false);
                  }}
                >
                  Delete group
                </button>
              </div>
              {/* CONFIRM DELETE GROUP OPTIONS - AVAILABLE ONLY TO THE GROUP CREATOR */}
              <div
                className={
                  currentRoom.type === "group" && confirmDeleteGroup
                    ? "Chat--Room_Information--Confirm_Delete"
                    : "Inactive"
                }
              >
                <p className="Chat--Room_Information--Confirm_Delete--Message">
                  By deleting this group, all the group chat messages will be
                  deleted and the group will no longer exist. Do you want to
                  proceed?
                </p>
                <div className="Chat--Room_Information--Buttons">
                  <button
                    className="Chat--Room_Information--Buttons--Cancel"
                    onClick={() => setConfirmDeleteGroup(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="Chat--Room_Information--Buttons--Danger"
                    onClick={deleteGroup}
                  >
                    Confirm delete group
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* CHAT ROOM BASIC DETAILS */}
        <section className="Chat--Details">
          {/* CHAT - NAVIGATE BACK TO FRIENDS PAGE */}
          <div className="Chat--Back_Button">
            <IoMdArrowRoundBack
              className="Chat--Back_Button--Icon"
              onClick={() => navigate("/user/friends")}
            />
          </div>
          {/* CHAT - IMAGE */}
          <div className="Chat--Image">
            <div className="Chat--Image_Icon_Container">
              {currentRoom.imageUrl ? (
                <>
                  <div
                    className={
                      loadedImages.includes(currentRoom.imageTag)
                        ? "Chat--Image_Frame"
                        : "Inactive"
                    }
                  >
                    <img
                      src={currentRoom.imageUrl}
                      onLoad={() =>
                        setLoadedImages((prev) => [
                          ...prev,
                          currentRoom.imageTag,
                        ])
                      }
                    ></img>
                  </div>
                  <IoMdPerson
                    className={
                      loadedImages.includes(currentRoom.imageTag)
                        ? "Inactive"
                        : "Chat--Image_Icon"
                    }
                  />
                </>
              ) : (
                <IoMdPerson className="Chat--Image_Icon" />
              )}
            </div>
          </div>
          {/* CHAT - FRIEND/GROUP NAME AND SHOW ROOM INFORMATION OPTION */}
          <div className="Chat--Room_Details">
            <p className="Chat--Name">{currentRoom?.name}</p>
            <p
              className="Chat--Show_Details"
              onClick={() => setShowRoomDetails(true)}
            >
              Show details
            </p>
          </div>
        </section>
        {/* CHAT MESSAGES CONTAINER */}
        <section className="Chat--Messages" ref={messagesRef}>
          {/* CHAT - MESSAGE CARD */}
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
                          ? "Inactive"
                          : "Chat--Message_Card--Userid"
                        : "Inactive"
                    }
                    style={{
                      color: currentRoom.userIdColors
                        ? currentRoom.userIdColors[message.usr_id]
                        : "white",
                    }}
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
                            : "Inactive"
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
        {/* NEW MESSAGE TYPING SECTION */}
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
      </section>
    </div>
  );
}

export default Chats;
