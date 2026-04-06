import { Hono } from "hono";
import { handle } from "hono/vercel";
import database from "@/infra/database.js";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

const endpoint = new Hono();

endpoint.get("*", status);
endpoint.all("*", onNoMatchHandler);
endpoint.onError(onErrorHandler);

function onNoMatchHandler(context) {
  const publicErrorObject = new MethodNotAllowedError();
  return context.json(publicErrorObject, publicErrorObject.statusCode);
}

function onErrorHandler(error, context) {
  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.log("\nHono controller error:");
  console.error(publicErrorObject);

  return context.json(publicErrorObject, publicErrorObject.statusCode);
}

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
