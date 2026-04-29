import orchestrator from "#tests/orchestrator.js";
import config from "#infra/config.js";
import activation from "#models/activation.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("E2E registration happy path", () => {
  let createUserResponseBody;
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
    createUserResponseBody = body;

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

    const token = orchestrator.extractUUID(lastEmail.text);
    expect(lastEmail.sender).toBe(`<${config.appEmail}>`);

    expect(lastEmail.recipients[0]).toBe("<newjimmyfive@host.testemail>");
    expect(lastEmail.subject).toBe("Please activate your account.");
    expect(lastEmail.text).toContain("new_jimmy_five");
    expect(lastEmail.text).toContain(
      `${config.origin}/sign_up/activate/${token}`,
    );

    const validTokenObject = await activation.findOneValidTokenById(token);
    expect(token).toBe(validTokenObject.id);
    expect(validTokenObject.user_id).toBe(createUserResponseBody.id);
    expect(validTokenObject.used_at).toBeNull();

    vi.useFakeTimers({
      now: new Date(Date.now() + activation.EXPIRATION_IN_MILLISECONDS),
    });

    const invalidTokenObject = await activation.findOneValidTokenById(token);
    expect(invalidTokenObject).toBeNull();

    vi.useRealTimers();

    const otherValidTokenObject = await activation.findOneValidTokenById(token);
    expect(token).toBe(otherValidTokenObject.id);
    expect(otherValidTokenObject.user_id).toBe(createUserResponseBody.id);
    expect(otherValidTokenObject.used_at).toBeNull();
  });

  test("Activate account", async () => {});

  test("Sign in", async () => {});

  test("Get user information", async () => {});
});
