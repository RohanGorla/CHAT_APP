import React, { useState } from "react";

function Register() {
  const [mail, setMail] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="Login_Page">
      <form className="Login_Page--Form">
        <div className="Login_Form--Field">
          <label htmlFor="Login_Mail">Email address:</label>
          <input
            id="Login_Mail"
            type="email"
            value={mail}
            onChange={(e) => {
              setMail(e.target.value);
            }}
          ></input>
        </div>
        <div className="Login_Form--Field">
          <label htmlFor="Login_UserId">User Id:</label>
          <input
            id="Login_UserId"
            type="text"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
            }}
          ></input>
        </div>
        <div className="Login_Form--Field">
          <label htmlFor="Login_Username">Username:</label>
          <input
            id="Login_Username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          ></input>
        </div>
        <div className="Login_Form--Field">
          <label htmlFor="Login_Password">Password:</label>
          <input
            id="Login_Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          ></input>
        </div>
        <div className="Login_Form--Field">
          <label htmlFor="Login_Confirm_Password">Confirm password:</label>
          <input
            id="Login_Confirm_Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
          ></input>
        </div>
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          Sign up
        </button>
      </form>
    </div>
  );
}

export default Register;
