import mongoose from "mongoose";

const { Schema } = mongoose;

const HomeworkSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  timeInMinutes: {
    type: Number,
    required: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

export default HomeworkSchema;
