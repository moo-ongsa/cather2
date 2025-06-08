const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Replace with your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("update-user-velocity", (id, user) => {
    // const users = app.get("users");
    // app.set("users", { ...users, [id]: user });
  });
  socket.on("join-room", (roomId, userPeerId) => {
    socket.join(roomId);
    console.log("🚀 ~ file: server.js:24 ~ socket.on ~ roomId:", roomId);
    socket.broadcast.to(roomId).emit("user-connected", userPeerId);

    socket.on("disconnect", () => {
      //   const users = app.get("users");
      //   if (users.hasOwnProperty(currentUserId)) {
      //     delete users[currentUserId];
      //   }
      socket.broadcast.to(roomId).emit("user-disconnected", userPeerId);
    });

    socket.on("exit-room", () => {
      console.log("exit-room");
      io.to(roomId).emit("user-exit-room", userPeerId);
    });
  });
});

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});
