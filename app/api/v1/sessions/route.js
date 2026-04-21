import { handle } from "hono/vercel";
import { getCookie } from "hono/cookie";
import { createEndpoint } from "#infra/endpoint.js";
import validator from "#infra/validators.js";
import authentication from "#models/authentication.js";
import session from "#models/session.js";
import controller from "#infra/controller.js";
const endpoint = createEndpoint();

endpoint.post("*", postHandler);
endpoint.delete("*", deleteHandler);

async function postHandler(context) {
  const userInputValues = await context.req.json();
  const loginSchema = {
    email: { type: "notEmptyText", required: true },
    password: { type: "notEmptyText", required: true },
  };

  validator.validate(userInputValues, loginSchema);

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );
  const newSession = await session.create(authenticatedUser.id);
  controller.setSessionCookie(newSession.token, context);
  return context.json(newSession, 201);
}

async function deleteHandler(context) {
  const sessionToken = getCookie(context, session.COOKIE_NAME);
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(context);
  return context.json(expiredSession, 200);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
