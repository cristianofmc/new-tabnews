import { runner as migrationRunner } from 'node-pg-migrate'
import { join } from "node:path"

async function migrations(request, response) {
  const migrations = await migrationRunner({
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    direction: "up",
    dir: join("infra", "migrations"),
    verbose: true,
  });

  response.status(200).json(migrations);
}

export default migrations;
