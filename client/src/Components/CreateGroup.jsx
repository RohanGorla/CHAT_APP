import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";
import { SiTicktick } from "react-icons/si";

function CreateGroup() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const { friends } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLE */
  const [sortedFriends, setSortedFriends] = useState(friends);
  const [groupName, setGroupName] = useState("");
  const [friendListSearch, setFriendListSearch] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);

  /* SORT THE FRIENDS LIST BASED ON SELECTED FRIENDS */
  useEffect(() => {
    const selectedList = friends.filter((friend) =>
      selectedFriends.includes(friend.usr_id)
    );
    const notSelectedList = friends.filter(
      (friend) => !selectedFriends.includes(friend.usr_id)
    );
    setSortedFriends([...selectedList, ...notSelectedList]);
  }, [selectedFriends]);

  return (
    <div className="CreateGroup_Page">
      <div className="CreateGroup_Container">
        <section className="CreateGroup--Group_Details">
          <p className="CreateGroup--Group_Details--Heading">
            Create new frens group
          </p>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name..."
          ></input>
          <button
            className={
              groupName.length
                ? "CreateGroup--Group_Details--Create"
                : "CreateGroup--Group_Details--Create--Inactive"
            }
          >
            Create Group
          </button>
        </section>
        <section className="CreateGroup--Select_Friends">
          <div className="CreateGroup--Select_Friends--Search">
            <p className="CreateGroup--Select_Friends--Heading">Select frens</p>
            <input
              type="text"
              value={friendListSearch}
              onChange={(e) => setFriendListSearch(e.target.value)}
              placeholder="Search your frens list"
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
                  }}
                >
                  <div className="CreateGroup--Friends_List--Friend_Image_Container">
                    <div className="CreateGroup--Friends_List--Friend_Image">
                      {friend.imageUrl ? (
                        <div className="CreateGroup--Friends_List--Friend_Image_Frame">
                          <img src={friend.imageUrl}></img>
                        </div>
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
