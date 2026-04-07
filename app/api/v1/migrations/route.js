import { handle } from "hono/vercel";
import { createEndpoint } from "@/infra/endpoint";
import migrator from "@/models/migrator";

const endpoint = createEndpoint();

endpoint.get("*", getHandler);
endpoint.post("*", postHandler);

async function getHandler(context) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return context.json(pendingMigrations, 200);
}

async function postHandler(context) {
  const migratedMigrations = await migrator.runPendingMigrations();
  const status = migratedMigrations.length ? 201 : 200;
  return context.json(migratedMigrations, status);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
