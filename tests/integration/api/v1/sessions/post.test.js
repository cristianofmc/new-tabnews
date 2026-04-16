import orchestrator from "#tests/orchestrator.js";

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
  });
});
