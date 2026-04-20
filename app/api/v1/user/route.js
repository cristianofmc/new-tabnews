import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import user from "#models/user.js";
import { getCookie } from "hono/cookie";
import session from "#models/session.js";

const endpoint = createEndpoint();

endpoint.get("*", getHandler);

async function getHandler(context) {
  const sessionToken = getCookie(context, "__Host-session_id");

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const userFound = await user.findOneById(sessionObject.user_id);
  return context.json(userFound, 200);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
