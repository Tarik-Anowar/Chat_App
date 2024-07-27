import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors'; // Import the CORS middleware
import connectDB from './config/db.js';
import router from './routes/routes.js';
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoute.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Use CORS middleware
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// API routes
app.use('/api/user', router);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Basic route
app.get('/', (req, res) => {
    res.json('Hello');
});

// Socket.io setup
io.on('connection', (socket) => {
    console.log('connected to socket.io');

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
        console.log(userData._id);
    });

    socket.on('disconnect', () => {
        console.log('disconnected from socket.io');
    });

    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('User Joined Room: ' + room);
    });

    socket.on('new message', (newMessage) => {
        var chat = newMessage.chat;
        if (!chat.users) return console.log('Chat users not defined...');
        chat.users.forEach((user) => {
            if (user._id === newMessage.sender._id) return;
            socket.in(user._id).emit('message received', newMessage);
        });
    });

    socket.on('new status', (status) => {
        console.log('new status received');
        var sender = status.sender;
        socket.broadcast.emit('broadcast', status);
    });
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is listening on http://127.0.0.1:${PORT}`);
});
