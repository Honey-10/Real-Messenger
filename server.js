const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utli/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utli/users");
const app = express();
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);
const io = socketio(server);

const botname = "ChatBot";

//set static folder
app.use(express.static(path.join(__dirname, "public")));
// end static folder

//run when client connect
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botname, "welcome to Messenger App!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(botname, `${user.username} has joined`));

    // send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //Listen message
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
  console.log("NEW WS Connect");

  //Runs when client Disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botname, `${user.username} left the chat`)
      );

      // send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`server start at ${PORT}`);
});
