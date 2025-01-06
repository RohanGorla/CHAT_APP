import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";

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

  useEffect(() => {
    if (!friendListSearch.length) return setSearchRooms(rooms);
    const filteredRooms = rooms.filter((room) =>
      room.name.toLowerCase().startsWith(friendListSearch.toLowerCase())
    );
    setSearchRooms(filteredRooms);
  }, [friendListSearch]);

  return (
    <section className="Friends_List">
      {/* SEARCH FRIEND IN FRIENDS LIST */}
      <search className="Friends_List--Search">
        <input
          type="text"
          value={friendListSearch}
          onChange={(e) => {
            setFriendListSearch(e.target.value);
          }}
          placeholder="Search friend list..."
        ></input>
      </search>
      {searchRooms.length ? (
        searchRooms.map((room, index) => {
          /* FILTER OUT THIS FRIEND/GROUP ROOM CHATS FROM ALL CHATS */
          const roomChats = chats.filter((chat) => chat.room === room.roomId);
          /* SET LAST MESSAGE OF THIS CHAT FROM THE ROOM CHATS */
          const lastMessage = roomChats[roomChats.length - 1];
          /* SET THE DISPLAY TIME OF THIS CHAT'S LAST MESSAGE */
          const currentDate = new Date().toLocaleDateString("en-IN");
          const lastMessageDate = new Date(
            lastMessage?.time
          ).toLocaleDateString("en-IN");
          const lastMessageTime = new Date(
            lastMessage?.time
          ).toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          });
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
                  <IoMdPerson className="Friend_Card--Image_Icon" />
                </div>
              </div>
              {/* CHAT INFO AND LATEST MESSAGE DISPLAY */}
              <div className="Friend_Card--Details">
                <div className="Friend_Card--Name_And_Time">
                  <p className="Friend_Card--Name">{room.name}</p>
                  <p className="Friend_Card--Time">
                    {lastMessage
                      ? lastMessageDate === currentDate
                        ? `${lastMessageTime.split(" ")[0]} ${lastMessageTime
                            .split(" ")[1]
                            .toUpperCase()}`
                        : lastMessageDate
                      : null}
                  </p>
                </div>
                <p className="Friend_Card--Message">
                  {lastMessage
                    ? lastMessage.msg
                    : `Say hello, to your new fren!`}
                </p>
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
