import { handle } from "hono/vercel";
import { getCookie } from "hono/cookie";
import { createEndpoint } from "#infra/endpoint.js";
import authentication from "#models/authentication.js";
import session from "#models/session.js";
import controller from "#infra/controller.js";
import { requireSchema } from "#infra/middlewares/validate.js";
import { canRequest } from "#infra/middlewares/authorize.js";
import { ForbiddenError } from "#infra/errors.js";
import authorization from "#models/authorization.js";

const endpoint = createEndpoint();

const loginSchema = {
  email: { type: "notEmptyText", required: true },
  password: { type: "notEmptyText", required: true },
};

endpoint.post(
  "*",
  requireSchema(loginSchema),
  canRequest("create:session"),
  postHandler,
);

endpoint.delete("*", requireSchema({}), deleteHandler);

async function postHandler(context) {
  const userInputValues = context.get("validatedBody");

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );

  if (!authorization.can(authenticatedUser, "create:session")) {
    throw new ForbiddenError({
      message: "You do not have permission to log in.",
      action: "Please contact support if you believe this is an error.",
    });
  }

  const newSession = await session.create(authenticatedUser.id);
  controller.setSessionCookie(newSession.token, context);

  const secureOutputValues = authorization.filterOutput(
    authenticatedUser,
    "read:session",
    newSession,
  );

  return context.json(secureOutputValues, 201);
}

async function deleteHandler(context) {
  const userTryingToDelete = context.get("user");
  const sessionToken = getCookie(context, session.COOKIE_NAME);
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(context);

  const secureOutputValues = authorization.filterOutput(
    userTryingToDelete,
    "read:session",
    expiredSession,
  );
  return context.json(secureOutputValues, 200);
}

const handler = handle(endpoint);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
