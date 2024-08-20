import mongoose from "mongoose";
import MessageSchema from "./Message.js";

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  illness: {
    type: String,
    required: false,
  },
  UserType: {
    type: String,
    enum: ["parent", "child"],
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  children: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  chat: {
    messages: {
      type: [MessageSchema],
      select: false,
    },
  },
});

export default mongoose.model("User", UserSchema);
