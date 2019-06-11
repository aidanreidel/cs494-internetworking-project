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
let allRooms = ["Home"]; // List of all rooms available
let history = {
  // Initialize the first chat room history
  Home: []
};
let usersRooms = {}; // Structure to hold every user's list of connected rooms
// {username: [list of rooms]}

io.on("connection", function(socket) {
  // Calls this function upon connecting to the client
  socket.on("adduser", username => {
    // Save the clients username and what room they are in to a session variable
    socket.username = username;
    socket.room = "Home"; // This is the room everyone starts in
    socket.join("Home"); // send client to the home room

    // Add data to all of the structures
    usernames[username] = username;
    usersRooms[username] = []; // Initilize room list for new user
    usersRooms[username].push("Home"); // add room to the user's connected rooms

    console.log(usersRooms);
    socket.emit(
      "update rooms",
      history[socket.room],
      usersRooms[socket.username],
      socket.room
    );
    socket.emit("chat message", "SERVER", username + " joined the Home Room!"); // echo to client that that have joined
    socket.broadcast
      .to("Home") //Maybe list traversal here
      .emit("chat message", "SERVER", username + " has connected to this room");
    io.in(socket.room).emit("update users", usersInRoom(socket.room)); // Updates user list for Home
  });

  socket.on("addroom", roomname => {
    if (!allRooms.includes(roomname)) {
      // Update data structures
      allRooms.push(roomname); // add room to global room list
      usersRooms[socket.username].push(roomname); // add room to the user's connected rooms
      history[roomname] = [];

      // Change room into new room
      socket.leave(socket.room);
      socket.room = roomname; // store room name in the socket session for this client
      socket.join(roomname); // send client to new room
      console.log("All rooms: " + allRooms); // log all rooms to console
      console.log(socket.username + " rooms: " + usersRooms[socket.username]);

      // Updates user list for the new room!
      io.in(socket.room).emit("update users", usersInRoom(socket.room));
      socket.emit(
        "chat message",
        "SERVER",
        socket.username + " joined " + roomname + "!! Welcome in!"
      );
      socket.emit(
        "update rooms",
        history[socket.room],
        usersRooms[socket.username],
        socket.room
      );
    } else {
      console.log(roomname + " already exists");
      socket.emit(
        "chat message",
        "SERVER",
        roomname + " already exists. Try another one or join that room!"
      );
    }
  });

  socket.on("join room", (roomname, callback) => {
    usersRooms[socket.username].push(roomname); // add room to the user's connected rooms
    // Change room into new room
    socket.leave(socket.room);
    socket.room = roomname; // store room name in the socket session for this client
    socket.join(roomname); // send client to new room
    console.log(allRooms); // log all rooms to console
    console.log(usersRooms);

    socket.emit(
      "chat message",
      "SERVER",
      socket.username + " joined " + roomname + "!! Welcome in!"
    ); // echo to client that that have joined
    socket.broadcast
      .to(roomname) //Maybe list traversal here
      .emit(
        "chat message",
        "SERVER",
        socket.username + " has connected to this room"
      );
    io.in(socket.room).emit("update users", usersInRoom(socket.room)); // Updates user list for the new room!
    socket.emit(
      "update rooms",
      history[socket.room],
      usersRooms[socket.username],
      socket.room
    );
    callback();
  });

  // Send the client their rooms list
  socket.on("get rooms", fn => {
    fn(usersRooms[socket.username]);
  });

  // Show rooms that a user has not joined by subtracting the arrays
  socket.on("get other rooms", fn => {
    fn(allRooms.filter(x => !usersRooms[socket.username].includes(x)));
  });

  // Can a user be in more than one room at a time, but only see messages from one?
  // Lets find out!
  socket.on("chat message", function(msg) {
    msg = validateMsg(msg);
    if (msg == null) return;

    // Start a chat history if there isn't one
    if (!history[socket.room]) history[socket.room] = [];
    // Append this message into the specific room's chat history
    history[socket.room].push(socket.username + ": " + msg);
    console.log(history); // TODO: remove
    //send the message to the room in question
    io.in(socket.room).emit("chat message", socket.username, msg);
  });

  socket.on("chat message-all", function(msg) {
    msg = validateMsg(msg); // Validates the message given
    if (msg == null) return;

    // Sends message to each room the user is connected to
    //usersRooms[socket.username].forEach(function(room) {
    // Currently send message to ALL rooms... the correct code is commented out above
    allRooms.forEach(function(room) {
      if (!history[room]) history[room] = [];
      history[room].push(socket.username + ": " + msg);
      console.log(history);
      io.in(room).emit("chat message", socket.username, msg);
    });
  });

  socket.on("change room", newroom => {
    socket.leave(socket.room);
    socket.join(newroom);
    // Update room session info
    socket.room = newroom;
    socket.emit(
      "update rooms",
      history[socket.room],
      usersRooms[socket.username],
      socket.room
    );
    io.in(newroom).emit("update users", usersInRoom(newroom)); // Updates the users list for the new room
  });

  socket.on("leave room", (room, callback) => {
    // TODO: add notifications to the user?
    const index = usersRooms[socket.username].indexOf(room);
    if (index > -1) {
      usersRooms[socket.username].splice(index, 1);
    }
    if (room === socket.room) {
      oldroom = socket.room;
      socket.leave(socket.room);
      socket.join("Home");
      // Update room session info
      socket.room = "Home";
      io.in(oldroom).emit("update users", usersInRoom(oldroom));
      io.in("Home").emit("update users", usersInRoom("Home")); // Updates the users list for the new room
    }
    socket.emit("update rooms", history[socket.room], usersRooms[socket.username], socket.room);
    callback();
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

    // Makes a deep copy of the rooms the user was connected to so user lists
    // of those rooms can be updated
    var rooms = [];
    Object.values(usersRooms[socket.username]).forEach(room => {
      rooms.push(room);
    });

    // Deletes the users memory from data structures
    delete usernames[socket.username];
    delete usersRooms[socket.username];

    // Updates the user list to all of the rooms the user was connected to
    rooms.forEach(room => {
      io.in(room).emit("update users", usersInRoom(room));
    });

    console.log(usernames);
    console.log(usersRooms);
  });

  // Helper functions

  function usersInRoom(room) {
    var users = [];
    for (var username in usersRooms) {
      if (usersRooms[username].includes(room)) {
        users.push(username);
      }
    }
    console.log(users);
    return users;
  }

  function validateMsg(msg) {
    msg = msg.trim(); // trim white space from front and back of string
    msg = msg.replace(/[^\x00-\x7F]/g, ""); // Removes non-ASCII characters
    if (msg.length == 0) {
      // No message to be sent
      socket.emit(
        "chat message",
        "SERVER",
        "No valid message was present, nothing was sent to this room."
      );
      return null;
    }
    if (msg.length > 160) {
      // Error sending over 160 characters
      socket.emit(
        "chat message",
        "SERVER",
        "Only a maximum of 160 characters can be sent. Please try again."
      );
      return null;
    }
    return msg;
  }

  io.on("connect_failed", function() {
    alert("Sorry, there seems to be an issue with the connection!");
    document.write("Sorry, there seems to be an issue with the connection!");
  });
});

io.on("connect_failed", function() {
  alert("Sorry, there seems to be an issue with the connection!");
  document.write("Sorry, there seems to be an issue with the connection!");
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

/* Notes on functions... to keep my head clear!

Data Structures:
  allRooms - List of all rooms
  history - map room to all messages
  usersRooms - map user to all connected rooms

New user:
  - add username to usernames
  - add "Home" to usersRooms

New Room:
  - add room to allRooms
  - add room to usersRooms
  - create empty history to room

Join (Connect) Room: 
  - add room to usersRooms

Leave (Disconnect) Room:
  - remove room from usersRooms

Delete Room (Remove room from entire server): 
  - remove room from allRooms
  - remove history of room
  - somehow remove the room from every users usersRoom <<<<<<,

Send Message:
  - add message to room history
*/
