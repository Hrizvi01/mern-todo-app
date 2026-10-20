
// Import useState so React can remember changing values
import { useState } from "react";

// Import our CSS file to style the application
import "./App.css";

// Create the main App component
function App() {

  // Store the text the user types into the input
  const [taskInput, setTaskInput] = useState("");

  // Store our tasks temporarily in React state
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Learn React basics",
      completed: false
    },
    {
      id: 2,
      title: "Build a Todo App",
      completed: false
    }
  ]);

  // Run this function when the user adds a task
  function addTask(event) {

    // Prevent the form from refreshing the page
    event.preventDefault();

    // Reject empty task titles
    if (!taskInput.trim()) {
      return;
    }

    // Create a new task object
    const newTask = {
      id: crypto.randomUUID(),
      title: taskInput.trim(),
      completed: false
    };

    // Add the new task to the existing tasks array
    setTasks([...tasks, newTask]);

    // Clear the input after adding the task
    setTaskInput("");
  }

  // Change a task from incomplete to complete or vice versa
  function toggleTask(id) {

    // Create a new array with the updated task
    const updatedTasks = tasks.map((task) => {

      // Find the task that the user clicked
      if (task.id === id) {
        return {
          ...task,
          completed: !task.completed
        };
      }

      // Keep all other tasks unchanged
      return task;
    });

    // Update React state so the screen changes
    setTasks(updatedTasks);
  }

  // Delete a task using its ID
  function deleteTask(id) {

    // Keep every task except the one being deleted
    const remainingTasks = tasks.filter(
      (task) => task.id !== id
    );

    // Update the screen with the remaining tasks
    setTasks(remainingTasks);
  }

  // Edit the title of an existing task
  function editTask(id) {

    // Find the task the user wants to edit
    const taskToEdit = tasks.find((task) => task.id === id);

    // Stop if the task does not exist
    if (!taskToEdit) {
      return;
    }

    // Ask the user to enter a new task title
    const newTitle = window.prompt(
      "Edit your task:",
      taskToEdit.title
    );

    // Stop if the user cancels or enters an empty title
    if (newTitle === null || !newTitle.trim()) {
      return;
    }

    // Create a new array with the edited title
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? { ...task, title: newTitle.trim() }
        : task
    );

    // Update React state to display the new title
    setTasks(updatedTasks);
  }

  // Count how many tasks have been completed
  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  // Calculate the completion percentage for our progress bar
  const progress = tasks.length === 0
    ? 0
    : (completedCount / tasks.length) * 100;

  // Return the UI that React should render
  return (
    <div className="app-container">

      {/* Main heading */}
      <header className="app-header">
        <h1>My Tasks</h1>
        <p>Stay organized, one task at a time.</p>
      </header>

      {/* Display the number of completed tasks */}
      <div className="progress-section">
        <p>
          {completedCount} of {tasks.length} tasks completed
        </p>

        {/* Show progress using a dynamically sized bar */}
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form for adding new tasks */}
      <form onSubmit={addTask} className="task-form">

        {/* Controlled input: its value comes from React state */}
        <input
          type="text"
          placeholder="What needs to be done?"
          value={taskInput}
          onChange={(event) =>
            setTaskInput(event.target.value)
          }
        />

        {/* Submitting this button runs addTask */}
        <button type="submit">
          Add Task
        </button>
      </form>

      {/* Display the list of tasks */}
      <div className="task-list">

        {/* Show a message if there are no tasks */}
        {tasks.length === 0 && (
          <p className="empty-message">
            No tasks yet. Add your first task!
          </p>
        )}

        {/* Loop through tasks and display each one */}
        {tasks.map((task) => (
          <div
            key={task.id}
            className="task-item"
          >

            {/* Checkbox for completing or reopening a task */}
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
            />

            {/* Apply completed styling when appropriate */}
            <span
              className={
                task.completed ? "completed" : ""
              }
            >
              {task.title}
            </span>

            {/* Button for editing the task */}
            <button
              type="button"
              className="edit-btn"
              onClick={() => editTask(task.id)}
            >
              Edit
            </button>

            {/* Button for deleting the task */}
            <button
              type="button"
              className="delete-btn"
              onClick={() => deleteTask(task.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export App so main.jsx can render it
export default App;
