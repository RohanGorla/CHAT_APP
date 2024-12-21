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
  const [searchResults, setSearchResults] = useState([]);

  async function finduser() {
    socket.emit("send_request", { from: userData.userId, to: user });
  }

  /* DEBOUNCE FUNCTION FOR SEARCHING USER */
  function debounce() {
    let timeout;
    return function (searchInput) {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        if (!searchInput.length) return setSearchResults([]);
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/finduser`,
          { user: searchInput }
        );
        console.log(response.data);
        setSearchResults(response.data);
      }, 700);
    };
  }
  /* USE THE CLOSURE RETURNED BY DEBOUNCE */
  const handleSearch = useMemo(() => debounce(), []);

  return (
    <div className="FindFriends_Page">
      <div className="FindFriends_Container">
        <section className="FindFriends--SearchBar">
          <input
            className="FindFriends--SearchBar_Input"
            type="text"
            value={user}
            onChange={(e) => {
              setUser(e.target.value);
              handleSearch(e.target.value);
            }}
            autoFocus
            placeholder="Search username/user ID"
          ></input>
        </section>
        <section className="FindFriends--Search_Results">
          {searchResults.map((user, index) => {
            return (
              <div key={index} className="FindFriends--User_Card">
                <div className="FindFriends_User_Card--Image">
                  <div className="FindFriends_User_Card--Image_Icon_Container">
                    <IoMdPerson className="FindFriends_User_Card--Image_Icon" />
                  </div>
                </div>
                <div className="FindFriends_User_Card--Details">
                  <p className="FindFriends_User_Card--Username">
                    {user.usr_nm}
                  </p>
                  <p className="FindFriends_User_Card--Userid">{user.usr_id}</p>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

export default FindFriends;
