# cs494-internetworking-project

This is a repo for our cs494 Internetworking protocols project!

## What was the assignment?

We were tasked with building an IRC / Discord / Slack like chat client with web sockets in teams of two. I did this project with my esteemed colleague and friend [Natalie Leon Guerrero](https://github.com/nleong2). At the time I had more experience with server work than Natalie so I layed the groundwork for the project by getting the development environment and server setup. After getting the project off the ground, I focused on the more complicated features such as loading and saving each room's the chat history and Natalie helped with the rest!

### Features
* Users can send and receive messages
* Users can create, join, switch and leave rooms
* Chat history is persisted on a per room basis
* Users can send messages to a specific room or as a broadcast to all rooms
* Users can see who actively in the room that they are in currently 
* Both the client and the server handle disconnections gracefully

# How to run this code

| Dependency | Version |
| --- | --- |
| `node` Current | `12.5.0` |
| `node` Past | `8.11.1` |
| `npm` | `6.10.2` |


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
npm start
```

Then in your favorite browser navigate to [localhost:3000](http://localhost:3000) to see that app do it's thing. If you go that location on more than one tab you can chat with yourself, HOORAY!
