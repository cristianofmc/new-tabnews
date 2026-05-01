import orchestrator from "#tests/orchestrator.js";
import config from "#infra/config.js";
import activation from "#models/activation.js";
import user from "#models/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("E2E registration happy path", () => {
  let userResponseBody;
  let token;
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
    userResponseBody = body;

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

    token = orchestrator.extractUUID(lastEmail.text);
    expect(lastEmail.sender).toBe(`<${config.appEmail}>`);

    expect(lastEmail.recipients[0]).toBe("<newjimmyfive@host.testemail>");
    expect(lastEmail.subject).toBe("Please activate your account.");
    expect(lastEmail.text).toContain("new_jimmy_five");
    expect(lastEmail.text).toContain(
      `${config.origin}/sign_up/activate/${token}`,
    );

    const validTokenObject = await activation.findOneValidTokenById(token);
    expect(token).toBe(validTokenObject.id);
    expect(validTokenObject.user_id).toBe(userResponseBody.id);
    expect(validTokenObject.used_at).toBeNull();

    vi.useFakeTimers({
      now: new Date(Date.now() + activation.EXPIRATION_IN_MILLISECONDS),
    });

    await expect(activation.findOneValidTokenById(token)).rejects.toThrow(
      "The activation token provided was not found in the system or has expired.",
    );

    vi.useRealTimers();

    const otherValidTokenObject = await activation.findOneValidTokenById(token);
    expect(token).toBe(otherValidTokenObject.id);
    expect(otherValidTokenObject.user_id).toBe(userResponseBody.id);
    expect(otherValidTokenObject.used_at).toBeNull();
  });

  test("Activate account", async () => {
    const { response, body } = await orchestrator.request(
      `/api/v1/activations/${token}`,
      { method: "PATCH" },
    );

    expect(response.status).toBe(200);

    expect(Date.parse(body.used_at)).not.toBeNaN();

    const activatedUser = await user.findOneByUsername("new_jimmy_five");
    expect(activatedUser.features).toEqual(["create:session"]);
  });

  test("Sign in", async () => {
    const { response, body } = await orchestrator.request(`/api/v1/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "newjimmyfive@host.testemail",
        password: "Test@123",
      }),
    });

    expect(response.status).toBe(201);
    expect(body.user_id).toBe(userResponseBody.id);
  });

  test("Get user information", async () => {});
});
