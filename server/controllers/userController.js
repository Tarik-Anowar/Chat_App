import generateToken from '../config/generateToken.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { config } from 'dotenv';
config();

export const registerUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, pic } = req.body;
        console.log("name = " + name);

        if (!name || !email || !password) {
            res.status(400);
            throw new Error("Please enter all the fields.");
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error("User already exists.");
        }

        const user = await User.create({
            name,
            email,
            password,
            pic,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error("Failed to create new user");
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

export const authUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error("Enter all the fields");
        }

        const user = await User.findOne({ email });

        function hmac_rawurlsafe_base64_string(distinct_id, secret) {
            const hash = crypto
                .createHmac("sha256", secret)
                .update(distinct_id)
                .digest("base64url");
            return hash.trimEnd("=");
        }

        if (user && (await user.matchPassword(password))) {
            const subscriber_id = hmac_rawurlsafe_base64_string(user.email, process.env.WORKSPACE_SECRET);
            console.log("secret = " + process.env.WORKSPACE_SECRET);
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                subscriber_id: subscriber_id,
                pic: user.pic,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error("Invalid email or password");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

export const allUsers = asyncHandler(async (req, res) => {
    try {
        const keyword = req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
            ],
        } : {};

        const users = await User.find({
            ...keyword,
            _id: { $ne: req.user._id },
        });

        res.send(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
