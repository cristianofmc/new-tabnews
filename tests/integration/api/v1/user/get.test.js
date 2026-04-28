import orchestrator from "#tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import { vi } from "vitest";
import session from "#models/session.js";
import setCookieParsers from "set-cookie-parser";

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
          Cookie: `${session.COOKIE_NAME}=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      expect(body).toEqual({
        id: created_user.id,
        username: created_user.username,
        email: created_user.email,
        password: created_user.password,
        features: ["read:activation_token"],
        created_at: created_user.created_at.toISOString(),
        updated_at: created_user.updated_at.toISOString(),
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBe(NaN);
      expect(Date.parse(body.updated_at)).not.toBe(NaN);

      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(renewedSessionObject.expires_at.getTime()).toBeGreaterThan(
        sessionObject.expires_at.getTime(),
      );
      expect(renewedSessionObject.updated_at.getTime()).toBeGreaterThan(
        sessionObject.updated_at.getTime(),
      );

      const parsedSetCookie = setCookieParsers(response, { map: true });

      expect(parsedSetCookie[session.COOKIE_NAME]).toEqual({
        name: session.COOKIE_NAME,
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
        sameSite: "Strict",
      });
    });

    test("Should receive valid session before one minute of expiration", async () => {
      const expirationMinusOneMinute =
        session.EXPIRATION_IN_MILLISECONDS - 60 * 1000;
      vi.useFakeTimers({
        now: new Date(Date.now() - expirationMinusOneMinute),
      });
      const created_user = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(created_user.id);

      vi.useRealTimers();

      const { response, body } = await orchestrator.request(`/api/v1/user`, {
        headers: {
          Cookie: `${session.COOKIE_NAME}=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      expect(body).toEqual({
        id: created_user.id,
        username: created_user.username,
        email: created_user.email,
        password: created_user.password,
        features: ["read:activation_token"],
        created_at: created_user.created_at.toISOString(),
        updated_at: created_user.updated_at.toISOString(),
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBe(NaN);
      expect(Date.parse(body.updated_at)).not.toBe(NaN);

      const renewedSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );

      expect(renewedSessionObject.expires_at.getTime()).toBeGreaterThan(
        sessionObject.expires_at.getTime(),
      );
      expect(renewedSessionObject.updated_at.getTime()).toBeGreaterThan(
        sessionObject.updated_at.getTime(),
      );

      const parsedSetCookie = setCookieParsers(response, { map: true });

      expect(parsedSetCookie[session.COOKIE_NAME]).toEqual({
        name: session.COOKIE_NAME,
        value: sessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
        sameSite: "Strict",
      });
    });

    test("Should not receive a valid session with nonexistent token", async () => {
      const nonexistentToken =
        "971a0a9446464fb8e242a99b690336ec0ce1b36de1c1a6d48d3c46db968ea36eaa5806db4bc784ebe42f5988d5fdc14e";
      const { response, body } = await orchestrator.request(`/api/v1/user`, {
        headers: {
          Cookie: `${session.COOKIE_NAME}=${nonexistentToken}`,
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
          Cookie: `${session.COOKIE_NAME}=${sessionObject.token}`,
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

    test("Should not receive a valid session without providing a cookie", async () => {
      const { response, body } = await orchestrator.request(`/api/v1/user`);

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
