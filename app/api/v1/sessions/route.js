import { handle } from "hono/vercel";
import { createEndpoint } from "#infra/endpoint.js";
import validator from "#infra/validators.js";
import authentication from "#models/authentication.js";
import session from "#models/session.js";
import { setCookie } from "hono/cookie";

const endpoint = createEndpoint();

endpoint.post("*", postHandler);

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

  setCookie(context, "__Host-session_id", newSession.token, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    partitioned: true,
  });

  return context.json(newSession, 201);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
