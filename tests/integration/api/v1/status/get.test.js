import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

async function getStatus() {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const contentType = response.headers.get("content-type") || "";
  expect(contentType).toContain("application/json");

  const body = await response.json();
  return { response, body };
}

test("GET to /api/v1/status should return data", async () => {
  const { body } = await getStatus();
  expect(Object.keys(body).length).toBeGreaterThan(0);
});

test("GET to /api/v1/status data must have 'updated_at' key with value in ISO", async () => {
  const { body } = await getStatus();

  const date = new Date(body.updated_at);
  expect(date.toString()).not.toBe("Invalid Date");
  expect(body.updated_at).toBe(date.toISOString());
});

test("GET to /api/v1/status data must have 'database'", async () => {
  const { body } = await getStatus();

  expect(body).toHaveProperty("database");
  expect(body.database).toBeTruthy();
});

test("GET to /api/v1/status data from database must have the server expected propreties", async () => {
  const { body } = await getStatus();

  expect(body.database.server_version).toBeTruthy();
  expect(body.database.server_version).toBe("18.1");
});

test("GET to /api/v1/status data from database must have max_connections", async () => {
  const { body } = await getStatus();

  expect(body.database.max_connections).toBeTruthy();
  expect(body.database.max_connections).toBe(100);
});

test("GET to /api/v1/status data from database must have current_connections", async () => {
  const { body } = await getStatus();

  expect(body.database.current_connections).toBeTruthy();
  expect(body.database.current_connections).toBe(1);
});
