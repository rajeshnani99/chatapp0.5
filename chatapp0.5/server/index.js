/** @format */

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
const socket = require("socket.io");
const User = require("./models/userModel");
const groupchat = require("./models/groupchatModel");

dotenv.config();
app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/message", messageRoute);

//mongoose connection
mongoose
	.connect(process.env.MONGO_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("DB Connection Successful!");
	})
	.catch((err) => console.log(err));

const server = app.listen(process.env.PORT, () => {
	console.log(`Server started on Port ${process.env.PORT}`);
});

const io = socket(server, {
	cors: {
		origin: "http://localhost:3000",
		credentials: true,
	},
});
//store all online users inside this map
global.onlineUsers = new Map();
console.log("online users :-" + global.onlineUsers);

io.on("connection", (socket) => {
	global.chatSocket = socket;
	socket.on("join", (roomId) => {
		socket.join(roomId);
		console.log(`User joined group ${roomId}`);
	});
	socket.on("message", (message) => {
		socket.to(message.to).emit("message-received", message.message);
		console.log(message);
	});

	socket.on("add-user", (userId) => {
		console.log(userId);
		onlineUsers.set(userId, socket.id);
	});

	socket.on("send-msg", (data) => {
		const sendUserSocket = onlineUsers.get(data.to);
		if (sendUserSocket) {
			socket.to(sendUserSocket).emit("msg-recieved", data.message);
		}
	});
});
