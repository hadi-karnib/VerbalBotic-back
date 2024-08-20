import mongoose from "mongoose";

const { Schema } = mongoose;

const VoiceNoteMetadataSchema = new Schema({
  duration: {
    type: Number,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  format: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const MessageSchema = new Schema({
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
});

export default MessageSchema;
