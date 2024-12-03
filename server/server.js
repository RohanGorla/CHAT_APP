import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { MongoClient } from "mongodb";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT;

server.listen(PORT, () => console.log(`Listening at port ${PORT}`));
