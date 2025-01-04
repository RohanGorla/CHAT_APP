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
  const [newEmail, setNewEmail] = useState(userData?.mail);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState(false);
  const [errorType, setErrorType] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  /* CHANGE USERNAME SOCKET METHOD */
  async function changeUsername() {
    if (userData.username === newUsername) {
      setError(true);
      setErrorType("username");
      setErrorMsg("New username cannot be the same as old username!");
      return;
    }
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
    if (newUserid === userData.userId) {
      setError(true);
      setErrorType("userid");
      setErrorMsg("New userid cannot be the same as old userid!");
      return;
    }
    socket.emit("update_userid", {
      oldUserid: userData.userId,
      newUserid,
      friends,
    });
  }

  /* CHANGE EMAIL SOCKET METHOD */
  async function changeEmail(e) {
    e.preventDefault();
    if (userData.mail === newEmail) {
      setError(true);
      setErrorType("email");
      setErrorMsg("New email cannot be the same as old email!");
      return;
    }
    socket.emit("update_email", { userId: userData.userId, newEmail, friends });
  }

  /* CHANGE PASSWORD SOCKET METHOD */
  async function changePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError(true);
      setErrorType("newpassword");
      setErrorMsg("Passwords do not match!");
      return;
    }
    if (oldPassword === newPassword) {
      setError(true);
      setErrorType("newpassword");
      setErrorMsg("New password cannot be the same as old password!");
      return;
    }
    socket.emit("update_password", {
      userId: userData.userId,
      oldPassword,
      newPassword,
    });
  }

  useEffect(() => {
    /* HANDLE UPDATE USERID SUCCESS AND FAILURE */
    socket.on("update_userid_success", ({ newUserid }) => {
      userData.userId = newUserid;
      localStorage.setItem("ChatApp_UserInfo", JSON.stringify(userData));
      setEditUserid(false);
      setError(false);
      setErrorType("");
      setErrorMsg("");
    });

    socket.on("update_userid_failed", ({ error }) => {
      setError(true);
      setErrorType("userid");
      setErrorMsg(error);
    });

    /* HANDLE UPDATE EMAIL SUCCESS AND FAILURE */
    socket.on("update_email_success", ({ newEmail }) => {
      userData.mail = newEmail;
      localStorage.setItem("ChatApp_UserInfo", JSON.stringify(userData));
      setEditEmail(false);
      setError(false);
      setErrorType("");
      setErrorMsg("");
    });

    socket.on("update_email_failed", ({ error }) => {
      setError(true);
      setErrorType("email");
      setErrorMsg(error);
    });

    /* HANDLE UPDATE PASSWORD SUCCESS AND FAILURE */
    socket.on("update_password_success", () => {
      setEditPassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setError(false);
      setErrorType("");
      setErrorMsg("");
    });

    socket.on("update_password_failed", ({ error }) => {
      setError(true);
      setErrorType("oldpassword");
      setErrorMsg(error);
    });
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
                  onClick={() => {
                    setEditUsername(true);
                    setEditUserid(false);
                    setEditEmail(false);
                    setEditPassword(false);
                    setNewUserid(userData.userId);
                    setNewEmail(userData.mail);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }}
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
              <div
                className={
                  errorType === "username"
                    ? "Profile--Edit_Credential_Error"
                    : "Profile--Edit_Credential_Error--Inactive"
                }
              >
                <p className="Profile--Edit_Credential_Error--Message">
                  {errorMsg}
                </p>
              </div>
              <div className="Profile--Edit_Credentials--Buttons">
                <button
                  className="Profile--Edit_Credentials--Buttons--Cancel"
                  onClick={() => {
                    setEditUsername(false);
                    setNewUsername(userData.username);
                  }}
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
                  onClick={() => {
                    setEditUsername(false);
                    setEditUserid(true);
                    setEditEmail(false);
                    setEditPassword(false);
                    setNewUsername(userData.username);
                    setNewEmail(userData.mail);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }}
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
              <div
                className={
                  errorType === "userid"
                    ? "Profile--Edit_Credential_Error"
                    : "Profile--Edit_Credential_Error--Inactive"
                }
              >
                <p className="Profile--Edit_Credential_Error--Message">
                  {errorMsg}
                </p>
              </div>
              <div className="Profile--Edit_Credentials--Buttons">
                <button
                  className="Profile--Edit_Credentials--Buttons--Cancel"
                  onClick={() => {
                    setEditUserid(false);
                    setNewUserid(userData.userId);
                  }}
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
            {/* SHOW EMAIL */}
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
                  onClick={() => {
                    setEditUsername(false);
                    setEditUserid(false);
                    setEditEmail(true);
                    setEditPassword(false);
                    setNewUsername(userData.username);
                    setNewUserid(userData.userId);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }}
                />
              </div>
            </div>
            {/* EDIT EMAIL */}
            <form
              className={
                editEmail
                  ? "Profile--Edit_Credentials"
                  : "Profile--Edit_Credentials--Inactive"
              }
              onSubmit={changeEmail}
            >
              <div className="Profile--Edit_Credentials--Input_Section">
                <input
                  className="Profile--Edit_Credentials--Input"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  placeholder="Enter email..."
                ></input>
              </div>
              <div
                className={
                  errorType === "email"
                    ? "Profile--Edit_Credential_Error"
                    : "Profile--Edit_Credential_Error--Inactive"
                }
              >
                <p className="Profile--Edit_Credential_Error--Message">
                  {errorMsg}
                </p>
              </div>
              <div className="Profile--Edit_Credentials--Buttons">
                <button
                  className="Profile--Edit_Credentials--Buttons--Cancel"
                  onClick={(e) => {
                    e.preventDefault();
                    setEditEmail(false);
                    setNewEmail(userData.mail);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="Profile--Edit_Credentials--Buttons--Save"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
          {/* PASSWORD */}
          <div className="Profile--Credential_Container">
            {/* SHOW PASSWORD */}
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
                  onClick={() => {
                    setEditUsername(false);
                    setEditUserid(false);
                    setEditEmail(false);
                    setEditPassword(true);
                    setNewUsername(userData.username);
                    setNewUserid(userData.userId);
                    setNewEmail(userData.mail);
                  }}
                />
              </div>
            </div>
            {/* EDIT PASSWORD */}
            <form
              className={
                editPassword
                  ? "Profile--Edit_Credentials"
                  : "Profile--Edit_Credentials--Inactive"
              }
              onSubmit={changePassword}
            >
              <div className="Profile--Edit_Credentials--Input_Section">
                <input
                  className="Profile--Edit_Credentials--Input"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter old password..."
                  required
                ></input>
              </div>
              <div
                className={
                  errorType === "oldpassword"
                    ? "Profile--Edit_Credential_Error"
                    : "Profile--Edit_Credential_Error--Inactive"
                }
              >
                <p className="Profile--Edit_Credential_Error--Message">
                  {errorMsg}
                </p>
              </div>
              <div className="Profile--Edit_Credentials--Input_Section">
                <input
                  className="Profile--Edit_Credentials--Input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  required
                ></input>
              </div>
              <div className="Profile--Edit_Credentials--Input_Section">
                <input
                  className="Profile--Edit_Credentials--Input"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password..."
                  required
                ></input>
              </div>
              <div
                className={
                  errorType === "newpassword"
                    ? "Profile--Edit_Credential_Error"
                    : "Profile--Edit_Credential_Error--Inactive"
                }
              >
                <p className="Profile--Edit_Credential_Error--Message">
                  {errorMsg}
                </p>
              </div>
              <div className="Profile--Edit_Credentials--Buttons">
                <button
                  className="Profile--Edit_Credentials--Buttons--Cancel"
                  onClick={(e) => {
                    e.preventDefault();
                    setEditPassword(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="Profile--Edit_Credentials--Buttons--Save"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </form>
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
