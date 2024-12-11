import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

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
    <div>
      <input
        type="text"
        value={user}
        onChange={(e) => {
          setUser(e.target.value);
        }}
      ></input>
      <button onClick={finduser}>Find</button>
    </div>
  );
}

export default FindFriends