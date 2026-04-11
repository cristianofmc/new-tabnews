import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import user from "#models/user.js";

const endpoint = createEndpoint();

endpoint.get("*", getHandler);

async function getHandler(context) {
  const username = context.req.query("username");
  const userFound = await user.findOneByUsername(username);
  return context.json(userFound, 200);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
