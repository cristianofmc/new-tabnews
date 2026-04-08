import orchestrator from "#tests/orchestrator.js";
import database from "#infra/database.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("should create a new user account with unique and valid data", async () => {
      // const { response } = await orchestrator.request("/api/v1/users", {
      //   method: "POST",
      //   body: JSON.stringify({
      //     username: "jimmyfive",
      //   }),
      // });

      await database.query({
        text: "INSERT INTO users (username, email, password) VALUES ($1, $2, $3);",
        values: ["jimmyfive", "jimmyfive@host.testemail", "Test@123"],
      });

      await database.query({
        text: "INSERT INTO users (username, email, password) VALUES ($1, $2, $3);",
        values: ["jimmyfive2", "Jimmyfive@host.testemail", "Test@123"],
      });

      const users = await database.query("SELECT * FROM users;");
      console.log(users.rows);

      // expect(response.status).toBe(201);
    });
  });
});
