import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";
import { FaEdit } from "react-icons/fa";

function Profile() {
  /* SPECIAL VARIABLES */
  const { socket, notifications } = useOutletContext();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES */
  const [editUsername, setEditUsername] = useState(false);
  const [editUserid, setEditUserid] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editPassword, setEditPassword] = useState(false);
  const [newUsername, setNewUsername] = useState(userData?.username);

  return (
    <div className="Profile_Page">
      <div className="Profile">
        <div className="Profile--Image">
          <IoMdPerson className="Profile--Image--Icon" />
        </div>
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
                <button className="Profile--Edit_Credentials--Buttons--Save">
                  Save
                </button>
              </div>
            </div>
          </div>
          {/* USERID */}
          <div className="Profile--Credential_Container">
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
            <div
              className={
                editUserid
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
                  onClick={() => setEditUserid(false)}
                >
                  Cancel
                </button>
                <button className="Profile--Edit_Credentials--Buttons--Save">
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
