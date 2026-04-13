import orchestrator from "#tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "#models/user.js";
import password from "#models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("should create a new user account with unique and valid data", async () => {
      const { response, body } = await orchestrator.request("/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "jimmyfive",
          email: "jimmyfive@host.testemail",
          password: "Test@123",
        }),
      });

      expect(response.status).toBe(201);

      expect(body).toEqual({
        id: body.id,
        username: "jimmyfive",
        email: "jimmyfive@host.testemail",
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBe(NaN);
      expect(Date.parse(body.updated_at)).not.toBe(NaN);

      const userInDatabase = await user.findOneByUsername("jimmyfive");
      const correctPasswordMatch = await password.compare(
        "Test@123",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);

      const incorrectPasswordMatch = await password.compare(
        "incorrectPassword",
        userInDatabase.password,
      );

      expect(incorrectPasswordMatch).toBe(false);
    });

    test("should not create a new user account with duplicated email", async () => {
      const returnRequest = await orchestrator.request("/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "first_jimmyfive",
          email: "duplicated_email_jimmyfive@host.testemail",
          password: "Test@123",
        }),
      });

      expect(returnRequest.response.status).toBe(201);

      const returnRequest2 = await orchestrator.request("/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "second_jimmyfive",
          email: "Duplicated_email_jimmyfive@host.testemail",
          password: "Test@123",
        }),
      });

      expect(returnRequest2.response.status).toBe(400);

      expect(returnRequest2.body).toEqual({
        name: "ValidationError",
        message: "The email address provided is already registered.",
        action: "Try again with a different email.",
        status_code: 400,
      });
    });

    test("should not create a new user account with duplicated username", async () => {
      const returnRequest = await orchestrator.request("/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicated_jimmyfive",
          email: "first_duplicated_username_jimmyfive@host.testemail",
          password: "Test@123",
        }),
      });

      expect(returnRequest.response.status).toBe(201);

      const returnRequest2 = await orchestrator.request("/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Duplicated_jimmyfive",
          email: "second_duplicated_username_jimmyfive@host.testemail",
          password: "Test@123",
        }),
      });

      expect(returnRequest2.response.status).toBe(400);

      expect(returnRequest2.body).toEqual({
        name: "ValidationError",
        message: "The username provided is already registered.",
        action: "Try again with a different username.",
        status_code: 400,
      });
    });
  });
});
