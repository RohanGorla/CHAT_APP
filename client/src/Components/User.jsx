import React, { useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

function User() {
  const navigate = useNavigate();
  const socket = useMemo(() => io(`${import.meta.env.VITE_SERVER_URL}`), []);
  return (
    <>
      <Outlet context={{ socket }} />
    </>
  );
}

export default User;
