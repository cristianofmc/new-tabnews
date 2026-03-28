import { query } from "infra/database";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await cleanDatabase();
});

async function cleanDatabase() {
  await query("drop schema public cascade; create schema public;");
}

async function postMigrations() {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/v1/migrations`, {
    method: "POST",
  });

  const contentType = response.headers.get("content-type") || "";
  expect(contentType).toContain("application/json");

  const body = await response.json();
  return { response, body };
}

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("should run pending migrations on the first call", async () => {
      const { response, body } = await postMigrations();

      expect(response.status).toBe(201);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    test("should return an empty array on the second call", async () => {
      const { response, body } = await postMigrations();

      expect(response.status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });
  });
});
