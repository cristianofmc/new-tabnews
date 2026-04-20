import orchestrator from "#tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import { vi } from "vitest";
import session from "#models/session.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("Should receive valid session", async () => {
      const created_user = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(created_user.id);

      const { response, body } = await orchestrator.request(`/api/v1/user`, {
        headers: {
          Cookie: `__Host-session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      expect(body).toEqual({
        id: created_user.id,
        username: created_user.username,
        email: created_user.email,
        password: created_user.password,
        created_at: created_user.created_at.toISOString(),
        updated_at: created_user.updated_at.toISOString(),
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBe(NaN);
      expect(Date.parse(body.updated_at)).not.toBe(NaN);
    });

    test("Should not receive a valid session with nonexistent token", async () => {
      const nonexistentToken =
        "971a0a9446464fb8e242a99b690336ec0ce1b36de1c1a6d48d3c46db968ea36eaa5806db4bc784ebe42f5988d5fdc14e";
      const { response, body } = await orchestrator.request(`/api/v1/user`, {
        headers: {
          Cookie: `__Host-session_id=${nonexistentToken}`,
        },
      });

      expect(response.status).toBe(401);

      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "The user does not have an active session.",
        action: "Please check if this user is logged in and try again.",
        status_code: 401,
      });
    });

    test("Should not receive a valid session after the expiration date", async () => {
      vi.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const created_user = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(created_user.id);

      vi.useRealTimers();

      const { response, body } = await orchestrator.request(`/api/v1/user`, {
        headers: {
          Cookie: `__Host-session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(401);

      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "The user does not have an active session.",
        action: "Please check if this user is logged in and try again.",
        status_code: 401,
      });
    });
  });
});
