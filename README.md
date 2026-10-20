
# TaskFlow — MERN Stack To-Do Application

A full-stack To-Do application built using MongoDB,
Express.js, React.js, and Node.js.

## Features

- Create new tasks
- View all tasks
- Edit task titles
- Mark tasks as completed or active
- Delete tasks
- Filter tasks by status
- Clear completed tasks
- View task completion progress
- Store tasks permanently in MongoDB
- Responsive user interface

## Tech Stack

**Frontend:** React, Vite, Axios, CSS

**Backend:** Node.js, Express.js, Mongoose

**Database:** MongoDB Atlas

**Version Control:** Git and GitHub

## Project Structure

mern-todo/
  backend/
    models/
      Task.js
    server.js
    .env.example

  frontend/
    src/
      api/
        tasks.js
      components/
        TaskItem.jsx
      App.jsx
      App.css
      index.css

## Getting Started

### Backend

1. Open the backend folder.
2. Run `npm install`.
3. Create a `.env` file using `.env.example`.
4. Add your MongoDB connection string.
5. Run `node server.js`.

The backend runs on http://localhost:5000.

### Frontend

1. Open the frontend folder.
2. Run `npm install`.
3. Run `npm run dev`.

Open the local URL shown by Vite.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | Get all tasks |
| POST | /tasks | Create a task |
| PUT | /tasks/:id | Update a task |
| DELETE | /tasks/:id | Delete a task |

## Future Improvements

- User authentication
- Task deadlines and priorities
- Search functionality
- Deployment
- Automated testing
