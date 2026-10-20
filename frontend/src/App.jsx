
// Import React Hooks for state and data loading
import { useEffect, useState } from "react";

// Import API functions that communicate with Express
import {
  getTasks,
  createTask,
  updateTask,
  removeTask,
} from "./api/tasks";

// Import our reusable task component
import TaskItem from "./components/TaskItem";

// Import the application's CSS styles
import "./App.css";

function App() {
  // Store the text entered into the new-task input
  const [taskInput, setTaskInput] = useState("");

  // Store tasks returned from our MongoDB backend
  const [tasks, setTasks] = useState([]);

  // Track the selected filter: all, active, or completed
  const [filter, setFilter] = useState("all");

  // Track loading and API errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Prevent duplicate task creation requests
  const [adding, setAdding] = useState(false);

  // Track IDs of tasks currently being modified
  const [busyIds, setBusyIds] = useState([]);

  // Track whether Clear Completed is currently running
  const [clearing, setClearing] = useState(false);

  // Load saved tasks when the application first opens
  useEffect(() => {
    // Ignore responses from an effect that has been cleaned up
    let ignore = false;

    async function loadTasks() {
      try {
        // Request all saved tasks from Express
        const response = await getTasks();

        // Store the MongoDB tasks in React state
        if (!ignore) {
          setTasks(response.data);
        }
      } catch (err) {
        // Display an error if the request fails
        if (!ignore) {
          console.error(err);
          setError("Could not load tasks. Check your backend.");
        }
      } finally {
        // Stop showing the loading indicator
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    // Run the asynchronous loading function
    loadTasks();

    // Prevent stale responses from updating state
    return () => {
      ignore = true;
    };
  }, []);

  // Add a task to MongoDB
  async function addTask(event) {
    // Prevent the browser from refreshing the page
    event.preventDefault();

    // Remove extra spaces from the entered title
    const title = taskInput.trim();

    // Reject empty titles and repeated submissions
    if (!title || adding || clearing) return;

    setAdding(true);
    setError("");

    try {
      // Send the task title to the Express POST endpoint
      const response = await createTask(title);

      // Add the saved MongoDB task to the current list
      setTasks((previous) => [...previous, response.data]);

      // Clear the input after a successful save
      setTaskInput("");
    } catch (err) {
      // Preserve the entered title if saving fails
      console.error(err);
      setError("Failed to add task.");
    } finally {
      // Re-enable the Add button
      setAdding(false);
    }
  }

  // Toggle a task's completed status
  async function toggleTask(task) {
    // Ignore repeated clicks while the task is busy
    if (busyIds.includes(task._id) || clearing) return;

    // Mark the task as busy
    setBusyIds((previous) => [...previous, task._id]);
    setError("");

    try {
      // Update completion status in MongoDB
      const response = await updateTask(task._id, {
        completed: !task.completed,
      });

      // Replace the old task with the saved task
      setTasks((previous) =>
        previous.map((item) =>
          item._id === task._id ? response.data : item
        )
      );
    } catch (err) {
      // Keep the old state when the API fails
      console.error(err);
      setError("Failed to update task.");
    } finally {
      // Mark the task as available again
      setBusyIds((previous) =>
        previous.filter((id) => id !== task._id)
      );
    }
  }

  // Save a task title from the inline editing form
  async function editTask(id, title) {
    // Prevent overlapping requests for the same task
    if (busyIds.includes(id) || clearing) return false;

    // Mark the task as busy
    setBusyIds((previous) => [...previous, id]);
    setError("");

    try {
      // Send the edited title to our Express PUT API
      const response = await updateTask(id, { title });

      // Update the task shown in React
      setTasks((previous) =>
        previous.map((task) =>
          task._id === id ? response.data : task
        )
      );

      // Tell TaskItem that saving succeeded
      return true;
    } catch (err) {
      // Tell TaskItem to keep its editing form open
      console.error(err);
      setError("Failed to edit task.");
      return false;
    } finally {
      // Allow further actions on this task
      setBusyIds((previous) =>
        previous.filter((taskId) => taskId !== id)
      );
    }
  }

  // Delete one task from MongoDB
  async function deleteTask(id) {
    // Prevent overlapping requests
    if (busyIds.includes(id) || clearing) return;

    // Ask for confirmation before permanent deletion
    if (!window.confirm("Delete this task?")) return;

    // Mark this task as busy
    setBusyIds((previous) => [...previous, id]);
    setError("");

    try {
      // Remove the task using our Express DELETE API
      await removeTask(id);

      // Remove the deleted task from the displayed list
      setTasks((previous) =>
        previous.filter((task) => task._id !== id)
      );
    } catch (err) {
      // Keep the task visible if deletion fails
      console.error(err);
      setError("Failed to delete task.");
    } finally {
      // Remove the task ID from the busy list
      setBusyIds((previous) =>
        previous.filter((taskId) => taskId !== id)
      );
    }
  }

  // Delete every completed task from MongoDB
  async function clearCompleted() {
    // Prevent clearing while other operations are running
    if (clearing || busyIds.length > 0 || adding) return;

    // Find tasks that have been marked completed
    const completedTasks = tasks.filter(
      (task) => task.completed
    );

    // Stop when there are no completed tasks
    if (completedTasks.length === 0) return;

    // Confirm the user wants to delete these tasks
    if (!window.confirm("Delete all completed tasks?")) {
      return;
    }

    setClearing(true);
    setError("");

    // Track IDs successfully deleted from MongoDB
    const deletedIds = [];

    try {
      // Delete tasks one at a time using our existing API
      for (const task of completedTasks) {
        await removeTask(task._id);

        // Remember each successfully deleted task
        deletedIds.push(task._id);

        // Immediately remove it from the React list
        setTasks((previous) =>
          previous.filter((item) => item._id !== task._id)
        );
      }
    } catch (err) {
      // Earlier successful deletions remain deleted
      console.error(err);
      setError(
        "Some tasks could not be deleted. Please try again."
      );
    } finally {
      // Finish the bulk deletion operation
      setClearing(false);
    }
  }

  // Count completed tasks for the progress display
  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  // Count how many tasks are still active
  const activeCount = tasks.length - completedCount;

  // Calculate the percentage of completed tasks
  const progress = tasks.length
    ? (completedCount / tasks.length) * 100
    : 0;

  // Filter tasks based on the selected category
  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  // Render the final application interface
  return (
    <main className="app-container">
      {/* Display the app's name and subtitle */}
      <header className="app-header">
        <h1>TaskFlow ✓</h1>
        <p>Make every day productive.</p>
      </header>

      {/* Show the completion progress */}
      <section className="progress-section">
        <div className="progress-label">
          <span>Your progress</span>
          <strong>{Math.round(progress)}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p>
          {completedCount} of {tasks.length} tasks completed
        </p>
      </section>

      {/* Display API errors without hiding tasks */}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}

      {/* Form for adding a new task */}
      <form className="task-form" onSubmit={addTask}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={taskInput}
          onChange={(event) =>
            setTaskInput(event.target.value)
          }
          aria-label="New task title"
        />

        <button
          type="submit"
          disabled={!taskInput.trim() || adding || clearing}
        >
          {adding ? "Adding..." : "+ Add Task"}
        </button>
      </form>

      {/* Buttons for filtering the task list */}
      <div className="filter-buttons">
        {["all", "active", "completed"].map((option) => (
          <button
            key={option}
            type="button"
            className={filter === option ? "selected" : ""}
            onClick={() => setFilter(option)}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Show tasks or the appropriate empty message */}
      {loading ? (
        <p className="empty-message">Loading tasks...</p>
      ) : (
        <div className="task-list">
          {visibleTasks.length === 0 && (
            <p className="empty-message">
              {filter === "all"
                ? "No tasks yet. Add your first task!"
                : "No tasks in this category."}
            </p>
          )}

          {/* Render each task using our reusable component */}
          {visibleTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={toggleTask}
              onEdit={editTask}
              onDelete={deleteTask}
              disabled={
                busyIds.includes(task._id) || clearing
              }
            />
          ))}
        </div>
      )}

      {/* Display remaining tasks and bulk delete action */}
      <footer className="app-footer">
        <span>{activeCount} active tasks</span>

        <button
          type="button"
          onClick={clearCompleted}
          disabled={
            completedCount === 0 ||
            clearing ||
            adding ||
            busyIds.length > 0
          }
        >
          {clearing ? "Clearing..." : "Clear Completed"}
        </button>
      </footer>
    </main>
  );
}

// Export the component for main.jsx
export default App;
