/*
  This project was started with the help of the socket.io getting started 
  guide, which can be found at: https://socket.io/get-started/chat/
*/
var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/");
});

const usernames = {};
var rooms = ["room1", "room2", "room3"];

io.on("connection", function(socket) {
  socket.on("adduser", username => {
    usernames[username] = username;
    socket.username = username;
    socket.room = "room1"; // store room name in the socket session for this client
    socket.join("room1"); // send client to room 1
    console.log(usernames);
    socket.emit("chat message", "SERVER", username + " joined room 1!"); // echo to client that that have joined
    socket.broadcast
      .to("room1")
      .emit("chat message", "SERVER", username + " has connected to this room");
    io.emit("update user list", usernames); // This sends the user list over to the client
  });

  socket.on("chat message", function(msg) {
    io.emit("chat message", socket.username, msg);
  });
  socket.on("getUsers", fn => {
    fn(usernames);
  });
  socket.on("disconnect", function() {
    io.sockets.emit("update users", usernames); // update list of users in chat, client-side
    socket.broadcast.emit(
      "chat message",
      "SERVER",
      socket.username + " has disconnected."
    ); // echo globally that this client has left
    socket.leave(socket.room);
    console.log("user disconnected");
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
