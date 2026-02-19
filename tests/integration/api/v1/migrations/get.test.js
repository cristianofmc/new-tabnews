import { query } from "infra/database";

beforeAll(cleanDatabase);
async function cleanDatabase(){
  await query("drop schema public cascade; create schema public;");
}

async function getMigrations(){
  const response = await fetch("http://localhost:3000/api/v1/migrations");
  expect(response.status).toBe(200);

  const contentType = response.headers.get('content-type') || "";
  expect(contentType).toContain("application/json");

  const body = await response.json();
  return { response, body };
}

test("GET to /api/v1/migrations should return array", async () => {
  const { body } = await getMigrations();
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBeGreaterThan(0);
});
