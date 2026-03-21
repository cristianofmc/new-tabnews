import { query } from "infra/database";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  cleanDatabase();
});

beforeAll(cleanDatabase);
async function cleanDatabase() {
  await query("drop schema public cascade; create schema public;");
}

async function postMigrations() {
  const response = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  const contentType = response.headers.get("content-type") || "";
  expect(contentType).toContain("application/json");

  const body = await response.json();
  return { response, body };
}

test("POST to /api/v1/migrations should return array", async () => {
  const { response, body } = await postMigrations();
  expect(response.status).toBe(201);
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
});

test("POST to /api/v1/migrations for the second time, should return nothing", async () => {
  const { response, body } = await postMigrations();
  expect(response.status).toBe(200);
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(0);
});
