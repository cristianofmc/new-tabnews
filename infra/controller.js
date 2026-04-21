import {
  InternalServerError,
  ValidationError,
  NotFoundError,
  MethodNotAllowedError,
  UnauthorizedError,
} from "#infra/errors.js";
import { setCookie } from "hono/cookie";
import session from "#models/session.js";

function setSessionCookie(sessionToken, context) {
  setCookie(context, session.COOKIE_NAME, sessionToken, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    partitioned: process.env.NODE_ENV === "production",
  });
}

function onError(error, context) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return context.json(error, error.statusCode);
  }

  const publicErrorObject = new InternalServerError({
    cause: error,
  });

  console.log("\nHono controller error:");
  console.error(publicErrorObject);

  return context.json(publicErrorObject, publicErrorObject.statusCode);
}

function onNoMatch(context) {
  const publicErrorObject = new MethodNotAllowedError();
  return context.json(publicErrorObject, publicErrorObject.statusCode);
}

const controller = {
  errorHandlers: {
    onError,
    onNoMatch,
  },
  setSessionCookie,
};

export default controller;
