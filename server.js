const express = require("express");

const app = express();
const port = process.env.PORT || 5000;

let nextTaskId = 1;
const tasks = [];

app.use((request, response, next) => {
  console.log(`${request.method} ${request.originalUrl} - ${new Date().toISOString()}`);
  next();
});

app.use(express.json());

app.use((request, response, next) => {
  if (["POST", "PUT"].includes(request.method) && !request.is("application/json")) {
    return response.status(415).json({
      error: "Content-Type must be application/json.",
    });
  }

  next();
});

app.param("id", (request, response, next, id) => {
  if (!/^\d+$/.test(id) || Number(id) < 1) {
    return response.status(400).json({ error: "Task ID must be a positive integer." });
  }

  request.taskId = Number(id);
  next();
});

app.get("/tasks", (request, response) => {
  response.status(200).json({ data: tasks });
});

app.get("/tasks/:id", (request, response, next) => {
  const task = tasks.find((item) => item.id === request.taskId);
  if (!task) {
    return next(Object.assign(new Error("Task not found."), { status: 404 }));
  }

  response.status(200).json({ data: task });
});

app.post("/tasks", (request, response, next) => {
  const { title, completed = false } = request.body ?? {};
  if (typeof title !== "string" || title.trim() === "") {
    return response.status(400).json({ error: "Task title is required." });
  }
  if (typeof completed !== "boolean") {
    return response.status(400).json({ error: "Task completed must be a boolean." });
  }

  const task = { id: nextTaskId++, title: title.trim(), completed };
  tasks.push(task);
  response.status(201).json({ data: task });
});

app.put("/tasks/:id", (request, response, next) => {
  const task = tasks.find((item) => item.id === request.taskId);
  if (!task) {
    return next(Object.assign(new Error("Task not found."), { status: 404 }));
  }

  const { title, completed } = request.body ?? {};
  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    return response.status(400).json({ error: "Task title must be a non-empty string." });
  }
  if (completed !== undefined && typeof completed !== "boolean") {
    return response.status(400).json({ error: "Task completed must be a boolean." });
  }
  if (title === undefined && completed === undefined) {
    return response.status(400).json({ error: "Provide a title or completed value to update." });
  }

  if (title !== undefined) task.title = title.trim();
  if (completed !== undefined) task.completed = completed;
  response.status(200).json({ data: task });
});

app.delete("/tasks/:id", (request, response, next) => {
  const taskIndex = tasks.findIndex((item) => item.id === request.taskId);
  if (taskIndex === -1) {
    return next(Object.assign(new Error("Task not found."), { status: 404 }));
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);
  response.status(200).json({ data: deletedTask, message: "Task deleted." });
});

app.use((request, response) => {
  response.status(404).json({
    error: "Route not found.",
    path: request.originalUrl,
  });
});

app.use((error, request, response, next) => {
  console.error(error.stack || error.message);
  const status = Number.isInteger(error.status) ? error.status : 500;
  response.status(status).json({
    error: status === 500 ? "Internal server error." : error.message,
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Task Manager API running at http://localhost:${port}`);
  });
}

module.exports = app;