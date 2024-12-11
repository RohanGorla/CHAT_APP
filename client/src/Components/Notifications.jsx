import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Notifications() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");

  async function finduser() {}

  return (
    <div>
      <input
        type="text"
        value={user}
        onChange={(e) => {
          setUser(e.target.value);
        }}
      ></input>
      <button onClick={finduser}>Find</button>
    </div>
  );
}

export default Notifications;
