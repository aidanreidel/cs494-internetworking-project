/*
  This project was started with the help of the socket.io getting started 
  guide, which can be found at: https://socket.io/get-started/chat/
*/
var app = require("express")();
var http = require("http").Server(app);
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
      .to("room1") //Maybe list traversal here
      .emit("chat message", "SERVER", username + " has connected to this room");
    io.emit("update users", usernames); // This sends the user list over to the client
    io.emit("update rooms", rooms, socket.room);
  });

  // Can a user be in more than one room at a time, but only see messages from one?
  // Lets find out!
  socket.on("chat message", function(msg) {
    io.emit("chat message", socket.username, msg);
  });

  socket.on("change room", newroom => {
    socket.leave(socket.room);
    socket.join(newroom);
    // Alert user they changed rooms
    socket.emit("chat message", "SERVER", "you have connected to " + newroom);
    // Alert rooms you left / joined
    socket.broadcast
      .to(socket.room)
      .emit("chat message", "SERVER", socket.username + " has left this room");
    socket.broadcast
      .to(newroom)
      .emit(
        "chat message",
        "SERVER",
        socket.username + " has joined this room"
      );
    // Update room session info
    socket.room = newroom;
    socket.emit("update rooms", rooms, newroom);
  });

  socket.on("disconnect", function() {
    if (typeof socket.username === "undefined") return;
    socket.broadcast.emit(
      "chat message",
      "SERVER",
      socket.username + " has disconnected."
    ); // echo globally that this client has left
    socket.leave(socket.room);
    console.log(socket.username + " disconnected");
    delete usernames[socket.username];
    io.sockets.emit("update users", usernames); // update list of users in chat, client-side
    console.log(usernames);
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
/*
  leaving this in as an example for now
  socket.on("getUsers", fn => {
    fn(usernames);
  });
  */
