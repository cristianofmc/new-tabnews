import orchestrator from "#tests/orchestrator.js";
import session from "#models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("should not run pending migrations", async () => {
      const { response, body } = await orchestrator.request(
        "/api/v1/migrations",
        {
          method: "POST",
        },
      );

      const contentType = response.headers.get("content-type") || "";
      expect(contentType).toContain("application/json");

      expect(response.status).toBe(403);

      expect(body).toEqual({
        name: "ForbiddenError",
        message: "You do not have permission to perform this action.",
        action:
          "Please verify that your user has the 'create:migration' feature.",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("should not run pending migrations", async () => {
      const created_user = await orchestrator.createActivatedUser();
      const sessionObject = await orchestrator.createSession(created_user.id);
      const { response, body } = await orchestrator.request(
        "/api/v1/migrations",
        {
          method: "POST",
          headers: {
            Cookie: `${session.COOKIE_NAME}=${sessionObject.token}`,
          },
        },
      );

      const contentType = response.headers.get("content-type") || "";
      expect(contentType).toContain("application/json");

      expect(response.status).toBe(403);

      expect(body).toEqual({
        name: "ForbiddenError",
        message: "You do not have permission to perform this action.",
        action:
          "Please verify that your user has the 'create:migration' feature.",
        status_code: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("should not run pending migrations", async () => {
      const created_user = await orchestrator.createActivatedUser();
      await orchestrator.addFeaturesToUser(created_user, ["create:migration"]);
      const sessionObject = await orchestrator.createSession(created_user.id);
      const { response, body } = await orchestrator.request(
        "/api/v1/migrations",
        {
          method: "POST",
          headers: {
            Cookie: `${session.COOKIE_NAME}=${sessionObject.token}`,
          },
        },
      );

      const contentType = response.headers.get("content-type") || "";
      expect(contentType).toContain("application/json");

      expect(response.status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
    });
  });
});
