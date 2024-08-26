import mongoose from "mongoose";

const { Schema } = mongoose;

const VoiceNoteMetadataSchema = new Schema({
  duration: {
    type: Number,
    required: false,
  },
  size: {
    type: Number,
    required: false,
  },
  format: {
    type: String,
    required: false,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const MessageSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    diagnosis: {
      type: String,
      required: false,
    },
    AI_response: {
      type: String,
      required: false,
    },
    voiceNoteMetadata: {
      type: VoiceNoteMetadataSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default MessageSchema;
