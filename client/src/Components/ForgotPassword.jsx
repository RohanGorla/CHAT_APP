import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import axios from "axios";
import logoUrl from "../assets/Logo";

function ForgotPassword() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  /* STATE VARIABLES */
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mailError, setMailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  /* FUNCTION TO RESET USER PASSWORD */
  async function resetPassword(e) {
    e.preventDefault();
    setSubmitted(true);
    /* CHECK IF PASSWORDS MATCH */
    if (password !== confirmPassword) {
      setMailError(false);
      setPasswordError(true);
      setSubmitted(false);
      setErrorMessage("Passwords donot match!");
      return;
    }
    setPasswordError(false);
    /* RESET PASSWORD AXIOS REQUEST */
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/resetpassword`,
      {
        mail,
        password,
      }
    );
    /* IF EMAIL NOT LINKED TO ANY ACCOUNT */
    if (!response.data.access) {
      switch (response.data.errorCode) {
        case "mail":
          setMailError(true);
          break;

        case "pass":
          setPasswordError(true);
          setPassword("");
          setConfirmPassword("");
          break;
      }
      setErrorMessage(response.data.errorMsg);
      setSubmitted(false);
      return;
    }
    /* NAVIGATE BACK TO LOGIN PAGE AFTER SUCCESSFUL PASSWORD RESET */
    setMailError(false);
    setPasswordError(false);
    setErrorMessage("");
    navigate("/login");
  }

  return (
    <div className="Login_Page">
      {/* APP LOGO AND RESET PASSWORD MESSAGE */}
      <div className="Login_Page--Logo_And_Message">
        <img
          className="Login_Page--App_Logo"
          src={`data:image/png;base64,${logoUrl}`}
        ></img>
        <p className="Login_Page--Message">Set a new password!</p>
      </div>
      {/* PASSWORD RESET FORM */}
      <form className="Login_Page--Form" onSubmit={resetPassword}>
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
        {/* NEW PASSWORD */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_Password">New password:</label>
          <div className="Login_Password--Input_Container">
            <input
              id="Login_Password"
              className={passwordError ? "Login_Input--Error" : ""}
              type={showPassword ? "text" : "password"}
              value={password}
              required
              placeholder="Enter new password"
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
        </div>
        {/* CONFIRM NEW PASSWORD */}
        <div className="Login_Form--Field">
          <label htmlFor="Login_Confirm_Password">Confirm new password:</label>
          <div className="Login_Password--Input_Container">
            <input
              id="Login_Confirm_Password"
              className={passwordError ? "Login_Input--Error" : ""}
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              required
              placeholder="Confirm new password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></input>
            <AiFillEye
              className={
                showConfirmPassword ? "Login_Password--Show" : "Inactive"
              }
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
            <AiFillEyeInvisible
              className={
                showConfirmPassword ? "Inactive" : "Login_Password--Show"
              }
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>
          <p>{passwordError ? errorMessage : ""}</p>
        </div>
        {/* LOGIN BUTTON */}
        <button type="submit" disabled={submitted}>
          Done
        </button>
        {/* NAVIGATE TO REGISTER PAGE */}
        <p className="Login--Toggle">
          Remembered your password?{" "}
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
      {/* APP INFO */}
      <div className="Login_Page--App_Info">
        <div className="Login_Page--App_Info--Logo_And_Name">
          <img
            className="Login_Page--App_Info--Logo"
            src={`data:image/png;base64,${logoUrl}`}
          ></img>
          <p className="Login_Page--App_Info--Name">Frens - online messenger</p>
        </div>
        <p className="Login_Page--App_Info--CreatedBy">
          Created by - Rohan Gorla
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
