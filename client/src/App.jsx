import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io(`${import.meta.env.VITE_SERVER_URL}`);

function App() {
  return <></>;
}

export default App;
