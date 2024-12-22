import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

function Notifications() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const { socket, notifications, setNotifications } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));

  /* ACCEPT FRIEND REQUEST SOCKET METHOD */
  async function acceptRequest(request) {
    socket.emit("accept_request", request);
  }

  async function declineRequest(request) {
    socket.emit("decline_request", request);
  }

  return (
    <div className="Notifications_Page">
      {notifications.map((notification, index) => {
        return (
          <div key={index}>
            <p>{notification.from.username}</p>
            <div>
              <button onClick={() => acceptRequest(notification)}>
                Accept
              </button>
              <button onClick={() => declineRequest(notification)}>
                Decline
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Notifications;
