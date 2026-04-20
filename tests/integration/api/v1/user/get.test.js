import orchestrator from "#tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("Username get valid session", async () => {
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
  });
});
