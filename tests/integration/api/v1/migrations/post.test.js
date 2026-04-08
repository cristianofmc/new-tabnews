import orchestrator from "#tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("should run pending migrations on the first call", async () => {
      const { response, body } = await orchestrator.request(
        "/api/v1/migrations",
        {
          method: "POST",
        },
      );

      const contentType = response.headers.get("content-type") || "";
      expect(contentType).toContain("application/json");

      expect(response.status).toBe(201);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    test("should return an empty array on the second call", async () => {
      const { response, body } = await orchestrator.request(
        "/api/v1/migrations",
        {
          method: "POST",
        },
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(0);
    });
  });
});
