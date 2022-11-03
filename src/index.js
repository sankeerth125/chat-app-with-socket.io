const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { generateMessage } = require("./utils/messages");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const pathToPublicDir = path.join(__dirname, "../public");

app.use(express.static(pathToPublicDir));

io.on("connection", (socket) => {
  socket.emit("message", generateMessage("Welcome to Chat App"));

  socket.broadcast.emit(
    "message",
    generateMessage("A new user has joined chat")
  ); // broadcast sends message to all users expect the currrent user

  socket.on("sendMessage", (message, callback) => {
    io.emit("message", generateMessage(message));
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left the chat"));
  });

  socket.on("sendLocation", (location, callback) => {
    io.emit(
      "message",
      generateMessage(
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });
});

server.listen(port, () => {
  console.log("Server Started on " + port);
});
