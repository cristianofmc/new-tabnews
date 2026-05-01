import orchestrator from "#tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "#models/session.js";
import setCookieParsers from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("should not create session with incorrect email", async () => {
      await orchestrator.createUser({
        password: "correct_P@ss0rd",
      });

      const { response, body } = await orchestrator.request(
        "/api/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "whrong_email@host.testemail",
            password: "correct_P@ss0rd",
          }),
        },
      );

      expect(response.status).toBe(401);

      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "Incorrect authentication data.",
        action: "Please verify that the submitted data is correct.",
        status_code: 401,
      });
    });

    test("should not create session with incorrect password", async () => {
      const user = await orchestrator.createUser({
        password: "wrong_P@ss0rd",
      });

      const { response, body } = await orchestrator.request(
        "/api/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: user.email,
            password: "correct_P@ss0rd",
          }),
        },
      );

      expect(response.status).toBe(401);

      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "Incorrect authentication data.",
        action: "Please verify that the submitted data is correct.",
        status_code: 401,
      });
    });

    test("should not create session with incorrect email and password", async () => {
      await orchestrator.createUser();

      const { response, body } = await orchestrator.request(
        "/api/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "incorrect_email@email.testemail",
            password: "incorrect_P@ss0rd",
          }),
        },
      );

      expect(response.status).toBe(401);

      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "Incorrect authentication data.",
        action: "Please verify that the submitted data is correct.",
        status_code: 401,
      });
    });

    test("should create session with correct data", async () => {
      const newUser = await orchestrator.createActivatedUser({
        password: "!23NoMad",
      });

      const { response, body } = await orchestrator.request(
        "/api/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: newUser.email,
            password: "!23NoMad",
          }),
        },
      );

      console.log(response);
      console.log(body);

      expect(response.status).toBe(201);

      expect(body).toEqual({
        id: body.id,
        token: body.token,
        user_id: newUser.id,
        expires_at: body.expires_at,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });

      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.expires_at)).not.toBe(NaN);
      expect(Date.parse(body.created_at)).not.toBe(NaN);
      expect(Date.parse(body.updated_at)).not.toBe(NaN);

      const expiresAt = new Date(body.expiresAt);
      const createdAt = new Date(body.createdAt);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(Date.parse(expiresAt)).toBe(
        Date.parse(createdAt) + session.EXPIRATION_IN_MILLISECONDS,
      );

      const parsedSetCookie = setCookieParsers(response, { map: true });

      expect(parsedSetCookie[session.COOKIE_NAME]).toEqual({
        name: session.COOKIE_NAME,
        value: body.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
        sameSite: "Strict",
      });
    });
  });
});
