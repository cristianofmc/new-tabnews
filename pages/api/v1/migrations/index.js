import { runner as migrationRunner } from 'node-pg-migrate'
import { join } from "node:path"

async function migrations(request, response) {

  if (request.method === "GET"){
    const migrations = await migrationRunner({
      databaseUrl: process.env.DATABASE_URL,
      dryRun: true,
      direction: "up",
      dir: join("infra", "migrations"),
      verbose: true,
      migrationsTable: "pgmigrations",
    });

    return response.status(200).json(migrations);
  }

  if (request.method === "POST"){
    const migrations = await migrationRunner({
      databaseUrl: process.env.DATABASE_URL,
      dryRun: false,
      direction: "up",
      dir: join("infra", "migrations"),
      verbose: true,
      migrationsTable: "pgmigrations",
    });

    return response.status(200).json(migrations);
  }

  return response.status(405).end();
}

export default migrations;
