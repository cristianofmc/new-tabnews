import orchestrator from "#tests/orchestrator.js";
import session from "#models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("should not return complete and valid system status", async () => {
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
      expect(body.database).not.toHaveProperty("version");
      expect(body.database).not.toHaveProperty("environment");
      expect(body.database.max_connections).toBe(100);

      // Database connection
      expect(body.database.current_connections).toBe(1);
    });
  });

  describe("Privileged user", () => {
    test("should return complete and valid system status", async () => {
      const created_user = await orchestrator.createActivatedUser();
      await orchestrator.addFeaturesToUser(created_user, ["read:status:all"]);
      const sessionObject = await orchestrator.createSession(created_user.id);

      const { response, body } = await orchestrator.request("/api/v1/status", {
        headers: {
          Cookie: `${session.COOKIE_NAME}=${sessionObject.token}`,
        },
      });

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
      expect(body.database.environment).toBe("Local");
      expect(body.database.max_connections).toBe(100);

      // Database connection
      expect(body.database.current_connections).toBe(1);
    });
  });
});
