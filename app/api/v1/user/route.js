import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import user from "#models/user.js";
import { getCookie } from "hono/cookie";
import session from "#models/session.js";
import controller from "#infra/controller.js";
const endpoint = createEndpoint();

endpoint.get("*", getHandler);

async function getHandler(context) {
  const sessionToken = getCookie(context, session.COOKIE_NAME);

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewedSessionObject = await session.renew(sessionObject.id);
  controller.setSessionCookie(renewedSessionObject.token, context);

  context.header(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  const userFound = await user.findOneById(sessionObject.user_id);
  return context.json(userFound, 200);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
