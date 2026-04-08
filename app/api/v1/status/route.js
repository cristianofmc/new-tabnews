import { handle } from "hono/vercel";
import database from "#infra/database.js";
import { createEndpoint } from "#infra/endpoint.js";

const endpoint = createEndpoint();

endpoint.get("*", status);

async function status(context) {
  const updatedAt = new Date().toISOString();
  const database_status = await database.status();

  return context.json(
    {
      updated_at: updatedAt,
      database: database_status,
    },
    200,
  );
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
