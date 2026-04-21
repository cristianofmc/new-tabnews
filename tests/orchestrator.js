import retry from "async-retry";
import { query } from "#infra/database.js";
import migrator from "#models/migrator.js";
import user from "#models/user.js";
import { faker } from "@faker-js/faker";
import session from "#models/session.js";

async function request(path, options = {}) {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, options);

  let body;
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    try {
      body = await response.json();
    } catch {
      console.log("No body found for ", url);
    }
  }

  return {
    response,
    body,
  };
}

async function fetchStatusPage() {
  const result = await request("/api/v1/status");

  if (result.response.status !== 200) {
    throw new Error(
      `The server is not yet ready. Status: ${result.response.status}`,
    );
  }
}

async function waitForAllServices() {
  await waitForWebServer();
}

async function waitForWebServer() {
  return retry(fetchStatusPage, {
    retries: 100,
    maxTimeout: 1000,
  });
}

async function cleanDatabase() {
  await query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject = {}) {
  const newUserObject = {
    username:
      userObject.username || faker.internet.username().replace(/[.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "validP@ssw0rd",
  };

  const newUser = await user.create(newUserObject);
  return newUser;
}

async function createSession(userId) {
  return await session.create(userId);
}

const orchestrator = {
  waitForAllServices,
  cleanDatabase,
  runPendingMigrations,
  request,
  createUser,
  createSession,
};

export default orchestrator;
