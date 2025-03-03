import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import { createServer } from "http";
import { Server } from "socket.io";
import { MongoClient, ObjectId } from "mongodb";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

/* CONNECTING TO AWS S3 BUCKET */
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;

const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

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
  if (emailRecords[0].imageTag) userData.imageTag = emailRecords[0].imageTag;
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

/* PASSWORD RESET SERVER ROUTE */
app.post("/resetpassword", async (req, res) => {
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

  const passwordCheck = await bcrypt.compare(
    req.body.password,
    emailRecords[0].pass
  );
  if (passwordCheck)
    return res.send({
      access: false,
      errorMsg: "The new password cannot be the same as your current password!",
      errorCode: "pass",
    });
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const updatePassword = await userInfoCollection.updateOne(
    { email: req.body.mail },
    { $set: { pass: hashedPassword } }
  );
  if (updatePassword.acknowledged) return res.send({ access: true });
  res.send({ access: false });
});

/* GENERATE THE PROFILE PICTURE GET AND PUT SIGNED URLS */
app.post("/generateputurl", async (req, res) => {
  if (req.body.oldKey) {
    const params = {
      Bucket: bucketName,
      Key: req.body.oldKey,
    };
    const command = new DeleteObjectCommand(params);
    const deleteOldPictureResponse = await s3.send(command);
  }
  const key = `ChatApp_ProfilePictures/${req.body.newKey}-${Date.now()}.${
    req.body.contentType.split("/")[1]
  }`;
  const params = {
    Bucket: bucketName,
    Key: key,
    ContentType: req.body.contentType,
  };
  const command = new PutObjectCommand(params);
  const url = await getSignedUrl(s3, command);
  if (url) return res.send({ url, key });
});

app.post("/generategeturl", async (req, res) => {
  const getObjectParams = {
    Bucket: bucketName,
    Key: req.body.key,
  };
  const command = new GetObjectCommand(getObjectParams);
  const url = await getSignedUrl(s3, command, { expiresIn: 86400 });
  res.send({ url });
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
        projection: { _id: 0, rooms: 0, pass: 0 },
      }
    )
    .toArray();
  res.send(users);
});

