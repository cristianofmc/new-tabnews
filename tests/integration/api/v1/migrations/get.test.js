import orchestrator from "#tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("should return an array with pending migrations", async () => {
      const { response, body } =
        await orchestrator.request("/api/v1/migrations");

      const contentType = response.headers.get("content-type") || "";
      expect(contentType).toContain("application/json");

      // HTTP response status
      expect(response.status).toBe(200);

      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });
  });
});
