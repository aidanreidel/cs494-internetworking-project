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

io.on("connection", function(socket) {
  socket.on("adduser", username => {
    usernames[username] = username;
    socket.username = username;
    console.log(usernames);
    io.emit("chat message", "SERVER", username + " joined the room!");
  });

  socket.on("chat message", function(msg) {
    io.emit("chat message", socket.username, msg);
  });
  socket.on("getUsers", fn => {
    fn(usernames);
  });
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
