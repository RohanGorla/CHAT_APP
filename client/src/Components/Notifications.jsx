import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";
import { SiTicktick } from "react-icons/si";

function Notifications() {
  /* SPECIAL VARIABLES */
  const navigate = useNavigate();
  const { socket, notifications } = useOutletContext();
  const userData = JSON.parse(localStorage.getItem("ChatApp_UserInfo"));
  /* STATE VARIABLES */
  const [reversedNotifications, setReversedNotifications] = useState([]);

  /* ACCEPT FRIEND REQUEST SOCKET METHOD */
  async function acceptRequest(request) {
    socket.emit("accept_request", request);
  }

  async function declineRequest(request) {
    socket.emit("reject_request", request);
  }

  useEffect(() => {
    const reverseNotificationList = notifications.toReversed();
    setReversedNotifications(reverseNotificationList);
  }, [notifications]);

  return (
    <div className="Notifications_Page">
      <p className="Notifications--Title">NOTIFICATIONS</p>
      <div className="Notifications_Container">
        {reversedNotifications.length ? (
          reversedNotifications.map((notification, index) => {
            return (
              <div key={index} className="Notifications_Card">
                <div className="Notifications_Card--Image_Container">
                  <div className="Notifications_Card--Image_Icon_Container">
                    <IoMdPerson className="Notifications_Card--Image_Icon" />
                  </div>
                </div>
                <div
                  className={
                    notification.from.userId === userData.userId
                      ? "Notifications_Card--User_Details--Inactive"
                      : "Notifications_Card--User_Details"
                  }
                >
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
                <div
                  className={
                    notification.from.userId === userData.userId
                      ? "Notifications_Card--Sent"
                      : "Notifications_Card--Sent--Inactive"
                  }
                >
                  <p className="Notifications_Card--Sent--Message">
                    Fren request sent to {notification.to.usr_nm}.
                  </p>
                  <SiTicktick className="Notifications_Card--Sent--Icon" />
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
