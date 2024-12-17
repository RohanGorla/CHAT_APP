import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./Styles/Friends.css";
import "./Styles/Chats.css";
import "./Styles/Login.css";

function App() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));

  useEffect(() => {
    /* NAVIGTE TO LOGIN PAGE IF NOT LOGGED IN OR CHATS PAGE IF LOGGED IN */
    if (!userData) return navigate("/login");
    navigate("/user/friends");
  }, []);

  return <>APP</>;
}

export default App;
