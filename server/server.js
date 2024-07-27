import { createServer } from 'http';
import { Server } from 'socket.io';
import express from 'express';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on("connection", (socket) => {
    console.log("connected to socket.io");

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
        console.log(userData._id);
    });

    socket.on("disconnect", () => {
        console.log("disconnected from socket.io");
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on('new message', (newMessage) => {
        var chat = newMessage.chat;
        if (!chat.users) return console.log('Chat users not defined...');
        chat.users.forEach((user) => {
            if (user._id === newMessage.sender._id) return;
            socket.in(user._id).emit("message received", newMessage);
        });
    });

    socket.on("new status", (status) => {
        console.log("new status received");
        var sender = status.sender;
        socket.broadcast.emit("broadcast", status);
    });
});

export default server;
