import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";

function Notifications() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const { socket, notifications } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));

  /* ACCEPT FRIEND REQUEST SOCKET METHOD */
  async function acceptRequest(request) {
    socket.emit("accept_request", request);
  }

  async function declineRequest(request) {
    socket.emit("reject_request", request);
  }

  return (
    <div className="Notifications_Page">
      <p className="Notifications--Title">NOTIFICATIONS</p>
      <div className="Notifications_Container">
        {notifications.length ? (
          notifications.map((notification, index) => {
            return (
              <div key={index} className="Notifications_Card">
                <div className="Notifications_Card--Image_Container">
                  <div className="Notifications_Card--Image_Icon_Container">
                    <IoMdPerson className="Notifications_Card--Image_Icon" />
                  </div>
                </div>
                <div className="Notifications_Card--User_Details">
                  <p className="Notifications_Card--Username">
                    {notification.from.username}
                  </p>
                  <p className="Notifications_Card--Userid">
                    {notification.from.userId}
                  </p>
                  <div className="Notifications_Card--Buttons">
                    <button
                      className="Notifications_Card--Buttons--Accept"
                      onClick={() => acceptRequest(notification)}
                    >
                      Accept
                    </button>
                    <button
                      className="Notifications_Card--Buttons--Reject"
                      onClick={() => declineRequest(notification)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="Notifications_Empty">
            <p className="Notifications_Empty--Message">
              When you receive any fren requests, they will be shown here!.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Notifications;
