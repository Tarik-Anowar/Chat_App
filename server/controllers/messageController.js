import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatmodel.js";
import { json } from "express";
import BroadcastMessage from "../models/broadcastMessageModel.js";

export const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;
    if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }
    const newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    };

    try {
        var message = await Message.create(newMessage);
        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: 'chat.users',
            select: "name email pic"
        });
        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message
        });
        res.status(200).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export const getAllStatuses = asyncHandler(async (req, res) => {
    try {
        const statuses = await BroadcastMessage.find().populate("sender", "name email pic");
        res.status(200).json(statuses);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export const broadcastMessage = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ error: "Content is required for broadcasting a message." });
    }

    try {
        const newBroadcastMessage = {
            sender: req.user._id,
            content: content,
            isSeen:false
        };

        let broadcastMessage = await BroadcastMessage.create(newBroadcastMessage);
        broadcastMessage = await broadcastMessage.populate("sender", "name email pic");
        res.status(200).json(broadcastMessage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


export const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name email pic")
            .populate("chat");
    
        const broadcastMessages = await BroadcastMessage.find({ chat: req.params.chatId })
            .populate("sender", "name email pic")
            .populate("chat");
    
        const allMessages = messages.concat(broadcastMessages);
    
        res.status(200).json(allMessages);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
    
})