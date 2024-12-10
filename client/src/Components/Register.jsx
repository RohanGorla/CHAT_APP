import React, { useState } from "react";

function Register() {
  const [mail, setMail] = useState("");
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    }
  }

  return (
    <div className="Login_Page">
      <form className="Login_Page--Form" onSubmit={registerUser}>
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
        <button type="submit">Sign up</button>
      </form>
    </div>
  );
}

export default Register;
