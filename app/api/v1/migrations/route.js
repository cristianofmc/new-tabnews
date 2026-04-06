import { handle } from "hono/vercel";
import { runner as migrationRunner } from "node-pg-migrate";
import path from "node:path";
import database from "@/infra/database";
import { createEndpoint } from "@/infra/endpoint";

const endpoint = createEndpoint();

endpoint.get("*", getHandler);
endpoint.post("*", postHandler);

const defaultMigrationOptions = {
  direction: "up",
  dir: path.join(process.cwd(), "infra", "migrations"),
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandler(context) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: true,
    });

    return context.json(pendingMigrations, 200);
  } finally {
    await dbClient?.end();
  }
}

async function postHandler(context) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    const status = migratedMigrations.length ? 201 : 200;
    return context.json(migratedMigrations, status);
  } finally {
    await dbClient?.end();
  }
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
