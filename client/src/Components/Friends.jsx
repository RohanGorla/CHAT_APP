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

  useEffect(() => {
    /* NAVIGATE TO LOGIN PAGE IF USER IS NOT LOGGED IN */
    if (!userData) return navigate("/login");
  }, []);

  return (
    <div className="Friends_Page">
      {rooms.map((room, index) => {
        let roomName;
        switch (room.type) {
          case "single":
            const friendId = room.users.filter(
              (user) => user !== userData.userId
            );
            for (let i = 0; i < friends.length; i++) {
              if (friends[i].usr_id === friendId[0]) {
                roomName = friends[i].usr_nm;
                break;
              }
            }
            break;
          case "group":
            break;
        }
        return <div key={index}>{roomName}</div>;
      })}
    </div>
  );
}

export default Friends;
