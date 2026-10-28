const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const app = require("./server");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("task CRUD and middleware responses", async () => {
  const emptyList = await fetch(`${baseUrl}/tasks`);
  assert.equal(emptyList.status, 200);
  assert.deepEqual(await emptyList.json(), { data: [] });

  const missingContentType = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title: "Rejected task" }),
  });
  assert.equal(missingContentType.status, 415);

  const createdResponse = await fetch(`${baseUrl}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Write API tests" }),
  });
  assert.equal(createdResponse.status, 201);
  const { data: createdTask } = await createdResponse.json();
  assert.deepEqual(createdTask, {
    id: 1,
    title: "Write API tests",
    completed: false,
  });

  const updatedResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: true }),
  });
  assert.equal(updatedResponse.status, 200);
  assert.deepEqual((await updatedResponse.json()).data, {
    ...createdTask,
    completed: true,
  });

  const fetchedResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}`);
  assert.equal(fetchedResponse.status, 200);

  const invalidIdResponse = await fetch(`${baseUrl}/tasks/not-a-number`);
  assert.equal(invalidIdResponse.status, 400);

  const missingTaskResponse = await fetch(`${baseUrl}/tasks/999`);
  assert.equal(missingTaskResponse.status, 404);
  assert.deepEqual(await missingTaskResponse.json(), { error: "Task not found." });

  const unknownRouteResponse = await fetch(`${baseUrl}/unknown`);
  assert.equal(unknownRouteResponse.status, 404);
  assert.deepEqual(await unknownRouteResponse.json(), {
    error: "Route not found.",
    path: "/unknown",
  });

  const deletedResponse = await fetch(`${baseUrl}/tasks/${createdTask.id}`, {
    method: "DELETE",
  });
  assert.equal(deletedResponse.status, 200);
  assert.equal((await deletedResponse.json()).data.id, createdTask.id);
});