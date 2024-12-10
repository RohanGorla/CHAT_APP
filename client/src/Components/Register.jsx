import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Login.css";
import axios from "axios";

function Register() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  /* STATE VARIABLES */
  const [mail, setMail] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [mailError, setMailError] = useState(false);
  const [userIdError, setUserIdError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* REGISTER A NEW USER API */
  async function registerUser(e) {
    e.preventDefault();
    /* CHECK IF PASSWORD AND CONFIRM PASSWORD MATCH */
    if (password !== confirmPassword) {
      setMailError(false);
      setUserIdError(false);
      setPasswordError(true);
      setErrorMessage("Passwords donot match!");
      return;
    }
    setPasswordError(false);
    /* MAKE A POST REQUEST IF PASSWORDS MATCH */
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/registeruser`,
      {
        mail,
        userId,
        username,
        password,
      }
    );
    /* REGISTER FAIL */
    if (!response.data.access) {
      switch (response.data.errorCode) {
        case "mail":
          setMailError(true);
          setUserIdError(false);
          break;
        case "id":
          setMailError(false);
          setUserIdError(true);
          break;
      }
      setErrorMessage(response.data.errorMsg);
      return;
    }
    /* REGISTER SUCCESS */
    setMailError(false);
    setUserIdError(false);
    const userData = JSON.stringify({ mail, userId, username });
    localStorage.setItem("ChatApp_UserInfo", userData);
    navigate("/");
  }

  return (
    <div className="Login_Page">
      {/* USER REGISTER FORM */}
      <form className="Login_Page--Form" onSubmit={registerUser}>
        {/* USER EMAIL */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_Mail">Email address:</label>
          <input
            id="Login_Mail"
            className={mailError ? "Login_Input--Error" : null}
            type="email"
            value={mail}
            required
            onChange={(e) => {
              setMail(e.target.value);
            }}
          ></input>
          <p>{mailError ? errorMessage : ""}</p>
        </div>
        {/* UNIQUE USER ID */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_UserId">User Id:</label>
          <input
            id="Login_UserId"
            className={userIdError ? "Login_Input--Error" : null}
            type="text"
            value={userId}
            required
            onChange={(e) => {
              setUserId(e.target.value);
            }}
          ></input>
          <p>{userIdError ? errorMessage : ""}</p>
        </div>
        {/* DISPLAY NAME OF THE USER IN THE APP */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_Username">Username:</label>
          <input
            id="Login_Username"
            type="text"
            value={username}
            required
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          ></input>
        </div>
        {/* USER PASSWORD FOR AUTHENTICATION */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_Password">Password:</label>
          <input
            id="Login_Password"
            className={passwordError ? "Login_Input--Error" : null}
            type="password"
            value={password}
            required
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          ></input>
        </div>
        {/* CONFIRM USER PASSWORD */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_Confirm_Password">Confirm password:</label>
          <input
            id="Login_Confirm_Password"
            className={passwordError ? "Login_Input--Error" : null}
            type="password"
            value={confirmPassword}
            required
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
          ></input>
          <p>{passwordError ? errorMessage : ""}</p>
        </div>
        {/* REGISTRATION FORM SUBMIT BUTTON */}
        <button type="submit">Sign up</button>
      </form>
    </div>
  );
}

export default Register;
