import React, { useState, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdPerson, IoMdArrowRoundBack } from "react-icons/io";
import axios from "axios";

function FindFriends() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const { socket, friends } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES */
  const [user, setUser] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDetailsCard, setShowDetailsCard] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});

  const friendsIds = useMemo(() => {
    const ids = friends.map((friend) => friend.usr_id);
    return ids;
  }, []);

  /* FIND USER */
  async function sendRequest(user) {
    socket.emit("send_request", { from: userData, to: user });
    setShowDetailsCard(false);
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
      <div
        className={
          showDetailsCard
            ? "FindFriends--Selected_User_Container"
            : "FindFriends--Selected_User_Container--Hidden"
        }
        onClick={(e) => {
          setShowDetailsCard(false);
          e.stopPropagation();
        }}
      >
        <div
          className="FindFriends--Selected_User"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="FindFriends--Selected_User--Back_Button">
            <IoMdArrowRoundBack
              className="FindFriends--Selected_User--Back_Button--Icon"
              onClick={() => setShowDetailsCard(false)}
            />
          </div>
          <div className="FindFriends--Selected_User--Image">
            <div className="FindFriends--Selected_User--Image_Icon_Container">
              <IoMdPerson className="FindFriends--Selected_User--Image_Icon" />
            </div>
          </div>
          <div className="FindFriends--Selected_User--Details">
            <p className="FindFriends--Selected_User--Username">
              {selectedUser.usr_nm}
            </p>
            <p className="FindFriends--Selected_User--Userid">
              {selectedUser.usr_id}
            </p>
            <p className="FindFriends--Selected_User--Mail">
              {selectedUser.email}
            </p>
            <button
              className="FindFriends--Selected_User--Send_Request_Button"
              onClick={() => {
                if (selectedUser.usr_id === userData.userId)
                  return setShowDetailsCard(false);
                sendRequest(selectedUser);
              }}
            >
              {selectedUser.usr_id !== userData.userId
                ? friendsIds.includes(selectedUser.usr_id)
                  ? `Remove fren`
                  : `Send fren request`
                : `You`}
            </button>
          </div>
        </div>
      </div>
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
          {searchResults.length ? (
            searchResults.map((user, index) => {
              return (
                <div
                  key={index}
                  className="FindFriends--User_Card"
                  onClick={() => {
                    setShowDetailsCard(true);
                    setSelectedUser(user);
                  }}
                >
                  <div className="FindFriends_User_Card--Image">
                    <div className="FindFriends_User_Card--Image_Icon_Container">
                      <IoMdPerson className="FindFriends_User_Card--Image_Icon" />
                    </div>
                  </div>
                  <div className="FindFriends_User_Card--Details">
                    <p className="FindFriends_User_Card--Username">
                      {user.usr_nm}
                    </p>
                    <p className="FindFriends_User_Card--Userid">
                      {user.usr_id}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="FindFriends--Instructions">
              <p className="FindFriends--Instructions_Message">
                Find your next frens using their user name or user id and send
                them a fren request!
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default FindFriends;
