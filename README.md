# Task Manager API

A RESTful task management API built with Node.js and Express. Tasks are stored in memory and reset when the server restarts.

## Requirements

- Node.js 18 or newer
- npm

## Run

```bash
npm install
npm start
```

The API listens on port `5000` by default. Set the `PORT` environment variable to use a different port.

## Endpoints

| Method | Path | Description | Success status |
| --- | --- | --- | --- |
| GET | `/tasks` | List all tasks | 200 |
| GET | `/tasks/:id` | Get one task | 200 |
| POST | `/tasks` | Create a task | 201 |
| PUT | `/tasks/:id` | Update a task | 200 |
| DELETE | `/tasks/:id` | Delete a task | 200 |

POST and PUT require `Content-Type: application/json`. A task needs a non-empty `title`; `completed` is optional and defaults to `false`.

Example create request:

```json
{
  "title": "Review REST API concepts",
  "completed": false
}
```

The server logs each request's method, URL, and timestamp. Invalid task IDs return 400, missing tasks and routes return structured 404 responses, and unexpected errors are handled by the final global error middleware without exposing stack traces to clients.