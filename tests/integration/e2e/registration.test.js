import orchestrator from "#tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("E2E registration happy path", () => {
  test("Create user account", async () => {
    const { response, body } = await orchestrator.request("/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "New_Jimmy_Five",
        email: "newjimmyfive@host.testemail",
        password: "Test@123",
      }),
    });

    expect(response.status).toBe(201);

    expect(body).toEqual({
      id: body.id,
      username: "new_jimmy_five",
      email: "newjimmyfive@host.testemail",
      password: body.password,
      features: ["read:activation_token"],
      created_at: body.created_at,
      updated_at: body.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contact@cristianofelipe.com>");
    expect(lastEmail.recipients[0]).toBe("<newjimmyfive@host.testemail>");
    expect(lastEmail.subject).toBe("Please activate your account.");
    expect(lastEmail.text).toContain("new_jimmy_five");
  });

  test("Activate account", async () => {});

  test("Sign in", async () => {});

  test("Get user information", async () => {});
});
