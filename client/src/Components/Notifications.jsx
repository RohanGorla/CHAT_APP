import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IoMdPerson } from "react-icons/io";
import { SiTicktick } from "react-icons/si";
import { GiCancel } from "react-icons/gi";
import axios from "axios";

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

  /* REJECT FRIEND REQUEST SOCKET METHOD */
  async function declineRequest(request) {
    socket.emit("reject_request", request);
  }

  /* DELETE REJECTED FRIEND REQUEST SOCKET METHOD */
  async function deleteRequest(request) {
    socket.emit("delete_request", request);
  }

  /* RESEND REJECTED FRIEND REQUEST SOCKET METHOD */
  async function resendRequest(request) {
    socket.emit("send_request", {
      from: userData,
      to: request.to,
      type: "Request",
    });
  }

  /* GET PROFILE PICTURE GET URL FUNCTION */
  async function generateGetUrl(key) {
    const generateGetUrlResponse = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/generategeturl`,
      {
        key,
      }
    );
    return generateGetUrlResponse.data.url;
  }

  /* REVERSE THE NOTIFICATIONS LIST TO SHOW NEW NOTIFICATIONS ON TOP */
  useEffect(() => {
    if (!userData) {
      navigate("/login");
    } else {
      const validNotifications = notifications.filter(
        (notification) =>
          !(
            notification.to.usr_id === userData.userId &&
            notification.type === "Reject"
          )
      );
      const reverseNotificationList = validNotifications.toReversed();
      async function getImageUrls() {
        for (let i = 0; i < reverseNotificationList.length; i++) {
          if (
            reverseNotificationList[i].to.usr_id === userData.userId &&
            reverseNotificationList[i].from.imageTag
          )
            reverseNotificationList[i].imageUrl = await generateGetUrl(
              reverseNotificationList[i].from.imageTag
            );
          if (
            reverseNotificationList[i].from.userId === userData.userId &&
            reverseNotificationList[i].to.imageTag
          )
            reverseNotificationList[i].imageUrl = await generateGetUrl(
              reverseNotificationList[i].to.imageTag
            );
        }
        setReversedNotifications(reverseNotificationList);
      }
      getImageUrls();
    }
  }, [notifications]);

  return (
    <div className="Notifications_Page">
      <p className="Notifications--Title">NOTIFICATIONS</p>
      <div className="Notifications_Container">
        {reversedNotifications.length ? (
          reversedNotifications.map((notification, index) => {
            return (
              <div
                key={index}
                className={
                  notification.to.usr_id === userData.userId &&
                  notification.type === "Reject"
                    ? "Notifications_Card--Inactive"
                    : "Notifications_Card"
                }
              >
                <div className="Notifications_Card--Image_Container">
                  <div className="Notifications_Card--Image_Icon_Container">
                    {notification.imageUrl ? (
                      <div className="Notifications_Card--Image_Frame">
                        <img src={notification.imageUrl}></img>
                      </div>
                    ) : (
                      <IoMdPerson className="Notifications_Card--Image_Icon" />
                    )}
                  </div>
                </div>
                {/* NOTIFICATION DETAILS (SHOWN WHEN YOU RECEIVE A REQUEST) */}
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
                {/* NOTIFICATION SENT/REJECTED (SHOWN WHEN YOU SEND A REQUEST) */}
                <div
                  className={
                    notification.from.userId === userData.userId
                      ? "Notifications_Card--Sent"
                      : "Notifications_Card--Sent--Inactive"
                  }
                >
                  <div className="Notifications_Card--Sent--Details">
                    <p className="Notifications_Card--Sent--Message">
                      {notification.type === "Request"
                        ? `Fren request sent to ${notification.to.usr_nm}.`
                        : notification.type === "Reject"
                        ? `Fren request rejected by ${notification.to.usr_nm}.`
                        : null}
                    </p>
                    {/* WHEN REQUEST IS SENT */}
                    <SiTicktick
                      className={
                        notification.type === "Request"
                          ? "Notifications_Card--Sent--Icon"
                          : "Notifications_Card--Sent--Icon--Inactive"
                      }
                    />
                    {/* SHOWN WHEN REQUEST IS REJECTED */}
                    <GiCancel
                      className={
                        notification.type === "Reject"
                          ? "Notifications_Card--Reject--Icon"
                          : "Notifications_Card--Reject--Icon--Inactive"
                      }
                    />
                  </div>
                  <div
                    className={
                      notification.type === "Reject"
                        ? "Notifications_Card--Reject--Options"
                        : "Notifications_Card--Reject--Options--Inactive"
                    }
                  >
                    <button
                      className="Notifications_Card--Reject--Options--Ok"
                      onClick={() => deleteRequest(notification)}
                    >
                      Ok
                    </button>
                    <button
                      className="Notifications_Card--Reject--Options--Resend"
                      onClick={() => resendRequest(notification)}
                    >
                      Re-send
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
