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
          username: "Same_Jimmy_Five_Case",
          email: "same_jimmy_five_case@host.testemail",
          password: "Test@123",
        }),
      });

      expect(returnRequest.response.status).toBe(201);

      const returnRequest2 = await orchestrator.request(
        "/api/v1/users/same_Jimmy_five_case",
      );
      expect(returnRequest2.response.status).toBe(200);

      const body = returnRequest2.body;
      expect(body).toEqual({
        id: body.id,
        username: "same_jimmy_five_case",
        email: "same_jimmy_five_case@host.testemail",
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBe(NaN);
      expect(Date.parse(body.updated_at)).not.toBe(NaN);
    });

    test("Username should mismatch with case", async () => {
      const returnRequest = await orchestrator.request("/api/v1/users/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "CaseJimmyFiveCase",
          email: "case_jimmyfive_case@host.testemail",
          password: "Test@123",
        }),
      });

      expect(returnRequest.response.status).toBe(201);

      const returnRequest2 = await orchestrator.request(
        "/api/v1/users/casejimmyfivecase",
      );
      expect(returnRequest2.response.status).toBe(200);

      const body = returnRequest2.body;
      expect(body).toEqual({
        id: body.id,
        username: "casejimmyfivecase",
        email: "case_jimmyfive_case@host.testemail",
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
