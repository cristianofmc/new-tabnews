import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

async function getStatus() {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/v1/status`, {
    method: "POST",
  });
  const body = await response.json();

  return { response, body };
}

describe("POST /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("should return MethodNotAllowedError when using an invalid method", async () => {
      const { response, body } = await getStatus();

      // HTTP response
      expect(response.status).toBe(405);

      expect(body).toEqual({
        name: "MethodNotAllowedError",
        message: "This method is not allowed for this endpoint.",
        action: "Please verify that the HTTP method is valid.",
        status_code: 405,
      });
    });
  });
});
