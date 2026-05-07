import { handle } from "hono/vercel";
import database from "#infra/database.js";
import { createEndpoint } from "#infra/endpoint.js";
import { requireSchema } from "#infra/middlewares/validate.js";
import authorization from "#models/authorization.js";

const endpoint = createEndpoint();

endpoint.get("*", requireSchema({}), getHandler);

async function getHandler(context) {
  const userTryingToGet = await context.get("user");
  const updatedAt = new Date().toISOString();
  const database_status = await database.status();
  const statusObject = { updated_at: updatedAt, database: database_status };

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:status",
    statusObject,
  );

  return context.json(secureOutputValues, 200);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
