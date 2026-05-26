import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";


const app = express();
dotenv.config();

const PORT = process.env.PORT || 5001; 
const URI = process.env.MONGODB_URI;

try {
  mongoose.connect(URI)
  console.log("MongoDB Connected");
} catch (error) {
  console.log(error); 
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});