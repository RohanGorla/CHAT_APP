import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdPerson, IoMdArrowRoundBack } from "react-icons/io";
import axios from "axios";

function FindFriends() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const { socket, friends, rooms, notifications } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES */
  const [user, setUser] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsLoading, setSearchResultsLoading] = useState(false);
  const [showDetailsCard, setShowDetailsCard] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  /* FRIENDS IDS LISTS */
  const friendsIds = useMemo(() => {
    const ids = friends.map((friend) => friend.usr_id);
    return ids;
  }, [friends]);

  /* GET ALL FRIEND REQUEST THE USER HAS SENT TO OTHERS */
  const sentRequests = useMemo(() => {
    const requestsList = notifications
      .filter(
        (notification) =>
          notification.from.userId === userData.userId &&
          notification.type !== "Reject"
      )
      .map((notification) => notification.to.usr_id);
    return requestsList;
  }, [notifications]);

  /* SEND FRIEND REQUEST TO SELECTED USER */
  async function sendRequest(user) {
    socket.emit("send_request", { from: userData, to: user, type: "Request" });
    setShowDetailsCard(false);
  }

  /* REMOVE SELECTED USER FROM FRIENDS LIST */
  async function removeFriend(user) {
    const room = rooms.filter((room) => {
      const users = [userData.userId, user.usr_id];
      const usersCheck = users.every((user) => room.users.includes(user));
      if (usersCheck && room.type === "single") return room;
    });
    socket.emit("remove_friend", { from: userData, to: user, room: room[0] });
    setShowDetailsCard(false);
    setShowConfirmRemove(false);
  }

  useEffect(() => {
    if (!userData) navigate("/login");
  }, []);

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
        setSearchResults(response.data);
        setSearchResultsLoading(false);
      }, 700);
    };
  }
  /* USE THE CLOSURE RETURNED BY DEBOUNCE */
  const handleSearch = useMemo(() => debounce(), []);

  return (
    <div className="FindFriends_Page">
      {/* CARD TO SHOW SELECTED USER'S DETAILS AND OPTIONS */}
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
                if (sentRequests.includes(selectedUser.usr_id))
                  return setShowDetailsCard(false);
                if (friendsIds.includes(selectedUser.usr_id))
                  return setShowConfirmRemove(true);
                sendRequest(selectedUser);
              }}
            >
              {selectedUser.usr_id === userData.userId
                ? `You`
                : sentRequests.includes(selectedUser.usr_id)
                ? `Fren request has been sent`
                : friendsIds.includes(selectedUser.usr_id)
                ? `Remove fren`
                : `Send fren request`}
            </button>
          </div>
          <div
            className={
              showConfirmRemove
                ? "FindFriends--Selected_User--Confirm_Remove"
                : "FindFriends--Selected_User--Confirm_Remove--Inactive"
            }
          >
            <i className="FindFriends--Selected_User--Confirm_Remove--Message">
              By removing {selectedUser.usr_nm} as your fren, all your chat
              messages will be deleted permanently and you will no longer be
              frens!
            </i>
            <button
              className="FindFriends--Selected_User--Confirm_Remove--Button"
              onClick={() => removeFriend(selectedUser)}
            >
              Confirm remove fren
            </button>
          </div>
        </div>
      </div>
      <div className="FindFriends_Container">
        {/* SEARCH BAR TO FIND NEW FRIENDS */}
        <section className="FindFriends--SearchBar">
          <input
            className="FindFriends--SearchBar_Input"
            type="text"
            value={user}
            onChange={(e) => {
              setUser(e.target.value);
              setSearchResultsLoading(true);
              handleSearch(e.target.value);
            }}
            autoFocus
            placeholder="Search username/user ID"
          ></input>
        </section>
        {/* LIST OF USERS WHO MATCH THE SEARCH */}
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
                {user.length
                  ? searchResultsLoading
                    ? `Searching...`
                    : `No match found! Try searching with a different username or user id.`
                  : `Find your next frens using their user name or user id and send
                them a fren request!`}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default FindFriends;
