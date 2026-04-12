import orchestrator from "#tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("should update an existing user with valid data", async () => {
      await orchestrator.request("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "OriginalJimmyFive",
          email: "original_jimmy_five@host.testemail",
          password: "Test@123",
        }),
      });

      const { response, body } = await orchestrator.request(
        "/api/v1/users/originalJimmyFive",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "updatedJimmyFive",
            email: "updated_jimmy_five@host.testemail",
          }),
        },
      );

      expect(response.status).toBe(200);

      expect(body).toEqual({
        id: body.id,
        username: "updatedJimmyFive",
        email: "updated_jimmy_five@host.testemail",
        password: "Test@123",
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBe(NaN);
      expect(new Date(body.updated_at).getTime()).toBeGreaterThan(
        new Date(body.created_at).getTime(),
      );
    });

    test("should not update to an email that is already in use by another user", async () => {
      await orchestrator.request("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "AnotherJimmyFive",
          email: "conflict@jimmy.five",
          password: "TestPassword123",
        }),
      });

      const { response, body } = await orchestrator.request(
        "/api/v1/users/UpdatedJimmyFive",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "conflict@jimmy.five",
          }),
        },
      );

      expect(response.status).toBe(400);
      expect(body).toEqual({
        name: "ValidationError",
        message: "The email address provided is already registered.",
        action: "Try again with a different email.",
        status_code: 400,
      });
    });

    test("should not update to a username that is already in use by another user", async () => {
      const { response, body } = await orchestrator.request(
        "/api/v1/users/UpdatedJimmyFive",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "AnotherJimmyFive",
          }),
        },
      );

      expect(response.status).toBe(400);
      expect(body).toEqual({
        name: "ValidationError",
        message: "The username provided is already registered.",
        action: "Try again with a different username.",
        status_code: 400,
      });
    });

    test("should return 404 when updating a non-existent user", async () => {
      const { response, body } = await orchestrator.request(
        "/api/v1/users/GhostJimmyFive",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "WillNeverExist",
          }),
        },
      );

      expect(response.status).toBe(404);
      expect(body.name).toBe("NotFoundError");
    });
  });
});
