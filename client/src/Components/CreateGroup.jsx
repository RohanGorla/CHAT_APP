import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";
import { SiTicktick } from "react-icons/si";
import { FaXmark } from "react-icons/fa6";

function CreateGroup() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const { socket, friends } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLE */
  const [sortedFriends, setSortedFriends] = useState(friends);
  const [groupName, setGroupName] = useState("");
  const [friendListSearch, setFriendListSearch] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loadedImages, setLoadedImages] = useState([]);

  async function createGroup() {
    if (!groupName.length || !selectedFriends.length) return;
    socket.emit("create_group", {
      groupName,
      friends: [...selectedFriends, userData.userId],
      createdBy: { usr_nm: userData.username, usr_id: userData.userId },
    });
    navigate("/user/friends");
  }

  /* FUNCTION TO SORT THE FRIENDS LIST BASED ON SELECTED FRIENDS */
  function sortFriendsList(list) {
    const selectedList = list.filter((friend) =>
      selectedFriends.includes(friend.usr_id)
    );
    const notSelectedList = list.filter(
      (friend) => !selectedFriends.includes(friend.usr_id)
    );
    setSortedFriends([...selectedList, ...notSelectedList]);
  }

  /* FILTER THE FRIENDS LIST BASED ON SEARCH INPUT */
  useEffect(() => {
    if (friendListSearch.length) {
      const filteredFriends = friends.filter(
        (friend) =>
          friend.usr_nm
            .toLowerCase()
            .startsWith(friendListSearch.toLowerCase()) ||
          friend.usr_id.toLowerCase().startsWith(friendListSearch.toLowerCase())
      );
      sortFriendsList(filteredFriends);
    } else {
      sortFriendsList(friends);
    }
  }, [friendListSearch]);

  /* SORT THE FRIENDS LIST BASED ON SELECTED FRIENDS WHEN EVER SELECTED FRIENDS LIST CHANGES */
  useEffect(() => sortFriendsList(friends), [selectedFriends]);

  return (
    <div className="CreateGroup_Page">
      <div className="CreateGroup_Container">
        <FaXmark
          onClick={() => navigate("/user/friends")}
          className="CreateGroup--Close"
        />
        <section className="CreateGroup--Group_Details">
          <p className="CreateGroup--Group_Details--Heading">
            Create new frens group
          </p>
          <input
            type="text"
            value={groupName}
            onChange={(e) => {
              if (e.target.value.length <= 100) setGroupName(e.target.value);
            }}
            placeholder="Enter group name..."
          ></input>
          <div className="CreateGroup--Group_Details--Create_Button_And_Character_Count">
            <button
              className={
                groupName.length && selectedFriends.length
                  ? "CreateGroup--Group_Details--Create"
                  : "CreateGroup--Group_Details--Create--Inactive"
              }
              onClick={createGroup}
            >
              Create Group
            </button>
            <p className="CreateGroup--Group_Details--Character_Count">
              {groupName.length}/100
            </p>
          </div>
        </section>
        <section className="CreateGroup--Select_Friends">
          <div className="CreateGroup--Select_Friends--Search">
            <p className="CreateGroup--Select_Friends--Heading">Select frens</p>
            <input
              type="text"
              value={friendListSearch}
              onChange={(e) => setFriendListSearch(e.target.value)}
              placeholder="Search your frens list..."
            ></input>
          </div>
          <div className="CreateGroup--Select_Friends--Friends_List">
            {sortedFriends.map((friend, index) => {
              return (
                <div
                  key={index}
                  className="CreateGroup--Friends_List--Friend"
                  onClick={() => {
                    if (selectedFriends.includes(friend.usr_id)) {
                      const updatedList = selectedFriends.filter(
                        (id) => id !== friend.usr_id
                      );
                      setSelectedFriends(updatedList);
                    } else {
                      setSelectedFriends([...selectedFriends, friend.usr_id]);
                    }
                    setFriendListSearch("");
                  }}
                >
                  <div className="CreateGroup--Friends_List--Friend_Image_Container">
                    <div className="CreateGroup--Friends_List--Friend_Image">
                      {friend.imageUrl ? (
                        <>
                          <div
                            className={
                              loadedImages.includes(friend.imageTag)
                                ? "CreateGroup--Friends_List--Friend_Image_Frame"
                                : "Inactive"
                            }
                          >
                            <img
                              src={friend.imageUrl}
                              onLoad={() =>
                                setLoadedImages((prev) => [
                                  ...prev,
                                  friend.imageTag,
                                ])
                              }
                            ></img>
                          </div>
                          <IoMdPerson
                            className={
                              loadedImages.includes(friend.imageTag)
                                ? "Inactive"
                                : "CreateGroup--Friends_List--Friend_Icon"
                            }
                          />
                        </>
                      ) : (
                        <IoMdPerson className="CreateGroup--Friends_List--Friend_Icon" />
                      )}
                    </div>
                  </div>
                  <div className="CreateGroup--Friends_List--Friend_Details">
                    <div className="CreateGroup--Friends_List--Friend_Details--Name_And_Id">
                      <p className="CreateGroup--Friends_List--Friend_Username">
                        {friend.usr_nm}
                      </p>
                      <p className="CreateGroup--Friends_List--Friend_Userid">
                        {friend.usr_id}
                      </p>
                    </div>
                    <div
                      className={
                        selectedFriends.includes(friend.usr_id)
                          ? "CreateGroup--Friends_List--Friend_Details--Selected"
                          : "Inactive"
                      }
                    >
                      <SiTicktick className="CreateGroup--Friends_List--Friend_Details--Selected_Icon" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default CreateGroup;
