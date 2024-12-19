import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";

function FindFriends() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const { socket } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));

  /* STATE VARIABLES */
  const [user, setUser] = useState("");

  async function finduser() {
    socket.emit("send_request", { from: userData.userId, to: user });
  }

  return (
    <div className="FindFriends_Page">
      <div className="FindFriends_Container">
        <div>
          <input
            className="FindFriends--SearchBar"
            type="text"
            value={user}
            onChange={(e) => {
              setUser(e.target.value);
            }}
            autoFocus
            placeholder="Search username/user ID"
          ></input>
        </div>
      </div>
    </div>
  );
}

export default FindFriends;
