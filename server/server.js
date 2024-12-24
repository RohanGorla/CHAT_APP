import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import { createServer } from "http";
import { Server } from "socket.io";
import { MongoClient, ObjectId } from "mongodb";
import { access } from "fs";
import { error } from "console";

const PORT = process.env.PORT;

/* CREATING AN EXPRESS SERVER FOR API REQUEST HANDLING */
const app = express();
app.use(cors());
app.use(express.json());

/* CREATING A WEB SOCKET SERVER */
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/* CREATING AND CONNECTING TO MONGODB CLIENT */
const client = new MongoClient(process.env.DB_URL);
client
  .connect()
  .then(() => console.log("Mongodb connected..."))
  .catch((err) => console.log(err));

const db = client.db(process.env.DB_NAME);
const userInfoCollection = db.collection("ChatApp_UserInfo");
const roomsCollection = db.collection("ChatApp_Rooms");
const chatMessagesCollection = db.collection("ChatApp_Chats");
const notificationsCollection = db.collection("ChatApp_Notifications");

/* BASIC SERVER ROUTE TO ENSURE CONNECTION IN POSTMAN */
app.get("/", (req, res) => {
  res.json("Connected...");
});

/* USER LOGIN AUTHENTICATION */
app.post("/checkuser", async (req, res) => {
  /* CHECK IF THE EMAIL IS LINKED TO ANY EXISTING ACCOUNTS */
  const emailRecords = await userInfoCollection
    .find({
      email: req.body.mail,
    })
    .toArray();
  if (!emailRecords.length)
    return res.send({
      access: false,
      errorMsg: "No account linked with this email address!",
      errorCode: "mail",
    });

  /* CHECK IF THE PASSWORD ENTERED IS CORRECT */
  const actual_password = emailRecords[0].pass;
  const entered_password = req.body.password;
  const passwordCheck = await bcrypt.compare(entered_password, actual_password);
  if (!passwordCheck)
    return res.send({
      access: false,
      errorMsg: "Password incorrect. Please try again!",
      errorCode: "pass",
    });

  /* IF ALL CREDENTIALS MATCH SEND THE USER DATA */
  const userData = {
    mail: emailRecords[0].email,
    userId: emailRecords[0].usr_id,
    username: emailRecords[0].usr_nm,
  };
  return res.send({ access: true, userData });
});

/* REGISTER A NEW USER SERVER ROUTE */
app.post("/registeruser", async (req, res) => {
  /* CHECK IF THE EMAIL IS LINKED TO ANY EXISTING ACCOUNTS */
  const checkMailExists = await userInfoCollection
    .find({
      email: req.body.mail,
    })
    .toArray();
  if (checkMailExists.length)
    return res.send({
      access: false,
      errorMsg: "Email is already linked to an account!",
      errorCode: "mail",
    });

  /* CHECK IF THE USER ID IS ALREADY TAKEN */
  const checkUserIdExists = await userInfoCollection
    .find({
      usr_id: req.body.userId,
    })
    .toArray();
  if (checkUserIdExists.length)
    return res.send({
      access: false,
      errorMsg: "User id is already taken!",
      errorCode: "id",
    });

  /* CREATE A HASHED PASSWORD */
  const password = await bcrypt.hash(req.body.password, 10);

  /* CREATE A NEW USER RECORD AND STORE IT IN THE MONGODB COLLECTION */
  const newUser = {
    email: req.body.mail,
    pass: password,
    usr_nm: req.body.username,
    usr_id: req.body.userId,
    rooms: [],
  };
  const response = await userInfoCollection.insertOne(newUser);
  if (response.acknowledged) {
    return res.send({
      access: true,
      userData: {
        mail: req.body.mail,
        userId: req.body.userId,
        username: req.body.username,
      },
    });
  }
});

