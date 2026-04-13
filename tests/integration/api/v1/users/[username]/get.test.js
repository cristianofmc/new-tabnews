import orchestrator from "#tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("Username should match with exact case", async () => {
      const created_user = await orchestrator.createUser();

      const returnRequest = await orchestrator.request(
        `/api/v1/users/${created_user.username}`,
      );
      expect(returnRequest.response.status).toBe(200);

      const body = returnRequest.body;
      expect(body).toEqual({
        id: body.id,
        username: created_user.username,
        email: created_user.email,
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBe(NaN);
      expect(Date.parse(body.updated_at)).not.toBe(NaN);
    });

    test("Username should mismatch with case", async () => {
      const created_user = await orchestrator.createUser({
        username: "CaseJimmyFiveCase",
      });

      const returnRequest = await orchestrator.request(
        "/api/v1/users/casejimmyfivecase",
      );
      expect(returnRequest.response.status).toBe(200);

      const body = returnRequest.body;
      expect(body).toEqual({
        id: body.id,
        username: "casejimmyfivecase",
        email: created_user.email,
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBe(NaN);
      expect(Date.parse(body.updated_at)).not.toBe(NaN);
    });

    test("shouldn't find non existent username", async () => {
      const returnRequest = await orchestrator.request(
        "/api/v1/users/NonExistentUser",
      );

      expect(returnRequest.response.status).toBe(404);

      const body = returnRequest.body;
      expect(body).toEqual({
        name: "NotFoundError",
        message: "The username provided was not found.",
        action: "Please check that the username was entered correctly.",
        status_code: 404,
      });
    });
  });
});
