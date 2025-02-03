import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import FriendsList from "./FriendsList";
import greetings from "../assets/Greetings";

function Friends() {
  /* SPECIAL VARIABLES */
  const userData = JSON?.parse(localStorage?.getItem("ChatApp_UserInfo"));
  const navigate = useNavigate();
  const { rooms } = useOutletContext();
  /* STATE VARIABLES */
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    /* NAVIGATE TO LOGIN PAGE IF USER IS NOT LOGGED IN */
    if (!userData) navigate("/login");
    else {
      /* SET A RANDOM GREETING FOR THE USER */
      setGreeting(
        rooms.length
          ? greetings.hasFriends[
              Math.floor(Math.random() * greetings.hasFriends.length)
            ]
          : greetings.noFriends[
              Math.floor(Math.random() * greetings.noFriends.length)
            ]
      );
    }
  }, [rooms]);

  return (
    <div className="Friends_Page">
      {/* USER'S FRIENDS LIST */}
      <section className="Friends_List_Container">
        <FriendsList />
      </section>
      {/* USER GREETING CARD (ONLY VISIBLE IN MEDIUM AND LARGE SCREENS) */}
      <section className="Friends_Chat">
        <article className="Friends_Welcome_Card">
          <p className="Friends_Welcome_Card--Title">
            Hey there, {userData?.username}👋
          </p>
          <p className="Friends_Welcome_Card--Greeting">{greeting}</p>
        </article>
      </section>
    </div>
  );
}

export default Friends;
