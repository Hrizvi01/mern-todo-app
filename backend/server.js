
// Load variables from the .env file
require("dotenv").config();

// Import libraries needed for our backend
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import our Task model to access MongoDB tasks
const Task = require("./models/Task");

// Create the Express application
const app = express();

// Allow requests from our future React frontend
app.use(cors());

// Allow Express to read JSON request bodies
app.use(express.json());

// Use the port from .env, or 5000 if not provided
const PORT = process.env.PORT || 5000;

// Homepage route to check whether the API is running
app.get("/", (req, res) => {
  res.send("Todo API is running!");
});

// GET API: retrieve all tasks from MongoDB
app.get("/tasks", async (req, res) => {
  try {
    // Find every task document in the database
    const tasks = await Task.find();

    // Send the tasks to the client as JSON
    res.json(tasks);
  } catch (error) {
    // Send an error response if reading fails
    res.status(500).json({
      message: "Failed to fetch tasks"
    });
  }
});

// POST API: create and save a new task
app.post("/tasks", async (req, res) => {
  try {
    // Extract the task title from the request body
    const { title } = req.body;

    // Reject missing, invalid, or empty titles
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Task title is required"
      });
    }

    // Create a new task using our Mongoose model
    const newTask = new Task({
      title: title.trim()
    });

    // Save the task permanently in MongoDB
    const savedTask = await newTask.save();

    // Return the saved task with HTTP 201 Created
    res.status(201).json(savedTask);
  } catch (error) {
    // Handle database errors without exposing details
    res.status(500).json({
      message: "Failed to create task"
    });
  }
});

// Connect to MongoDB before starting the server
async function startServer() {
  try {
    // Stop startup if the connection string is missing
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    // Establish the MongoDB connection
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully!");

    // Start accepting requests after MongoDB connects
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // Show a safe startup error and stop the process
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

// Run the startup function
startServer();
