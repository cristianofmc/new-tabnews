import retry from "async-retry";
import { query } from "infra/database";

async function waitForAllServices() {
  await waitForWebServer();
}

async function waitForWebServer() {
  return retry(fetchStatusPage, {
    retries: 100,
    maxTimeout: 1000,
  });
}

async function fetchStatusPage() {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const response = await fetch(`${baseUrl}/api/v1/status`);

  if (response.status !== 200) {
    throw Error(`The server is not yet ready. Status: ${response.status}`);
  }
}

async function cleanDatabase() {
  await query("drop schema public cascade; create schema public;");
}

const orchestrator = {
  waitForAllServices,
  cleanDatabase,
};

export default orchestrator;
