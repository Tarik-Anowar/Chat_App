import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import router from './routes/routes.js';
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoute.js';
import { notFound,errorHandler } from './middleware/errorMiddleware.js';
import User from './models/userModel.js';

const app = express();
dotenv.config();
connectDB();
const server = http.createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: '*',
        methods: ['GET', 'POST'] 
    }
});


io.on("connection",(socket)=>{
    console.log("connected to socket.io");

    socket.on('setup',(userData)=>{
        socket.join(userData._id);
        socket.emit('connected');
        console.log(userData._id)
    });

    socket.on("disconnect",()=>{
        console.log("disconnected from socket.io");
    });

    socket.on('join chat',(room)=>{
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
    

})

app.get("/",(req,res)=>{
    res.send("Hello");
});

app.use(express.json());
app.use('/api/user',router);
app.use('/api/chat',chatRouter);
app.use("/api/message",messageRouter);
app.use(notFound);
app.use(errorHandler);

const PORT  = process.env.PORT||9000;
server.listen(PORT,()=>{
    console.log(`server is listenling on http://127.0.0.1:${PORT}`);
})
