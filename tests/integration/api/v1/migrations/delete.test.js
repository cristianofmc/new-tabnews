import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
});

async function getMigrations() {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/v1/migrations`, {
    method: "DELETE",
  });

  const contentType = response.headers.get("content-type") || "";
  expect(contentType).toContain("application/json");

  const body = await response.json();
  return { response, body };
}

describe("DELETE /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("should return MethodNotAllowedError when using an invalid method", async () => {
      const { response, body } = await getMigrations();

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
