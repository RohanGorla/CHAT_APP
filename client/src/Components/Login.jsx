import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/Login.css";

function Login() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  /* STATE VARIABLES */
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [mailError, setMailError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  /* CHECK USER CREDENTIALS API */
  async function checkUser(e) {
    e.preventDefault();
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/checkuser`,
      {
        mail,
        password,
      }
    );
    /* LOGIN FAIL */
    if (!response.data.access) {
      switch (response.data.errorCode) {
        case "mail":
          setMailError(true);
          setPasswordError(false);
          break;
        case "pass":
          setPasswordError(true);
          setMailError(false);
          break;
      }
      setErrorMessage(response.data.errorMsg);
    }
    /* LOGIN SUCCESS */
    setMailError(false);
    setPasswordError(false);
    setErrorMessage("");
    const userData = JSON.stringify(response.data.userData);
    localStorage.setItem("ChatApp_UserInfo", userData);
    navigate("/");
  }

  return (
    <div className="Login_Page">
      <form className="Login_Page--Form" onSubmit={checkUser}>
        <div className="Login_Form--Field">
          <label htmlFor="Login_Usermail">Email:</label>
          <input
            id="Login_Usermail"
            type="email"
            value={mail}
            required
            onChange={(e) => {
              setMail(e.target.value);
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Login;
