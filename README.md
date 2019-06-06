# cs494-internetworking-project

This is a repo for our cs494 Internetworking protocols project!

# What's next?

Slack or Discord style room switching / selecting!

The basic functionally of this app is good to go. Now we need to move onto the hard part of dealing with multiple rooms.

We need something like this:

1. Client should be able to create rooms (prompt)
2. Client should be able to join rooms (prompt or select)
3. Client should be able to switch between rooms(click room in side bar)
4. Client should be able to see what members are in the room (update side bar with current room members)
5. Client should be able to send a message to all rooms that they have joined. (special broadcast send button?)

To do these tasks, I believe that we will need to make an object with room names as keys and an array of messages as the value. Like this:

```javascript
const rooms = {
  "room1" : ["User 1: Hey", "User 2: Hello", ...]
  "room2" : [...]
  ...
}
```

This per room message list will be read into the users message window when they switch to that room, and this is the only message list they will be adding to while they are in this room. Unless they broadcast!

We might not have to make a new object to hold this, we might be able to add a message felid to socket.io's already existing join and leave and just read that into the user's message window. I'm not sure but I know we'll find out when we get started!

# How to run this code

This is a Node.js project, we are running node `v8.11.1`

After cloning this project cd into the repo:

```
cd cs494-internetworking-project/
```

Then setup the project on your system by running:

```
npm i
```

After waiting for NPM to do its thing you should be able to run the project by running:

```
node index.js
```

Then in your favorite browser navigate to:

```
localhost:3000
```

to see that app do its thing. If you go that location on more than one tab you can chat with yourself, HOORAY!
