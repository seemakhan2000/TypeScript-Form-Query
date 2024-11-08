import mongoose from "mongoose";

const dbUrl: string = process.env.MONGODB_URL as string;

async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(dbUrl);

    console.log("MongoDB is connected");
  } catch (error) {
    console.error(`Unable to connect to the server: ${error}`);
  }
}

export default connectDB;
