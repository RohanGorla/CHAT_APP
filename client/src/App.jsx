import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io(`${import.meta.env.VITE_SERVER_URL}`);

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  socket.on("allChat", (paylod) => {
    console.log(paylod);
  });

  return (
    <div className="Chat_App">
      <div className="Chat_App--Container">
        <section className="Chat_App--Header">
          <h1>Chit-Chat</h1>
        </section>
        <section className="Chat_App--Chats"></section>
      </div>
    </div>
  );
}

export default App;
