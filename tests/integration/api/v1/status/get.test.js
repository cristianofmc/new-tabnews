import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

async function getStatus() {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/v1/status`);
  const body = await response.json();

  return { response, body };
}

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("should return complete and valid system status", async () => {
      const { response, body } = await getStatus();

      // HTTP response
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain(
        "application/json",
      );
      expect(Object.keys(body).length).toBeGreaterThan(0);

      // Data validations
      const parsedUpdatedAt = new Date(body.updated_at);
      expect(parsedUpdatedAt.toString()).not.toBe("Invalid Date");
      expect(body.updated_at).toBe(parsedUpdatedAt.toISOString());

      // Database validations
      expect(body.database).toBeDefined();
      expect(body.database.server_version).toBe("18.3");
      expect(body.database.max_connections).toBe(100);

      // Database connection
      expect(body.database.current_connections).toBe(1);
    });
  });
});
