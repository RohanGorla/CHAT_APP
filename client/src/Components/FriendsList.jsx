import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";

function FriendsList() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const params = useParams();
  const {
    friends,
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
  const usernameColors = ["orange", "green", "violet", "goldenrod"];

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
          let friendsList;
          switch (room.type) {
            /* IF SINGLE CHAT */
            case "single":
              const friendId = room.users.filter(
                (user) => user !== userData.userId
              );
              friendsList = friends.filter(
                (friend) => friend.usr_id === friendId[0]
              );
              break;
            /* IF GROUP CHAT */
            case "group":
              const friendsIdList = room.users.filter(
                (user) => user !== userData.userId
              );
              friendsList = friends.filter((friend) =>
                friendsIdList.includes(friend.usr_id)
              );
              break;
          }
          return (
            /* EACH FRIEND'S DISPLAY CARD */
            <div
              key={index}
              className="Friends_List--Friend_Card"
              onClick={() => {
                /* AVOID RENAVIGATION TO THE SAME PAGE */
                if (params.id !== room.roomId) {
                  /* FILTER OUT THIS FRIEND/GROUP ROOM CHATS FROM ALL CHATS */
                  const roomChats = chats.filter(
                    (chat) => chat.room === room.roomId
                  );
                  setRoomChats(roomChats);
                  console.log(room.name);
                  setCurrentRoom(room.name);
                  /* SELECT AND SET A UNIQUE COLOR FOR USERNAME IN CHATS PAGE CARDS */
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
                  <p className="Friend_Card--Time">07:00 PM</p>
                </div>
                <p className="Friend_Card--Message">
                  This is the final message!
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <div className="Friends_List--Empty">
          <p className="Friends_List--Empty--Message">Send a request to your friends and start chatting!</p>
        </div>
      )}
    </section>
  );
}

export default FriendsList;
