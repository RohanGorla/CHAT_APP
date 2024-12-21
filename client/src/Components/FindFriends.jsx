import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";
import axios from "axios";

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

  /* DEBOUNCE FUNCTION FOR SEARCHING USER */
  function debounce() {
    let timeout;
    return function (searchInput) {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        if (!searchInput.length) return;
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/finduser`,
          { user: searchInput }
        );
        console.log(response.data);
      }, 700);
    };
  }
  /* USE THE CLOSURE RETURNED BY DEBOUNCE */
  const handleSearch = useMemo(() => debounce(), []);

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
              handleSearch(e.target.value);
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
