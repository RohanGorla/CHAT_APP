import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdPerson } from "react-icons/io";
import { FaEdit } from "react-icons/fa";

function Profile() {
  /* SPECIAL VARIABLES */
  const { socket, friends } = useOutletContext();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES */
  const [editUsername, setEditUsername] = useState(false);
  const [editUserid, setEditUserid] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [newUsername, setNewUsername] = useState(userData?.username);
  const [newUserid, setNewUserid] = useState(userData?.userId);

  /* CHANGE USERNAME SOCKET METHOD */
  async function changeUsername() {
    if (userData.username === newUsername) return;
    socket.emit("update_username", {
      username: newUsername,
      userId: userData.userId,
      friends,
    });
    userData.username = newUsername;
    localStorage.setItem("ChatApp_UserInfo", JSON.stringify(userData));
    setEditUsername(false);
  }

  /* CHNAGE USERID SOCKET METHOD */
  async function changeUserid() {
    if (newUserid === userData.userId) return;
    socket.emit("update_userid", {
      oldUserid: userData.userId,
      newUserid,
      friends,
    });
  }

  useEffect(() => {
    socket.on("update_userid_success", ({ newUserid }) => {
      userData.userId = newUserid;
      localStorage.setItem("ChatApp_UserInfo", JSON.stringify(userData));
      setEditUserid(false);
    });

    socket.on("update_userid_failed", ({ error }) => {});
  }, []);

  return (
    <div className="Profile_Page">
      <div className="Profile">
        {/* PROFILE PICTURE/ICON */}
        <div className="Profile--Image">
          <IoMdPerson className="Profile--Image--Icon" />
        </div>
        {/* PROFILE DETAILS */}
        <div className="Profile--Details">
          {/* USERNAME */}
          <div className="Profile--Credential_Container">
            {/* SHOW USERNAME */}
            <div
              className={
                editUsername
                  ? "Profile--Show_Credential--Inactive"
                  : "Profile--Show_Credential"
              }
            >
              <p className="Profile--Credential">{userData.username}</p>
              <div className="Profile--Edit_Credential_Button">
                <FaEdit
                  className="Profile--Edit_Credential_Button--Icon"
                  onClick={() => setEditUsername(true)}
                />
              </div>
            </div>
            {/* EDIT USERNAME */}
            <div
              className={
                editUsername
                  ? "Profile--Edit_Credentials"
                  : "Profile--Edit_Credentials--Inactive"
              }
            >
              <div className="Profile--Edit_Credentials--Input_Section">
                <input
                  className="Profile--Edit_Credentials--Input"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username..."
                ></input>
              </div>
              <div className="Profile--Edit_Credentials--Buttons">
                <button
                  className="Profile--Edit_Credentials--Buttons--Cancel"
                  onClick={() => setEditUsername(false)}
                >
                  Cancel
                </button>
                <button
                  className="Profile--Edit_Credentials--Buttons--Save"
                  onClick={changeUsername}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
          {/* USERID */}
          <div className="Profile--Credential_Container">
            {/* SHOW USERID */}
            <div
              className={
                editUserid
                  ? "Profile--Show_Credential--Inactive"
                  : "Profile--Show_Credential"
              }
            >
              <p className="Profile--Credential">{userData.userId}</p>
              <div className="Profile--Edit_Credential_Button">
                <FaEdit
                  className="Profile--Edit_Credential_Button--Icon"
                  onClick={() => setEditUserid(true)}
                />
              </div>
            </div>
            {/* EDIT USERID */}
            <div
              className={
                editUserid
                  ? "Profile--Edit_Credentials"
                  : "Profile--Edit_Credentials--Inactive"
              }
            >
              <div className="Profile--Edit_Credentials--Input_Section">
                <input
                  className="Profile--Edit_Credentials--Input"
                  value={newUserid}
                  onChange={(e) => {
                    setNewUserid(e.target.value);
                  }}
                  placeholder="Enter user id..."
                ></input>
              </div>
              <div className="Profile--Edit_Credentials--Buttons">
                <button
                  className="Profile--Edit_Credentials--Buttons--Cancel"
                  onClick={() => setEditUserid(false)}
                >
                  Cancel
                </button>
                <button
                  className="Profile--Edit_Credentials--Buttons--Save"
                  onClick={changeUserid}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
          {/* EMAIL */}
          <div className="Profile--Credential_Container">
            <div
              className={
                editEmail
                  ? "Profile--Show_Credential--Inactive"
                  : "Profile--Show_Credential"
              }
            >
              <p className="Profile--Credential">{userData.mail}</p>
              <div className="Profile--Edit_Credential_Button">
                <FaEdit
                  className="Profile--Edit_Credential_Button--Icon"
                  onClick={() => setEditEmail(true)}
                />
              </div>
            </div>
            <div
              className={
                editEmail
                  ? "Profile--Edit_Credentials"
                  : "Profile--Edit_Credentials--Inactive"
              }
            >
              <div className="Profile--Edit_Credentials--Input_Section">
                <input className="Profile--Edit_Credentials--Input"></input>
              </div>
              <div className="Profile--Edit_Credentials--Buttons">
                <button
                  className="Profile--Edit_Credentials--Buttons--Cancel"
                  onClick={() => setEditEmail(false)}
                >
                  Cancel
                </button>
                <button className="Profile--Edit_Credentials--Buttons--Save">
                  Save
                </button>
              </div>
            </div>
          </div>
          {/* PASSWORD */}
          <div className="Profile--Credential_Container">
            <div
              className={
                editPassword
                  ? "Profile--Show_Credential--Inactive"
                  : "Profile--Show_Credential"
              }
            >
              <p className="Profile--Credential">********</p>
              <div className="Profile--Edit_Credential_Button">
                <FaEdit
                  className="Profile--Edit_Credential_Button--Icon"
                  onClick={() => setEditPassword(true)}
                />
              </div>
            </div>
            <div
              className={
                editPassword
                  ? "Profile--Edit_Credentials"
                  : "Profile--Edit_Credentials--Inactive"
              }
            >
              <div className="Profile--Edit_Credentials--Input_Section">
                <input className="Profile--Edit_Credentials--Input"></input>
              </div>
              <div className="Profile--Edit_Credentials--Buttons">
                <button
                  className="Profile--Edit_Credentials--Buttons--Cancel"
                  onClick={() => setEditPassword(false)}
                >
                  Cancel
                </button>
                <button className="Profile--Edit_Credentials--Buttons--Save">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* LOGOUT BUTTON */}
        <div className="Profile--Logout">
          <button
            className="Profile--Logout_Button"
            onClick={() => {
              navigate("/login");
              localStorage.removeItem("ChatApp_UserInfo");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
