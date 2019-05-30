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

io.on("connection", function(socket) {
  console.log("a user connected");
  io.emit("chat message", "a user connected");

  socket.on("chat message", function(msg) {
    io.emit("chat message", msg);
  });

  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
