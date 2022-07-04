import dontenv from 'dotenv';
import http from "http";
import express from "express";
import logger from "morgan";
import {Server} from "socket.io";
import cors from "cors";
// mongo connection
import  "./config/mongo.js";
// routes
import indexRouter from "./routes/index.js";
import userRouter from "./routes/user.js";
import chatRoomRouter from "./routes/chatRoom.js";
import deleteRouter from "./routes/delete.js";
// websocket
import WebSockets from "./utils/WebSockets.js";
// middlewares
import { decode } from './middlewares/jwt.js'

const app = express();
dontenv.config();

/** Get port from environment and store in Express. */
const port = process.env.PORT || 3001;
app.set("port", port);
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/room", decode, chatRoomRouter);
app.use("/delete", deleteRouter);
app.disable('etag');
/** catch 404 and forward to error handler */
app.use('*', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'API endpoint doesnt exist'
  })
});

/** Create HTTP server. */
const server = http.createServer(app);


global.io = new Server(server,{
  cors : {
    origin: '*',
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});
let users = []
// in case users has 2 connections
function subscribeOtherUser(room, otherUserId) {
  const userSockets = users.filter(
    (user) => user.userId === otherUserId
  );
  userSockets.map((userInfo) => {
    const socketConn = global.io.sockets.connected(userInfo.socketId);
    if (socketConn) {
      socketConn.join(room);
    }
  });
}
global.io.on('connection', (client)=>{
  // event fired when the chat room is disconnected
  client.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== client.id);
  });
  // add identity of user mapped to the socket id
  client.on("identity", ({userId,roomId}) => {
    users.push({
      socketId: client.id,
      userId: userId,
      roomId: roomId,
    });
  });
  // subscribe person to chat & other user as well
  client.on("subscribe", ({roomId, userId},otherUserId = "") =>{
    subscribeOtherUser(roomId, otherUserId);
    const user = users.find(user => user.userId === userId);
    if(user){
      user.roomId = roomId;
    }
    const totalUsers = users.filter(user => user.roomId === roomId);
    console.log('total users',totalUsers.length);
    client.join(roomId);
  });
  // mute a chat room
  client.on("unsubscribe", (room) => {
    client.leave(room);
  });
})
/** Listen on provided port, on all network interfaces. */
server.listen(port, () => {
  console.log(`Listening on port:: http://localhost:${port}/`)
});