import React, { useState, useEffect } from "react";
import "../Styles/Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="Login_Page">
      <form className="Login_Page--Form">
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
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            // localStorage.setItem("chitchat_username", username);
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default Login;
