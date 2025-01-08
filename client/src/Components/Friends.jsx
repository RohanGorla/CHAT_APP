import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FriendsList from "./FriendsList";

function Friends() {
  /* SPECIAL VARIABLES */
  const userData = JSON?.parse(localStorage?.getItem("ChatApp_UserInfo"));
  const navigate = useNavigate();

  useEffect(() => {
    /* NAVIGATE TO LOGIN PAGE IF USER IS NOT LOGGED IN */
    if (!userData) navigate("/login");
  }, []);

  return (
    <div className="Friends_Page">
      {/* USER'S FRIENDS LIST */}
      <section className="Friends_List_Container">
        <FriendsList />
      </section>
      {/* USER GREETING CARD */}
      <section className="Friends_Chat">
        <article className="Friends_Welcome_Card">
          <p className="Friends_Welcome_Card--Title">
            Hey there, {userData.username}👋
          </p>
          <p className="Friends_Welcome_Card--Greeting">
            Conversations aren't just for extroverts. Select a fren and prove to
            the world (or just yourself) that you're a great conversationalist.
          </p>
        </article>
      </section>
    </div>
  );
}

export default Friends;
