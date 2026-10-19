
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Temporary task storage
let tasks = [];

// Homepage API
app.get("/", (req, res) => {
  res.send("Todo API is running!");
});

// Get all tasks

app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      message: "Task title is required"
    });
  }

  const newTask = {
    id: Date.now(),
    title: title.trim(),
    completed: false
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

app.get("/tasks", (req, res) => {
  res.json(tasks);
});


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
