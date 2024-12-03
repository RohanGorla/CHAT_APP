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

/* CONNECTING TO MONGODB CLIENT */
const client = new MongoClient(process.env.DB_URL);
client
  .connect()
  .then(() => console.log("Mongodb connected..."))
  .catch((err) => console.log(err));

io.on("connection", (socket) => {
  console.log("Socket connection made...");
});

server.listen(PORT, () => console.log(`Listening at port ${PORT}`));
