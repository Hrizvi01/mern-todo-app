
const mongoose = require("mongoose");

// Define the structure of a task document
const taskSchema = new mongoose.Schema({
  // Every task must have a title
  title: {
    type: String,
    required: true,
    trim: true
  },

  // Track whether the task has been completed
  completed: {
    type: Boolean,
    default: false
  }
});

// Create a model to read and write tasks in MongoDB
const Task = mongoose.model("Task", taskSchema);

// Export the model so server.js can use it
module.exports = Task;
