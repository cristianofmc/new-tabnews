import { Client } from "pg";

export async function query(queryObject) {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });

  await client.connect();

  try {
    return await client.query(queryObject);
  } finally {
    await client.end().catch(() => {});
  }
}

export default { query };
