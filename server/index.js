import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors
import connectDB from './config/db.js';
import router from './routes/routes.js';
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoute.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();
dotenv.config();
connectDB();

const corsOptions = {
    origin: ['http://localhost:3000', 'https://chat-app-client-jade.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));

const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'https://chat-app-client-jade.vercel.app',
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

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Hello" });
});

app.get("/api", (req, res) => {
    res.json({ message: "Hello Fom Tarik" });
});


app.use('/api/user', router);
app.use('/api/chat', chatRouter);
app.use("/api/message", messageRouter);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
    console.log(`Server is listening on http://127.0.0.1:${PORT}`);
});
