import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";
import { MdGroupAdd } from "react-icons/md";
import axios from "axios";

function FriendsList() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const params = useParams();
  const {
    rooms,
    searchRooms,
    setSearchRooms,
    setCurrentRoom,
    chats,
    setRoomChats,
    setUsernameColor,
  } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES */
  const [friendListSearch, setFriendListSearch] = useState("");
  const [loadedImages, setLoadedImages] = useState([]);

  /* SORT THE CHATS ACCORDING TO RECENT MESSAGE RECEIVED OR SENT */
  function sortChats(rooms) {
    rooms.map((room) => {
      /* FILTER OUT THE ROOM CHATS FROM ALL CHATS */
      const roomChats = chats.filter((chat) => chat.room === room.roomId);
      /* SET THE LAST MESSAGE ATTRIBUTE OF THE ROOM CHAT */
      room.lastMessage = roomChats[roomChats.length - 1];
      /* SET THE LAST MESSAGE FULL DATE STRING FOR SORTING */
      room.lastMessageFullDate = room?.lastMessage?.time;
      /* SET THE LAST MESSAGE DATE AND TIME FOR DISPLAY */
      room.lastMessageDate = new Date(
        room.lastMessage?.time
      ).toLocaleDateString("en-IN");
      room.lastMessageTime = new Date(
        room.lastMessage?.time
      ).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    });
    /* GET ALL THE ROOMS WITH ATLEAST ONE MESSAGE */
    const validRooms = rooms.filter(
      (room) => room.lastMessageFullDate !== undefined
    );
    /* SORT ALL THE VALID ROOMS ACCORDING TO THE TIME OF LAST MESSAGE */
    validRooms.sort((room_1, room_2) => {
      return (
        new Date(room_2.lastMessageFullDate) -
        new Date(room_1.lastMessageFullDate)
      );
    });
    /* GET ALL ROOMS WITH NO MESSAGES */
    const invalidRooms = rooms.filter(
      (room) => room.lastMessageFullDate === undefined
    );
    /* RETURN THE SORTED ROOMS LIST */
    return [...validRooms, ...invalidRooms];
  }

  /* TO FIND THE FRIEND FROM FRIENDS LIST USING SEARCH STRING */
  useEffect(() => {
    if (!friendListSearch.length) {
      const sortedRooms = sortChats(rooms);
      setSearchRooms(sortedRooms);
    } else {
      const filteredRooms = rooms.filter((room) =>
        room.name.toLowerCase().startsWith(friendListSearch.toLowerCase())
      );
      const sortedRooms = sortChats(filteredRooms);
      setSearchRooms(sortedRooms);
    }
  }, [friendListSearch]);

  /* TO UPDATE THE LAST MESSAGE TEXT & TIME AND ALSO SORT THE FRIENDS LIST ACCORDINGLY */
  useEffect(() => {
    const sortedRooms = sortChats(searchRooms);
    setSearchRooms(sortedRooms);
  }, [chats, rooms]);

  useEffect(() => {
    if (!userData) navigate("/login");
  }, []);

  return (
    <section className="Friends_List">
      {/* CREATE A NEW FRIENDS GROUP */}
      <div
        className="Friends_List--New_Group"
        onClick={() => navigate("/user/creategroup")}
      >
        <MdGroupAdd className="Friends_List--New_Group--Icon" />
      </div>
      {/* SEARCH FRIEND IN FRIENDS LIST */}
      <search className="Friends_List--Search">
        <input
          type="text"
          value={friendListSearch}
          onChange={(e) => {
            setFriendListSearch(e.target.value);
          }}
          placeholder="Search your frens list..."
        ></input>
      </search>
      {searchRooms.length ? (
        searchRooms.map((room, index) => {
          /* FILTER OUT THIS FRIEND/GROUP ROOM CHATS FROM ALL CHATS */
          const roomChats = chats.filter((chat) => chat.room === room.roomId);
          let unreadMessages;
          if (room.type === "single")
            unreadMessages = roomChats.filter(
              (chat) => chat.read === false && chat.usr_id !== userData.userId
            );
          else
            unreadMessages = roomChats.filter(
              (chat) => !chat.read.includes(userData.userId)
            );
          const currentDate = new Date().toLocaleDateString("en-IN");
          return (
            /* EACH FRIEND'S DISPLAY CARD */
            <div
              key={index}
              className="Friends_List--Friend_Card"
              onClick={() => {
                /* AVOID RENAVIGATION TO THE SAME PAGE */
                if (params.id !== room.roomId) {
                  setRoomChats(roomChats);
                  setCurrentRoom(room);
                  /* SELECT AND SET A UNIQUE COLOR FOR USERNAME IN CHATS PAGE CARDS */
                  const usernameColors = [
                    "orange",
                    "green",
                    "violet",
                    "goldenrod",
                  ];
                  const randomColor =
                    usernameColors[
                      Math.floor(Math.random() * usernameColors.length)
                    ];
                  setUsernameColor(randomColor);
                  /* NAVIGATE TO THE DESIRED CHAT PAGE */
                  return navigate(`/user/chats/${room.roomId}`);
                }
              }}
            >
              {/* USER/GROUP DISPLAY PICTURE */}
              <div className="Friend_Card--Image">
                <div className="Friend_Card--Image_Icon_Container">
                  {room.imageUrl ? (
                    <>
                      <div
                        className={
                          loadedImages.includes(room.imageTag)
                            ? "Friend_Card--Image_Frame"
                            : "Inactive"
                        }
                      >
                        <img
                          src={room.imageUrl}
                          onLoad={() =>
                            setLoadedImages((prev) => [...prev, room.imageTag])
                          }
                        ></img>
                      </div>
                      <IoMdPerson
                        className={
                          loadedImages.includes(room.imageTag)
                            ? "Inactive"
                            : "Friend_Card--Image_Icon"
                        }
                      />
                    </>
                  ) : (
                    <IoMdPerson className="Friend_Card--Image_Icon" />
                  )}
                </div>
              </div>
              {/* CHAT INFO AND LATEST MESSAGE DISPLAY */}
              <div className="Friend_Card--Details">
                <div className="Friend_Card--Name_And_Time">
                  <p className="Friend_Card--Name">{room.name}</p>
                  <p
                    className={
                      unreadMessages.length
                        ? "Friend_Card--Time Friend_Card--Time--Unread"
                        : "Friend_Card--Time"
                    }
                  >
                    {room.lastMessage
                      ? room.lastMessageDate === currentDate
                        ? `${
                            room.lastMessageTime.split(" ")[0]
                          } ${room.lastMessageTime.split(" ")[1].toUpperCase()}`
                        : room.lastMessageDate
                      : null}
                  </p>
                </div>
                <div className="Friend_Card--Message_Container">
                  <p className="Friend_Card--Message">
                    {room?.lastMessage
                      ? room.lastMessage.msg
                      : room.type === "single"
                      ? `Say hello, to your fren!`
                      : `Say hello, to your frens!`}
                  </p>
                  <span className="Friend_Card--Unread_Message_Count">
                    {unreadMessages.length
                      ? unreadMessages.length < 100
                        ? unreadMessages.length
                        : `99+`
                      : null}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="Friends_List--Empty">
          <p className="Friends_List--Empty--Message">
            {friendListSearch.length
              ? `No match found!`
              : `Oops! Looks like your frens list is empty. Send a request to a fren
            to show them here!`}
          </p>
        </div>
      )}
    </section>
  );
}

export default FriendsList;
