import migrationRunner from 'node-pg-migrate'

async function migrations(request, response) {
  const migrations = await migrationRunner({
    databaseUrl: process.env.DATABASE_URL
  });
  response.status(200).json(migrations);
}

export default migrations;
