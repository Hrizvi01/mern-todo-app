
// Import Axios so we can send HTTP requests to Express
import axios from "axios";

// Create a reusable Axios client for our backend
const api = axios.create({
  // Read the backend address from Vite environment variables.
  // If it isn't provided, use our local Express server.
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:5000",

  // Set a timeout so requests don't wait forever
  timeout: 10000,
});

// GET: request all tasks stored in MongoDB
export const getTasks = () => api.get("/tasks");

// POST: send a new task title to the backend
export const createTask = (title) =>
  api.post("/tasks", { title });

// PUT: update a task's title or completion status
export const updateTask = (id, updates) =>
  api.put(`/tasks/${id}`, updates);

// DELETE: remove a task from MongoDB
export const removeTask = (id) =>
  api.delete(`/tasks/${id}`);
