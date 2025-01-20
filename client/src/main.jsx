import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Login from "./Components/Login.jsx";
import Register from "./Components/Register.jsx";
import User from "./Components/User.jsx";
import Friends from "./Components/Friends.jsx";
import CreateGroup from "./Components/CreateGroup.jsx";
import Chats from "./Components/Chats.jsx";
import Notifications from "./Components/Notifications.jsx";
import FindFriends from "./Components/FindFriends.jsx";
import Profile from "./Components/Profile.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/">
        <Route path="" element={<App />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="user" element={<User />}>
          <Route path="friends" element={<Friends />} />
          <Route path="creategroup" element={<CreateGroup />} />
          <Route path="chats/:id" element={<Chats />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="findfriends" element={<FindFriends />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
