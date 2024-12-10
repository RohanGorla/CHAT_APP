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
          <label>Email address:</label>
          <input
            type="email"
            value={mail}
            onChange={(e) => {
              setMail(e.target.value);
            }}
          ></input>
        </div>
        <div className="Login_Form--Field">
          <label>User Id:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
            }}
          ></input>
        </div>
        <div className="Login_Form--Field">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          ></input>
        </div>
        <div className="Login_Form--Field">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          ></input>
        </div>
        <div className="Login_Form--Field">
          <label>Confirm password:</label>
          <input
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
