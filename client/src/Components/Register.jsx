import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [mailError, setMailError] = useState(false);
  const [userIdError, setUserIdError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  /* REGISTER A NEW USER API */
  async function registerUser(e) {
    e.preventDefault();
    setSubmitted(true);
    /* CHECK IF PASSWORD AND CONFIRM PASSWORD MATCH */
    if (password !== confirmPassword) {
      setMailError(false);
      setUserIdError(false);
      setPasswordError(true);
      setSubmitted(false);
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
      setSubmitted(false);
      return;
    }
    /* REGISTER SUCCESS */
    setMailError(false);
    setUserIdError(false);
    const userData = JSON.stringify(response.data.userData);
    localStorage.setItem("ChatApp_UserInfo", userData);
    navigate("/");
  }

  return (
    <div className="Login_Page">
      {/* WELCOME MESSAGE */}
      <p className="Login_Page--Welcome_Message">Welcome to frens!</p>
      {/* USER REGISTER FORM */}
      <form className="Login_Page--Form" onSubmit={registerUser}>
        {/* USER EMAIL */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_Mail">Email address:</label>
          <input
            id="Login_Mail"
            className={mailError ? "Login_Input--Error" : ""}
            type="email"
            value={mail}
            required
            placeholder="Enter your email"
            onChange={(e) => setMail(e.target.value)}
          ></input>
          <p>{mailError ? errorMessage : ""}</p>
        </div>
        {/* UNIQUE USER ID */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_UserId">User Id:</label>
          <input
            id="Login_UserId"
            className={userIdError ? "Login_Input--Error" : ""}
            type="text"
            value={userId}
            required
            placeholder="Enter a unique user id"
            onChange={(e) => setUserId(e.target.value)}
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
            placeholder="Enter your username"
            onChange={(e) => setUsername(e.target.value)}
          ></input>
        </div>
        {/* USER PASSWORD FOR AUTHENTICATION */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_Password">Password:</label>
          <div className="Login_Password--Input_Container">
            <input
              id="Login_Password"
              className={passwordError ? "Login_Input--Error" : ""}
              type={showPassword ? "text" : "password"}
              value={password}
              required
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
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
        </div>
        {/* CONFIRM USER PASSWORD */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_Confirm_Password">Confirm password:</label>
          <div className="Login_Password--Input_Container">
            <input
              id="Login_Confirm_Password"
              className={passwordError ? "Login_Input--Error" : ""}
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              required
              placeholder="Confirm your password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></input>
            <AiFillEye
              className={
                showConfirmPassword
                  ? "Login_Password--Show"
                  : "Login_Password--Show--Inactive"
              }
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
            <AiFillEyeInvisible
              className={
                showConfirmPassword
                  ? "Login_Password--Show--Inactive"
                  : "Login_Password--Show"
              }
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>
          <p>{passwordError ? errorMessage : ""}</p>
        </div>
        {/* REGISTRATION FORM SUBMIT BUTTON */}
        <button type="submit" disabled={submitted}>
          Sign up
        </button>
        {/* NAVIGATE TO LOGIN PAGE */}
        <p className="Login--Toggle">
          Already have an account?{" "}
          <span
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
          >
            Login!
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
