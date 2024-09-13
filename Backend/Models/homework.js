import mongoose from "mongoose";

const { Schema } = mongoose;

// Define Homework schema
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
  dueDate: {
    type: Date,
    required: true,
  },
});

// Export the schema
export default HomeworkSchema;
