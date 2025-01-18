import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";
import { FaEdit, FaCamera } from "react-icons/fa";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import axios from "axios";

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
  const [profilePicture, setProfilePicture] = useState("");
  const [confirmProfilePicture, setConfirmProfilePicture] = useState(false);
  const [getUrl, setGetUrl] = useState("");
  const [newUsername, setNewUsername] = useState(userData?.username);
  const [newUserid, setNewUserid] = useState(userData?.userId);
  const [newEmail, setNewEmail] = useState(userData?.mail);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errorType, setErrorType] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  /* GET PROFILE PICTURE GET URL FUNCTION */
  async function getSignedUrl(key) {
    const getGetUrlResponse = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/getsignedgeturl`,
      {
        key,
      }
    );
    setGetUrl(getGetUrlResponse.data.url);
  }

  /* CHANGE PROFILE PICTURE SOCKET METHOD */
  async function changeProfilePicture() {
    if (!profilePicture) return;
    const getPutUrlResponse = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/getsignedputurl`,
      {
        contentType: profilePicture.type,
        key: userData.userId,
      }
    );
    const putRequestResponse = await axios.put(
      getPutUrlResponse.data.url,
      profilePicture,
      {
        headers: {
          "Content-Type": profilePicture.type,
        },
      }
    );
    if (putRequestResponse.status === 200) {
      userData.imageTag = getPutUrlResponse.data.key;
      localStorage.setItem("ChatApp_UserInfo", JSON.stringify(userData));
      socket.emit("update_profile_picture", {
        userId: userData.userId,
        key: getPutUrlResponse.data.key,
        friends,
      });
      setConfirmProfilePicture(false);
    }
  }

  /* CHANGE USERNAME SOCKET METHOD */
  async function changeUsername() {
    if (userData.username === newUsername) {
      setErrorType("username");
      setErrorMsg("New username cannot be the same as old username!");
      return;
    }
    if (!newUsername.length) {
      setErrorType("username");
      setErrorMsg("Username cannot be empty!");
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

  /* CHANGE USERID SOCKET METHOD */
  async function changeUserid() {
    if (newUserid === userData.userId) {
      setErrorType("userid");
      setErrorMsg("New userid cannot be the same as old userid!");
      return;
    }
    if (!newUserid.length) {
      setErrorType("userid");
      setErrorMsg("Userid cannot be empty!");
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
      setErrorType("email");
      setErrorMsg("New email cannot be the same as old email!");
      return;
    }
    socket.emit("update_email", {
      userId: userData.userId,
      newEmail,
      friends,
    });
  }

  /* CHANGE PASSWORD SOCKET METHOD */
  async function changePassword(e) {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setErrorType("newpassword");
      setErrorMsg("Passwords do not match!");
      return;
    }
    if (oldPassword === newPassword) {
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
    if (!userData) {
      navigate("/login");
    } else {
      /* GET THE SIGNED GET URL TO DISPLAY THE PROFILE PICTURE */
      getSignedUrl(userData.imageTag);

      /* HANDLE UPDATE USERID SUCCESS AND FAILURE */
      socket.on("update_userid", ({ oldUserid, newUserid }) => {
        if (userData.userId !== oldUserid) return;
        userData.userId = newUserid;
        localStorage.setItem("ChatApp_UserInfo", JSON.stringify(userData));
        setEditUserid(false);
        setErrorType("");
        setErrorMsg("");
      });

      socket.on("update_userid_failed", ({ error }) => {
        setErrorType("userid");
        setErrorMsg(error);
      });

      /* HANDLE UPDATE EMAIL SUCCESS AND FAILURE */
      socket.on("update_email", ({ userId, newEmail }) => {
        if (userData.userId !== userId) return;
        userData.mail = newEmail;
        localStorage.setItem("ChatApp_UserInfo", JSON.stringify(userData));
        setEditEmail(false);
        setErrorType("");
        setErrorMsg("");
      });

      socket.on("update_email_failed", ({ error }) => {
        setErrorType("email");
        setErrorMsg(error);
      });

      /* HANDLE UPDATE PASSWORD SUCCESS AND FAILURE */
      socket.on("update_password", () => {
        setEditPassword(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setErrorType("");
        setErrorMsg("");
      });

      socket.on("update_password_failed", ({ error }) => {
        setErrorType("oldpassword");
        setErrorMsg(error);
      });
    }
  }, []);

  return (
    <div className="Profile_Page">
      <div
        className={
          confirmProfilePicture
            ? "Profile--Confirm_Profile_Picture--Container"
            : "Profile--Confirm_Profile_Picture--Inactive"
        }
      >
        <div className="Profile--Confirm_Profile_Picture">
          <p className="Profile--Confirm_Profile_Picture--Heading">
            CONFIRM PROFILE PICTURE
          </p>
          <p className="Profile--Confirm_Profile_Picture--Message">
            Set the selected image as your profile picture?
          </p>
          <button
            className="Profile--Confirm_Profile_Picture--Confirm_Button"
            onClick={changeProfilePicture}
          >
            Confirm
          </button>
          <button
            className="Profile--Confirm_Profile_Picture--Cancel_Button"
            onClick={() => setConfirmProfilePicture(false)}
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="Profile">
        {/* PROFILE PICTURE/ICON */}
        <div className="Profile--Image">
          {userData.imageTag ? (
            <div className="Profile--Image_Frame">
              <img src={getUrl}></img>
            </div>
          ) : (
            <IoMdPerson className="Profile--Image--Icon" />
          )}
          <label htmlFor="Profile--Image_Select">
            <FaCamera className="Profile--Image_Edit--Icon" />
          </label>
          <input
            id="Profile--Image_Select"
            type="file"
            accept="image/*"
            onChange={(e) => {
              setProfilePicture(e.target.files[0]);
              setConfirmProfilePicture(true);
            }}
          ></input>
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
                    setErrorType("");
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
                <label className="Profile--Edit_Credentials--Label">
                  Username:
                </label>
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
                    setErrorType("");
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
                    setErrorType("");
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
                <label className="Profile--Edit_Credentials--Label">
                  User id:
                </label>
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
                    setErrorType("");
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
                    setErrorType("");
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
                <label className="Profile--Edit_Credentials--Label">
                  Email:
                </label>
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
                    setErrorType("");
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
                    setErrorType("");
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
                <label className="Profile--Edit_Credentials--Label">
                  Old password:
                </label>
                <div className="Profile--Edit_Credentials--Input_Container">
                  <input
                    className="Profile--Edit_Credentials--Input"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter old password..."
                    required
                  ></input>
                  <AiFillEye
                    className={
                      showOldPassword
                        ? "Profile--Edit_Credentials--Input--Show"
                        : "Profile--Edit_Credentials--Input--Show--Inactive"
                    }
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  />
                  <AiFillEyeInvisible
                    className={
                      showOldPassword
                        ? "Profile--Edit_Credentials--Input--Show--Inactive"
                        : "Profile--Edit_Credentials--Input--Show"
                    }
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  />
                </div>
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
                <label className="Profile--Edit_Credentials--Label">
                  New password:
                </label>
                <div className="Profile--Edit_Credentials--Input_Container">
                  <input
                    className="Profile--Edit_Credentials--Input"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password..."
                    required
                  ></input>
                  <AiFillEye
                    className={
                      showNewPassword
                        ? "Profile--Edit_Credentials--Input--Show"
                        : "Profile--Edit_Credentials--Input--Show--Inactive"
                    }
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  />
                  <AiFillEyeInvisible
                    className={
                      showNewPassword
                        ? "Profile--Edit_Credentials--Input--Show--Inactive"
                        : "Profile--Edit_Credentials--Input--Show"
                    }
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  />
                </div>
              </div>
              <div className="Profile--Edit_Credentials--Input_Section">
                <label className="Profile--Edit_Credentials--Label">
                  Confirm new password:
                </label>
                <input
                  className="Profile--Edit_Credentials--Input"
                  type={showNewPassword ? "text" : "password"}
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
                    setErrorType("");
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
