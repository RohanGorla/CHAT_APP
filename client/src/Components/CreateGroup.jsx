import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";

function CreateGroup() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const { friends } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLE */
  const [groupName, setGroupName] = useState("");
  const [friendListSearch, setFriendListSearch] = useState("");

  return (
    <div className="CreateGroup_Page">
      <div className="CreateGroup_Container">
        <section className="CreateGroup--Group_Details">
          <p className="CreateGroup--Group_Details--Heading">
            Create a frens group
          </p>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name..."
          ></input>
          <button className="CreateGroup--Group_Details--Create">
            Create Group
          </button>
        </section>
        <section className="CreateGroup--Select_Friends">
          <div className="CreateGroup--Select_Friends--Search">
            <input
              type="text"
              value={friendListSearch}
              onChange={(e) => setFriendListSearch(e.target.value)}
              placeholder="Search your frens list"
            ></input>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CreateGroup;
