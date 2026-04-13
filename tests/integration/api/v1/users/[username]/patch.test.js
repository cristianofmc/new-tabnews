import orchestrator from "#tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "#models/user.js";
import password from "#models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
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
      expect(body).toEqual({
        name: "NotFoundError",
        message: "The username provided was not found.",
        action: "Please check that the username was entered correctly.",
        status_code: 404,
      });
    });

    test("should return 400 when sending an empty payload", async () => {
      await orchestrator.request("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "EmptyPayloadUser",
          email: "empty@host.testemail",
          password: "Test@123",
        }),
      });

      const { response, body } = await orchestrator.request(
        "/api/v1/users/EmptyPayloadUser",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}), // Payload ZERO
        },
      );

      expect(response.status).toBe(400);
      expect(body).toEqual({
        name: "ValidationError",
        message: "No data provided in the request body.",
        action:
          "Please provide at least one valid field: username, email, password.",
        status_code: 400,
      });
    });

    test("should return 400 when updating with an invalid email format", async () => {
      const { response, body } = await orchestrator.request(
        "/api/v1/users/EmptyPayloadUser",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "not-an-email",
          }),
        },
      );

      expect(response.status).toBe(400);
      expect(body).toEqual({
        name: "ValidationError",
        message: "The email format is invalid.",
        action: "Please provide a valid email address.",
        status_code: 400,
      });
    });

    test("should return 400 when updating with an invalid username", async () => {
      const { response, body } = await orchestrator.request(
        "/api/v1/users/EmptyPayloadUser",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Invalid Jimmy Five!",
          }),
        },
      );

      expect(response.status).toBe(400);
      expect(body).toEqual({
        name: "ValidationError",
        message: "The username provided is invalid.",
        action:
          "Please ensure that the username is between 3 and 30 characters, contains only letters, numbers or underscores, does not start or end with underscores, and does not have two consecutive underscores.",
        status_code: 400,
      });
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
        "/api/v1/users/EmptyPayloadUser",
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
        action: "Please try again with a different email.",
        status_code: 400,
      });
    });

    test("should not update to a username that is already in use by another user", async () => {
      const { response, body } = await orchestrator.request(
        "/api/v1/users/EmptyPayloadUser",
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
        action: "Please try again with a different username.",
        status_code: 400,
      });
    });

    test("should successfully update the password when sent in the PATCH body", async () => {
      await orchestrator.request("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "secure_jimmy_five",
          email: "secure_jimmy@host.testemail",
          password: "OriginalPassword@123",
        }),
      });

      const { response, body } = await orchestrator.request(
        "/api/v1/users/secure_jimmy_five",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password: "NewSecurePassword@456",
          }),
        },
      );

      expect(response.status).toBe(200);

      expect(body).toEqual({
        id: body.id,
        username: "secure_jimmy_five",
        email: "secure_jimmy@host.testemail",
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      const userInDatabase = await user.findOneByUsername("secure_jimmy_five");

      const newPasswordWorks = await password.compare(
        "NewSecurePassword@456",
        userInDatabase.password,
      );
      expect(newPasswordWorks).toBe(true);

      const oldPasswordStillWorks = await password.compare(
        "OriginalPassword@123",
        userInDatabase.password,
      );
      expect(oldPasswordStillWorks).toBe(false);
    });

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
        "/api/v1/users/OriginalJimmyFive",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "updated_Jimmy_Five",
            email: "updated_jimmy_five@host.testemail",
          }),
        },
      );

      expect(response.status).toBe(200);

      expect(body).toEqual({
        id: body.id,
        username: "updated_jimmy_five",
        email: "updated_jimmy_five@host.testemail",
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBe(NaN);

      expect(new Date(body.updated_at).getTime()).toBeGreaterThan(
        new Date(body.created_at).getTime(),
      );
    });
  });
});
