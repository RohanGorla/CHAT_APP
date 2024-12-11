import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function App() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));

  useEffect(() => {
    /* NAVIGTE TO LOGIN PAGE IF NOT LOGGED IN OR CHATS PAGE IF LOGGED IN */
    if (!userData) return navigate("/login");
    navigate("/chats");
  }, []);

  return <>APP</>;
}

export default App;
