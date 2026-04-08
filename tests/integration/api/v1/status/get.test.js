import orchestrator from "#tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("should return complete and valid system status", async () => {
      const { response, body } = await orchestrator.request("/api/v1/status");

      // HTTP response
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain(
        "application/json",
      );
      expect(Object.keys(body).length).toBeGreaterThan(0);

      // Data validations
      const updatedAt = body.updated_at;
      const parsedUpdatedAt = new Date(updatedAt);
      expect(parsedUpdatedAt.toString()).not.toBe("Invalid Date");
      expect(updatedAt).toBe(parsedUpdatedAt.toISOString());

      // Database validations
      expect(body.database).toBeDefined();
      expect(body.database.server_version).toBe("18.3");
      expect(body.database.max_connections).toBe(100);

      // Database connection
      expect(body.database.current_connections).toBe(1);
    });
  });
});
