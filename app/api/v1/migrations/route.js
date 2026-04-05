import { runner as migrationRunner } from "node-pg-migrate";
import path from "node:path";
import database from "@/infra/database";

async function migrations(request) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return Response.json(
      {
        error: `Method "${request.method}" not allowed`,
      },
      { status: 405 },
    );
  }

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

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner({
        ...defaultMigrationOptions,
      });
      return Response.json(pendingMigrations, { status: 200 });
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      const status = migratedMigrations.length ? 201 : 200;
      return Response.json(migratedMigrations, { status: status });
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient?.end();
  }
}

export const GET = migrations;
export const POST = migrations;
