import retry from "async-retry";
import { query } from "#infra/database.js";
import migrator from "#models/migrator.js";
import user from "#models/user.js";
import { faker } from "@faker-js/faker";
import session from "#models/session.js";

const getAppUrl = () => process.env.APP_URL || "http://localhost:3000";
const getEmailUrl = () =>
  `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function request(path, options = {}) {
  const url = `${getAppUrl()}${path}`;
  const response = await fetch(url, options);

  let body;
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    try {
      body = await response.json();
    } catch {
      console.log(`No JSON body found for ${url}`);
    }
  }

  return { response, body };
}

async function waitForAllServices() {
  const results = await Promise.allSettled([
    waitForWebServer(),
    waitForEmailServer(),
  ]);

  const failedErrors = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);

  if (failedErrors.length > 0) {
    throw new AggregateError(
      failedErrors,
      "Failed to start infrastructure services",
    );
  }
}

async function waitForWebServer() {
  return retry(fetchStatusPage, { retries: 100, maxTimeout: 1000 });
}

async function waitForEmailServer() {
  return retry(fetchEmailPage, { retries: 100, maxTimeout: 1000 });
}

async function fetchStatusPage() {
  const result = await request("/api/v1/status");

  if (result.response.status !== 200) {
    throw new Error(
      `Web server is not ready. Status: ${result.response.status}`,
    );
  }
}

async function fetchEmailPage() {
  const url = getEmailUrl();
  const response = await fetch(url);

  if (response.status !== 200) {
    throw new Error(
      `Email server is not ready at ${url}. Status: ${response.status}`,
    );
  }
}

async function cleanDatabase() {
  await query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject = {}) {
  const newUser = await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "validP@ssw0rd",
  });
  return newUser;
}

async function createSession(userId) {
  return await session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${getEmailUrl()}/messages`, { method: "DELETE" });
}

async function getLastEmail() {
  const baseUrl = getEmailUrl();

  const emailListResponse = await fetch(`${baseUrl}/messages`);
  const emailListBody = await emailListResponse.json();

  const lastEmailItem = emailListBody.pop();

  if (!lastEmailItem) return null;

  const emailTextResponse = await fetch(
    `${baseUrl}/messages/${lastEmailItem.id}.plain`,
  );
  lastEmailItem.text = await emailTextResponse.text();

  return lastEmailItem;
}

function extractUUID(text) {
  const match = text.match(/[0-9a-fA-F-]{36}/);
  return match ? match[0] : null;
}

const orchestrator = {
  waitForAllServices,
  cleanDatabase,
  runPendingMigrations,
  request,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
  extractUUID,
};

export default orchestrator;
