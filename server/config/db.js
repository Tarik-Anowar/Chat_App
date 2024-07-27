import { config } from "dotenv";
import mongoose from "mongoose";

config(); // Load environment variables

const connectDB = async () => {
  console.log("MongoDB URI:", process.env.DB_URI); // Debugging line
  if (!process.env.DB_URI) {
    console.error("DB_URI is not defined. Check your .env file.");
    return;
  }
  await mongoose
    .connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    })
    .catch((err) => {
      console.log("The error is: - " + err);
    });
};

export default connectDB;
