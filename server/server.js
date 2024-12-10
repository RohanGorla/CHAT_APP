import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { createServer } from "http";
import { Server } from "socket.io";
import { MongoClient } from "mongodb";
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
const collection = db.collection("ChatApp_Chats");
const userInfoCollection = db.collection("ChatApp_UserInfo");

/* BASIC SERVER ROUTE TO ENSURE CONNECTION IN POSTMAN */
app.get("/", (req, res) => {
  res.json("Connected...");
});

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
      errorMsg:
        "No account linked with this email address. Please check and try again!",
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

  /* IF THE ENTERED DETAILS ARE CORRECT SEND THE USER DATA */
  return res.send({ access: true, userData: emailRecords[0] });
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
  };
  const response = await userInfoCollection.insertOne(newUser);
  if (response.acknowledged) {
    return res.send({ access: true });
  }
});

io.on("connection", async (socket) => {
  console.log("Socket connection made...");
  const allChat = await collection.find({}).toArray();
  io.emit("allChat", allChat);
  socket.on("message_input", async (payload) => {
    await collection.insertOne({
      name: payload.username,
      msg: payload.message,
    });
    io.emit("message_output", payload);
  });
});

server.listen(PORT, () => console.log(`Listening at port ${PORT}`));