/* WEB SOCKET CONNECTION AND EVENTS */
io.on("connection", async (socket) => {
  console.log("Socket connection made...", socket.id);
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
          projection: { _id: 0, rooms: 0, pass: 0 },
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
        $or: [
          { "to.usr_id": personalRoomId },
          { "from.userId": personalRoomId },
        ],
      })
      .toArray();
    socket.emit("user_data", { rooms, friends, chats, notifications });
  });
  /* HANDLE INCOMING MESSAGES */
  socket.on("send_message", async (payload) => {
    const messageRecord = {
      usr_nm: payload.usr_nm,
      usr_id: payload.usr_id,
      msg: payload.msg,
      room: payload.room,
      time: payload.time,
      read: payload.read,
      incognito: payload.incognito,
    };
    await chatMessagesCollection.insertOne(messageRecord);
    io.to(payload.room).emit("receive_message", messageRecord);
  });
  /* UPDATE THE MESSAGE READ STATUS */
  socket.on("update_message_read", async ({ id, userData, type }) => {
    if (type === "single")
      await chatMessagesCollection.updateMany(
        { $and: [{ room: id }, { usr_id: { $ne: userData.userId } }] },
        { $set: { read: true } }
      );
    if (type === "group")
      await chatMessagesCollection.updateMany(
        { $and: [{ room: id }, { read: { $ne: userData.userId } }] },
        { $addToSet: { read: userData.userId } }
      );
    io.to(id).emit("message_read_updated", { id, userData, type });
  });
  /* DELETE A MESSAGE FROM A CHAT */
  socket.on("delete_message", async ({ id, room, usr_id }) => {
    const messageId = new ObjectId(id);
    const messageRecord = await chatMessagesCollection.deleteOne({
      _id: messageId,
    });
    if (messageRecord.acknowledged)
      io.to(room).emit("message_deleted", { id, usr_id });
  });
  /* SEND FRIEND REQUESTS TO USERS */
  socket.on("send_request", async (payload) => {
    const deleteResponse = await notificationsCollection.deleteOne({
      $and: [
        { "to.usr_id": payload.to.usr_id },
        { "from.userId": payload.from.userId },
      ],
    });
    const record = {
      from: payload.from,
      to: payload.to,
      type: payload.type,
      seen: false,
    };
    const response = await notificationsCollection.insertOne(record);
    socket.to(payload.to.usr_id).emit("friend_request", record);
    socket.emit("friend_request", record);
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
    const id = new ObjectId(payload._id);
    const deleteResponse = await notificationsCollection.deleteOne({
      _id: id,
    });
    io.to(payload.to.usr_id).emit("join_room", {
      from: payload.from,
      to: payload.to,
      roomId,
    });
    io.to(payload.from.userId).emit("join_room", {
      from: payload.from,
      to: payload.to,
      roomId,
    });
  });
  /* REJECT FRIEND REQUESTS */
  socket.on("reject_request", async (payload) => {
    const id = new ObjectId(payload._id);
    const deleteResponse = await notificationsCollection.deleteOne({
      _id: id,
    });
    const newNotificationRecord = {
      from: payload.from,
      to: payload.to,
      type: "Reject",
      seen: false,
    };
    const rejectNotification = await notificationsCollection.insertOne(
      newNotificationRecord
    );
    io.to(payload.from.userId).emit("request_rejected", {
      oldNotification: payload,
      newNotification: newNotificationRecord,
    });
    io.to(payload.to.usr_id).emit("request_rejected", {
      oldNotification: payload,
      newNotification: newNotificationRecord,
    });
  });
  /* DELETE FRIEND REQUESTS */
  socket.on("delete_request", async (payload) => {
    const id = new ObjectId(payload._id);
    const deleteResponse = await notificationsCollection.deleteOne({
      _id: id,
    });
    io.to(payload.to.usr_id).emit("request_deleted", payload);
    io.to(payload.from.userId).emit("request_deleted", payload);
  });
  /* REMOVE FRIENDS */
  socket.on("remove_friend", async ({ from, to, room }) => {
    const removeFriend = await userInfoCollection.updateMany(
      { usr_id: { $in: [to.usr_id, from.userId] } },
      { $pull: { rooms: { $in: [room.roomId] } } }
    );
    const deleteRoom = await roomsCollection.deleteOne({
      roomId: room.roomId,
    });
    const deleteChat = await chatMessagesCollection.deleteMany({
      room: room.roomId,
    });
    io.to(to.usr_id).emit("remove_friend", { from, to, roomToRemove: room });
    io.to(from.userId).emit("remove_friend", { from, to, roomToRemove: room });
  });
  /* JOIN ROOMS */
  socket.on("join_room", async (payload) => {
    socket.join(payload.roomId);
    socket.emit("join_room_success", payload);
  });
  /* DELETE CHAT */
  socket.on("delete_chat", async ({ from, to, room }) => {
    const deleteChatResponse = await chatMessagesCollection.deleteMany({
      room: room.roomId,
    });
    io.to(room.roomId).emit("chat_deleted", { from, to, room });
  });
  /* CREATE GROUP */
  socket.on("create_group", async ({ groupName, friends, createdBy }) => {
    const roomId = v4();
    const response = await userInfoCollection.updateMany(
      { usr_id: { $in: friends } },
      { $push: { rooms: roomId } }
    );
    const roomRecord = {
      roomId: roomId,
      name: groupName,
      users: friends,
      type: "group",
    };
    const roomsResponse = await roomsCollection.insertOne(roomRecord);
    friends.forEach((friend) =>
      io.to(friend).emit("join_group", { groupName, roomId, createdBy })
    );
  });
  /* JOIN GROUP */
  socket.on("join_group", async (payload) => {
    socket.join(payload.roomId);
    socket.emit("join_group_success", payload);
  });
  /* EXIT GROUP */
  socket.on("exit_group", async ({ id, user, name }) => {
    const updateUserInfoCollection = await userInfoCollection.updateOne(
      { usr_id: user.userId },
      { $pull: { rooms: id } }
    );
    const updateRoomCollection = await roomsCollection.updateOne(
      { roomId: id },
      { $pull: { users: user.userId } }
    );
    io.to(id).emit("exit_group_success", { id, user, name });
    socket.leave(id);
  });
  /* UPDATE GROUP PICTURE */
  socket.on("update_group_picture", async ({ id, key, groupName }) => {
    const updateRoomPicture = await roomsCollection.updateOne(
      { roomId: id },
      { $set: { imageTag: key } }
    );
    const getObjectParams = {
      Bucket: bucketName,
      Key: key,
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 86400 });
    io.to(id).emit("group_picture_updated", { id, key, groupName, url });
  });
  /* UPDATE GROUP NAME */
  socket.on("update_group_name", async ({ id, oldRoomname, newRoomname }) => {
    const updateRoomName = await roomsCollection.updateOne(
      { roomId: id },
      {
        $set: { name: newRoomname },
      }
    );
    io.to(id).emit("group_name_updated", { id, oldRoomname, newRoomname });
  });
  /* ADD GROUP MEMBERS */
  socket.on(
    "add_group_members",
    async ({ id, groupName, members, addedBy }) => {
      const updateRoomsCollection = await roomsCollection.updateOne(
        { roomId: id },
        { $push: { users: { $each: members } } }
      );
      const updateUserInfo = await userInfoCollection.updateMany(
        {
          usr_id: { $in: members },
        },
        { $push: { rooms: id } }
      );
      io.to(id).emit("group_members_added", { groupName });
      members.forEach((member) => {
        io.to(member).emit("join_group", {
          groupName,
          roomId: id,
          createdBy: addedBy,
        });
      });
    }
  );
  /* DELETE GROUP */
  socket.on("delete_group", async ({ id, groupName, from, members }) => {
    const updateUserRooms = await userInfoCollection.updateMany(
      {
        usr_id: { $in: members },
      },
      { $pull: { rooms: { $in: [id] } } }
    );
    const deleteRoom = await roomsCollection.deleteOne({ roomId: id });
    const deleteChat = await chatMessagesCollection.deleteMany({ room: id });
    io.to(id).emit("group_deleted", { id, groupName, from });
  });
  /* UPDATE PROFILE PICTURE */
  socket.on("update_profile_picture", async ({ userId, key, friends }) => {
    const updateUserInfo = await userInfoCollection.updateOne(
      {
        usr_id: userId,
      },
      { $set: { imageTag: key } }
    );
    const updateSentNotifications = await notificationsCollection.updateMany(
      {
        "from.userId": userId,
      },
      { $set: { "from.imageTag": key } }
    );
    const updateReceivedNotifications =
      await notificationsCollection.updateMany(
        {
          "to.usr_id": userId,
        },
        { $set: { "to.imageTag": key } }
      );
    const getObjectParams = {
      Bucket: bucketName,
      Key: key,
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 86400 });
    socket.emit("update_profile_picture", { userId, key, url });
    friends.forEach((friend) => {
      io.to(friend.usr_id).emit("update_profile_picture", {
        userId,
        key,
        url,
      });
    });
  });
  /* UPDATE USERNAME */
  socket.on("update_username", async ({ userId, username, friends }) => {
    const updateUserInfo = await userInfoCollection.updateOne(
      { usr_id: userId },
      { $set: { usr_nm: username } }
    );
    const updateSentNotifications = await notificationsCollection.updateMany(
      {
        "from.userId": userId,
      },
      { $set: { "from.username": username } }
    );
    const updateReceivedNotifications =
      await notificationsCollection.updateMany(
        { "to.usr_id": userId },
        { $set: { "to.usr_nm": username } }
      );
    const updateChats = await chatMessagesCollection.updateMany(
      { usr_id: userId },
      { $set: { usr_nm: username } }
    );
    socket.emit("update_username", { userId, username });
    friends.forEach((friend) => {
      io.to(friend.usr_id).emit("update_username", { userId, username });
    });
  });
  /* UPDATE USER ID */
  socket.on("update_userid", async ({ oldUserid, newUserid, friends }) => {
    try {
      const updateUserInfo = await userInfoCollection.updateOne(
        { usr_id: oldUserid },
        { $set: { usr_id: newUserid } }
      );
      socket.join(newUserid);
      socket.emit("update_userid", { oldUserid, newUserid });
      friends.forEach((friend) => {
        io.to(friend.usr_id).emit("update_userid", { oldUserid, newUserid });
      });
    } catch (e) {
      if (e?.keyPattern?.usr_id === 1)
        socket.emit("update_userid_failed", {
          error: "User id has already been taken!",
        });
    }
    const addNewRoomUsers = await roomsCollection.updateMany(
      {
        users: oldUserid,
      },
      { $push: { users: newUserid } }
    );
    const removeOldRoomUsers = await roomsCollection.updateMany(
      {
        users: oldUserid,
      },
      { $pull: { users: oldUserid } }
    );
    const updateChatMessages = await chatMessagesCollection.updateMany(
      {
        usr_id: oldUserid,
      },
      { $set: { usr_id: newUserid } }
    );
    const removeIdFromMessageReadList = await chatMessagesCollection.updateMany(
      {
        read: oldUserid,
      },
      { $push: { read: newUserid } }
    );
    const addIdToMessageReadList = await chatMessagesCollection.updateMany(
      {
        read: oldUserid,
      },
      { $pull: { read: oldUserid } }
    );
    const updateSentNotifications = await notificationsCollection.updateMany(
      {
        "from.userId": oldUserid,
      },
      { $set: { "from.userId": newUserid } }
    );
    const updateReceivedNotifications =
      await notificationsCollection.updateMany(
        { "to.usr_id": oldUserid },
        { $set: { "to.usr_id": newUserid } }
      );
  });
  /* UPDATE EMAIL */
  socket.on("update_email", async ({ userId, newEmail, friends }) => {
    try {
      const updateUserInfo = await userInfoCollection.updateOne(
        { usr_id: userId },
        { $set: { email: newEmail } }
      );
      socket.emit("update_email", { userId, newEmail });
      friends.forEach((friend) => {
        io.to(friend.usr_id).emit("update_email", { userId, newEmail });
      });
    } catch (e) {
      if (e?.keyPattern?.email === 1)
        socket.emit("update_email_failed", {
          error: "Email id has already been taken!",
        });
    }
    const updateSentNotifications = await notificationsCollection.updateMany(
      {
        "from.userId": userId,
      },
      { $set: { "from.mail": newEmail } }
    );
    const updateReceivedNotifications =
      await notificationsCollection.updateMany(
        { "to.usr_id": userId },
        { $set: { "to.email": newEmail } }
      );
  });
  /* UPDATE PASSWORD */
  socket.on("update_password", async ({ userId, oldPassword, newPassword }) => {
    const user = await userInfoCollection.findOne({ usr_id: userId });
    const passwordCheck = await bcrypt.compare(oldPassword, user.pass);
    if (!passwordCheck)
      return socket.emit("update_password_failed", {
        error: "Old password is incorrect!",
      });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateUserInfo = await userInfoCollection.updateOne(
      { usr_id: userId },
      { $set: { pass: hashedPassword } }
    );
    socket.emit("update_password");
  });
});

server.listen(PORT, () => console.log(`Listening at port ${PORT}`));
