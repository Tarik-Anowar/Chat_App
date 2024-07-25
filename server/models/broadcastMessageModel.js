import mongoose from "mongoose";

const broadcastMessageSchema = mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, trim: true },
        isSeen: { type: Boolean, default: false } 
    },
    {
        timestamps: true
    }
);

const BroadcastMessage = mongoose.model("BroadcastMessage", broadcastMessageSchema);

export default BroadcastMessage;
