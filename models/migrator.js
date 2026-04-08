import path from "node:path";
import database from "#infra/database.js";
import { runner } from "node-pg-migrate";

function buildMigrationOptions(dryRun) {
  return {
    direction: "up",
    dir: path.join(process.cwd(), "infra", "migrations"),
    verbose: true,
    migrationsTable: "pgmigrations",
    dryRun,
  };
}

async function delegateToMigrationRunner(options) {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    return await runner({
      ...options,
      dbClient,
    });
  } finally {
    await dbClient?.end();
  }
}

export async function listPendingMigrations() {
  return delegateToMigrationRunner(buildMigrationOptions(true));
}

export async function runPendingMigrations() {
  return delegateToMigrationRunner(buildMigrationOptions(false));
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
