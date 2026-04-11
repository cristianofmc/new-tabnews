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
      const returnRequest = await orchestrator.request("/api/v1/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "SameJimmyFiveCase",
          email: "same_jimmyfive_case@host.testemail",
          password: "Test@123",
        }),
      });

      expect(returnRequest.response.status).toBe(201);

      const returnRequest2 = await orchestrator.request(
        "/api/v1/users/SameJimmyFiveCase",
      );
      expect(returnRequest2.response.status).toBe(200);

      const body = returnRequest2.body;
      expect(body).toEqual({
        id: body.id,
        username: "SameJimmyFiveCase",
        email: "same_jimmyfive_case@host.testemail",
        password: "Test@123",
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBe(NaN);
      expect(Date.parse(body.updated_at)).not.toBe(NaN);
    });
  });
});
