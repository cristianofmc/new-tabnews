import { Hono } from "hono";
import { handle } from "hono/vercel";
import { runner as migrationRunner } from "node-pg-migrate";
import path from "node:path";
import database from "@/infra/database";
import { InternalServerError, MethodNotAllowedError } from "@/infra/errors";

const endpoint = new Hono();

endpoint.get("*", migrations);
endpoint.post("*", migrations);
endpoint.all("*", onNoMatchHandler);
endpoint.onError(onErrorHandler);

function onNoMatchHandler(context) {
  const publicErrorObject = new MethodNotAllowedError();
  return context.json(publicErrorObject, publicErrorObject.statusCode);
}

function onErrorHandler(error, context) {
  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.log("\nHono controller error:");
  console.error(publicErrorObject);

  return context.json(publicErrorObject, publicErrorObject.statusCode);
}

async function migrations(context) {
  const method = context.req.method;
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = {
      dbClient: dbClient,
      dryRun: true,
      direction: "up",
      dir: path.join(process.cwd(), "infra", "migrations"),
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (method === "GET") {
      const pendingMigrations = await migrationRunner({
        ...defaultMigrationOptions,
      });
      return context.json(pendingMigrations, 200);
    }

    if (method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      const status = migratedMigrations.length ? 201 : 200;
      return context.json(migratedMigrations, status);
    }
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
