import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  username: string;
  email: string;
  phone: string;
  password: string;
}

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
});

const userModel = mongoose.model<IUser>("userModel", userSchema);
export default userModel;
