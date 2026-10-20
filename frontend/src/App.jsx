
// Import React Hooks for managing state and loading data
import { useEffect, useState } from "react";

// Import our reusable backend API functions
import {
  getTasks,
  createTask,
  updateTask,
  removeTask,
} from "./api/tasks";

// Import our existing CSS from Lesson 5
import "./App.css";

// Create the main React component
function App() {
  // Store the text entered in the Add Task input
  const [taskInput, setTaskInput] = useState("");

  // Store tasks returned by MongoDB through our API
  const [tasks, setTasks] = useState([]);

  // Track whether the first task request is loading
  const [loading, setLoading] = useState(true);

  // Store a message when an API request fails
  const [error, setError] = useState("");

  // Disable the Add button while a task is being saved
  const [adding, setAdding] = useState(false);

  // Track which task is currently being updated or deleted
  const [busyTaskId, setBusyTaskId] = useState(null);

  // Load saved tasks when the component first appears
  useEffect(() => {
    // Prevent outdated responses from changing state
    // after this effect has been cleaned up
    let ignore = false;

    // Define an async function for fetching tasks
    async function loadTasks() {
      try {
        // Request the saved tasks from Express
        const response = await getTasks();

        // Axios places the response JSON inside .data
        if (!ignore) {
          setTasks(response.data);
        }
      } catch (err) {
        // Show a useful message if the backend cannot be reached
        if (!ignore) {
          console.error("Failed to load tasks:", err);
          setError("Could not load tasks. Check your backend.");
        }
      } finally {
        // Stop displaying the loading message
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    // Execute our task-loading function
    loadTasks();

    // Ignore old responses if the effect is cleaned up
    return () => {
      ignore = true;
    };
  }, []);

  // Create a new task when the form is submitted
  async function addTask(event) {
    // Prevent the browser from refreshing the page
    event.preventDefault();

    // Remove unnecessary spaces from the input
    const title = taskInput.trim();

    // Reject an empty title or duplicate submission
    if (!title || adding) {
      return;
    }

    // Clear previous error messages
    setError("");

    // Show that the request is in progress
    setAdding(true);

    try {
      // Send the new title to our Express POST API
      const response = await createTask(title);

      // MongoDB generates an _id for the saved task.
      // Add the saved task to our current React state.
      setTasks((previousTasks) => [
        ...previousTasks,
        response.data,
      ]);

      // Clear the input after the task is saved
      setTaskInput("");
    } catch (err) {
      // Keep the input so the user can try again
      console.error("Failed to add task:", err);
      setError("Could not add task. Please try again.");
    } finally {
      // Enable the Add button again
      setAdding(false);
    }
  }

  // Toggle a task between complete and incomplete
  async function toggleTask(task) {
    // Prevent overlapping operations on the same task
    if (busyTaskId !== null) {
      return;
    }

    // Mark this task as being updated
    setBusyTaskId(task._id);
    setError("");

    try {
      // Send the opposite completion status to Express
      const response = await updateTask(task._id, {
        completed: !task.completed,
      });

      // Replace the old task with the updated MongoDB task
      setTasks((previousTasks) =>
        previousTasks.map((currentTask) =>
          currentTask._id === task._id
            ? response.data
            : currentTask
        )
      );
    } catch (err) {
      // Show an error if MongoDB couldn't save the change
      console.error("Failed to update task:", err);
      setError("Could not update task.");
    } finally {
      // Allow task operations again
      setBusyTaskId(null);
    }
  }

  // Edit an existing task title
  async function editTask(task) {
    // Prevent overlapping task operations
    if (busyTaskId !== null) {
      return;
    }

    // Ask the user for the replacement title.
    // We'll improve this prompt in Lesson 7.
    const newTitle = window.prompt(
      "Edit your task:",
      task.title
    );

    // Stop if the user cancels or submits an empty title
    if (newTitle === null || !newTitle.trim()) {
      return;
    }

    // Avoid an unnecessary API request if nothing changed
    if (newTitle.trim() === task.title) {
      return;
    }

    // Mark this task as busy while saving
    setBusyTaskId(task._id);
    setError("");

    try {
      // Send the updated title to the Express PUT API
      const response = await updateTask(task._id, {
        title: newTitle.trim(),
      });

      // Replace the matching task with the saved version
      setTasks((previousTasks) =>
        previousTasks.map((currentTask) =>
          currentTask._id === task._id
            ? response.data
            : currentTask
        )
      );
    } catch (err) {
      // Preserve the old title if the request fails
      console.error("Failed to edit task:", err);
      setError("Could not edit task.");
    } finally {
      // Re-enable task actions
      setBusyTaskId(null);
    }
  }

  // Delete a task from MongoDB
  async function deleteTask(id) {
    // Prevent overlapping task operations
    if (busyTaskId !== null) {
      return;
    }

    // Ask for confirmation before permanent deletion
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    // Stop if the user chooses Cancel
    if (!confirmed) {
      return;
    }

    // Mark the task as busy during deletion
    setBusyTaskId(id);
    setError("");

    try {
      // Request permanent deletion from MongoDB
      await removeTask(id);

      // Remove the deleted task from the React interface
      setTasks((previousTasks) =>
        previousTasks.filter((task) => task._id !== id)
      );
    } catch (err) {
      // Keep the task visible if deletion fails
      console.error("Failed to delete task:", err);
      setError("Could not delete task.");
    } finally {
      // Allow new task operations
      setBusyTaskId(null);
    }
  }

  // Count the number of completed tasks
  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  // Calculate the percentage shown in the progress bar
  const progress =
    tasks.length === 0
      ? 0
      : (completedCount / tasks.length) * 100;

  // Render the To-Do application
  return (
    <div className="app-container">
      {/* Display our application heading */}
      <header className="app-header">
        <h1>My Tasks</h1>
        <p>Stay organized, one task at a time.</p>
      </header>

      {/* Display how many tasks are completed */}
      <div className="progress-section">
        <p>
          {completedCount} of {tasks.length} tasks completed
        </p>

        {/* Fill the progress bar according to completion */}
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Display API errors without removing the task list */}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {/* Submit new tasks to our Express backend */}
      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={taskInput}
          onChange={(event) =>
            setTaskInput(event.target.value)
          }
        />

        {/* Disable the button while saving or for empty input */}
        <button
          type="submit"
          disabled={adding || !taskInput.trim()}
        >
          {adding ? "Adding..." : "Add Task"}
        </button>
      </form>

      {/* Show a loading message while fetching initial data */}
      {loading ? (
        <p className="empty-message">Loading tasks...</p>
      ) : (
        <div className="task-list">
          {/* Show this message only when no tasks exist */}
          {tasks.length === 0 && (
            <p className="empty-message">
              No tasks yet. Add your first task!
            </p>
          )}

          {/* Render each task returned from MongoDB */}
          {tasks.map((task) => (
            <div
              key={task._id}
              className="task-item"
            >
              {/* Toggle the completion status in MongoDB */}
              <input
                type="checkbox"
                checked={task.completed}
                disabled={busyTaskId !== null}
                onChange={() => toggleTask(task)}
                aria-label={`Complete ${task.title}`}
              />

              {/* Cross out the title when the task is completed */}
              <span
                className={
                  task.completed ? "completed" : ""
                }
              >
                {task.title}
              </span>

              {/* Update the task title through our PUT API */}
              <button
                type="button"
                className="edit-btn"
                disabled={busyTaskId !== null}
                onClick={() => editTask(task)}
              >
                Edit
              </button>

              {/* Permanently delete the task through our API */}
              <button
                type="button"
                className="delete-btn"
                disabled={busyTaskId !== null}
                onClick={() => deleteTask(task._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Export App so main.jsx can render it
export default App;
