import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { MongoClient } from "mongodb";

const PORT = process.env.PORT;

/* CREATING AND CONNECTING TO SOCKET SERVER */
const app = express();
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

io.on("connection", async (socket) => {
  console.log("Socket connection made...");
  const allChat = await collection.find({}).toArray();
  io.emit("allChat", allChat);
  socket.on("message_input", async (payload) => {
    await collection.insertOne({ name: payload.username, msg: payload.message });
  });
});

server.listen(PORT, () => console.log(`Listening at port ${PORT}`));
