import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  /* REGISTER A NEW USER API */
  async function registerUser(e) {
    e.preventDefault();
    if (password === confirmPassword) {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/registeruser`,
        {
          mail,
          userId,
          username,
          password,
        }
      );
      if (response.data.access) {
        navigate("/");
      }
    }
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
            type="email"
            value={mail}
            required
            onChange={(e) => {
              setMail(e.target.value);
            }}
          ></input>
        </div>
        {/* UNIQUE USER ID */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_UserId">User Id:</label>
          <input
            id="Login_UserId"
            type="text"
            value={userId}
            required
            onChange={(e) => {
              setUserId(e.target.value);
            }}
          ></input>
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
            type="password"
            value={confirmPassword}
            required
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
          ></input>
        </div>
        {/* REGISTRATION FORM SUBMIT BUTTON */}
        <button type="submit">Sign up</button>
      </form>
    </div>
  );
}

export default Register;
