import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from '../config/db.js'; // Update the path as needed
import userRouter from '../routes/routes.js'; // Update the path as needed
import chatRouter from '../routes/chatRoutes.js'; // Update the path as needed
import messageRouter from '../routes/messageRoute.js'; // Update the path as needed
import { notFound, errorHandler } from '../middleware/errorMiddleware.js'; // Update the path as needed

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

app.use(express.json());

// API routes
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

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

// Basic route
app.get('/', (req, res) => {
    res.send('Hello');
});

// Export as serverless function
export default (req, res) => {
    server(req, res); 
};
