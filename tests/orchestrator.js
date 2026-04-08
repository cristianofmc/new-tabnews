import retry from "async-retry";
import { query } from "#infra/database.js";
import migrator from "#models/migrator.js";

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

const orchestrator = {
  waitForAllServices,
  cleanDatabase,
  runPendingMigrations,
  request,
};

export default orchestrator;
