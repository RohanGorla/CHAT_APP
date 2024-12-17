import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdSend } from "react-icons/io";
import axios from "axios";
import "../Styles/Friends.css";

function Friends() {
  /* SPECIAL VARIABLES */
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  const navigate = useNavigate();
  const { socket, friends, rooms } = useOutletContext();
  /* STATE VARIABLES */
  const [friendListSearch, setFriendListSearch] = useState("");

  useEffect(() => {}, [friendListSearch]);

  useEffect(() => {
    /* NAVIGATE TO LOGIN PAGE IF USER IS NOT LOGGED IN */
    if (!userData) return navigate("/login");
  }, []);

  return (
    <div className="Friends_Page">
      {/* USER'S FRIENDS LIST */}
      <section className="Friends_List">
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
            <div key={index} className="Friends_List--Friend">
              {/* EACH FRIEND'S CARD */}
              <p className="Friends_List--Friend_Name">{roomName}</p>
            </div>
          );
        })}
      </section>
      <section className="Friends_Chat"></section>
    </div>
  );
}

export default Friends;
