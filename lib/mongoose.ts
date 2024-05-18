import mongoose from "mongoose";

let isConnected = false; //Variable to track the connection status
console.log("hello there how are yu");
export const connectToDB = async () => {
  console.log("hello there how are you");
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URI)
    return console.log("MONGODB_URI is not defined");

  if (isConnected) return console.log("=> using existing databse connection");

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    isConnected = true;
    console.log("mongoDB connected");
  } catch (error) {
    console.log("NOt connected");
    console.log(error);
  }
};
