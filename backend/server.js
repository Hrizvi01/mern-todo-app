
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


// PUT API: update an existing task using its MongoDB ID
app.put("/tasks/:id", async (req, res) => {
  try {
    // Extract the task ID from the URL
    const { id } = req.params;

    // Extract the updated fields sent by the user
    const { title, completed } = req.body;

    // Check that the ID has a valid MongoDB ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    // Create an empty object for the fields we want to update
    const updates = {};

    // Update the title only if the user provided it
    if (title !== undefined) {
      // Reject titles that are not valid, nonempty strings
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          message: "Task title must be a nonempty string"
        });
      }

      // Remove extra spaces before saving the title
      updates.title = title.trim();
    }

    // Update completion status only if the user provided it
    if (completed !== undefined) {
      // Ensure completed is a true or false value
      if (typeof completed !== "boolean") {
        return res.status(400).json({
          message: "Completed must be true or false"
        });
      }

      // Store the validated completion status
      updates.completed = completed;
    }

    // Reject requests that contain no supported fields
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "Provide a title or completed status"
      });
    }

    // Find the task by ID and update its fields
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    // Return 404 if the task doesn't exist
    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Return the updated task to the frontend
    res.json(updatedTask);

  } catch (error) {
    // Handle unexpected errors during the update
    res.status(500).json({
      message: "Failed to update task"
    });
  }
});





// DELETE API: remove a task from MongoDB using its ID
app.delete("/tasks/:id", async (req, res) => {
  try {
    // Extract the task ID from the URL
    const { id } = req.params;

    // Validate the ID before querying MongoDB
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid task ID"
      });
    }

    // Find the matching task and delete it
    const deletedTask = await Task.findByIdAndDelete(id);

    // Return 404 if no task matches the ID
    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found"
      });
    }

    // Confirm that the task was deleted successfully
    res.json({
      message: "Task deleted successfully",
      task: deletedTask
    });

  } catch (error) {
    // Handle unexpected database errors
    res.status(500).json({
      message: "Failed to delete task"
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
