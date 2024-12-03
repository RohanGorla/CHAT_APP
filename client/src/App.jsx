import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { IoMdSend } from "react-icons/io";
import "./App.css";

const socket = io(`${import.meta.env.VITE_SERVER_URL}`);

function App() {
  const [username, setUsername] = useState("");
  const [access, setAccess] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  async function sendMessage(e) {
    e.preventDefault();
    socket.emit("message_input", { username, message });
    setMessage("");
  }

  useEffect(() => {
    socket.on("allChat", (paylod) => {
      setChat(paylod);
    });
  });

  useEffect(() => {
    const name = localStorage.getItem("chitchat_username");
    if (name) {
      setUsername(name);
      setAccess(true);
    }
  }, []);

  return (
    <div className="Chat_App">
      {access ? (
        <div className="Chat_App--Container">
          <section className="Chat_App--Header">
            <h1>Chit-Chat</h1>
          </section>
          <section className="Chat_App--Chats">
            <div className="Chat_App--Chat_Messages">
              {chat.map((message, index) => {
                return (
                  <div
                    key={index}
                    className={
                      username === message.name
                        ? "Chat_App--Chat_Message Chat_App--Chat_Message--Others"
                        : "Chat_App--Chat_Message Chat_App--Chat_Message--Own"
                    }
                  >
                    <p>{message.name}</p>
                    <p>{message.msg}</p>
                  </div>
                );
              })}
            </div>
          </section>
          <section className="Chat_App--Type_Message">
            <form
              onSubmit={sendMessage}
              className="Chat_App--Type_Message--Form"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
              ></input>
              <button type="submit">
                <IoMdSend size={25} />
              </button>
            </form>
          </section>
        </div>
      ) : (
        <div className="Chat_App--EnterName">
          <div className="Chat_App--EnterName_Form">
            <p>Enter your name</p>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
            ></input>
            <button
              onClick={() => {
                localStorage.setItem("chitchat_username", username);
                setAccess(true);
              }}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
