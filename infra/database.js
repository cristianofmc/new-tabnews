import { Client } from "pg";
import { ServiceError } from "@/infra/errors";

export async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    ssl: process.env.NODE_ENV === "production" ? true : false,
  });

  await client.connect();
  return client;
}

export async function query(queryObject) {
  let client;
  try {
    client = await getNewClient();
    return await client.query(queryObject);
  } catch (error) {
    const ServiceErrorObject = new ServiceError({
      message: "Error connecting to the database or in the query.",
      cause: error,
    });
    throw ServiceErrorObject;
  } finally {
    await client?.end();
  }
}

async function status() {
  const databaseName = process.env.POSTGRES_DB;
  const appEnv = process.env.APP_ENV || process.env.NODE_ENV || "unknown";
  const status_query = `
    select
      current_setting('server_version') as server_version,
      current_setting('max_connections')::int as max_connections,
      count(*)::int as current_connections
    from pg_stat_activity
    where datname = $1;
  `;

  const result = await query({ text: status_query, values: [databaseName] });
  return {
    environment: appEnv,
    ...result.rows[0],
  };
}

const database = {
  query,
  status,
  getNewClient,
};

export default database;
