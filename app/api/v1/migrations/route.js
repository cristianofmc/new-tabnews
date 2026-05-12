import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import migrator from "#models/migrator.js";
import { requireSchema } from "#infra/middlewares/validate.js";
import { canRequest } from "#infra/middlewares/authorize.js";
import authorization from "#models/authorization.js";

const endpoint = createEndpoint();

endpoint.get("*", requireSchema({}), canRequest("read:migration"), getHandler);
endpoint.post(
  "*",
  requireSchema({}),
  canRequest("create:migration"),
  postHandler,
);

async function getHandler(context) {
  const userTryingToGet = await context.get("user");
  const pendingMigrations = await migrator.listPendingMigrations();

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:migration",
    pendingMigrations,
  );
  return context.json(secureOutputValues, 200);
}

async function postHandler(context) {
  const userTryingToPost = await context.get("user");
  const migratedMigrations = await migrator.runPendingMigrations();
  const status = migratedMigrations.length ? 201 : 200;

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "read:migration",
    migratedMigrations,
  );
  return context.json(secureOutputValues, status);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
