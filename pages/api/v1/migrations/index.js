import { runner as migrationRunner } from 'node-pg-migrate'
import { resolve } from "node:path"
import database from '@/infra/database';

async function migrations(request, response) {
  const dbClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient: dbClient,
    dryRun: true,
    direction: "up",
    dir: path.join(process.cwd(), "infra", "migrations"),
    verbose: true,
    migrationsTable: "pgmigrations",
  }

  if (request.method === "GET"){
    const pendingMigrations = await migrationRunner({ ...defaultMigrationOptions});
    await dbClient.end();
    return response.status(200).json(pendingMigrations);
  }

  if (request.method === "POST"){
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });

    await dbClient.end();
    const status = migratedMigrations.length? 201: 200;
    return response.status(status).json(migratedMigrations);
  }

  return response.status(405).end();
}

export default migrations;
