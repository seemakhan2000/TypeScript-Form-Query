import mongoose, { Schema, Document } from "mongoose";

export interface ISignup extends Document {
  username: string;
  email: string;
  phone: string;
  password: string;
}

const SignupSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
});

const SignupModel = mongoose.model<ISignup>("SignupModel", SignupSchema);
export default SignupModel;
