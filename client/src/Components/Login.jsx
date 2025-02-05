import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import axios from "axios";
import logoUrl from "../assets/Logo";

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
  const [submitted, setSubmitted] = useState(false);

  /* CHECK USER CREDENTIALS API */
  async function checkUser(e) {
    e.preventDefault();
    setSubmitted(true);
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
      setSubmitted(false);
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
      {/* APP LOGO AND WELCOME MESSAGE */}
      <div className="Login_Page--Logo_And_Message">
        <img
          className="Login_Page--App_Logo"
          src={`data:image/png;base64,${logoUrl}`}
        ></img>
        <p className="Login_Page--Welcome_Message">Welcome, please login!</p>
      </div>
      {/* LOGIN FORM */}
      <form className="Login_Page--Form" onSubmit={checkUser}>
        {/* LOGIN EMAIL */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_Usermail">Email:</label>
          <input
            id="Login_Usermail"
            className={mailError ? "Login_Input--Error" : null}
            type="email"
            value={mail}
            required
            placeholder="Enter your email"
            onChange={(e) => setMail(e.target.value)}
          ></input>
          <p>{mailError ? errorMessage : ""}</p>
        </div>
        {/* LOGIN PASSWORD */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_Password">Password:</label>
          <div className="Login_Password--Input_Container">
            <input
              id="Login_Password"
              className={passwordError ? "Login_Input--Error" : null}
              type={showPassword ? "text" : "password"}
              value={password}
              required
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
            ></input>
            <AiFillEye
              className={showPassword ? "Login_Password--Show" : "Inactive"}
              onClick={() => setShowPassword(!showPassword)}
            />
            <AiFillEyeInvisible
              className={showPassword ? "Inactive" : "Login_Password--Show"}
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
          <p>{passwordError ? errorMessage : ""}</p>
        </div>
        {/* LOGIN BUTTON */}
        <button type="submit" disabled={submitted}>
          Login
        </button>
        {/* NAVIGATE TO REGISTER PAGE */}
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
