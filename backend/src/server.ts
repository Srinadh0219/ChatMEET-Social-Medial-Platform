import { Buffer } from 'buffer';
if (!(Buffer as any).SlowBuffer) {
  (Buffer as any).SlowBuffer = class {};
}
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import passport from 'passport';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

dotenv.config({ path: 'credentials.env' });

import path from 'path';

import connectDB from './config/db';
import usersRoutes from './Routes/api/users';
import chatRoutes from './Routes/api/chat';
import postsRoutes from './Routes/api/posts';
import messageRoutes from './Routes/api/message';
import communityRoutes from './Routes/api/community';
import passportConfig from './config/password';
import errorHandler from './middleware/error';
import authRoutes from './Routes/api/auth';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3002",
      "http://localhost:5173",
      "https://chatmeetapp.netlify.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Connect Database
connectDB();

// Bodyparser middleware
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(cors({ origin: true }));

// Passport middleware
app.use(passport.initialize());
passportConfig(passport);

// Routes
app.use("/api/users", usersRoutes);
app.use("/api/post", postsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/auth", authRoutes);

// Misc Routes
import { submitFeedback } from './Controllers/misc/feedback';
app.post("/api/feedback", submitFeedback);

// Socket.io
io.on("connection", (socket) => {
  console.log("User Connected");

  socket.on("setup", (userData) => {
    socket.join(userData.id);
    console.log("User joined setup room: " + userData.id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Chat Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user: any) => {
      const userId = user.id || user._id;
      const senderId = newMessageRecieved.sender?.id || newMessageRecieved.sender?._id;
      if (userId === senderId) return;
      socket.in(userId).emit("message recieved", newMessageRecieved);
    });
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

// Error Handler Middleware
app.use(errorHandler);

// Deployment logic
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/FrontEnd/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "FrontEnd", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

const PORT = process.env.PORT || 4001; // fixed dev port
server.listen(PORT, () => {
  const actualPort = (server instanceof http.Server && server.address() && typeof server.address() === 'object') ? (server.address() as any).port : PORT;
  console.log(`Server running on port ${actualPort}`);
});
