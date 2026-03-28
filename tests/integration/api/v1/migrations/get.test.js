import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
});

async function getMigrations() {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/v1/migrations`);

  const contentType = response.headers.get("content-type") || "";
  expect(contentType).toContain("application/json");

  const body = await response.json();
  return { response, body };
}

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("should return an array with pending migrations", async () => {
      const { response, body } = await getMigrations();

      expect(response.status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });
  });
});
