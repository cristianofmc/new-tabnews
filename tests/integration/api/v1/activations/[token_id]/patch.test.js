import orchestrator from "#tests/orchestrator.js";
import { vi } from "vitest";
import activation from "#models/activation.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("PATCH /api/v1/activations/:token_id", () => {
  let createdUser;
  let activationToken;
  describe("Anonymous user", () => {
    test("Should create a user and fail to activate when sending an invalid body", async () => {
      const { response: userResponse, body: userBody } =
        await orchestrator.request("/api/v1/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "activation_test_user",
            email: "activation_test@host.testemail",
            password: "ValidPassword123!",
          }),
        });

      expect(userResponse.status).toBe(201);
      createdUser = userBody;

      const lastEmail = await orchestrator.getLastEmail();
      activationToken = orchestrator.extractUUID(lastEmail.text);

      const { response, body } = await orchestrator.request(
        `/api/v1/activations/${activationToken}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invalid_field: "not allowed",
          }),
        },
      );

      expect(response.status).toBe(400);
      expect(body).toEqual({
        name: "ValidationError",
        message:
          "Unrecognized or not allowed fields provided: 'invalid_field'.",
        action:
          "Please remove these fields. This endpoint does not accept any data in the request body.",
        status_code: 400,
      });
    });

    test("Should fail to activate using an invalid token", async () => {
      const invalidToken = "00000000-0000-0000-0000-000000000000";

      const { response, body } = await orchestrator.request(
        `/api/v1/activations/${invalidToken}`,
        { method: "PATCH" },
      );

      expect(response.status).toBe(404);
      expect(body).toEqual({
        name: "NotFoundError",
        action: "Please create a new account.",
        message:
          "The activation token provided was not found in the system or has expired.",
        status_code: 404,
      });
    });

    test("Should fail to activate when the token is expired", async () => {
      vi.useFakeTimers({
        now: new Date(Date.now() - activation.EXPIRATION_IN_MILLISECONDS),
      });

      const expiredUser = await orchestrator.createUser({
        username: "expired_test_user",
        email: "expired@host.testemail",
      });
      const expiredTokenObject = await activation.create(expiredUser.id);

      vi.useRealTimers();

      const { response, body } = await orchestrator.request(
        `/api/v1/activations/${expiredTokenObject.id}`,
        { method: "PATCH" },
      );

      expect(response.status).toBe(404);
      expect(body).toEqual({
        name: "NotFoundError",
        action: "Please create a new account.",
        message:
          "The activation token provided was not found in the system or has expired.",
        status_code: 404,
      });
    });

    test("Should activate the user successfully in normal time", async () => {
      const { response, body } = await orchestrator.request(
        `/api/v1/activations/${activationToken}`,
        { method: "PATCH" },
      );

      expect(response.status).toBe(200);

      expect(body).toEqual({
        id: activationToken,
        user_id: createdUser.id,
        created_at: body.created_at,
        expires_at: body.expires_at,
        updated_at: body.updated_at,
        used_at: body.used_at,
      });

      expect(Date.parse(body.expires_at)).not.toBeNaN();
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(Date.parse(body.used_at)).not.toBeNaN();

      const expiresAt = new Date(body.expires_at);
      const createdAt = new Date(body.created_at);
      const updatedAt = new Date(body.updated_at);
      const usedAt = new Date(body.used_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);
      updatedAt.setMilliseconds(0);
      usedAt.setMilliseconds(0);

      expect(expiresAt.getTime()).toBe(
        createdAt.getTime() + activation.EXPIRATION_IN_MILLISECONDS,
      );

      expect(updatedAt.getTime()).toBe(usedAt.getTime());
    });

    test("Should fail to activate again using the same (already used) token", async () => {
      const { response, body } = await orchestrator.request(
        `/api/v1/activations/${activationToken}`,
        { method: "PATCH" },
      );

      expect(response.status).toBe(404);
      expect(body).toEqual({
        name: "NotFoundError",
        action: "Please create a new account.",
        message:
          "The activation token provided was not found in the system or has expired.",
        status_code: 404,
      });
    });
  });
});
