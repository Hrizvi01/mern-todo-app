
// Import useState to manage the editing form for each task
import { useState } from "react";

// Receive the task and action functions from App.jsx as props
function TaskItem({ task, onToggle, onEdit, onDelete, disabled }) {
  // Track whether this task is currently being edited
  const [isEditing, setIsEditing] = useState(false);

  // Store the title while the user is editing it
  const [editTitle, setEditTitle] = useState(task.title);

  // Save the edited title when the form is submitted
  async function handleSave(event) {
    // Prevent the form from refreshing the browser
    event.preventDefault();

    // Remove unnecessary spaces from the new title
    const title = editTitle.trim();

    // Reject empty titles
    if (!title) return;

    // Avoid a database request if nothing has changed
    if (title === task.title) {
      setIsEditing(false);
      return;
    }

    // Ask App.jsx to save the title in MongoDB
    const success = await onEdit(task._id, title);

    // Close editing only if the database update succeeded
    if (success) {
      setIsEditing(false);
    }
  }

  // Cancel editing and restore the original task title
  function handleCancel() {
    setEditTitle(task.title);
    setIsEditing(false);
  }

  // Display either the editing form or the normal task row
  return (
    <div className="task-item">
      {/* Toggle completion status using the backend */}
      <input
        type="checkbox"
        checked={task.completed}
        disabled={disabled || isEditing}
        onChange={() => onToggle(task)}
        aria-label={`Complete ${task.title}`}
      />

      {isEditing ? (
        // Show an inline editing form
        <form className="edit-form" onSubmit={handleSave}>
          <input
            type="text"
            value={editTitle}
            disabled={disabled}
            onChange={(event) =>
              setEditTitle(event.target.value)
            }
            aria-label="Edit task title"
          />

          {/* Submit the updated title */}
          <button
            type="submit"
            className="save-btn"
            disabled={disabled || !editTitle.trim()}
          >
            Save
          </button>

          {/* Cancel without saving */}
          <button
            type="button"
            className="cancel-btn"
            disabled={disabled}
            onClick={handleCancel}
          >
            Cancel
          </button>
        </form>
      ) : (
        <>
          {/* Show the task title with completed styling */}
          <span className={task.completed ? "completed" : ""}>
            {task.title}
          </span>

          {/* Switch this task into editing mode */}
          <button
            type="button"
            className="edit-btn"
            disabled={disabled}
            onClick={() => {
              setEditTitle(task.title);
              setIsEditing(true);
            }}
          >
            Edit
          </button>

          {/* Ask App.jsx to delete the task from MongoDB */}
          <button
            type="button"
            className="delete-btn"
            disabled={disabled}
            onClick={() => onDelete(task._id)}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
}

// Export the component so App.jsx can reuse it
export default TaskItem;
