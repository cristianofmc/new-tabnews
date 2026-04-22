import orchestrator from "#tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "#models/session.js";
import setCookieParsers from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("DELETE /api/v1/sessions", () => {
  describe("Default user", () => {
    test("should receive error on nonexistent session", async () => {
      const nonexistentToken =
        "971a0a9446464fb8e242a99b690336ec0ce1b36de1c1a6d48d3c46db968ea36eaa5806db4bc784ebe42f5988d5fdc14e";
      const { response, body } = await orchestrator.request(
        `/api/v1/sessions`,
        {
          method: "DELETE",
          headers: {
            Cookie: `${session.COOKIE_NAME}=${nonexistentToken}`,
          },
        },
      );

      expect(response.status).toBe(401);

      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "The user does not have an active session.",
        action: "Please check if this user is logged in and try again.",
        status_code: 401,
      });
    });

    test("should delete expired session", async () => {
      vi.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const created_user = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(created_user.id);

      vi.useRealTimers();

      const { response, body } = await orchestrator.request(
        `/api/v1/sessions`,
        {
          method: "DELETE",
          headers: {
            Cookie: `${session.COOKIE_NAME}=${sessionObject.token}`,
          },
        },
      );
      expect(response.status).toBe(401);

      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "The user does not have an active session.",
        action: "Please check if this user is logged in and try again.",
        status_code: 401,
      });
    });

    test("should delete valid session", async () => {
      const created_user = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(created_user.id);

      const { response, body } = await orchestrator.request(
        `/api/v1/sessions`,
        {
          method: "DELETE",
          headers: {
            Cookie: `${session.COOKIE_NAME}=${sessionObject.token}`,
          },
        },
      );

      expect(response.status).toBe(200);

      expect(body).toEqual({
        id: sessionObject.id,
        token: sessionObject.token,
        user_id: sessionObject.user_id,
        expires_at: body.expires_at,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.expires_at)).not.toBe(NaN);
      expect(Date.parse(body.created_at)).not.toBe(NaN);
      expect(Date.parse(body.updated_at)).not.toBe(NaN);

      const expiresAtDate = new Date(body.expires_at);
      const updatedAtDate = new Date(body.updated_at);
      expect(expiresAtDate.getTime()).toBeLessThan(
        sessionObject.expires_at.getTime(),
      );

      expect(updatedAtDate.getTime()).toBeGreaterThan(
        sessionObject.updated_at.getTime(),
      );

      const parsedSetCookie = setCookieParsers(response, { map: true });

      expect(parsedSetCookie[session.COOKIE_NAME]).toEqual({
        name: session.COOKIE_NAME,
        value: "invalid",
        path: "/",
        httpOnly: true,
        sameSite: "Strict",
      });

      const { response: doubleCheckResponse, body: doubleCheckBody } =
        await orchestrator.request(`/api/v1/user`, {
          headers: {
            Cookie: `${session.COOKIE_NAME}=${sessionObject.token}`,
          },
        });

      console.log(doubleCheckResponse);
      expect(doubleCheckResponse.status).toBe(401);
      expect(doubleCheckBody).toEqual({
        name: "UnauthorizedError",
        message: "The user does not have an active session.",
        action: "Please check if this user is logged in and try again.",
        status_code: 401,
      });
    });
  });
});
