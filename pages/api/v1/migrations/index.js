import { runner as migrationRunner } from 'node-pg-migrate'
import { join } from "node:path"

async function migrations(request, response) {
  const defaultMigrationOptions = {
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    direction: "up",
    dir: join("infra", "migrations"),
    verbose: true,
    migrationsTable: "pgmigrations",
  }

  if (request.method === "GET"){
    const pendingMigrations = await migrationRunner({ ...defaultMigrationOptions});
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST"){
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });

    const status = migratedMigrations.length? 201: 200;
    return response.status(status).json(migratedMigrations);
  }

  return response.status(405).end();
}

export default migrations;
