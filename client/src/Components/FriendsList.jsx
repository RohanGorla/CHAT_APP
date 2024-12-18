import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";

function FriendsList() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const params = useParams();
  const { friends, rooms, chats, setRoomChats } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES */
  const [friendListSearch, setFriendListSearch] = useState("");

  useEffect(() => {}, [friendListSearch]);

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
      {rooms.map((room, index) => {
        let roomName;
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
            roomName = friendsList[0].usr_nm;
            break;
          /* IF GROUP CHAT */
          case "group":
            const friendsIdList = room.users.filter(
              (user) => user !== userData.userId
            );
            friendsList = friends.filter((friend) =>
              friendsIdList.includes(friend.usr_id)
            );
            roomName = room.name;
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
                <p className="Friend_Card--Name">{roomName}</p>
                <p className="Friend_Card--Time">07:00 PM</p>
              </div>
              <p className="Friend_Card--Message">This is the final message!</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default FriendsList;
