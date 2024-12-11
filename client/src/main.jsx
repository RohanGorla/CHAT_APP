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
import Chats from "./Components/Chats.jsx";
import Notifications from "./Components/Notifications.jsx";
import FindFriends from "./Components/FindFriends.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/">
        <Route path="" element={<App />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="user" element={<User />}>
          <Route path="chats" element={<Chats />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="findfriends" element={<FindFriends />} />
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
