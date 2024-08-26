import mongoose from "mongoose";
import MessageSchema from "./Message.js";

const { Schema } = mongoose;

// Regular expression for validating a Lebanese phone number starting with 81, 71, 76, 79, or 03
const lebanesePhoneRegex =
  /^(?:\+961|961|0)?(81\d{6}|71\d{6}|76\d{6}|79\d{6}|3\d{6})$/;

const UserSchema = new Schema(
  {
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
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return lebanesePhoneRegex.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid Lebanese phone number!`,
      },
    },
    bio: {
      type: String,
      required: false,
    },
    hobbies: {
      type: [String],
      required: false,
    },
    work: {
      type: String,
      required: false,
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
        default: [],
        select: false,
      },
    },
    lastLogin: {
      type: Date,
      required: false,
    },
    streak: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