/* FIND USER */
app.post("/finduser", async (req, res) => {
  const searchString = req.body.user;
  const users = await userInfoCollection
    .find(
      {
        $or: [
          { usr_id: { $regex: `^${searchString}`, $options: "i" } },
          { usr_nm: { $regex: `^${searchString}`, $options: "i" } },
        ],
      },
      {
        projection: { usr_nm: 1, usr_id: 1, email: 1 },
      }
    )
    .toArray();
  res.send(users);
});

/* WEB SOCKET CONNECTION AND EVENTS */
io.on("connection", async (socket) => {
  // console.log("Socket connection made...", socket.id);
  /* SEND BACK SUCCESSFUL SOCKET CONNECTION MESSAGE */
  socket.emit("socket_connect", "Connection has been made!");
  /* JOIN PERSONAL ROOM TO GET LIVE CHATS AND NOTIFICATIONS */
  socket.on("get_user_data", async (payload) => {
    const personalRoomId = payload.room;
    socket.join(personalRoomId);
    /* GET USER DATA */
    const userData = await userInfoCollection.findOne({
      usr_id: personalRoomId,
    });
    /* GET ROOMS DATA THE USER IS INCLUDED IN AND JOIN THEM TO SEND AND RECEIVE MESSAGES */
    const rooms = await roomsCollection
      .find({
        roomId: { $in: userData.rooms },
      })
      .toArray();
    rooms.forEach((room) => socket.join(room.roomId));
    /* GET USER FRIENDS LIST */
    const friends = await userInfoCollection
      .find(
        {
          rooms: { $in: userData.rooms },
          usr_id: { $ne: personalRoomId },
        },
        {
          projection: { usr_nm: 1, usr_id: 1, _id: 0 },
        }
      )
      .toArray();
    /* GET USER CHAT MESSAGES */
    const chats = await chatMessagesCollection
      .find({
        room: { $in: userData.rooms },
      })
      .toArray();
    /* GET USER NOTIFICATIONS */
    const notifications = await notificationsCollection
      .find({
        "to.usr_id": personalRoomId,
      })
      .toArray();
    socket.emit("user_data", { rooms, friends, chats, notifications });
  });
  /* HANDLE INCOMING MESSAGES */
  socket.on("send_message", async (payload) => {
    await chatMessagesCollection.insertOne({
      usr_nm: payload.userData.username,
      usr_id: payload.userData.userId,
      msg: payload.message,
      room: payload.id,
      time: payload.time,
    });
    io.to(payload.id).emit("receive_message", payload);
  });
  /* SEND FRIEND REQUESTS TO USERS */
  socket.on("send_request", async (payload) => {
    const record = { from: payload.from, to: payload.to, type: "Request" };
    const response = await notificationsCollection.insertOne(record);
    socket.to(payload.to.usr_id).emit("friend_request", record);
  });
  /* ACCEPT FRIEND REQUESTS */
  socket.on("accept_request", async (payload) => {
    const roomId = v4();
    const response = await userInfoCollection.updateMany(
      { usr_id: { $in: [payload.to.usr_id, payload.from.userId] } },
      { $push: { rooms: roomId } }
    );
    const roomRecord = {
      roomId: roomId,
      users: [payload.to.usr_id, payload.from.userId],
      type: "single",
    };
    const roomsResponse = await roomsCollection.insertOne(roomRecord);
    io.to(payload.to.usr_id).emit("join_room", { roomId });
    io.to(payload.from.userId).emit("join_room", { roomId });
    const id = new ObjectId(payload._id);
    const deleteResponse = await notificationsCollection.deleteOne({
      _id: id,
    });
  });
  /* REJECT FRIEND REQUESTS */
  socket.on("reject_request", async (payload) => {
    io.to(payload.to.usr_id).emit("request_rejected");
    io.to(payload.from.userId).emit("request_rejected");
    const id = new ObjectId(payload._id);
    const deleteResponse = await notificationsCollection.deleteOne({
      _id: id,
    });
  });
  /* JOIN ROOMS */
  socket.on("join_room", async (payload) => {
    socket.join(payload.roomId);
    socket.emit("join_room_success");
  });
});

server.listen(PORT, () => console.log(`Listening at port ${PORT}`));
