import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import axios from "axios";

function Login() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  /* STATE VARIABLES */
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          setPassword("");
          break;
      }
      setErrorMessage(response.data.errorMsg);
      return;
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
            className={mailError ? "Login_Input--Error" : null}
            type="email"
            value={mail}
            required
            placeholder="Enter your email"
            onChange={(e) => {
              setMail(e.target.value);
            }}
          ></input>
          <p>{mailError ? errorMessage : ""}</p>
        </div>
        <div className="Login_Form--Field">
          <label htmlFor="Login_Password">Password:</label>
          <div className="Login_Password--Input_Container">
            <input
              id="Login_Password"
              className={passwordError ? "Login_Input--Error" : null}
              type={showPassword ? "text" : "password"}
              value={password}
              required
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            ></input>
            <AiFillEye
              className={
                showPassword
                  ? "Login_Password--Show"
                  : "Login_Password--Show--Inactive"
              }
              onClick={() => setShowPassword(!showPassword)}
            />
            <AiFillEyeInvisible
              className={
                showPassword
                  ? "Login_Password--Show--Inactive"
                  : "Login_Password--Show"
              }
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
          <p>{passwordError ? errorMessage : ""}</p>
        </div>
        <button type="submit">Login</button>
        <p className="Login--Toggle">
          New user?{" "}
          <span
            onClick={(e) => {
              e.preventDefault();
              navigate("/register");
            }}
          >
            Create new account!
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
