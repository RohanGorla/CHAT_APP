import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { IoMdSend } from "react-icons/io";
import "./App.css";

const socket = io(`${import.meta.env.VITE_SERVER_URL}`);

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  async function sendMessage(e) {
    e.preventDefault();
    socket.emit("message_input", { message });
  }

  useEffect(() => {
    socket.on("allChat", (paylod) => {
      setChat(paylod);
    });
  });

  return (
    <div className="Chat_App">
      <div className="Chat_App--Container">
        <section className="Chat_App--Header">
          <h1>Chit-Chat</h1>
        </section>
        <section className="Chat_App--Chats">
          <div className="Chat_App--Chat_Messages">
            {chat.map((message, index) => {
              return (
                <div key={index} className="Chat_App--Chat_Message">
                  <p>{message.name}</p>
                  <p>{message.msg}</p>
                </div>
              );
            })}
          </div>
        </section>
        <section className="Chat_App--Type_Message">
          <form onSubmit={sendMessage}>
            <input
              type="text"
              className="Chat_App--Message_Input"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
            ></input>
            <button type="submit">
              <IoMdSend />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default App;
