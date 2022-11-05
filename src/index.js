const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { generateMessage, MessageType } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const pathToPublicDir = path.join(__dirname, "../public");

app.use(express.static(pathToPublicDir));

io.on("connection", (socket) => {
  socket.on("sendMessage", ({ message, id }, callback) => {
    const user = getUser(socket.id);
    let type = "received";
    console.log(id, socket.id);
    if (id === socket.id) type = "sent";
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(message, type, user.username)
      );
      callback();
    }
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(
          `${user.username} has left the chat`,
          MessageType.NOTIFICATION,
          undefined
        )
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("sendLocation", (location, callback) => {
    io.emit(
      "message",
      generateMessage(
        `https://google.com/maps?q=${location.latitude},${location.longitude}`,
        undefined,
        undefined
      )
    );
    callback();
  });

  socket.on("join", ({ username, room }, callback) => {
    const { user, error } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit(
      "message",
      generateMessage("Welcome to QuickChat!", MessageType.NOTIFICATION),
      undefined
    );

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(
          `${user.username} has joined chat`,
          MessageType.NOTIFICATION,
          undefined
        )
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
  });
});

server.listen(port, () => {
  console.log("Server Started on " + port);
});
